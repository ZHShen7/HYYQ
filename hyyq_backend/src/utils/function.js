/**
 * 异步格式化函数 - 用于优雅地处理Promise的异步操作
 * 将Promise的结果转换为统一的[error, data]格式，避免使用try-catch
 * 
 * @param {Promise} pfn - 要处理的Promise对象
 * @param {Object} [error] - 可选的错误对象，用于扩展错误信息
 * @returns {Promise<Array>} 返回一个数组，格式为 [error, data]
 *                           - 成功时: [null, data]
 *                           - 失败时: [error, undefined]
 * 
 * @example
 * // 基本用法
 * const [error, data] = await AsyncTo(fetch('/api/users'));
 * if (error) {
 *   console.error('请求失败:', error);
 *   return;
 * }
 * console.log('用户数据:', data);
 * 
 * @example
 * // 带错误扩展的用法
 * const [error, data] = await AsyncTo(
 *   fetch('/api/users'),
 *   { context: '获取用户列表' }
 * );
 */
async function AsyncTo(pfn, error) {
    return await pfn
        .then((data) => [null, data])  // 成功时返回 [null, data]
        .catch((err) => [
            error ? Object.assign({}, err, error) : err,  // 失败时返回扩展的错误信息
            undefined
        ]);
}

/**
 * 同步版本的错误处理函数 - 用于处理可能抛出错误的同步函数
 * 
 * @param {Function} fn - 可能抛出错误的函数
 * @param {Object} [error] - 可选的错误对象，用于扩展错误信息
 * @returns {Array} 返回一个数组，格式为 [error, data]
 * 
 * @example
 * // 处理JSON解析
 * const [error, data] = SyncTo(() => JSON.parse('{"name": "test"}'));
 * if (error) {
 *   console.error('JSON解析失败:', error);
 *   return;
 * }
 * console.log('解析结果:', data);
 */
function SyncTo(fn, error) {
    try {
        const data = fn();
        return [null, data];
    } catch (err) {
        return [
            error ? Object.assign({}, err, error) : err,
            undefined
        ];
    }
}

/**
 * 带超时的异步函数包装器
 * 
 * @param {Promise} promise - 要执行的Promise
 * @param {number} timeout - 超时时间（毫秒）
 * @param {string} [timeoutMessage] - 超时时的错误消息
 * @returns {Promise<Array>} 返回 [error, data] 格式的结果
 * 
 * @example
 * // 5秒超时的API请求
 * const [error, data] = await AsyncToWithTimeout(
 *   fetch('/api/users'),
 *   5000,
 *   '请求超时'
 * );
 */
function AsyncToWithTimeout(promise, timeout, timeoutMessage = '操作超时') {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeout);
    });
    
    return AsyncTo(Promise.race([promise, timeoutPromise]));
}


export {
    AsyncTo,
    SyncTo,
    AsyncToWithTimeout
};