// 用户相关API接口
import request from '@/utils/request.js'

// 登录接口
export const login = (data) => {
  return request('/api/user/login', {
    method: 'POST',
    data
  })
}

// 微信登录接口
export const wechatLogin = (data) => {
  return request('/api/user/wechat-login', {
    method: 'POST',
    data
  })
}

// 注册接口
export const register = (data) => {
  return request('/api/user/register', {
    method: 'POST',
    data
  })
}

// 发送验证码接口
export const sendVerifyCode = (data) => {
  return request('/api/send-verify-code', {
    method: 'POST',
    data
  })
}

// 重置密码接口
export const resetPassword = (data) => {
  return request('/api/reset-password', {
    method: 'POST',
    data
  })
}

// 获取用户信息接口
export const getUserInfo = () => {
  return request('/api/user/info', {
    method: 'GET',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}

// 退出登录接口
export const logout = () => {
  return request('/api/logout', {
    method: 'POST',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
} 