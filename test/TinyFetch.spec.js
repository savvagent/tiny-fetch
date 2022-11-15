import TinyFetch from "../src/TinyFetch"
import jsonRequest from "../src/interceptors/json-request"
import jsonResponse from "../src/interceptors/json-response"
import rejectErrors from "../src/interceptors/reject-errors"
import mockEmployees from "./mockEmployees"

function employees() {
  return mockEmployees
}

describe("TinyFetch class", () => {
  let client
  const url = "http://localhost:8080/employees"

  beforeEach(() => {
    fetchMock.get(url, employees)
    fetchMock.put(url, employees)
    fetchMock.post(url, employees)
    fetchMock.delete(url, employees)
    fetchMock.patch(url, employees)
    client = new TinyFetch()
  })

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    client = null
  })

  it("should have certain methods and properties when instantiated", () => {
    expect(client).to.be.instanceof(TinyFetch)
    expect(client.clear).to.be.a("function")
    expect(client.request).to.be.a("function")
    expect(client.get).to.be.a("function")
    expect(client.put).to.be.a("function")
    expect(client.post).to.be.a("function")
    expect(client.delete).to.be.a("function")
    expect(client.patch).to.be.a("function")
    expect(client.register).to.be.a("function")
    expect(client.unregister).to.be.a("function")
    expect(client.interceptors).to.be.an("array")
  })

  it("should support creating multiple instances", () => {
    const client1 = new TinyFetch()
    expect(client).to.not.be.equal(client1)
  })

  it("should support instantiation with an array of interceptors", () => {
    const arr = [jsonRequest, jsonResponse]
    client = new TinyFetch(arr)
    const { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors).to.have.length(2)
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_REQUEST")
    expect(interceptors[1].id).to.be.equal("TINY_FETCH_JSON_RESPONSE")
  })

  it("should register a response interceptor", () => {
    client.register(jsonResponse)
    const { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_RESPONSE")
  })

  it("should register an interceptor only once", () => {
    client.register(jsonResponse)
    client.register(jsonResponse)
    client.register(jsonResponse)
    const { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors).to.have.length(1)
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_RESPONSE")
  })

  it("should register an array of interceptors", () => {
    const arr = [jsonRequest, jsonResponse]
    client.register(arr)
    const { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors).to.have.length(2)
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_REQUEST")
    expect(interceptors[1].id).to.be.equal("TINY_FETCH_JSON_RESPONSE")
  })

  it("should register a response interceptor in a specific location", () => {
    client.register(jsonResponse)
    client.register(jsonRequest, 0)
    const { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors).to.have.length(2)
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_REQUEST")
  })

  it(`should support clearing interceptors`, () => {
    client.register(jsonResponse)
    let { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_RESPONSE")
    client.clear()
    interceptors = client.interceptors
    expect(interceptors).to.be.an("array")
    expect(interceptors).to.have.length(0)
  })

  it(`should support unregistering an interceptor`, () => {
    client.register(jsonResponse)
    let { interceptors } = client
    expect(interceptors).to.be.an("array")
    expect(interceptors[0].id).to.be.equal("TINY_FETCH_JSON_RESPONSE")
    client.unregister("TINY_FETCH_JSON_RESPONSE")
    interceptors = client.interceptors
    expect(interceptors).to.be.an("array")
    expect(interceptors).to.have.length(0)
  })

  it(`should dedupe requests`, async () => {
    client = new TinyFetch([jsonRequest, jsonResponse])
    expect(client.requestCache.size).to.equal(0)
    const resp1 = await client.request(url)
    expect(client.requestCache.size).to.equal(1)
    const resp2 = await client.request(url)
    expect(client.requestCache.size).to.equal(1)
    const resp3 = await client.request(url)
    expect(client.requestCache.size).to.equal(1)
    const resp4 = await client.request(url)
    expect(client.requestCache.size).to.equal(1)
    expect(resp2).to.equal(resp1)
    expect(resp3).to.equal(resp1)
    expect(resp4).to.equal(resp1)
  })

  it(`should consolidate concurrent requests`, async () => {
    client = new TinyFetch([jsonRequest, jsonResponse])
    expect(client.requestMap.size).to.equal(0)
    const req1 = client.request(url)
    expect(client.requestMap.size).to.equal(1)
    const req2 = client.request(url)
    expect(client.requestMap.size).to.equal(1)
    const req3 = client.request(url)
    expect(client.requestMap.size).to.equal(1)
    const req4 = client.request(url)
    expect(client.requestMap.size).to.equal(1)

    const [one, two, three, four] = await Promise.all([req1, req2, req3, req4])
    expect(two).to.equal(one)
    expect(three).to.equal(one)
    expect(four).to.equal(one)

    expect(client.requestMap.size).to.equal(0)
  })

  describe("convenience methods", () => {
    it(`should support get`, async () => {
      const arr = [rejectErrors, jsonRequest, jsonResponse]
      client.register(arr)
      const resp = await client.get(url)
      expect(resp.data).to.be.an("array")
      expect(resp.data).to.have.length(24)
    })

    it(`should support post`, async () => {
      const arr = [rejectErrors, jsonRequest, jsonResponse]
      client.register(arr)
      try {
        const resp = await client.post(url, {
          body: {
            id: 25,
            employee_name: "Tom Bobby",
            employee_salary: 86000,
            employee_age: 305,
            profile_image: "",
          },
        })
        expect(resp).to.be.ok
      } catch (error) {
        expect(error).to.not.exist
      }
    })
    it(`should support put`, async () => {
      fetchMock.put(`${url}/25`, employees)
      const arr = [jsonRequest, jsonResponse]
      client.register(arr)
      try {
        const resp = await client.put(`${url}/25`, {
          body: {
            id: 25,
            employee_name: "Tom Bobby",
            employee_salary: 86000,
            employee_age: 25,
            profile_image: "",
          },
        })
        expect(resp).to.be.ok
      } catch (error) {
        expect(error).to.not.exist
      }
    })
    it(`should support patch`, async () => {
      fetchMock.patch(`${url}/25`, employees)
      const arr = [jsonRequest, jsonResponse]
      client.register(arr)
      try {
        const resp = await client.patch(`${url}/25`, {
          body: {
            id: 25,
            employee_name: "Tom Bobby",
            employee_salary: 86000,
            employee_age: 2500,
            profile_image: "",
          },
        })
        expect(resp).to.be.ok
      } catch (error) {
        expect(error).to.not.exist
      }
    })
  })
})
