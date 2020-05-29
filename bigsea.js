// bigsea.js
class SEA {
  constructor(select) {
    if (typeof select == 'string') {
      this.arr = Array.from(document.querySelectorAll(select))
    } else if (select && select.addEventListener) {
      this.arr = [select]
    } else {
      this.arr = []
    }
    this.dom = this.arr[0] || null
  }
  // 观察者
  ob(options, callback) {
    // www.cnblogs.com/jscode/p/3600060.html
    let _callback = (e) => {
      callback.bind(this.dom)(e[0])
    }
    let listen = new MutationObserver(_callback)
    for (let dom of this.arr) {
      listen.observe(dom, options)
    }
  }
  // 事件 (绑定/委托)
  on(names, select, callback, one) {
    let off = function (e, arr) {
      if (Array.isArray(e.sea_event)) {
        e.sea_event.push(arr)
      } else {
        e.sea_event = [arr]
      }
    }
    // 多个事件
    for (let name of names.split(' ')) {
      // 参数转换
      if (callback === undefined) {
        callback = select
        // 绑定
        for (let e of this.arr) {
          let _callback = function (event) {
            callback.call(e, event)
            if (one === true) {
              e.removeEventListener(name, _callback)
            }
          }
          e.addEventListener(name, _callback, false)
          off(e, [name, select, _callback])
        }
      } else {
        // 委托
        for (let e of this.arr) {
          let _callback = function (event) {
            let parent = Sea(event.target).parent(select).dom
            this.querySelectorAll(select).forEach(function (dom, index) {
              if (dom.isSameNode(parent)) {
                // callback.bind(dom)(event, index)
                callback.call(dom, event, index)
                if (one === true) {
                  e.removeEventListener(name, _callback)
                }
              }
            })
          }
          if (['blur', 'focus'].includes(name)) {
            e.addEventListener(name, _callback, true)
          } else {
            e.addEventListener(name, _callback, false)
          }
          off(e, [name, select, _callback])
        }
      }
    }
  }
  // 一次性事件 (绑定/委托)
  one(name, select, callback) {
    this.on(name, select, callback, true)
  }
  // 移除事件
  off() {
    for (let e of this.arr) {
      if (Array.isArray(e.sea_event)) {
        for (let arr of e.sea_event) {
          let [name, select, callback] = arr
          e.removeEventListener(name, callback)
        }
        e.sea_event = undefined
      }
    }
    return this
  }
  // 触发自定义事件
  iEvent(name, obj, bubble) {
    let e = new Event(name, {
      bubbles: bubble || true,
    })
    e.data = obj || {}
    for (let dom of this.arr) {
      dom.dispatchEvent(e)
    }
  }
  // 样式
  css(obj, val) {
    let set = (k, v) => {
      for (let e of this.arr) {
        e.style[k] = String(v)
      }
    }
    if (typeof obj === 'string') {
      if (val === undefined) {
        return window.getComputedStyle(this.dom)[obj]
      } else {
        set(obj, val)
      }
    } else {
      for (let key in obj) {
        set(key, obj[key])
      }
    }
    return this
  }
  // 显示
  show(str) {
    for (let e of this.arr) {
      e.style.display = str || e.sea_display || 'flex'
    }
    return this
  }
  // 隐藏
  hide() {
    for (let e of this.arr) {
      let display = window.getComputedStyle(e).display
      if (display !== 'none') {
        e.sea_display = display
      }
      e.style.display = 'none'
    }
    return this
  }
  // 查找子元素
  find(select) {
    let sea = Sea()
    let arr = []
    if (this.dom) {
      for (let e of this.arr) {
        Array.from(e.querySelectorAll(select)).forEach((e) => {
          arr.push(e)
        })
      }
      sea.arr = arr
      sea.dom = arr[0]
    }
    return sea
  }
  // 查找父元素
  parent(select) {
    let sea = Sea()
    let arr = []
    if (this.dom) {
      if (select) {
        arr.push(this.dom.closest(select))
      } else {
        arr.push(this.dom.parentElement)
      }
      sea.arr = arr
      sea.dom = arr[0]
    }
    return sea
  }
  // 查找上一个元素
  prev() {
    if (this.dom) {
      return Sea(this.dom.previousSibling)
    }
  }
  // 查找下一个元素
  next() {
    if (this.dom) {
      return Sea(this.dom.nextSibling)
    }
  }
  // 子元素
  child() {
    let sea = Sea()
    let arr = []
    for (let e of this.dom.childNodes) {
      arr.push(e)
    }
    sea.arr = arr
    sea.dom = arr[0]
    return sea
  }
  // 选择
  eq(i) {
    let sea = Sea()
    if (typeof i === 'number') {
      let end = i + 1 === 0 ? undefined : i + 1
      let arr = this.arr.slice(i, end)
      sea.arr = arr
      sea.dom = arr[0]
    }
    return sea
  }
  // 循环
  each(callback) {
    // 在 callback 中 return = null 相当于 break
    for (let i = 0; i < this.arr.length; i++) {
      let e = new SEA(this.arr[i])
      // callback.bind(this.dom)(e, i)
      if (callback.call(this.arr[i], e, i) === null) {
        break
      }
    }
  }
  // 添加类
  addClass(str) {
    for (let e of this.arr) {
      for (let cls of str.split(' ')) {
        e.classList.add(cls)
      }
    }
    return this
  }
  // 删除类
  removeClass(str) {
    for (let e of this.arr) {
      for (let cls of str.split(' ')) {
        e.classList.remove(cls)
      }
    }
    return this
  }
  // 判断包含类
  hasClass(str) {
    return this.dom.classList.contains(str)
  }
  // 开关类
  toggleClass(str) {
    for (let e of this.arr) {
      return e.classList.toggle(str)
    }
  }
  // 获取或设置 文本
  text(text) {
    if (text !== undefined) {
      for (let e of this.arr) {
        e.innerText = String(text)
      }
    } else {
      if (this.dom) {
        return this.dom.innerText
      }
    }
  }
  // 获取或设置 HTML
  html(html) {
    if (typeof html == 'string') {
      for (let e of this.arr) {
        e.innerHTML = html
      }
    } else {
      if (this.dom) {
        return this.dom.innerHTML
      }
    }
  }
  // value
  val(str) {
    if (this.dom) {
      if (str !== undefined) {
        for (let e of this.arr) {
          e.value = str
        }
        return this
      } else {
        return this.dom.value
      }
    } else {
      return ''
    }
  }
  // dataset
  data(key, val) {
    if (this.dom) {
      if (val !== undefined) {
        for (let e of this.arr) {
          e.dataset[key] = val
        }
      } else {
        return this.dom.dataset[key]
      }
    }
  }
  // 元素内添加
  append(html, where) {
    let s = where || 'beforeend'
    for (let e of this.arr) {
      e.insertAdjacentHTML(s, html)
    }
    return this
  }
  appendChild(dom) {
    for (let e of this.arr) {
      e.appendChild(dom)
    }
    return this
  }
  // 首部 添加
  prepend(html) {
    return this.append(html, 'afterbegin')
  }
  // 之前 添加 现有元素外
  before(html) {
    return this.append(html, 'beforebegin')
  }
  // 元素外添加
  after(html) {
    return this.append(html, 'afterend')
  }
  // 删除
  remove() {
    for (let e of this.arr) {
      e.remove()
    }
  }
  // 获取或设置属性
  attr(key, val) {
    if (this.dom) {
      if (typeof val === 'string') {
        for (let e of this.arr) {
          e.setAttribute(key, val)
        }
      } else {
        return this.dom.getAttribute(key)
      }
    }
  }
  // 删除属性
  removeAttr(key) {
    for (let e of this.arr) {
      e.removeAttribute(key)
    }
    return this
  }
  // 开关属性
  toggleAttr(key, val) {
    if (this.dom) {
      if (this.attr(key) === null) {
        this.attr(key, val || '')
      } else {
        this.removeAttr(key)
      }
    }
  }
  // 点击
  click() {
    this.dom.click()
    return this
  }
  // 获得焦点
  focus() {
    if (this.dom) {
      this.dom.focus()
    }
    return this
  }
  // 失去焦点
  blur() {
    if (this.dom) {
      this.dom.blur()
    }
    return this
  }
  // 全选
  select() {
    if (this.dom) {
      this.dom.select()
    }
    return this
  }
}
// Sea
const Sea = function (select) {
  return new SEA(select)
}
// 静态方法
Sea.static = {
  // 打开新网页
  open(url, onlyURL) {
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
    if (onlyURL) {
      return url
    }
    window.open(url)
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
    if (Sea.cut.count) {
      Sea.cut.count--
      if (Sea.cut.count == 1) {
        delete Sea.cut.count
        throw `断点：${n}次`
      }
    } else {
      if (n > 1) {
        Sea.cut.count = n
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
  parseUrl(url) {
    let obj = {}
    let arr = []
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
    obj.query = Sea.query(arr[1])
    url = arr[0]
    // path
    obj.path = '/' + url
    // origin
    obj.origin = ''
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
      return new Promise(function (success, fail) {
        const r = new XMLHttpRequest()
        r.open('GET', request, true)
        r.onreadystatechange = function () {
          // Promise 成功
          if (r.readyState === 4) {
            let res = Sea.json(r.response)
            if (typeof Sea.Ajax.initRes === 'function') {
              res = Sea.Ajax.initRes(res)
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
    if (typeof Sea.Ajax.default === 'function') {
      req.data = Object.assign(Sea.Ajax.default(), req.data)
    }
    // host
    if (!req.url.startsWith('http')) {
      // 默认域名
      req.url = (this.Ajax.HOST || '') + req.url
    }
    // url 解析
    const url = Sea.parseUrl(req.url)
    req.url = url.path
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
    // cors 跨域
    if (req.cors) {
      req.header.cors = url.origin
      req.url = req.cors + req.url
    } else {
      req.url = url.origin + req.url
    }
    // promise
    return new Promise(function (success, fail) {
      const r = new XMLHttpRequest()
      // 跨域请求 cookie
      if (Sea.Ajax.withCredentials) {
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
      r.onreadystatechange = function () {
        if (r.readyState === 4) {
          let res = Sea.json(r.response)
          if (typeof Sea.Ajax.initRes === 'function') {
            res = Sea.Ajax.initRes(res)
          }
          // 回调函数
          if (typeof req.callback === 'function') {
            req.callback(res)
          }
          // Promise 成功
          success(res)
        }
      }
      r.onerror = function (err) {
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
    // Sea.css('top:hover', {'display':'block', 'cursor':'zoom-in'})
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
    for (let i = 0; i < path.length; i++) {
      const s = path[i]
    }
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
      return Sea.json(window.localStorage.getItem(key))
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
    return Sea.json(JSON.stringify(data))
  },
  // 合并
  merge(a, b, ...args) {
    if (window._ && _.merge) {
      return _.merge(a, b, ...args)
    }
    return null
  },
  // 网页字体
  initWebFont(fontName, text) {
    if (!text) {
      return
    }
    Sea.Ajax({
      method: 'POST',
      url: '/v3/webFont',
      data: {
        text: text,
        // 目前支持 ['TSSunOld', 'STLibianSC']
        font: fontName,
      },
    }).then((res) => {
      if (res.ok) {
        let dom = Sea(`.${fontName}`)
        if (dom.dom) {
          dom.html(res.data)
        } else {
          Sea('head').append(`<style class="${fontName}">${res.data}</style>`)
        }
      } else {
        console.log(res.msg)
      }
    })
  },
}
// 载入
for (let key in Sea.static) {
  Sea[key] = Sea.static[key]
}
// 默认 host 域名
// Sea.Ajax.HOST = 'https://api.bigc.cc'
// 默认参数
Sea.Ajax.default = function () {
  const data = {}
  const token = Sea.localStorage('token')
  if (token) {
    data.token = token
  }
  return data
}
// 返回值 统一处理
Sea.Ajax.initRes = function (res) {
  if (res) {
    return res
  } else {
    return {
      ok: false,
      msg: '请求失败',
    }
  }
}
// Sea 大海
if (typeof window === 'undefined') {
  module.exports = Sea
} else {
  window.log = console.log.bind(console, '🐸')
  window.Sea = Sea
}
