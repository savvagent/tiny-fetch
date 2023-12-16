import { LRUCache } from 'lru-cache'

const options = {
  max: 500,
  ttl: 1000 * 60 * 10, // 10 minutes
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
}

const cache = new LRUCache(options)

const lruCache = { id: 'TINY_FETCH_LRUCACHE' }

lruCache.mapKey = null

lruCache.request = (request) => {
  const { method } = request
  if (method !== 'GET') return request
  const key = JSON.stringify(request)
  if (cache.has(key)) return cache.get(key)
  lruCache.mapKey = key
  return request
}

lruCache.response = (response) => {
  if (lruCache.mapKey) {
    cache.set(lruCache.mapKey, response.clone())
  }
  return response
}

export default lruCache
