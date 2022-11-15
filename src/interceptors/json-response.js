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

export default jsonResponse
