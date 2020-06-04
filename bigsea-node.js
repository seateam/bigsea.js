const log = console.log.bind(console, '>>>')
const axios = require('axios')
const Sea = require('./bigsea.js')
const SeaNode = {
  ...Sea.static,
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
    const url = this.parseUrl(req.url)
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
    req.url += this.query(query)
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
}
// 默认 host 域名
Sea.Ajax.HOST = 'https://api.bigc.cc'
module.exports = SeaNode
