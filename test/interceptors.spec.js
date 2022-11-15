import bustCache from "../src/interceptors/bust-cache"
import TinyFetch from "../src/TinyFetch"
import jsonRequest from "../src/interceptors/json-request"
import jsonResponse from "../src/interceptors/json-response"
import rejectErrors from "../src/interceptors/reject-errors"
import mockEmployees from "./mockEmployees"

describe("standard interceptors", () => {
  let client, sandbox
  const url = "http://dummy.restapiexample.com/api/v1/employees"

  beforeEach(() => {
    client = new TinyFetch()
    fetchMock.get(`begin:${url}`, mockEmployees)
    fetchMock.get(/.+\/employees\?rn=.+/, mockEmployees)
    fetchMock.post(`begin:${url}`, mockEmployees)
  })

  afterEach(() => {
    fetchMock.resetHistory()
    fetchMock.restore()
    client = null
  })

  it(`should register some interceptors upon invocation`, () => {
    client = new TinyFetch([jsonRequest])
    expect(client.interceptors).to.be.an("array")
    expect(client.interceptors).to.have.length(1)
  })

  it("should make a json request", () => {
    client = new TinyFetch([jsonRequest])

    return client
      .request(url)
      .then((response) => {
        expect(response.status).to.equal(200)
      })
      .catch((err) => expect(err).to.not.exist)
  })

  it("should stringify the body of json request", () => {
    client = new TinyFetch([jsonRequest])

    return client
      .request(url, { method: "POST", data: { name: "foo" } })
      .then((response) => {
        expect(response.status).to.equal(200)
      })
      .catch((err) => expect(err).to.not.exist)
  })

  it("should make a json request and get a json response", () => {
    client = new TinyFetch([jsonRequest, jsonResponse])

    return client
      .request(url)
      .then((response) => {
        expect(response.status).to.equal("success")
      })
      .catch((err) => expect(err).to.not.exist)
  })

  describe.skip(`bustCache interceptor`, () => {
    // skipping this now because fetchMock is returning a proxy, not a resolved response
    it(`should add a random number string to the request url`, async () => {
      client = new TinyFetch([bustCache])
      const response = await client.request(url, { bustCache: true })
      expect(response.url).to.contain("?rn=")
    })
  })

  describe("promises in interceptor methods", () => {
    it.skip(`should support a promise in a request interceptor`, async () => {
      const p = Promise.resolve({
        session: "124-64-74-311157-537524-7453-8889-19-11886119-5-2512148-7874-6612768-86-9052812935",
      })

      const interceptor = {
        async request(url = "", config = {}) {
          const prom = await p
          const u = `${url}?session=${prom.session}`
          return [u, config]
        },
        id: "PROMISE_REQUEST",
      }
      client = new TinyFetch([interceptor])
      const response = await client.request(url)
      expect(response.url).to.contain("?session=")
    })
    it(`should support a promise in a response interceptor`, async () => {
      const p = Promise.resolve({ thingy: "foo" })

      const interceptor = {
        async response(response) {
          if (response.status === 204 || response.status === 201) return JSON.stringify({})
          const text = await response.text()
          const json = JSON.parse(text)
          const { data } = json
          const resolvedPromise = await p
          const arr = data.map((datum) => ({
            ...datum,
            ...resolvedPromise,
          }))
          return arr
        },
        id: "PROMISE_RESPONSE",
      }
      client = new TinyFetch([interceptor])
      const response = await client.request(url)
      response.forEach((item) => expect(item.thingy).to.equal("foo"))
    })
  })
})
