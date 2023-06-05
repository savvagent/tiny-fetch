import TinyUri from "tiny-uri"

const bustCache = {
  request(req) {
    const uri = new TinyUri(req.url).query.add({ rn: new Date().getTime().toString() }).toString()
    const request = new Request(uri, req)
    return request
  },
  id: 'TINY_FETCH_BUST_CACHE',
}

export default bustCache
