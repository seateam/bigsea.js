# bigsea.js

源码 https://github.com/BIGC-HUB/bigsea.js/blob/master/bigsea.js

示例

```js
Sea('body').addClass('done')

Sea.type('gua')
```

联系我 iwnagyang@qq.com

```js
// 静态方法
Sea.static = {
  // 打开新网页
  open(url, replace) {
    // 默认 https
    if (url.startsWith('http')) {
      // 不处理
    } else if (url.startsWith('//')) {
      url = 'http:' + url
    } else if (url.startsWith('/')) {
      // 不处理
    } else {
      url = 'https://' + url
    }
    if (replace) {
      window.location = url
    } else {
      window.open(url)
    }
  },
  // 浮点数运算
  float(n, digit = 10) {
    return parseFloat(n.toFixed(digit))
  },
  // 测试
  ensure(bool, message) {
    if (!bool) {
      log('测试失败:', message)
    }
  },
  // 循环 n 次后断点
  cut(n) {
    if (this.cut.count) {
      this.cut.count--
      if (this.cut.count == 1) {
        delete this.cut.count
        throw `断点：${n}次`
      }
    } else {
      if (n > 1) {
        this.cut.count = n
      } else {
        throw `断点`
      }
    }
  },
  // 返回 a-b 的随机数
  random(a, b) {
    return parseInt(Math.random() * (b - a) + a)
  },
  // 正则 特殊字符转义
  re(s, flag) {
    return new RegExp(s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$&'), flag || 'g')
  },
  // json 解析
  json(s) {
    try {
      return JSON.parse(s)
    } catch (err) {
      return s
    }
  },
  // 返回数据类型
  type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
  },
  // url 解析
  url(url) {
    let obj = {}
    let arr = []
    // url
    obj.url = url
    // protocol
    arr = url.split('://')
    obj.protocol = arr[1] ? arr[0] : ''
    url = arr[1] || arr[0]
    // host
    arr = url.split('/')
    obj.host = arr[0]
    url = arr.slice(1).join('/')
    // port
    obj.port = obj.host.split(':')[1] || 80
    // hash
    arr = url.split('#')
    obj.hash = arr[1] || ''
    url = arr[0]
    // query
    arr = url.split('?')
    obj.query = this.query(arr[1])
    url = arr[0]
    // path
    obj.path = '/' + url
    // origin
    obj.origin = obj.host
    if (obj.protocol && obj.host) {
      obj.origin = obj.protocol + '://' + obj.host
    }
    // href
    obj.href = obj.origin + obj.path
    return obj
  },
  // Ajax
  Ajax(request) {
    // 直接 GET 请求
    if (typeof request === 'string') {
      return new Promise((success, fail) => {
        const r = new XMLHttpRequest()
        r.open('GET', request, true)
        r.onreadystatechange = () => {
          // Promise 成功
          if (r.readyState === 4) {
            let res = this.json(r.response)
            if (typeof this.Ajax.initRes === 'function') {
              res = this.Ajax.initRes(res)
            }
            success(res)
          }
        }
        r.onerror = function (err) {
          fail(err)
        }
        r.send()
      })
    }
    const req = {
      method: (request.method || 'GET').toUpperCase(),
      url: request.url || '',
      data: request.data || {},
      query: request.query || {},
      header: request.header || {},
      callback: request.callback,
      cors: request.cors || '',
      hash: request.hash || '',
      timeout: request.timeout,
    }
    // 默认参数
    if (typeof this.Ajax.default === 'function') {
      req.data = Object.assign(this.Ajax.default(), req.data)
    }
    // host
    if (!req.url.startsWith('http')) {
      // 默认域名
      req.url = (this.Ajax.HOST || '') + req.url
    }
    // url 解析
    const url = this.url(req.url)
    req.url = url.path
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
    // cors 跨域
    if (req.cors) {
      req.header.cors = url.origin
      req.url = req.cors + req.url
    } else {
      req.url = url.origin + req.url
    }
    // promise
    return new Promise((success, fail) => {
      const r = new XMLHttpRequest()
      // 跨域请求 cookie
      if (this.Ajax.withCredentials) {
        r.withCredentials = true
      }
      // 设置超时
      if (req.timeout) {
        r.timeout = req.timeout
      }
      r.open(req.method, req.url, true)
      for (const key in req.header) {
        r.setRequestHeader(key, req.header[key])
      }
      r.onreadystatechange = () => {
        if (r.readyState === 4) {
          let res = this.json(r.response)
          if (typeof this.Ajax.initRes === 'function') {
            res = this.Ajax.initRes(res)
          }
          // 回调函数
          if (typeof req.callback === 'function') {
            req.callback(res)
          }
          // Promise 成功
          success(res)
        }
      }
      r.onerror = (err) => {
        fail(err)
      }
      if (req.method === 'GET') {
        r.send()
      } else {
        // POST
        if (typeof req.data === 'string') {
          r.send(req.data)
        } else {
          // 默认 json
          r.send(JSON.stringify(req.data))
        }
      }
    })
  },
  // 文档 https://developer.qiniu.com/kodo/sdk/1283/javascript
  upload(qiniu, file, token, callback) {
    // 关于 key 要怎么处理自行解决，但如果为 undefined 或者 null 会使用上传后的 hash 作为 key.
    let key = file.key
    if (!key) {
      const suffix = file.name.split('.')[1] || ''
      key = `temp/${Date.now()}.${suffix}`
    }

    // 因人而异，自行解决
    const putExtra = {}
    const config = {}
    const observable = qiniu.upload(file, key, token, putExtra, config)

    const next = (event) => {
      callback('next', event.total)
    }

    const error = (err) => {
      callback('error', err)
    }

    const complete = (res) => {
      callback('complete', res)
    }
    const uploadTask = observable.subscribe(next, error, complete)
    // uploadTask.unsubscribe()
    // 返回以方便取消上传操作
    return uploadTask
  },
  // 生成样式 String
  css(css, obj) {
    // this.css('top:hover', {'display':'block', 'cursor':'zoom-in'})
    let s = ''
    for (let key in obj) {
      let val = obj[key]
      s += `${key}:${val};`
    }
    if (css) {
      s = `${css}{${s}}`
    }
    return s
  },
  // 生成 query
  query(obj) {
    if (typeof obj === 'string') {
      let result = {}
      let start = obj.indexOf('?')
      let end = obj.indexOf('#')
      if (start === -1) {
        start = 0
      } else {
        start += 1
      }
      if (end === -1) {
        end = obj.length
      }
      obj = obj.slice(start, end)
      if (obj) {
        for (let e of obj.split('&')) {
          let arr = e.split('=')
          result[arr[0]] = arr[1] || ''
        }
      }
      return result
    } else {
      let arr = []
      for (let key in obj) {
        let val = obj[key]
        arr.push([key, val].join('='))
      }
      let s = ''
      if (arr.length) {
        s = '?' + arr.join('&')
      }
      return s
    }
  },
  // 检查 Object
  has(obj, path) {
    if (this.get(obj, path) === null) {
      return false
    }
    return true
  },
  // 获取 Object
  get(obj, path) {
    // 小海聚聚的完美回答
    path = path.replace(/\[/g, '.').replace(/\]/g, '')
    // path = path.replace(/\[(.+?)\]/g, '.$1')
    if (obj && path) {
      const arr = path.split('.')
      for (const k of arr) {
        if (typeof obj === 'object' && k in obj) {
          obj = obj[k]
        } else {
          return null
        }
      }
      return obj
    }
  },
  // 本地存储
  localStorage(key, val) {
    if (val === undefined) {
      return this.json(window.localStorage.getItem(key))
    } else {
      if (val === '') {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(val))
      }
    }
  },
  // 深拷贝
  deepCopy(data) {
    return this.json(JSON.stringify(data))
  },
}
```
