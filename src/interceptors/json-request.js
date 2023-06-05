import { isJson, isNotEmpty } from '../utils'

const jsonRequest = {
  request(req) {
    req.headers.set('Content-Type', 'application/json')
    req.headers.set('Accept', 'application/json')
    if (isNotEmpty(req.body) && isJson(req.body)) req.body = JSON.stringify(req.body)
    return req
  },
  id: 'TINY_FETCH_JSON_REQUEST',
}

export default jsonRequest
