export default {
	name: {
		required: true,
		type: String,
		trim: true,
		match: /^.{1,30}$/,
		msg: "俱乐部名称只能由1到30位字符组成"
	},
	description: {
		type: String,
		trim: true,
		maxlength: 500,
		msg: "俱乐部描述不能超过500字符"
	},
	avatar: {
		type: String,
		trim: true,
		msg: "俱乐部头像URL"
	},
	creator: {
		type: String,
		required: true,
		msg: "创建者ID不能为空"
	},
	members: [{
		userId: {
			type: String,
			required: true
		},
		joinTime: {
			type: Date,
			default: Date.now
		},
		role: {
			type: String,
			enum: ['creator', 'admin', 'member'],
			default: 'member'
		}
	}],
	maxMembers: {
		type: Number,
		default: 100,
		min: 1,
		max: 1000,
		msg: "俱乐部最大成员数量在1-1000之间"
	},
	currentMembers: {
		type: Number,
		default: 1,
		msg: "当前成员数量"
	},
	location: {
		type: String,
		trim: true,
		msg: "俱乐部所在地区"
	},
	tags: [{
		type: String,
		trim: true
	}],
	isPublic: {
		type: Boolean,
		default: true,
		msg: "是否公开俱乐部"
	},
	status: {
		type: String,
		enum: ['active', 'inactive', 'disbanded'],
		default: 'active',
		msg: "俱乐部状态"
	},
	announcement: {
		type: String,
		trim: true,
		maxlength: 200,
		msg: "俱乐部公告不能超过200字符"
	}
};