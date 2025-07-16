// 认证相关工具函数

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
    url: '/pages/login/login'
  })
}

// 跳转到首页
export const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
} 