export const isJson = (str) => {
  try {
    if (JSON.parse(str)) return true
  } catch (e) {
    return false
  }
}

export const isObject = (thing) => typeof thing === 'object'

export const isString = (thing) => typeof thing === 'string'

export function isEmpty(value) {
  let empty = false
  if (value === null || value === undefined) empty = true
  else if (typeof value === 'string' && value === '') empty = true
  else if (value instanceof Date) empty = false
  else if ((Array.isArray(value) || typeof value === 'string') && value.length < 1) empty = true
  else if (typeof value === 'string' && !/\S/.test(value)) empty = true
  else if (typeof value === 'object' && Object.keys(value).length < 1) empty = true
  else if (typeof value === 'number' && value === 0) empty = true
  return empty
}

export function isNotEmpty(value) {
  return !isEmpty(value)
}

export const toRequest = (request) => (request instanceof Request ? request : new Request(request))

export const overloadMethod = (method, request) => {
  const { url } = request
  return new Request(url, { ...request, method })
}

