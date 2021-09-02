// bigsea.js
;(function (factory) {
  // node环境
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory()
  } else if (typeof define === 'function' && define.amd) {
    define(factory)
  }
  // 浏览器环境
  if (typeof window !== 'undefined') {
    window.log = console.log.bind(console, '🌊')
    window.Sea = factory()
  }
})(function () {
  class SEA {
    constructor(select) {
      if (typeof select === 'string') {
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
      const _callback = (e) => {
        callback.bind(this.dom)(e[0])
      }
      const listen = new MutationObserver(_callback)
      for (const dom of this.arr) {
        listen.observe(dom, options)
      }
    }

    // 事件 (绑定/委托)
    on(names, select, callback, one) {
      const off = function (e, arr) {
        if (Array.isArray(e.sea_event)) {
          e.sea_event.push(arr)
        } else {
          e.sea_event = [arr]
        }
      }
      // 多个事件
      for (const name of names.split(' ')) {
        // 参数转换
        if (callback === undefined) {
          callback = select
          // 绑定
          for (const e of this.arr) {
            const _callback = function (event) {
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
          for (const e of this.arr) {
            const _callback = function (event) {
              const parent = Sea(event.target).parent(select).dom
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
      for (const e of this.arr) {
        if (Array.isArray(e.sea_event)) {
          for (const arr of e.sea_event) {
            const name = arr[0]
            const callback = arr[2]
            e.removeEventListener(name, callback)
          }
          e.sea_event = undefined
        }
      }
      return this
    }

    // 触发自定义事件
    emit(name, obj, bubble) {
      const e = new Event(name, {
        // 事件冒泡
        bubbles: bubble || true,
      })
      e.data = obj || {}
      for (const dom of this.arr) {
        dom.dispatchEvent(e)
      }
    }

    // 样式
    css(obj, val) {
      // Sea('body').css('color') // 获取
      // Sea('body').css('color', 'red') // 设置单个
      // Sea('body').css({ color: 'red' }) // 设置多个
      const set = (k, v) => {
        for (const e of this.arr) {
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
        for (const key in obj) {
          set(key, obj[key])
        }
      }
      return this
    }

    // 显示
    show(str) {
      for (const e of this.arr) {
        e.style.display = str || e.sea_display || 'flex'
      }
      return this
    }

    // 隐藏
    hide() {
      for (const e of this.arr) {
        const display = window.getComputedStyle(e).display
        if (display !== 'none') {
          e.sea_display = display
        }
        e.style.display = 'none'
      }
      return this
    }

    // 查找子元素
    find(select) {
      const sea = Sea()
      const arr = []
      if (this.dom) {
        for (const e of this.arr) {
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
      const sea = Sea()
      const arr = []
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
      const sea = Sea()
      const arr = []
      for (const e of this.dom.childNodes) {
        arr.push(e)
      }
      sea.arr = arr
      sea.dom = arr[0]
      return sea
    }

    // 选择
    eq(i) {
      const sea = Sea()
      if (typeof i === 'number') {
        const end = i + 1 === 0 ? undefined : i + 1
        const arr = this.arr.slice(i, end)
        sea.arr = arr
        sea.dom = arr[0]
      }
      return sea
    }

    // 循环
    each(callback) {
      // 在 callback 中 return = null 相当于 break
      for (let i = 0; i < this.arr.length; i++) {
        const e = new SEA(this.arr[i])
        // callback.bind(this.dom)(e, i)
        if (callback.call(this.arr[i], e, i) === null) {
          break
        }
      }
    }

    // 添加类
    addClass(str) {
      for (const e of this.arr) {
        for (const cls of str.split(' ')) {
          e.classList.add(cls)
        }
      }
      return this
    }

    // 删除类
    removeClass(str) {
      for (const e of this.arr) {
        for (const cls of str.split(' ')) {
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
      for (const e of this.arr) {
        e.classList.toggle(str)
      }
    }

    // 获取或设置 文本
    text(text) {
      if (text !== undefined) {
        for (const e of this.arr) {
          e.innerText = String(text)
        }
      } else if (this.dom) {
        return this.dom.innerText
      }
    }

    // 获取或设置 HTML
    html(html) {
      if (typeof html === 'string') {
        for (const e of this.arr) {
          e.innerHTML = html
        }
      } else if (this.dom) {
        return this.dom.innerHTML
      }
    }

    // value
    val(str) {
      if (this.dom) {
        if (str !== undefined) {
          for (const e of this.arr) {
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
          for (const e of this.arr) {
            e.dataset[key] = val
          }
        } else {
          return this.dom.dataset[key]
        }
      }
    }

    // 元素内添加
    append(html, where) {
      const s = where || 'beforeend'
      for (const e of this.arr) {
        e.insertAdjacentHTML(s, html)
      }
      return this
    }

    appendChild(dom) {
      for (const e of this.arr) {
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
      for (const e of this.arr) {
        e.remove()
      }
    }

    // 获取或设置属性
    attr(key, val) {
      if (this.dom) {
        if (typeof val === 'string') {
          for (const e of this.arr) {
            e.setAttribute(key, val)
          }
        } else {
          return this.dom.getAttribute(key)
        }
      }
    }

    // 删除属性
    removeAttr(key) {
      for (const e of this.arr) {
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
  // https://juejin.im/entry/5ca45ad7e51d452c02246d26
  // 静态方法
  Sea.static = {
    openUrl(url) {
      // 默认 https
      if (url.startsWith('http')) {
        // 不处理 https http
      } else if (url.startsWith('//')) {
        url = 'http:' + url
      } else if (url.startsWith('/')) {
        // 不处理
      } else {
        url = 'https://' + url
      }
      return url
    },
    // 打开新网页
    open(url, replace) {
      const s = this.openUrl(url)
      if (replace) {
        window.location = s
      } else {
        window.open(s)
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
    // 返回 a-b 的随机数
    random(a, b) {
      return parseInt(Math.random() * (b - a) + a)
    },
    // 正则 特殊字符转义
    re(s, flag) {
      return new RegExp(
        s.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$&'),
        flag || 'g',
      )
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
      /*
      ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
      │                                               href                                              │
      ├──────────┬───┬─────────────────────┬────────────────────────┬───────────────────────────┬───────┤
      │ protocol │   │        auth         │          host          │                           │ hash  │
      │          │   │                     ├─────────────────┬──────┼──────────┬────────────────┤       │
      │          │   │                     │    hostname     │ port │   path   │     search     │       │
      │          │   │                     │                 │      │          ├─┬──────────────┤       │
      │          │   │                     │                 │      │          │ │    query     │       │
      "  https    ://    user   :   pass   @ sub.example.com : 8080   /p/a/t/h  ?  query=string # hash "
      │          │   │          │          │    hostname     │ port │          │                │       │
      │          │   │          │          ├─────────────────┴──────┤          │                │       │
      │ protocol │   │ username │ password │          host          │          │                │       │
      ├──────────┴───┼──────────┴──────────┼────────────────────────┤          │                │       │
      │    origin    │                     │         origin         │   path   │     search     │ hash  │
      ├──────────────┴─────────────────────┴────────────────────────┴──────────┴────────────────┴───────┤
      │                                               href                                              │
      └─────────────────────────────────────────────────────────────────────────────────────────────────┘
      */
      if (typeof url === 'object') {
        return this.urlFormat(url)
      }
      const obj = {}
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
      if (obj.protocol === 'https') {
        obj.port = 443
      }
      // hash
      arr = url.split('#')
      obj.hash = arr[1] || ''
      url = arr[0]
      // query
      arr = url.split('?')
      obj.query = this.query(arr[1]) || {}
      url = arr[0]
      // path
      obj.path = '/' + url
      // origin
      obj.origin = obj.host
      if (obj.protocol && obj.host) {
        obj.origin = obj.protocol + '://' + obj.host
      }
      // href
      const path = obj.path === '/' ? '' : obj.path
      obj.href = `${obj.origin}${path}`
      return obj
    },
    // url 生成
    urlFormat(obj) {
      // used: origin path query hash
      const origin = obj.origin || ''
      const path = obj.path || ''
      let query = obj.query || {}
      let hash = obj.hash || ''
      query = this.query(query)
      query = query ? `?${query}` : ''
      hash = hash ? `#${hash}` : ''
      const href = `${origin}${path}`
      return `${href}${query}${hash}`
    },
    // Ajax
    Ajax(request) {
      // 直接 GET 请求
      if (typeof request === 'string') {
        request = { url: request }
      }
      const req = {
        method: (request.method || 'GET').toUpperCase(),
        url: request.url || '',
        data: request.data || {},
        dataType: request.dataType || 'json',
        query: request.query || {},
        header: request.header || {},
        callback: request.callback,
        hash: request.hash || '',
        timeout: request.timeout,
      }
      // 默认参数
      if (typeof this.Ajax.default === 'function') {
        req.data = Object.assign(this.Ajax.default() || {}, req.data)
      }
      // host
      if (!req.url.startsWith('http')) {
        // 默认域名
        req.url = (this.Ajax.HOST || '') + req.url
      }
      // url 解析
      const url = this.url(req.url)
      req.url = url.origin + url.path
      // query 请求
      let query = Object.assign(url.query, req.query)
      if (req.method === 'GET') {
        query = Object.assign(query, req.data)
      }
      const search = this.query(query)
      if (search) {
        req.url += '?' + search
      }
      // hash 锚点
      const hash = req.hash || url.hash
      if (hash) {
        req.url += '#' + hash
      }
      // promise
      return new Promise((resolve, reject) => {
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
        // default json
        if (req.method !== 'GET' && !req.header['Content-Type']) {
          req.header['Content-Type'] = 'application/json'
        }
        for (const key in req.header) {
          r.setRequestHeader(key, req.header[key])
        }
        r.onreadystatechange = () => {
          if (r.readyState === 4) {
            const res = this.json(r.response)
            if (r.status < 200 || r.status >= 300) {
              if (typeof this.Ajax.fail === 'function') {
                this.Ajax.fail(r)
              }
            }
            // 回调函数
            if (typeof req.callback === 'function') {
              req.callback(res)
            }
            // Promise 成功
            resolve(res)
          }
        }
        r.onerror = (err) => {
          // Promise 失败
          reject(err)
        }
        if (req.method === 'GET') {
          r.send()
        } else {
          // POST
          if (typeof req.data === 'string') {
            r.send(req.data)
          }
          // default json
          r.send(JSON.stringify(req.data))
        }
      })
    },
    // 生成 query
    query(obj) {
      if (typeof obj === 'string') {
        const result = {}
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
          for (const e of obj.split('&')) {
            const arr = e.split('=')
            result[arr[0]] = decodeURIComponent(arr[1]) || ''
          }
        }
        return result
      } else {
        const arr = []
        for (const key in obj) {
          const val = obj[key]
          arr.push([key, val].join('='))
        }
        let s = ''
        if (arr.length) {
          s = arr.join('&')
        }
        return s
      }
    },
    // url params set get delete
    params(key, value) {
      const obj = new window.URL(window.location.href)
      if (value) {
        obj.searchParams.set(key, value)
      } else if (value === '') {
        obj.searchParams.delete(key, value)
      } else if (key) {
        return obj.searchParams.get(key)
      } else {
        return obj.searchParams
      }
      history.replaceState({}, 0, obj.href)
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
      return undefined
    },
    // 数组去重
    set(arr, path) {
      const result = []
      const dict = {}
      for (const item of arr) {
        if (typeof item === 'object') {
          const key = this.get(item, path || '')
          // 没找到不去重
          if (key === null) {
            result.push(item)
          } else if (dict[key] !== true) {
            dict[key] = true
            result.push(item)
          }
        } else if (dict[item] !== true) {
          dict[item] = true
          result.push(item)
        }
      }
      return result
    },
    // 本地存储
    localStorage(key, val) {
      if (val === undefined) {
        return this.json(window.localStorage.getItem(key))
      } else if (val === '') {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(val))
      }
    },
    // 深拷贝
    deepCopy(data) {
      return this.json(JSON.stringify(data))
    },
  }
  // 载入
  for (const key in Sea.static) {
    Sea[key] = Sea.static[key]
  }
  delete Sea.static
  // 默认 host 域名
  // Sea.Ajax.HOST = 'https://api.sea.team'
  // 默认参数
  // Sea.Ajax.default = () => {}
  // 返回值 统一处理
  // Sea.Ajax.fail = (res) => {}
  return Sea
})
