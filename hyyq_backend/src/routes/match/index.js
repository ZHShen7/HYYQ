import KoaRouter from "koa-router";
import { AsyncTo } from "../../utils/function.js";
import { MatchModel, UserModel } from "../../models/index.js";
import AppConfig from "../../app.config.js";

const Router = KoaRouter();

// 辅助函数：从token获取用户ID
const getUserIdFromToken = (token) => {
	if (!token) return null;
	
	const tokenParts = token.split('_');
	if (tokenParts.length !== 3) return null;
	
	return tokenParts[1];
};

// 发布约球接口 - 对应前端 /api/matches
Router.post(`${AppConfig.publicPath}/api/matches`, async ctx => {
	const params = ctx.request.body;
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	// 参数验证
	if (!params.content || !params.sport || !params.startTime || !params.location || !params.needPeople) {
		ctx.body = { code: 400, msg: "约球内容、运动类型、开始时间、地点和人数不能为空" };
		return false;
	}
	
	// 验证持续时间
	if (params.duration && (params.duration < 0.5 || params.duration > 24)) {
		ctx.body = { code: 400, msg: "活动持续时间必须在0.5-24小时之间" };
		return false;
	}
	
	// 获取用户信息
	const [userErr, user] = await AsyncTo(UserModel.findById(userId));
	if (userErr || !user) {
		ctx.body = { code: 404, msg: "用户不存在" };
		return false;
	}
	
	// 构建约球数据
	const matchData = {
		...params,
		userId: userId,
		userName: user.name || user.username,
		userAvatar: user.wechatAvatar || '/static/logo.png',
		currentPeople: 1,
		publishTime: new Date()
	};
	
	// 创建约球
	const [err, newMatch] = await AsyncTo(MatchModel.create(matchData));
	if (err) {
		ctx.body = { code: 500, msg: "发布约球失败" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: newMatch, 
		msg: "发布约球成功" 
	};
});

// 查询约球列表接口 - 对应前端 /api/matches
Router.get(`${AppConfig.publicPath}/api/matches`, async ctx => {
	const { sport, status = 'active', page = 1, limit = 20 } = ctx.query;
	
	// 构建查询条件
	const query = { status };
	if (sport && sport !== '') {
		query.sport = sport;
	}
	
	// 分页参数
	const skip = (parseInt(page) - 1) * parseInt(limit);
	
	// 查询约球列表
	const [err, matches] = await AsyncTo(
		MatchModel.find(query)
			.sort({ publishTime: -1 })
			.skip(skip)
			.limit(parseInt(limit))
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "查询约球列表失败" };
		return false;
	}
	
	// 获取总数
	const [countErr, total] = await AsyncTo(MatchModel.countDocuments(query));
	
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

// 查询我的约球接口 - 对应前端 /api/matches/my
Router.get(`${AppConfig.publicPath}/api/matches/my`, async ctx => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	const { page = 1, limit = 20 } = ctx.query;
	const skip = (parseInt(page) - 1) * parseInt(limit);
	
	// 查询我的约球
	const [err, matches] = await AsyncTo(
		MatchModel.find({ userId })
			.sort({ publishTime: -1 })
			.skip(skip)
			.limit(parseInt(limit))
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "查询我的约球失败" };
		return false;
	}
	
	// 获取总数
	const [countErr, total] = await AsyncTo(MatchModel.countDocuments({ userId }));
	
	ctx.body = { 
		code: 200, 
		data: matches,
		pagination: {
			page: parseInt(page),
			limit: parseInt(limit),
			total: total || 0
		},
		msg: "查询我的约球成功" 
	};
});

// 修改约球接口 - 对应前端 PUT /api/matches/:id
Router.put(`${AppConfig.publicPath}/api/matches/:id`, async ctx => {
	const matchId = ctx.params.id;
	const params = ctx.request.body;
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	// 查找约球
	const [findErr, match] = await AsyncTo(MatchModel.findById(matchId));
	if (findErr || !match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	// 权限验证
	if (match.userId !== userId) {
		ctx.body = { code: 403, msg: "只能修改自己发布的约球" };
		return false;
	}
	
	// 更新约球信息
	const [err, updatedMatch] = await AsyncTo(
		MatchModel.findByIdAndUpdate(matchId, params, { new: true })
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "修改约球失败" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: updatedMatch, 
		msg: "修改约球成功" 
	};
});

// 删除约球接口 - 对应前端 DELETE /api/matches/:id
Router.delete(`${AppConfig.publicPath}/api/matches/:id`, async ctx => {
	const matchId = ctx.params.id;
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	// 查找约球
	const [findErr, match] = await AsyncTo(MatchModel.findById(matchId));
	if (findErr || !match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	// 权限验证
	if (match.userId !== userId) {
		ctx.body = { code: 403, msg: "只能删除自己发布的约球" };
		return false;
	}
	
	// 删除约球
	const [err] = await AsyncTo(MatchModel.findByIdAndDelete(matchId));
	
	if (err) {
		ctx.body = { code: 500, msg: "删除约球失败" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		msg: "删除约球成功" 
	};
});

// 更新约球状态接口 - 对应前端 PUT /api/matches/:id/status
Router.put(`${AppConfig.publicPath}/api/matches/:id/status`, async ctx => {
	const matchId = ctx.params.id;
	const { status } = ctx.request.body;
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	// 参数验证
	if (!status || !['active', 'completed', 'cancelled'].includes(status)) {
		ctx.body = { code: 400, msg: "状态参数无效" };
		return false;
	}
	
	// 查找约球
	const [findErr, match] = await AsyncTo(MatchModel.findById(matchId));
	if (findErr || !match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	// 权限验证
	if (match.userId !== userId) {
		ctx.body = { code: 403, msg: "只能修改自己发布的约球状态" };
		return false;
	}
	
	// 更新状态
	const [err, updatedMatch] = await AsyncTo(
		MatchModel.findByIdAndUpdate(matchId, { status }, { new: true })
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "更新约球状态失败" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: updatedMatch, 
		msg: "更新约球状态成功" 
	};
});

// 参加约球接口 - 对应前端 POST /api/matches/:id/join
Router.post(`${AppConfig.publicPath}/api/matches/:id/join`, async ctx => {
	const matchId = ctx.params.id;
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	// 获取用户信息
	const [userErr, user] = await AsyncTo(UserModel.findById(userId));
	if (userErr || !user) {
		ctx.body = { code: 404, msg: "用户不存在" };
		return false;
	}
	
	// 查找约球
	const [findErr, match] = await AsyncTo(MatchModel.findById(matchId));
	if (findErr || !match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	// 检查是否是自己的约球
	if (match.userId === userId) {
		ctx.body = { code: 400, msg: "不能参加自己发布的约球" };
		return false;
	}
	
	// 检查是否已参加
	const isJoined = match.participants.some(p => p.userId === userId);
	if (isJoined) {
		ctx.body = { code: 400, msg: "已经参加了此约球" };
		return false;
	}
	
	// 检查人数是否已满
	if (match.currentPeople >= match.needPeople) {
		ctx.body = { code: 400, msg: "约球人数已满" };
		return false;
	}
	
	// 添加参与者
	const participant = {
		userId: userId,
		userName: user.name || user.username,
		joinTime: new Date()
	};
	
	const [err, updatedMatch] = await AsyncTo(
		MatchModel.findByIdAndUpdate(
			matchId,
			{
				$push: { participants: participant },
				$inc: { currentPeople: 1 }
			},
			{ new: true }
		)
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "参加约球失败" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: updatedMatch, 
		msg: "参加约球成功" 
	};
});

// 退出约球接口 - 对应前端 POST /api/matches/:id/leave
Router.post(`${AppConfig.publicPath}/api/matches/:id/leave`, async ctx => {
	const matchId = ctx.params.id;
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	
	// token验证
	const userId = getUserIdFromToken(token);
	if (!userId) {
		ctx.body = { code: 401, msg: "请先登录" };
		return false;
	}
	
	// 查找约球
	const [findErr, match] = await AsyncTo(MatchModel.findById(matchId));
	if (findErr || !match) {
		ctx.body = { code: 404, msg: "约球不存在" };
		return false;
	}
	
	// 检查是否已参加
	const isJoined = match.participants.some(p => p.userId === userId);
	if (!isJoined) {
		ctx.body = { code: 400, msg: "还没有参加此约球" };
		return false;
	}
	
	// 移除参与者
	const [err, updatedMatch] = await AsyncTo(
		MatchModel.findByIdAndUpdate(
			matchId,
			{
				$pull: { participants: { userId: userId } },
				$inc: { currentPeople: -1 }
			},
			{ new: true }
		)
	);
	
	if (err) {
		ctx.body = { code: 500, msg: "退出约球失败" };
		return false;
	}
	
	ctx.body = { 
		code: 200, 
		data: updatedMatch, 
		msg: "退出约球成功" 
	};
});

export default Router; 