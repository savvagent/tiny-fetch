class TinyFetch {
  constructor(interceptors = [], _fetch) {
    const f =
      typeof fetch === "function" && typeof window !== "undefined"
        ? fetch.bind(window)
        : typeof global !== "undefined"
        ? fetch.bind(global)
        : fetch
    this.interceptors = [...interceptors]
    this.requestMap = new Map()
    this.requestCache = new Map()
    this.fetch = f
  }

  clear() {
    this.interceptors = []
  }

  interceptor(...args) {
    let promise = Promise.resolve(args)

    this.interceptors.forEach(({ request, requestError }) => {
      if (request || requestError) {
        promise = promise.then((_args) => request(..._args), requestError)
      }
    })

    // Register fetch call
    promise = promise.then((_args) => {
      const [url, options] = _args
      return this.fetch(url, options)
    })

    // Register response interceptors
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
      if (pos !== "undefined" && !existing) {
        this.interceptors.splice(pos, 0, _interceptor)
      } else if (!existing) this.interceptors = [...this.interceptors, _interceptor]
    }
  }

  request(...args) {
    const [url, options] = args
    const conf = options || {}
    const s = JSON.stringify(...args)
    const loading = this.requestMap.get(s)
    const cached = this.requestCache.has(s)
    if (loading) return loading
    if (cached) return this.requestCache.get(s).response
    const response = this.interceptor(...args).finally(() => {
      this.requestMap.delete(s)
      const cache = this.requestCache.get(s)
      const { ttl } = cache
      setTimeout(() => this.requestCache.delete(s), ttl)
    })
    this.requestMap.set(s, response)
    this.requestCache.set(s, { ttl: conf.ttl || 0, response })
    return response
  }

  delete(...args) {
    const [url, options] = args
    const conf = options || {}
    conf.method = "DELETE"
    return this.request(url, conf)
  }

  get(...args) {
    const [url, options] = args
    const conf = options || {}
    conf.method = "GET"
    return this.request(url, conf)
  }

  head(...args) {
    const [url, options] = args
    const conf = options || {}
    conf.method = "HEAD"
    return this.request(url, conf)
  }

  patch(...args) {
    const [url, options] = args
    const conf = options || {}
    conf.method = "PATCH"
    return this.request(url, conf)
  }

  post(...args) {
    const [url, options] = args
    const conf = options || {}
    conf.method = "POST"
    return this.request(url, conf)
  }

  put(...args) {
    const [url, options] = args
    const conf = options || {}
    conf.method = "PUT"
    return this.request(url, conf)
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
