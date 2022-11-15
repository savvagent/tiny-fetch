import TinyUri from "tiny-uri"

const bustCache = {
  request(url, options = {}) {
    url = new TinyUri(url).query.add({ rn: new Date().getTime().toString() })

    return [url, options]
  },
  id: "TINY_FETCH_BUST_CACHE",
}

export default bustCache
