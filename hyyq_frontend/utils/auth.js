// 认证相关工具函数
import { ref, computed } from 'vue'

// 保存用户token
export const setToken = (token) => {
  uni.setStorageSync('token', token)
}

// 获取用户token
export const getToken = () => {
  return uni.getStorageSync('token')
}

// 删除用户token
export const removeToken = () => {
  uni.removeStorageSync('token')
}

// 保存用户信息
export const setUserInfo = (userInfo) => {
  uni.setStorageSync('userInfo', userInfo)
}

// 获取用户信息
export const getUserInfo = () => {
  return uni.getStorageSync('userInfo')
}

// 删除用户信息
export const removeUserInfo = () => {
  uni.removeStorageSync('userInfo')
}

// 检查是否已登录
export const isLoggedIn = () => {
  const token = getToken()
  return !!token
}

// 清除所有认证信息
export const clearAuth = () => {
  removeToken()
  removeUserInfo()
}

// 跳转到登录页
export const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}

// 跳转到首页
export const goToHome = () => {
  uni.switchTab({
    url: '/pages/home/index'
  })
}

// 响应式认证状态管理
export const useAuth = () => {
  const loginStatus = ref(isLoggedIn())
  const userInfo = ref(getUserInfo() || {})

  const updateAuthStatus = () => {
    loginStatus.value = isLoggedIn()
    userInfo.value = getUserInfo() || {}
  }

  const login = (token, user) => {
    setToken(token)
    setUserInfo(user)
    updateAuthStatus()
  }

  const logout = () => {
    clearAuth()
    updateAuthStatus()
  }

  return {
    isLoggedIn: computed(() => loginStatus.value),
    userInfo: computed(() => userInfo.value),
    login,
    logout,
    updateAuthStatus
  }
} 