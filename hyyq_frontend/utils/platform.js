// 平台检测工具

// 获取当前平台
export const getPlatform = () => {
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  
  // #ifdef MP-ALIPAY
  return 'mp-alipay'
  // #endif
  
  // #ifdef MP-BAIDU
  return 'mp-baidu'
  // #endif
  
  // #ifdef MP-TOUTIAO
  return 'mp-toutiao'
  // #endif
  
  // #ifdef MP-QQ
  return 'mp-qq'
  // #endif
  
  // #ifdef APP-PLUS
  return 'app-plus'
  // #endif
  
  // #ifdef H5
  return 'h5'
  // #endif
  
  // #ifdef QUICKAPP-WEBVIEW
  return 'quickapp-webview'
  // #endif
  
  return 'unknown'
}

// 判断是否为微信小程序
export const isWechatMiniProgram = () => {
  return getPlatform() === 'mp-weixin'
}

// 判断是否为APP端
export const isApp = () => {
  return getPlatform() === 'app-plus'
}

// 判断是否为H5端
export const isH5 = () => {
  return getPlatform() === 'h5'
}

// 判断是否支持微信登录
export const supportWechatLogin = () => {
  const platform = getPlatform()
  return platform === 'mp-weixin' || platform === 'app-plus'
}

// 获取平台名称
export const getPlatformName = () => {
  const platform = getPlatform()
  const platformNames = {
    'mp-weixin': '微信小程序',
    'mp-alipay': '支付宝小程序',
    'mp-baidu': '百度小程序',
    'mp-toutiao': '字节跳动小程序',
    'mp-qq': 'QQ小程序',
    'app-plus': 'APP',
    'h5': 'H5',
    'quickapp-webview': '快应用'
  }
  return platformNames[platform] || '未知平台'
} 