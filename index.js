"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

var TinyUri = require("tiny-uri")

function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { default: e }
}

var TinyUri__default = /*#__PURE__*/ _interopDefaultLegacy(TinyUri)

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
      const [url, config] = _args
      return this.fetch(url, config)
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
    const [url, config] = args
    const conf = config || {}
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
    const [url, config] = args
    const conf = config || {}
    conf.method = "DELETE"
    return this.request(url, conf)
  }

  get(...args) {
    const [url, config] = args
    const conf = config || {}
    conf.method = "GET"
    return this.request(url, conf)
  }

  head(...args) {
    const [url, config] = args
    const conf = config || {}
    conf.method = "HEAD"
    return this.request(url, conf)
  }

  patch(...args) {
    const [url, config] = args
    const conf = config || {}
    conf.method = "PATCH"
    return this.request(url, conf)
  }

  post(...args) {
    const [url, config] = args
    const conf = config || {}
    conf.method = "POST"
    return this.request(url, conf)
  }

  put(...args) {
    const [url, config] = args
    const conf = config || {}
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

function isJson(str) {
  try {
    if (JSON.parse(str)) return true
  } catch (e) {
    return false
  }
}

const jsonRequest = {
  request(url, config = {}) {
    const headers = { Accept: "application/json", "Content-Type": "application/json" }
    if (typeof config.headers === "object") Object.assign(config.headers, headers)
    else Object.assign(config, { headers })
    if (config.body && !isJson(config.body)) config.body = JSON.stringify(config.body)

    return [url, config]
  },
  id: "TINY_FETCH_JSON_REQUEST",
}

const jsonResponse = {
  response(response) {
    if (response.status === 204 || response.status === 201) return JSON.stringify({})
    return response.text().then((text) => {
      try {
        return JSON.parse(text)
      } catch (err) {
        return text
      }
    })
  },
  id: "TINY_FETCH_JSON_RESPONSE",
}

const rejectErrors = {
  response(response) {
    if (isJson(response)) return response
    if (!response.ok) throw response
    return response
  },
  id: "TINY_FETCH_REJECT_ERRORS",
}

const bustCache = {
  request(url, config = {}) {
    if (config && config.bustCache) {
      const u = new TinyUri__default["default"](url)
      u.query.add({ rn: new Date().getTime().toString() })
      url = u.toString()
    }

    return [url, config]
  },
  id: "TINY_FETCH_BUST_CACHE",
}

exports.TinyFetch = TinyFetch
exports.bustCache = bustCache
exports.jsonRequest = jsonRequest
exports.jsonResponse = jsonResponse
exports.rejectErrors = rejectErrors
