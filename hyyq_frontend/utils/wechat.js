// 微信登录工具
import { getPlatform } from './platform.js'
import { isWechatMiniProgram, isApp } from './platform.js'

// 微信小程序登录
export const wechatMiniProgramLogin = () => {
  return new Promise((resolve, reject) => {
    console.log('开始微信小程序登录...')
    console.log('当前平台:', getPlatform())
    
    if (!isWechatMiniProgram()) {
      console.error('当前平台不支持微信小程序登录')
      reject(new Error('当前平台不支持微信小程序登录'))
      return
    }

    console.log('调用uni.login...')
    // 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        console.log('uni.login成功:', loginRes)
        if (loginRes.code) {
          console.log('获取到code:', loginRes.code)
          // 获取用户信息
          uni.getUserInfo({
            provider: 'weixin',
            success: (userInfoRes) => {
              console.log('获取用户信息成功:', userInfoRes)
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
          console.error('未获取到code')
          reject(new Error('获取微信登录凭证失败'))
        }
      },
      fail: (err) => {
        console.error('uni.login失败:', err)
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
  console.log('wechatLogin被调用，当前平台:', getPlatform())
  console.log('isWechatMiniProgram():', isWechatMiniProgram())
  console.log('isApp():', isApp())
  
  if (isWechatMiniProgram()) {
    console.log('选择微信小程序登录方式')
    return wechatMiniProgramLogin()
  } else if (isApp()) {
    console.log('选择APP微信登录方式')
    return wechatAppLogin()
  } else {
    console.error('当前平台不支持微信登录')
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