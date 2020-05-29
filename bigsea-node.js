const axios = require('axios')
const static = require('./bigsea-static.js')
module.exports = {
  ...static,
  // Ajax
  Ajax(request) {
    // 直接 GET 请求
    if (typeof request === 'string') {
      return axios({
        method: 'GET',
        url: request,
      })
    }
    const req = {
      method: (request.method || 'GET').toUpperCase(),
      url: request.url || '',
      data: request.data || {},
      query: request.query || {},
      header: request.header || {},
      dataType: (request.dataType || 'json').toLowerCase(),
    }
    // url 解析
    const url = Sea.parseUrl(req.url)
    req.url = url.path
    // host
    if (!req.url.startsWith('http')) {
      let host = url.origin || this.Ajax.HOST || ''
      req.url = host + req.url
    }
    // query 请求
    let query = Object.assign(url.query, req.query)
    if (req.method === 'GET') {
      query = Object.assign(query, req.data)
    }
    req.url += Sea.query(query)
    // hash 锚点
    const hash = req.hash || url.hash
    if (hash) {
      req.url += '#' + hash
    }
    // 发送
    let options = {
      method: req.method,
      url: req.url,
      data: req.data,
      headers: req.header,
    }
    if (req.method === 'GET') {
      delete options.data
    }
    return axios(options)
  },
  toJSON(data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data)
    }
    return data
  },
}
