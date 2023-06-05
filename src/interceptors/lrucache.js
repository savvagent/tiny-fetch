const cache = new Map()

const ttl = 1000 * 60 * 10 // 10 minutes

const jsonRequest = { id: 'TINY_FETCH_LRUCACHE' }

jsonRequest.mapKey = null

jsonRequest.request = (request) => {
  if (request.cache) {
    const { headers, url } = request
    const headerValues = [...headers.values()]
    const headerString = headerValues.join('')
    jsonRequest.mapKey = JSON.stringify({
      url,
      method: request.method,
      headerString,
    })
  }
  return request
}

jsonRequest.response = (response) => {
  if (jsonRequest.mapKey) {
    if (cache.has(jsonRequest.mapKey)) return cache.get(jsonRequest.mapKey)
    cache.set(jsonRequest.mapKey, response.clone())
    setTimeout(() => {
      cache.delete(jsonRequest.mapKey)
    }, ttl)
  }
  return response
}

export default jsonRequest
