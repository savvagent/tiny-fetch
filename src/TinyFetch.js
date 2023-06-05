import { isJson, overloadMethod, toRequest } from './utils'

class TinyFetch {
  constructor(interceptors = [], _fetch) {
    const f =
      typeof fetch === 'function' && typeof window !== 'undefined'
        ? fetch.bind(window)
        : typeof globalThis !== 'undefined'
        ? fetch.bind(globalThis)
        : _fetch
    this.cache = new Map()
    this.interceptors = [...interceptors]
    this.requestPromise = null
    this.requestMap = new Map()
    this.fetch = f
  }

  clear() {
    this.interceptors = []
  }

  interceptor(req) {
    // console.log(`req`, req)
    let promise = Promise.resolve(req)

    this.interceptors.forEach(({ request, requestError }) => {
      if (request || requestError) {
        promise = promise.then((arg) => {
          return request(arg)
        }, requestError)
      }
    })

    promise = promise.then((a) => {
      // console.log(`a`, a)
      // console.log(`promise::a.headers.get('content-type')`, a.headers.get('content-type'))
      return this.fetch(a)
    })

    this.interceptors.forEach(({ response, responseError }) => {
      if (response || responseError) {
        promise = promise.then(response, responseError)
      }
    })

    return promise
  }

  register(_interceptor, pos) {
    if (Array.isArray(_interceptor)) this.interceptors = [...this.interceptors, ..._interceptor]
    else {
      const existing = Boolean(this.interceptors.find((i) => i.id === _interceptor.id))
      if (pos !== 'undefined' && !existing) {
        this.interceptors.splice(pos, 0, _interceptor)
      } else if (!existing) this.interceptors = [...this.interceptors, _interceptor]
    }
  }

  request(request) {
    const req = toRequest(request)
    const s = JSON.stringify({
      url: req.url,
      method: req.method,
      ...(req.body && isJson(req.body) && { body: JSON.stringify(req.body) }),
    })
    if (this.cache.has(s)) return this.cache.get(s)
    this.cache.set(
      s,
      this.interceptor(req).finally(() => this.cache.delete(s))
    )
    return this.cache.get(s)
  }

  delete(request) {
    const req = toRequest(request)
    const r = overloadMethod('DELETE', req)
    return this.request(r)
  }

  get(request) {
    const req = toRequest(request)
    const r = overloadMethod('GET', req)
    return this.request(r)
  }

  head(request) {
    const req = toRequest(request)
    const r = overloadMethod('HEAD', req)
    return this.request(r)
  }

  patch(request) {
    const req = toRequest(request)
    const r = overloadMethod('PATCH', req)
    return this.request(r)
  }

  post(request) {
    const req = toRequest(request)
    const r = overloadMethod('POST', req)
    return this.request(r)
  }

  put(request) {
    const req = toRequest(request)
    const r = overloadMethod('PUT', req)
    return this.request(r)
  }

  unregister(interceptorId) {
    this.interceptors = this.interceptors.filter((i) => i.id !== interceptorId)
  }

  get interceptors() {
    return this._interceptors
  }

  set interceptors(val) {
    this._interceptors = val
  }
}

export default TinyFetch
