import { isJson } from "../utils"

const jsonRequest = {
  request(url, options = {}) {
    options.headers = { ...(options.headers || {}), Accept: "application/json", "Content-Type": "application/json" }

    if (options.body && !isJson(options.body)) options.body = JSON.stringify(options.body)

    return [url, options]
  },
  id: "TINY_FETCH_JSON_REQUEST",
}

export default jsonRequest
