// 微信登录工具

import { isWechatMiniProgram, isApp } from './platform.js'

// 微信小程序登录
export const wechatMiniProgramLogin = () => {
  return new Promise((resolve, reject) => {
    if (!isWechatMiniProgram()) {
      reject(new Error('当前平台不支持微信小程序登录'))
      return
    }

    // 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.code) {
          // 获取用户信息
          uni.getUserInfo({
            provider: 'weixin',
            success: (userInfoRes) => {
              resolve({
                code: loginRes.code,
                userInfo: userInfoRes.userInfo
              })
            },
            fail: (err) => {
              console.error('获取用户信息失败:', err)
              // 即使获取用户信息失败，也返回登录凭证
              resolve({
                code: loginRes.code,
                userInfo: null
              })
            }
          })
        } else {
          reject(new Error('获取微信登录凭证失败'))
        }
      },
      fail: (err) => {
        console.error('微信登录失败:', err)
        reject(new Error('微信登录失败'))
      }
    })
  })
}

// APP端微信登录
export const wechatAppLogin = () => {
  return new Promise((resolve, reject) => {
    if (!isApp()) {
      reject(new Error('当前平台不支持APP微信登录'))
      return
    }

    // 检查是否安装了微信
    uni.getProvider({
      service: 'oauth',
      success: (res) => {
        if (res.provider.includes('weixin')) {
          // 微信授权登录
          uni.login({
            provider: 'weixin',
            success: (loginRes) => {
              resolve({
                code: loginRes.code,
                userInfo: null
              })
            },
            fail: (err) => {
              console.error('APP微信登录失败:', err)
              reject(new Error('APP微信登录失败'))
            }
          })
        } else {
          reject(new Error('未安装微信或微信版本过低'))
        }
      },
      fail: (err) => {
        console.error('获取服务提供商失败:', err)
        reject(new Error('获取服务提供商失败'))
      }
    })
  })
}

// 通用微信登录
export const wechatLogin = () => {
  if (isWechatMiniProgram()) {
    return wechatMiniProgramLogin()
  } else if (isApp()) {
    return wechatAppLogin()
  } else {
    return Promise.reject(new Error('当前平台不支持微信登录'))
  }
}

// 获取微信用户信息（仅小程序）
export const getWechatUserInfo = () => {
  return new Promise((resolve, reject) => {
    if (!isWechatMiniProgram()) {
      reject(new Error('仅微信小程序支持获取用户信息'))
      return
    }

    uni.getUserInfo({
      provider: 'weixin',
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (err) => {
        console.error('获取微信用户信息失败:', err)
        reject(new Error('获取微信用户信息失败'))
      }
    })
  })
}

// 检查微信登录权限
export const checkWechatLoginPermission = () => {
  return new Promise((resolve, reject) => {
    if (!isWechatMiniProgram()) {
      resolve(false)
      return
    }

    uni.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: () => {
        resolve(false)
      }
    })
  })
} 