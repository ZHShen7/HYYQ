// 请求封装模块

// API接口配置
const BASE_URL = 'http://116.62.127.61:3000' // 请替换为你的后端接口地址

// 请求封装
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        // 成功状态码范围：200-299
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          // 创建真正的Error对象，包含有用的错误信息
          const error = new Error(`HTTP ${res.statusCode}: ${res.data?.message || '请求失败'}`)
          error.statusCode = res.statusCode
          error.response = res
          error.data = res.data
          reject(error)
        }
      },
      fail: (err) => {
        // 网络错误等
        const error = new Error(err.errMsg || '网络请求失败')
        error.original = err
        reject(error)
      }
    })
  })
}

// 导出请求函数
export default request
