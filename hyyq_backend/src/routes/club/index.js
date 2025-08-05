import KoaRouter from "koa-router";
import { ClubModel, UserModel } from "../../models/index.js";
import { isAuth } from "../../utils/function.js";
import AppConfig from "../../app.config.js";

const Router = KoaRouter();

// 创建俱乐部
const createClub = async (ctx) => {
	try {
		const { name, description, avatar, maxMembers = 100, location, tags = [], isPublic = true, announcement } = ctx.request.body;
		const userId = ctx.user.id;

		// 检查用户是否已经创建过俱乐部
		const existingClub = await ClubModel.findOne({ creator: userId, status: 'active' });
		if (existingClub) {
			return ctx.body = {
				success: false,
				message: "您已经创建过俱乐部了，一个用户只能创建一个俱乐部"
			};
		}

		// 检查俱乐部名称是否已存在
		const existingName = await ClubModel.findOne({ name, status: 'active' });
		if (existingName) {
			return ctx.body = {
				success: false,
				message: "俱乐部名称已存在，请使用其他名称"
			};
		}

		// 创建俱乐部
		const club = new ClubModel({
			name,
			description,
			avatar,
			creator: userId,
			members: [{
				userId,
				joinTime: new Date(),
				role: 'creator'
			}],
			maxMembers,
			currentMembers: 1,
			location,
			tags,
			isPublic,
			announcement
		});

		await club.save();

		ctx.body = {
			success: true,
			message: "俱乐部创建成功",
			data: club
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "创建俱乐部失败：" + error.message
		};
	}
};

// 获取俱乐部列表
const getClubList = async (ctx) => {
	try {
		const { page = 1, limit = 10, search, location, tags } = ctx.query;
		const userId = ctx.user?.id;

		// 构建查询条件
		const query = { status: 'active', isPublic: true };
		if (search) {
			query.name = { $regex: search, $options: 'i' };
		}
		if (location) {
			query.location = { $regex: location, $options: 'i' };
		}
		if (tags && tags.length > 0) {
			query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
		}

		const skip = (page - 1) * limit;
		const clubs = await ClubModel.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.select('-members.userId');

		const total = await ClubModel.countDocuments(query);

		// 如果用户已登录，标记用户是否已加入俱乐部
		if (userId) {
			for (let club of clubs) {
				const isMember = club.members.some(member => member.userId.toString() === userId);
				club._doc.isMember = isMember;
				const memberInfo = club.members.find(member => member.userId.toString() === userId);
				club._doc.memberRole = memberInfo?.role || null;
			}
		}

		ctx.body = {
			success: true,
			data: {
				clubs,
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				totalPages: Math.ceil(total / limit)
			}
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "获取俱乐部列表失败：" + error.message
		};
	}
};

// 获取俱乐部详情
const getClubDetail = async (ctx) => {
	try {
		const { id } = ctx.params;
		const userId = ctx.user?.id;

		const club = await ClubModel.findById(id);
		if (!club || club.status !== 'active') {
			return ctx.body = {
				success: false,
				message: "俱乐部不存在或已解散"
			};
		}

		// 如果是私有俱乐部且用户未加入，不显示详情
		if (!club.isPublic && userId) {
			const isMember = club.members.some(member => member.userId.toString() === userId);
			if (!isMember) {
				return ctx.body = {
					success: false,
					message: "该俱乐部为私有俱乐部，仅成员可查看"
				};
			}
		}

		// 标记用户是否已加入
		if (userId) {
			const memberInfo = club.members.find(member => member.userId.toString() === userId);
			club._doc.isMember = !!memberInfo;
			club._doc.memberRole = memberInfo?.role || null;
		}

		ctx.body = {
			success: true,
			data: club
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "获取俱乐部详情失败：" + error.message
		};
	}
};

// 加入俱乐部
const joinClub = async (ctx) => {
	try {
		const { id } = ctx.params;
		const userId = ctx.user.id;

		const club = await ClubModel.findById(id);
		if (!club || club.status !== 'active') {
			return ctx.body = {
				success: false,
				message: "俱乐部不存在或已解散"
			};
		}

		// 检查是否已经是成员
		const isMember = club.members.some(member => member.userId.toString() === userId);
		if (isMember) {
			return ctx.body = {
				success: false,
				message: "您已经是该俱乐部成员了"
			};
		}

		// 检查俱乐部是否已满
		if (club.currentMembers >= club.maxMembers) {
			return ctx.body = {
				success: false,
				message: "俱乐部成员已满，无法加入"
			};
		}

		// 添加成员
		club.members.push({
			userId,
			joinTime: new Date(),
			role: 'member'
		});
		club.currentMembers += 1;

		await club.save();

		ctx.body = {
			success: true,
			message: "成功加入俱乐部"
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "加入俱乐部失败：" + error.message
		};
	}
};

// 离开俱乐部
const leaveClub = async (ctx) => {
	try {
		const { id } = ctx.params;
		const userId = ctx.user.id;

		const club = await ClubModel.findById(id);
		if (!club || club.status !== 'active') {
			return ctx.body = {
				success: false,
				message: "俱乐部不存在或已解散"
			};
		}

		// 检查是否是成员
		const memberIndex = club.members.findIndex(member => member.userId.toString() === userId);
		if (memberIndex === -1) {
			return ctx.body = {
				success: false,
				message: "您不是该俱乐部成员"
			};
		}

		// 检查是否是创建者
		if (club.creator.toString() === userId) {
			return ctx.body = {
				success: false,
				message: "创建者不能离开俱乐部，如需解散请使用解散功能"
			};
		}

		// 移除成员
		club.members.splice(memberIndex, 1);
		club.currentMembers -= 1;

		await club.save();

		ctx.body = {
			success: true,
			message: "成功离开俱乐部"
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "离开俱乐部失败：" + error.message
		};
	}
};

// 解散俱乐部（仅创建者可操作）
const disbandClub = async (ctx) => {
	try {
		const { id } = ctx.params;
		const userId = ctx.user.id;

		const club = await ClubModel.findById(id);
		if (!club || club.status !== 'active') {
			return ctx.body = {
				success: false,
				message: "俱乐部不存在或已解散"
			};
		}

		// 检查是否是创建者
		if (club.creator.toString() !== userId) {
			return ctx.body = {
				success: false,
				message: "只有创建者可以解散俱乐部"
			};
		}

		// 解散俱乐部
		club.status = 'disbanded';
		await club.save();

		ctx.body = {
			success: true,
			message: "俱乐部已解散"
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "解散俱乐部失败：" + error.message
		};
	}
};

// 获取我的俱乐部
const getMyClubs = async (ctx) => {
	try {
		const userId = ctx.user.id;

		// 获取我创建的俱乐部
		const createdClubs = await ClubModel.find({ 
			creator: userId, 
			status: 'active' 
		});

		// 获取我加入的俱乐部
		const joinedClubs = await ClubModel.find({ 
			'members.userId': userId, 
			creator: { $ne: userId },
			status: 'active' 
		});

		ctx.body = {
			success: true,
			data: {
				created: createdClubs,
				joined: joinedClubs
			}
		};
	} catch (error) {
		ctx.body = {
			success: false,
			message: "获取我的俱乐部失败：" + error.message
		};
	}
};

// 创建俱乐部
Router.post(`${AppConfig.publicPath}/api/club/create`, isAuth, createClub);

// 获取俱乐部列表（无需认证）
Router.get(`${AppConfig.publicPath}/api/club/list`, getClubList);

// 获取俱乐部详情（无需认证）
Router.get(`${AppConfig.publicPath}/api/club/:id`, getClubDetail);

// 加入俱乐部
Router.post(`${AppConfig.publicPath}/api/club/:id/join`, isAuth, joinClub);

// 离开俱乐部
Router.post(`${AppConfig.publicPath}/api/club/:id/leave`, isAuth, leaveClub);

// 解散俱乐部
Router.delete(`${AppConfig.publicPath}/api/club/:id`, isAuth, disbandClub);

// 获取我的俱乐部
Router.get(`${AppConfig.publicPath}/api/club/my/clubs`, isAuth, getMyClubs);

export default Router;