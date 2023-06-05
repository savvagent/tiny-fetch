import { simpleLocale } from '../utils'

const acceptLang = {
  request(req) {
    req.headers.set('Accept-Language', simpleLocale)
    return req
  },
  id: 'TINY_FETCH_ACCEPT_LANGUAGE',
}

export default acceptLang
