import KoaRouter from "koa-router";
import { AsyncTo } from "../../utils/function.js";
import { AdminModel, UserModel, MatchModel } from "../../models/index.js";
import AppConfig from "../../app.config.js";

const Router = KoaRouter();

// 简单的token验证工具函数（生产环境建议使用JWT）
function getAdminIdFromToken(token) {
	if (!token) return null;
	const parts = token.split('_');
	if (parts.length === 3 && parts[0] === 'admin') {
		return parts[1];
	}
	return null;
}

// 管理员登录接口
Router.post(`${AppConfig.publicPath}/api/admin/login`, async ctx => {
	const { username, password } = ctx.request.body;
	
	// 参数验证
	if (!username || !password) {
		ctx.body = { code: 400, msg: "用户名和密码不能为空" };
		return false;
	}
	
	// 查找管理员
	const [err, admin] = await AsyncTo(AdminModel.findOne({ username, status: 'active' }));
	if (err) {
		ctx.body = { code: 500, msg: "服务器错误" };
		console.log('查询管理员失败:', err);
		return false;
	}
	
	if (!admin) {
		ctx.body = { code: 400, msg: "管理员不存在或已被禁用" };
		return false;
	}
	
	// 验证密码
	if (admin.password !== password) {
		ctx.body = { code: 400, msg: "密码错误" };
		return false;
	}
	
	// 更新登录信息
	admin.lastLoginAt = new Date();
	admin.lastLoginIp = ctx.ip;
	admin.loginCount += 1;
	await admin.save();
	
	// 生成token
	const token = `admin_${admin._id}_${Date.now()}`;
	
	// 返回管理员信息（不包含密码）
	const adminData = {
		id: admin._id,
		username: admin.username,
		name: admin.name,
		role: admin.role,
		email: admin.email,
		phone: admin.phone,
		avatar: admin.avatar,
		permissions: admin.permissions,
		lastLoginAt: admin.lastLoginAt
	};
	
	ctx.body = { 
		code: 200, 
		data: adminData, 
		token: token,
		msg: "登录成功" 
	};
});

// 获取管理员信息接口
Router.get(`${AppConfig.publicPath}/api/admin/info`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	if (!token) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const adminId = getAdminIdFromToken(token);
	if (!adminId) {
		ctx.body = { code: 401, msg: "token无效" };
		return false;
	}
	
	// 查找管理员
	const [err, admin] = await AsyncTo(AdminModel.findById(adminId));
	if (err) {
		ctx.body = { code: 500, msg: "服务器错误" };
		console.log('查询管理员失败:', err);
		return false;
	}
	
	if (!admin || admin.status !== 'active') {
		ctx.body = { code: 404, msg: "管理员不存在或已被禁用" };
		return false;
	}
	
	// 返回管理员信息（不包含密码）
	const adminData = {
		id: admin._id,
		username: admin.username,
		name: admin.name,
		role: admin.role,
		email: admin.email,
		phone: admin.phone,
		avatar: admin.avatar,
		permissions: admin.permissions,
		lastLoginAt: admin.lastLoginAt
	};
	
	ctx.body = { 
		code: 200, 
		data: adminData, 
		msg: "获取管理员信息成功" 
	};
});

// 管理员登出接口
Router.post(`${AppConfig.publicPath}/api/admin/logout`, async ctx => {
	ctx.body = { code: 200, msg: "退出登录成功" };
});

// 获取用户列表接口（管理员专用）
Router.get(`${AppConfig.publicPath}/api/admin/users`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	const adminId = getAdminIdFromToken(token);
	
	if (!adminId) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const { 
		page = 1, 
		limit = 20,
		username,
		phone,
		loginType,
		status,
		startDate,
		endDate
	} = ctx.query;
	
	// 构建查询条件
	const query = {};
	if (username) {
		query.$or = [
			{ username: new RegExp(username, 'i') },
			{ name: new RegExp(username, 'i') }
		];
	}
	if (phone) {
		query.phone = new RegExp(phone, 'i');
	}
	if (loginType) {
		query.loginType = loginType;
	}
	if (status) {
		query.status = status;
	}
	if (startDate && endDate) {
		query.createdAt = {
			$gte: new Date(startDate),
			$lte: new Date(endDate + 'T23:59:59.999Z')
		};
	}
	
	// 分页参数
	const skip = (parseInt(page) - 1) * parseInt(limit);
	
	// 查询用户列表
	const [err, users] = await AsyncTo(
		UserModel.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.select('-password') // 不返回密码字段
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "查询用户列表失败" };
		console.log('查询用户列表失败:', err);
		return false;
	}
	
	// 获取总数
	const [countErr, total] = await AsyncTo(UserModel.countDocuments(query));
	
	ctx.body = { 
		code: 200, 
		data: users,
		pagination: {
			page: parseInt(page),
			limit: parseInt(limit),
			total: total || 0
		},
		msg: "查询用户列表成功" 
	};
});

// 更新用户状态接口（管理员专用）
Router.put(`${AppConfig.publicPath}/api/admin/users/:id/status`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	const adminId = getAdminIdFromToken(token);
	
	if (!adminId) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const userId = ctx.params.id;
	const { status } = ctx.request.body;
	
	// 参数验证
	if (!status || !['active', 'disabled', 'frozen'].includes(status)) {
		ctx.body = { code: 400, msg: "状态参数无效" };
		return false;
	}
	
	// 更新用户状态
	const [err, user] = await AsyncTo(
		UserModel.findByIdAndUpdate(userId, { status }, { new: true })
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "更新用户状态失败" };
		console.log('更新用户状态失败:', err);
		return false;
	}
	
	if (!user) {
		ctx.body = { code: 404, msg: "用户不存在" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: user, 
		msg: "用户状态更新成功" 
	};
});

// 获取约球列表接口（管理员专用）
Router.get(`${AppConfig.publicPath}/api/admin/matches`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	const adminId = getAdminIdFromToken(token);
	
	if (!adminId) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const { 
		page = 1, 
		limit = 20,
		keyword,
		sport,
		status,
		level,
		userId,
		searchTime
	} = ctx.query;
	
	// 构建查询条件
	const query = {};
	if (keyword) {
		query.$or = [
			{ content: new RegExp(keyword, 'i') },
			{ location: new RegExp(keyword, 'i') }
		];
	}
	if (sport) {
		query.sport = sport;
	}
	if (status) {
		query.status = status;
	}
	if (level) {
		query.level = level;
	}
	if (userId) {
		query.userId = userId;
	}
	
	// 时间点搜索：搜索约球时间段包含指定时间点的数据
	if (searchTime) {
		try {
			const searchDate = new Date(searchTime);
			console.log('搜索时间点:', searchDate);
			
			// 获取所有约球数据，然后在应用层进行时间段匹配
			// 这样可以处理字符串格式的startTime和数值格式的duration
			
			// 先不在这里过滤时间，而是在后续处理中进行时间段匹配
			// 将searchTime保存到query中，用于后续处理
			query._searchTime = searchTime;
		} catch (error) {
			console.log('时间解析失败:', error);
		}
	}
	
	// 处理时间段搜索的特殊情况
	delete query._searchTime; // 从查询条件中移除临时字段
	
	let matches = [];
	let total = 0;
	
	if (searchTime) {
		// 如果有时间点搜索，需要先获取所有匹配的数据，然后进行时间段过滤
		const [err, allMatches] = await AsyncTo(
			MatchModel.find(query).sort({ publishTime: -1 })
		);
		
		if (err) {
			ctx.body = { code: 500, msg: "查询约球列表失败" };
			console.log('查询约球列表失败:', err);
			return false;
		}
		
		// 时间段匹配过滤
		const searchDate = new Date(searchTime);
		const filteredMatches = allMatches.filter(match => {
			try {
				// 解析约球开始时间字符串 "07月29日 周二 18时00分"
				const startTimeStr = match.startTime;
				const duration = match.duration || 2; // 默认2小时
				
				// 简单的时间解析逻辑（这里需要根据实际格式调整）
				const timeMatch = startTimeStr.match(/(\d{2})月(\d{2})日.*?(\d{2})时(\d{2})分/);
				if (!timeMatch) return false;
				
				const month = parseInt(timeMatch[1]);
				const day = parseInt(timeMatch[2]);
				const hour = parseInt(timeMatch[3]);
				const minute = parseInt(timeMatch[4]);
				
				// 构建约球开始时间（假设是当年）
				const startTime = new Date();
				startTime.setMonth(month - 1, day);
				startTime.setHours(hour, minute, 0, 0);
				
				// 计算约球结束时间
				const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
				
				// 判断搜索时间点是否在约球时间段内
				return searchDate >= startTime && searchDate <= endTime;
			} catch (error) {
				console.log('时间段匹配错误:', error);
				return false;
			}
		});
		
		// 分页处理
		total = filteredMatches.length;
		const skip = (parseInt(page) - 1) * parseInt(limit);
		matches = filteredMatches.slice(skip, skip + parseInt(limit));
		
	} else {
		// 正常查询
		const skip = (parseInt(page) - 1) * parseInt(limit);
		
		const [err, queryMatches] = await AsyncTo(
			MatchModel.find(query)
				.sort({ publishTime: -1 })
				.skip(skip)
				.limit(parseInt(limit))
		);
		
		if (err) {
			ctx.body = { code: 500, msg: "查询约球列表失败" };
			console.log('查询约球列表失败:', err);
			return false;
		}
		
		// 获取总数
		const [countErr, countTotal] = await AsyncTo(MatchModel.countDocuments(query));
		
		matches = queryMatches;
		total = countTotal || 0;
	}
	
	ctx.body = { 
		code: 200, 
		data: matches,
		pagination: {
			page: parseInt(page),
			limit: parseInt(limit),
			total: total || 0
		},
		msg: "查询约球列表成功" 
	};
});

// 更新约球信息接口（管理员专用）
Router.put(`${AppConfig.publicPath}/api/admin/matches/:id`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	const adminId = getAdminIdFromToken(token);
	
	if (!adminId) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const matchId = ctx.params.id;
	const updateData = ctx.request.body;
	
	// 更新约球信息
	const [err, match] = await AsyncTo(
		MatchModel.findByIdAndUpdate(matchId, updateData, { new: true })
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "更新约球信息失败" };
		console.log('更新约球信息失败:', err);
		return false;
	}
	
	if (!match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: match, 
		msg: "约球信息更新成功" 
	};
});

// 更新约球状态接口（管理员专用）
Router.put(`${AppConfig.publicPath}/api/admin/matches/:id/status`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	const adminId = getAdminIdFromToken(token);
	
	if (!adminId) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const matchId = ctx.params.id;
	const { status } = ctx.request.body;
	
	// 参数验证
	if (!status || !['active', 'completed', 'cancelled'].includes(status)) {
		ctx.body = { code: 400, msg: "状态参数无效" };
		return false;
	}
	
	// 更新状态
	const [err, match] = await AsyncTo(
		MatchModel.findByIdAndUpdate(matchId, { status }, { new: true })
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "更新约球状态失败" };
		console.log('更新约球状态失败:', err);
		return false;
	}
	
	if (!match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: match, 
		msg: "更新约球状态成功" 
	};
});

// 删除约球接口（管理员专用）
Router.delete(`${AppConfig.publicPath}/api/admin/matches/:id`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	const adminId = getAdminIdFromToken(token);
	
	if (!adminId) {
		ctx.body = { code: 401, msg: "未授权访问" };
		return false;
	}
	
	const matchId = ctx.params.id;
	
	// 删除约球
	const [err, match] = await AsyncTo(MatchModel.findByIdAndDelete(matchId));
	
	if (err) {
		ctx.body = { code: 500, msg: "删除约球失败" };
		console.log('删除约球失败:', err);
		return false;
	}
	
	if (!match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		msg: "约球删除成功" 
	};
});

export default Router; 