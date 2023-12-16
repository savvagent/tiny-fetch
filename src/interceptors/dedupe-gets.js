const requestMap = new Map()

const dedupeGets = { id: 'TINY_FETCH_DEDUPE_GETS' }

dedupeGets.request = async (request) => {
  const { method, url } = request
  const key = `${method}-${url}`
  if (method === 'GET') {
    if (requestMap.has(key)) {
      const req = requestMap.get(key)
      return req
    }
    requestMap.set(key, request)
    setTimeout(() => requestMap.delete(key), 1000)
    return request
  }
  return request
}

export default dedupeGets
