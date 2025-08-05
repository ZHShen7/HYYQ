import { UserModel } from "../models/index.js";

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

/**
 * 认证中间件 - 验证用户token并将用户信息添加到上下文中
 * 
 * @param {Object} ctx - Koa上下文对象
 * @param {Function} next - 下一个中间件函数
 * 
 * @example
 * // 在路由中使用
 * Router.get('/protected', isAuth, async (ctx) => {
 *   // ctx.user 包含当前用户信息
 *   console.log('当前用户:', ctx.user);
 * });
 */
async function isAuth(ctx, next) {
    try {
        // 从请求头获取token
        const token = ctx.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            ctx.body = {
                success: false,
                message: "未授权访问，请先登录"
            };
            ctx.status = 401;
            return;
        }
        
        // 简单的token验证（基于项目现有的token格式：token_userId_timestamp）
        const tokenParts = token.split('_');
        if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
            ctx.body = {
                success: false,
                message: "token格式无效"
            };
            ctx.status = 401;
            return;
        }
        
        const userId = tokenParts[1];
        
        // 查找用户
        const [err, user] = await AsyncTo(UserModel.findById(userId));
        if (err) {
            console.error('查询用户失败:', err);
            ctx.body = {
                success: false,
                message: "服务器错误"
            };
            ctx.status = 500;
            return;
        }
        
        if (!user) {
            ctx.body = {
                success: false,
                message: "用户不存在或token已失效"
            };
            ctx.status = 401;
            return;
        }
        
        // 将用户信息添加到上下文中，供后续中间件使用
        ctx.user = {
            id: user._id.toString(),
            username: user.username,
            phone: user.phone,
            name: user.name,
            wechatOpenId: user.wechatOpenId,
            loginType: user.loginType
        };
        
        // 执行下一个中间件
        await next();
        
    } catch (error) {
        console.error('认证中间件错误:', error);
        ctx.body = {
            success: false,
            message: "认证失败"
        };
        ctx.status = 500;
    }
}


export {
    AsyncTo,
    SyncTo,
    AsyncToWithTimeout,
    isAuth
};