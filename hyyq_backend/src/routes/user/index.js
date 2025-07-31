import KoaRouter from "koa-router";
import { AsyncTo } from "../../utils/function.js";
import { UserModel, SmsCodeModel } from "../../models/index.js";
import AppConfig from "../../app.config.js";
import { verifyWechatCode, generateWechatUserData } from "../../utils/wechat.js";
import { sendSms, generateVerifyCode, validatePhone, checkSendFrequency } from "../../utils/sms.js";

const Router = KoaRouter();

// 短信发送频率限制记录（生产环境建议使用Redis）
const smsFrequencyCache = {};

// 用户注册接口 - 对应前端 /api/register
Router.post(`${AppConfig.publicPath}/api/user/register`, async ctx => {
	const params = ctx.request.body;
	
	// 参数验证
	if (!params.username || !params.password || !params.phone || !params.verifyCode) {
		ctx.body = { code: 400, msg: "用户名、密码、手机号和验证码不能为空" };
		return false;
	}
	
	// 验证手机号格式
	if (!validatePhone(params.phone)) {
		ctx.body = { code: 400, msg: "手机号格式不正确" };
		return false;
	}
	
	// // 验证短信验证码
	// const [codeErr, smsCode] = await AsyncTo(SmsCodeModel.findOne({
	// 	phone: params.phone,
	// 	code: params.verifyCode,
	// 	type: 'register',
	// 	used: false,
	// 	expiredAt: { $gt: new Date() } // 未过期
	// }));
	
	// if (codeErr) {
	// 	ctx.body = { code: 500, msg: "服务器错误" };
	// 	console.log('查询验证码失败:', codeErr);
	// 	return false;
	// }
	
	// if (!smsCode) {
	// 	ctx.body = { code: 400, msg: "验证码无效或已过期" };
	// 	return false;
	// }
	
	// 判断用户是否已存在
	const [err1, existingUser] = await AsyncTo(UserModel.findOne({ username: params.username }));
	if (err1) {
		ctx.body = { code: 500, msg: "服务器错误" };
		console.log('查询用户失败:', err1);
		return false;
	}
	
	if (existingUser) {
		ctx.body = { code: 400, msg: "用户名已存在" };
		return false;
	}
	
	// 检查手机号是否已存在
	const [err2, existingPhone] = await AsyncTo(UserModel.findOne({ phone: params.phone }));
	if (err2) {
		ctx.body = { code: 500, msg: "服务器错误" };
		console.log('查询手机号失败:', err2);
		return false;
	}
	
	if (existingPhone) {
		ctx.body = { code: 400, msg: "手机号已被注册" };
		return false;
	}
	
	try {
		// 标记验证码为已使用
		// await AsyncTo(SmsCodeModel.findByIdAndUpdate(smsCode._id, { used: true }));
		
		// 创建新用户
		const [err3, newUser] = await AsyncTo(UserModel.create(params));
		if (err3) {
			ctx.body = { code: 500, msg: "注册失败" };
			console.log('创建用户失败:', err3);
			return false;
		}
		
		// 返回成功响应，不包含密码
		const userData = {
			_id: newUser._id,
			username: newUser.username,
			name: newUser.name,
			phone: newUser.phone,
			type: newUser.type,
			height: newUser.height,
			weight: newUser.weight,
			age: newUser.age,
			sex: newUser.sex,
			location: newUser.location
		};

		ctx.body = { 
			code: 200, 
			data: userData, 
			msg: "注册成功" 
		};
		
	} catch (error) {
		console.log('注册处理失败:', error);
		ctx.body = { code: 500, msg: "注册失败" };
		return false;
	}
});

// 用户登录接口 - 对应前端 /api/user/login
Router.post(`${AppConfig.publicPath}/api/user/login`, async ctx => {
	const params = ctx.request.body;
	
	// 参数验证
	if (!params.username || !params.password) {
		ctx.body = { code: 400, msg: "用户名和密码不能为空" };
		return false;
	}
	
	// 查找用户
	const [err, user] = await AsyncTo(UserModel.findOne({ username: params.username }));
	if (err) {
		ctx.body = { code: 500, msg: "服务器错误" };
		console.log('查询用户失败:', err);
		return false;
	}
	
	if (!user) {
		ctx.body = { code: 400, msg: "用户不存在" };
		return false;
	}
	
	// 验证密码
	if (user.password !== params.password) {
		ctx.body = { code: 400, msg: "密码错误" };
		return false;
	}
	
	// 生成简单的token（实际项目中应该使用JWT）
	const token = `token_${user._id}_${Date.now()}`;
	
	// 返回用户信息（不包含密码）
	const userData = {
		_id: user._id,
		username: user.username,
		name: user.name,
		phone: user.phone,
		type: user.type,
		height: user.height,
		weight: user.weight,
		age: user.age,
		sex: user.sex,
		location: user.location
	};
	
	ctx.body = { 
		code: 200, 
		data: userData, 
		token: token,
		msg: "登录成功" 
	};
});

// 获取用户信息接口 - 对应前端 /api/user/info
Router.get(`${AppConfig.publicPath}/api/user/info`, async ctx => {
	// 从请求头获取token
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	if (!token) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	// 简单的token验证（实际项目中应该解析JWT）
	const tokenParts = token.split('_');
	if (tokenParts.length !== 3) {
		ctx.body = { code: 401, msg: "token无效" };
		return false;
	}
	
	const userId = tokenParts[1];
	
	// 查找用户
	const [err, user] = await AsyncTo(UserModel.findById(userId));
	if (err) {
		ctx.body = { code: 500, msg: "服务器错误" };
		console.log('查询用户失败:', err);
		return false;
	}
	
	if (!user) {
		ctx.body = { code: 404, msg: "用户不存在" };
		return false;
	}
	
	// 返回用户信息（不包含密码）
	const userData = {
		_id: user._id,
		username: user.username,
		name: user.name,
		phone: user.phone,
		type: user.type,
		height: user.height,
		weight: user.weight,
		age: user.age,
		sex: user.sex,
		location: user.location
	};
	
	ctx.body = { 
		code: 200, 
		data: userData, 
		msg: "获取用户信息成功" 
	};
});

// 微信登录接口 - 对应前端 /api/user/wechat-login
Router.post(`${AppConfig.publicPath}/api/user/wechat-login`, async ctx => {
	const params = ctx.request.body;
	console.log('=== 微信登录接口被调用 ===');
	console.log('接收到的参数:', JSON.stringify(params, null, 2));
	
	// 参数验证
	if (!params.code) {
		ctx.body = { code: 400, msg: "微信登录凭证不能为空" };
		return false;
	}
	
	try {
		// 调用微信API获取用户openid和session_key
		console.log('=== 开始调用微信API验证code ===');
		console.log('微信code:', params.code);
		
		const wechatResult = await verifyWechatCode(params.code);
		console.log('=== 微信API调用结果 ===');
		console.log('wechatResult:', JSON.stringify(wechatResult, null, 2));
		
		if (!wechatResult.success) {
			console.error('微信API调用失败:', wechatResult.error);
			ctx.body = { code: 400, msg: "微信登录失败: " + (wechatResult.error || '未知错误') };
			return false;
		}
		
		const { openid, unionid, session_key } = wechatResult.data;
		console.log('=== 解析出的微信用户信息 ===');
		console.log('openid:', openid);
		console.log('unionid:', unionid);
		console.log('session_key:', session_key ? '已获取' : '未获取');
		
		// 查找是否已有该微信用户
		console.log('=== 开始查询数据库中的微信用户 ===');
		const query = { 
			$or: [
				{ wechatOpenId: openid },
				{ wechatUnionId: unionid }
			]
		};
		console.log('查询条件:', JSON.stringify(query, null, 2));
		
		const [err1, existingUser] = await AsyncTo(UserModel.findOne(query));
		
		if (err1) {
			console.error('查询微信用户失败:', err1);
			ctx.body = { code: 500, msg: "服务器错误" };
			return false;
		}
		
		console.log('=== 数据库查询结果 ===');
		if (existingUser) {
			console.log('找到现有用户:', {
				_id: existingUser._id,
				username: existingUser.username,
				wechatOpenId: existingUser.wechatOpenId,
				wechatUnionId: existingUser.wechatUnionId,
				wechatNickname: existingUser.wechatNickname
			});
		} else {
			console.log('未找到现有用户，将创建新用户');
		}
		
		let user;
		
		if (existingUser) {
			// 用户已存在，直接登录
			user = existingUser;
			console.log('=== 使用现有用户登录 ===');
			
			// 更新微信信息（如果有新的信息）
			if (params.userInfo) {
				const updateData = {};
				if (params.userInfo.nickName) updateData.wechatNickname = params.userInfo.nickName;
				if (params.userInfo.avatarUrl) updateData.wechatAvatar = params.userInfo.avatarUrl;
				
				if (Object.keys(updateData).length > 0) {
					console.log('更新用户微信信息:', updateData);
					await AsyncTo(UserModel.findByIdAndUpdate(user._id, updateData));
				}
			}
		} else {
			// 新用户，创建账号
			console.log('=== 创建新微信用户 ===');
			console.log('用户信息参数:', params.userInfo);
			
			const userData = generateWechatUserData(openid, params.userInfo);
			console.log('生成的用户数据:', JSON.stringify(userData, null, 2));
			
			const [err2, newUser] = await AsyncTo(UserModel.create(userData));
			if (err2) {
				console.error('创建微信用户失败:', err2);
				ctx.body = { code: 500, msg: "创建微信用户失败" };
				return false;
			}
			
			user = newUser;
			console.log('新用户创建成功:', {
				_id: user._id,
				username: user.username,
				wechatOpenId: user.wechatOpenId
			});
		}
		
		// 生成token
		const token = `token_${user._id}_${Date.now()}`;
		console.log('=== 生成登录token ===');
		console.log('用户ID:', user._id);
		console.log('token:', token);
		
		// 返回用户信息（不包含密码）
		const userData = {
			_id: user._id,
			username: user.username,
			name: user.name,
			phone: user.phone,
			type: user.type,
			height: user.height,
			weight: user.weight,
			age: user.age,
			sex: user.sex,
			location: user.location,
			wechatNickname: user.wechatNickname,
			wechatAvatar: user.wechatAvatar,
			loginType: user.loginType
		};
		
		console.log('=== 微信登录成功 ===');
		console.log('返回的用户数据:', JSON.stringify(userData, null, 2));
		
		ctx.body = { 
			code: 200, 
			data: userData, 
			token: token,
			msg: existingUser ? "微信登录成功" : "微信注册并登录成功" 
		};
		
	} catch (error) {
		console.error('微信登录处理失败:', error);
		ctx.body = { code: 500, msg: "微信登录失败" };
		return false;
	}
});

// 发送短信验证码接口 - 对应前端 /api/user/send-verify-code
Router.post(`${AppConfig.publicPath}/api/user/send-verify-code`, async ctx => {
	const params = ctx.request.body;
	
	// 参数验证
	if (!params.phone) {
		ctx.body = { code: 400, msg: "手机号不能为空" };
		return false;
	}
	
	// 验证手机号格式
	if (!validatePhone(params.phone)) {
		ctx.body = { code: 400, msg: "手机号格式不正确" };
		return false;
	}
	
	// 检查发送频率限制
	const frequencyCheck = checkSendFrequency(params.phone, smsFrequencyCache);
	if (!frequencyCheck.allowed) {
		ctx.body = { code: 429, msg: frequencyCheck.message };
		return false;
	}
	
	// 验证码类型，默认为注册
	const type = params.type || 'register';
	
	// 如果是注册类型，检查手机号是否已存在
	if (type === 'register') {
		const [err, existingUser] = await AsyncTo(UserModel.findOne({ phone: params.phone }));
		if (err) {
			ctx.body = { code: 500, msg: "服务器错误" };
			console.log('查询用户失败:', err);
			return false;
		}
		
		if (existingUser) {
			ctx.body = { code: 400, msg: "该手机号已注册" };
			return false;
		}
	}
	
	try {
		// 生成验证码
		const code = generateVerifyCode();
		
		// 发送短信
		const smsResult = await sendSms(params.phone, code, type);
		
		if (!smsResult.success) {
			ctx.body = { code: 500, msg: "短信发送失败，请稍后重试" };
			console.log('短信发送失败:', smsResult.error);
			return false;
		}
		
		// 删除该手机号之前未使用的验证码
		await AsyncTo(SmsCodeModel.deleteMany({ 
			phone: params.phone, 
			type: type, 
			used: false 
		}));
		
		// 保存验证码到数据库
		const [saveErr, savedCode] = await AsyncTo(SmsCodeModel.create({
			phone: params.phone,
			code: code,
			type: type
		}));
		
		if (saveErr) {
			ctx.body = { code: 500, msg: "验证码保存失败" };
			console.log('验证码保存失败:', saveErr);
			return false;
		}
		
		// 更新发送频率记录
		smsFrequencyCache[params.phone] = Date.now();
		
		// 返回成功响应
		ctx.body = { 
			code: 200, 
			msg: "验证码发送成功",
			data: {
				phone: params.phone,
				type: type,
				// 开发环境返回验证码便于测试，生产环境不返回
				...(process.env.NODE_ENV === 'dev' && { code: code })
			}
		};
		
	} catch (error) {
		console.log('发送验证码处理失败:', error);
		ctx.body = { code: 500, msg: "验证码发送失败" };
		return false;
	}
});

// 验证短信验证码接口 - 对应前端 /api/user/verify-code
Router.post(`${AppConfig.publicPath}/api/user/verify-code`, async ctx => {
	const params = ctx.request.body;
	
	// 参数验证
	if (!params.phone || !params.code) {
		ctx.body = { code: 400, msg: "手机号和验证码不能为空" };
		return false;
	}
	
	const type = params.type || 'register';
	
	try {
		// 查找有效的验证码
		const [err, smsCode] = await AsyncTo(SmsCodeModel.findOne({
			phone: params.phone,
			code: params.code,
			type: type,
			used: false,
			expiredAt: { $gt: new Date() } // 未过期
		}));
		
		if (err) {
			ctx.body = { code: 500, msg: "服务器错误" };
			console.log('查询验证码失败:', err);
			return false;
		}
		
		if (!smsCode) {
			ctx.body = { code: 400, msg: "验证码无效或已过期" };
			return false;
		}
		
		// 标记验证码为已使用
		const [updateErr] = await AsyncTo(SmsCodeModel.findByIdAndUpdate(smsCode._id, { used: true }));
		if (updateErr) {
			console.log('更新验证码状态失败:', updateErr);
		}
		
		// 返回成功响应
		ctx.body = { 
			code: 200, 
			msg: "验证码验证成功",
			data: {
				phone: params.phone,
				type: type,
				verified: true
			}
		};
		
	} catch (error) {
		console.log('验证码验证处理失败:', error);
		ctx.body = { code: 500, msg: "验证码验证失败" };
		return false;
	}
});

// 测试短信发送接口 - 仅开发环境使用
if (process.env.NODE_ENV === 'dev') {
	Router.post(`${AppConfig.publicPath}/api/user/test-sms`, async ctx => {
		const params = ctx.request.body;
		
		if (!params.phone) {
			ctx.body = { code: 400, msg: "请提供测试手机号" };
			return false;
		}
		
		try {
			// 生成测试验证码
			const code = generateVerifyCode();
			
			// 发送短信
			const smsResult = await sendSms(params.phone, code, 'register');
			
			if (smsResult.success) {
				ctx.body = { 
					code: 200, 
					msg: "测试短信发送成功",
					data: {
						phone: params.phone,
						code: code, // 开发环境返回验证码
						provider: process.env.SMS_PROVIDER || 'mock'
					}
				};
			} else {
				ctx.body = { 
					code: 500, 
					msg: "测试短信发送失败",
					error: smsResult.error 
				};
			}
		} catch (error) {
			console.log('测试短信发送失败:', error);
			ctx.body = { code: 500, msg: "测试短信发送异常" };
		}
	});
}

export default Router;