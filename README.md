# bigsea.js

直接在浏览器 中使用

```html
<script src="https://cdn.jsdelivr.net/npm/bigsea@latest/bigsea.js"></script>
```

安装

```
npm install bigsea --save
```

Vue 中使用

```js
// 推荐在 main.js 中引用，可以直接生成全局对象 window.Sea
import 'bigsea'
或
import Sea from 'bigsea'
```

Node.Js 中使用

```js
const Sea = require('bigsea')
```

示例

## DOM 操作

接口设计同 jQuery

#### 事件监听

```js
Sea('body').on('click', function () {
  log('点击 body')
})
```

#### 事件委托

```js
Sea('body').on('click', '.user', function () {
  log('点击 body 中的 .user 元素')
})
```

#### 一次性事件

```js
Sea('body').one('click', function () {
  log('点击 body 后，自动销毁该监听')
})
```

#### 移除所有事件

```js
Sea('body').off()
```

#### [观察者模式](https://www.cnblogs.com/jscode/p/3600060.html)

```js
Sea('body').ob(
  {
    childList: true, // 子元素的变动
    attributes: true, // 属性的变动
    characterData: true, // 节点内容或节点文本的变动
    subtree: true, // 所有下属节点（包括子节点和子节点的子节点）的变动
    attributeOldValue: true, // 需要记录变动前的属性值
    characterDataOldValue: true, // 需要记录变动前的数据值
    attributesFilter: ['class', 'str'], // 值为一个数组，表示需要观察的特定属性
  },
  function (event) {
    log(event)
  },
)
```

#### 静态方法

```js
Sea.open() // 打开新网页
Sea.float() // 浮点数运算
Sea.ensure() // 测试
Sea.cut() // 循环 n 次后断点
Sea.random() // 返回 a-b 的随机数
Sea.re() // 正则 特殊字符转义
Sea.json() // json 解析
Sea.type() // 返回数据类型
Sea.url() // url 解析
Sea.Ajax() // Ajax
Sea.css() // 生成样式 String
Sea.query() // 生成 query
Sea.has() // Object 检查
Sea.get() // Object 获取
Sea.arraySet() // 数组去重
Sea.localStorage() // 本地存储
Sea.deepCopy() // 深拷贝
```

```js
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
  // 循环 n 次后断点
  cut(n) {
    if (this.cut.count) {
      this.cut.count--
      if (this.cut.count === 1) {
        delete this.cut.count
        throw `断点：${n}次`
      }
    } else if (n > 1) {
      this.cut.count = n
    } else {
      throw `断点`
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
      request = { url: request }
    }
    const req = {
      method: (request.method || 'GET').toUpperCase(),
      url: request.url || '',
      data: request.data || {},
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
          let res = this.json(r.response)
          if (r.status !== 200) {
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
  // 文档 https://developer.qiniu.com/kodo/sdk/1283/javascript
  upload(qiniu, file, token, callback) {
    // 关于 key 要怎么处理自行解决，但如果为 undefined 或者 null 会使用上传后的 hash 作为 key.
    const key = file.key
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
    return uploadTask
    // 取消上传
    // uploadTask.unsubscribe()
  },
  // 生成样式 String
  css(css, obj) {
    // this.css('top:hover', {'display':'block', 'cursor':'zoom-in'})
    if (typeof css === 'object') {
      obj = css
    }
    let s = ''
    for (const key in obj) {
      const val = obj[key]
      s += `${key}:${val};`
    }
    if (typeof css === 'string') {
      s = `${css}{${s}}`
    }
    return s
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
        const key = this.get(item, path)
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
```

联系作者

大海团队 https://mp.sea.team
