const static = require('./bigsea-static.js')
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
// 载入
for (let key in static) {
  Sea[key] = static[key]
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
module.exports = Sea
