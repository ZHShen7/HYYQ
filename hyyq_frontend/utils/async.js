// 异步操作工具

/**
 * 统一处理异步操作的结果
 * @param {Promise} promise - 异步操作
 * @returns {Promise<[any, Error]>} - 返回 [data, error] 格式的结果
 */
export const to = (promise) => {
  return promise
    .then(data => [data, null])
    .catch(error => [null, error])
}

/**
 * 处理异步操作，自动显示错误提示
 * @param {Promise} promise - 异步操作
 * @param {Object} options - 配置选项
 * @param {string} options.successMsg - 成功提示信息
 * @param {string} options.errorMsg - 错误提示信息
 * @param {boolean} options.showToast - 是否显示提示
 * @param {Function} options.onSuccess - 成功回调
 * @param {Function} options.onError - 错误回调
 * @returns {Promise<[any, Error]>} - 返回 [data, error] 格式的结果
 */
export const handleAsync = async (promise, options = {}) => {
  const {
    successMsg = '',
    errorMsg = '操作失败，请重试',
    showToast = true,
    onSuccess,
    onError
  } = options

  const [data, error] = await to(promise)

  if (error) {
    if (showToast) {
      uni.showToast({
        title: errorMsg,
        icon: 'none'
      })
    }
    if (onError) {
      onError(error)
    }
    console.error('操作失败:', error)
  } else {
    if (successMsg && showToast) {
      uni.showToast({
        title: successMsg,
        icon: 'success'
      })
    }
    if (onSuccess) {
      onSuccess(data)
    }
  }

  return [data, error]
}

/**
 * 处理异步操作，返回布尔值表示是否成功
 * @param {Promise} promise - 异步操作
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>} - 返回是否成功
 */
export const handleAsyncBoolean = async (promise, options = {}) => {
  const [data, error] = await handleAsync(promise, options)
  return !error
}

/**
 * 处理异步操作，自动处理loading状态
 * @param {Promise} promise - 异步操作
 * @param {Object} options - 配置选项
 * @param {Object} options.loading - loading状态对象 { loading: boolean }
 * @param {string} options.loadingText - loading提示文字
 * @returns {Promise<[any, Error]>} - 返回 [data, error] 格式的结果
 */
export const handleAsyncWithLoading = async (promise, options = {}) => {
  const { loading, loadingText = '加载中...' } = options

  if (loading) {
    loading.value = true
    if (loadingText) {
      uni.showLoading({
        title: loadingText
      })
    }
  }

  try {
    const [data, error] = await handleAsync(promise, options)
    return [data, error]
  } finally {
    if (loading) {
      loading.value = false
      uni.hideLoading()
    }
  }
}

/**
 * 批量处理多个异步操作
 * @param {Promise[]} promises - 异步操作数组
 * @param {Object} options - 配置选项
 * @returns {Promise<[any[], Error[]]>} - 返回 [dataArray, errorArray] 格式的结果
 */
export const handleAsyncAll = async (promises, options = {}) => {
  const results = await Promise.allSettled(promises)
  
  const dataArray = []
  const errorArray = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      dataArray[index] = result.value
    } else {
      errorArray[index] = result.reason
      console.error(`第${index + 1}个操作失败:`, result.reason)
    }
  })

  if (errorArray.length > 0 && options.showToast !== false) {
    uni.showToast({
      title: options.errorMsg || '部分操作失败',
      icon: 'none'
    })
  }

  return [dataArray, errorArray]
}

/**
 * 重试机制
 * @param {Function} fn - 要重试的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试间隔（毫秒）
 * @returns {Promise<[any, Error]>} - 返回 [data, error] 格式的结果
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn()
      return [result, null]
    } catch (error) {
      lastError = error
      console.warn(`第${i + 1}次尝试失败:`, error)
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return [null, lastError]
}

/**
 * 超时控制
 * @param {Promise} promise - 异步操作
 * @param {number} timeout - 超时时间（毫秒）
 * @param {string} timeoutMsg - 超时提示信息
 * @returns {Promise<[any, Error]>} - 返回 [data, error] 格式的结果
 */
export const withTimeout = (promise, timeout = 10000, timeoutMsg = '请求超时') => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMsg))
    }, timeout)
  })

  return to(Promise.race([promise, timeoutPromise]))
} 