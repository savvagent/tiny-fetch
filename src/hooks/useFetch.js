import TinyFetch from '../TinyFetch'
import { dedupeGets, jsonResponse, jsonRequest, rejectErrors } from '../interceptors'
const interceptors = [jsonRequest, dedupeGets, rejectErrors, jsonResponse]

let client = TinyFetch(interceptors)

export const configure = (options) => {
  options.interceptors = options.interceptors || interceptors
  client = new TinyFetch(options)
}

export default function useFetch(options) {}