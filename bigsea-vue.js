// Sea Vue
import Vue from 'vue'
// https://juejin.im/entry/5ca45ad7e51d452c02246d26
import lodash_merge from 'lodash.merge'
// 合并
Sea.merge = lodash_merge

Sea.Vue = {
  // main.js
  // Sea.Vue.that = new Vue({ ... })
  that: null,
  // 页面栈
  path: [],
  back() {
    if (this.path.length < 1) {
      this.push('/')
    } else {
      this.path.pop()
      this.that.$router.go(-1)
    }
  },
  push(path) {
    this.path.push(this.that.$route.path)
    this.that.$router.push(path)
  },
  replace(path) {
    this.that.$router.replace(path)
  },
  // 检查登录
  login() {
    const that = this.that
    // 已登录
    if (that.$store.getters.getUser) {
      return false
    } else {
      that
        .$msgbox({
          title: '提示',
          message: '登录后才可以使用此功能。',
        })
        .then(() => {
          this.push('/login')
        })
        .catch(() => { })
      return true
    }
  },
  eventBus: new Vue(),
  eventBusList: [],
  can$on(name) {
    if (!this.eventBusList.includes(name)) {
      this.eventBusList.push(name)
      return true
    } else {
      return false
    }
  },
  /*
  监听 Sea.Vue.eventBus.$on('event', callback)
  触发 Sea.Vue.eventBus.$emit('event', data)
  */
  // 加载图标
  initFontAwesomeJs() {
    // 动态添加 js
    const script = document.createElement('script')
    script.src = '/cdn/fontawesome/js/all.min.js'
    script.defer = true
    script.classList.add('fontawesome')
    if (!document.querySelector('.fontawesome')) {
      document.body.appendChild(script)
    }
  },
}

// 全局事件
window.addEventListener('keydown', event => {
  const ctrl = event.ctrlKey
  const alt = event.metaKey || event.altKey
  // crtl + alt + p
  if (ctrl && alt && event.keyCode === 80) {
    Sea.Vue.eventBus.$emit('musicPlay')
  }
})

window.addEventListener('storage', event => {
  // 登录改变
  if (event.key === 'token') {
    location.reload()
  }
})
