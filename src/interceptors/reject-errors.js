import { isJson } from "../utils"

const rejectErrors = {
  response(response) {
    if (isJson(response)) return response
    if (!response.ok) throw response
    return response
  },
  id: "TINY_FETCH_REJECT_ERRORS",
}

export default rejectErrors
