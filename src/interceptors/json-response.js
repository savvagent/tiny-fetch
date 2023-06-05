const jsonResponse = {
  async response(response) {
    if (response.bodyUsed) return response
    try {
      const text = await response.text()
    const resp = { ...response, ...JSON.parse(text) }
    return resp
    } catch (error) {
      return response
    }
  },
  id: 'TINY_FETCH_JSON_RESPONSE',
}

export default jsonResponse
