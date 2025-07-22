import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import CustomTabBar from './custom-tab-bar/index.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 注册全局组件
  app.component('CustomTabBar', CustomTabBar)
  
  return {
    app
  }
}
// #endif