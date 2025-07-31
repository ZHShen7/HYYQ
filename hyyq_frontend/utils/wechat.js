// 微信登录工具
import { getPlatform } from './platform.js'
import { isWechatMiniProgram, isApp } from './platform.js'

// 微信小程序登录 - 重新设计流程
export const wechatMiniProgramLogin = () => {
  return new Promise((resolve, reject) => {
    console.log('开始微信小程序登录...')
    console.log('当前平台:', getPlatform())
    
    if (!isWechatMiniProgram()) {
      console.error('当前平台不支持微信小程序登录')
      reject(new Error('当前平台不支持微信小程序登录'))
      return
    }

    // 先获取用户信息（必须在用户点击的直接上下文中）
    console.log('调用getUserProfile获取用户信息...')
    uni.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (userInfoRes) => {
        console.log('获取用户信息成功:', userInfoRes)
        
        // 用户信息获取成功后，再获取登录凭证
        console.log('调用uni.login获取登录凭证...')
        uni.login({
          provider: 'weixin',
          success: (loginRes) => {
            console.log('uni.login成功:', loginRes)
            if (loginRes.code) {
              console.log('获取到code:', loginRes.code)
              resolve({
                code: loginRes.code,
                userInfo: userInfoRes.userInfo,
                rawData: userInfoRes.rawData,
                signature: userInfoRes.signature,
                encryptedData: userInfoRes.encryptedData,
                iv: userInfoRes.iv
              })
            } else {
              console.error('未获取到code')
              reject(new Error('获取微信登录凭证失败'))
            }
          },
          fail: (err) => {
            console.error('uni.login失败:', err)
            reject(new Error('微信登录失败: ' + (err.errMsg || '未知错误')))
          }
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        
        // 如果用户拒绝授权，尝试仅获取登录凭证
        if (err.errMsg && err.errMsg.includes('cancel')) {
          console.log('用户取消授权，尝试仅获取登录凭证')
          uni.showModal({
            title: '提示',
            content: '需要获取您的头像和昵称，以便为您提供更好的服务',
            showCancel: true,
            confirmText: '重新授权',
            cancelText: '暂不授权',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 用户选择重新授权，递归调用
                wechatMiniProgramLogin().then(resolve).catch(reject)
              } else {
                // 用户选择暂不授权，仅获取登录凭证
                getWechatCodeOnly().then(resolve).catch(reject)
              }
            },
            fail: () => {
              // 模态框失败，仅获取登录凭证
              getWechatCodeOnly().then(resolve).catch(reject)
            }
          })
        } else {
          // 其他错误，仅获取登录凭证
          console.log('获取用户信息失败，尝试仅获取登录凭证')
          getWechatCodeOnly().then(resolve).catch(reject)
        }
      }
    })
  })
}

// 仅获取微信登录凭证（不获取用户信息）
const getWechatCodeOnly = () => {
  return new Promise((resolve, reject) => {
    console.log('调用uni.login仅获取登录凭证...')
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        console.log('uni.login成功:', loginRes)
        if (loginRes.code) {
          console.log('获取到code:', loginRes.code)
          resolve({
            code: loginRes.code,
            userInfo: null
          })
        } else {
          console.error('未获取到code')
          reject(new Error('获取微信登录凭证失败'))
        }
      },
      fail: (err) => {
        console.error('uni.login失败:', err)
        reject(new Error('微信登录失败: ' + (err.errMsg || '未知错误')))
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
              reject(new Error('APP微信登录失败: ' + (err.errMsg || '未知错误')))
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

// 获取微信用户信息（使用新的API）
export const getWechatUserProfile = (desc = '用于完善用户资料') => {
  return new Promise((resolve, reject) => {
    if (!isWechatMiniProgram()) {
      reject(new Error('仅微信小程序支持获取用户信息'))
      return
    }

    uni.getUserProfile({
      desc: desc,
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (err) => {
        console.error('获取微信用户信息失败:', err)
        reject(new Error('获取微信用户信息失败: ' + (err.errMsg || '未知错误')))
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
        // 注意：scope.userInfo 权限在新版本中已经变化
        // 现在主要检查基础的授权情况
        console.log('当前授权情况:', res.authSetting)
        resolve(true) // 对于新版本，主要依赖用户主动授权
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

// 兼容旧版本的getUserInfo（保留以防万一）
export const getWechatUserInfo = () => {
  return new Promise((resolve, reject) => {
    if (!isWechatMiniProgram()) {
      reject(new Error('仅微信小程序支持获取用户信息'))
      return
    }

    // 先尝试新的API
    getWechatUserProfile()
      .then(resolve)
      .catch(() => {
        // 如果新API失败，尝试旧API（兼容性）
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
  })
} 