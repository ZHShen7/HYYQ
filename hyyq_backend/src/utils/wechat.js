import axios from 'axios';
import wechatConfig from '../config/wechat.config.js';

/**
 * 调用微信API获取用户openid和session_key
 * @param {string} code - 微信登录凭证
 * @returns {Promise<Object>} 返回openid、unionid、session_key等信息
 */
export async function getWechatSession(code) {
	try {
		const url = wechatConfig.code2SessionUrl;
		const params = {
			appid: wechatConfig.appId,
			secret: wechatConfig.appSecret,
			js_code: code,
			grant_type: 'authorization_code'
		};

		const response = await axios.get(url, { params });
		const data = response.data;

		if (data.errcode) {
			throw new Error(`微信API错误: ${data.errmsg}`);
		}

		return {
			success: true,
			data: {
				openid: data.openid,
				unionid: data.unionid,
				session_key: data.session_key
			}
		};
	} catch (error) {
		console.error('微信API调用失败:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * 获取微信用户信息（需要用户授权）
 * @param {string} sessionKey - 会话密钥
 * @param {string} encryptedData - 加密的用户数据
 * @param {string} iv - 加密算法的初始向量
 * @returns {Promise<Object>} 返回解密后的用户信息
 */
export async function getWechatUserInfo(sessionKey, encryptedData, iv) {
	try {
		// 这里需要实现解密逻辑
		// 由于涉及加密解密，建议使用专门的加密库
		// 例如：crypto-js 或 node-crypto
		
		// 示例实现（需要根据实际情况调整）
		const crypto = require('crypto');
		
		const decipher = crypto.createDecipher('aes-128-cbc', sessionKey);
		decipher.setAutoPadding(true);
		
		let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
		decrypted += decipher.final('utf8');
		
		return JSON.parse(decrypted);
	} catch (error) {
		console.error('解密用户信息失败:', error);
		throw new Error('解密用户信息失败');
	}
}

/**
 * 验证微信登录凭证
 * @param {string} code - 微信登录凭证
 * @returns {Promise<Object>} 返回验证结果
 */
export async function verifyWechatCode(code) {
	if (!code) {
		return {
			success: false,
			error: '登录凭证不能为空'
		};
	}

	// 调用微信API验证
	return await getWechatSession(code);
}

/**
 * 生成微信用户默认信息
 * @param {string} openid - 微信openid
 * @param {Object} userInfo - 微信用户信息（可选）
 * @returns {Object} 返回用户数据对象
 */
export function generateWechatUserData(openid, userInfo = {}) {
	return {
		username: `wx_${openid.substring(0, 8)}`,
		name: userInfo.nickName || '微信用户',
		password: '', // 微信登录用户不需要密码
		phone: '', // 微信登录用户可能没有手机号
		wechatOpenId: openid,
		wechatUnionId: userInfo.unionId || '',
		wechatNickname: userInfo.nickName || '',
		wechatAvatar: userInfo.avatarUrl || '',
		loginType: 'wechat',
		type: 0 // 默认用户类型
	};
} 