export default {
	username: {
		required: true,
		type: String,
		trim: true,
		unique: true,
		minlength: 3,
		maxlength: 20,
		msg: "管理员用户名必须是3-20个字符"
	},
	password: {
		required: true,
		type: String,
		minlength: 6,
		msg: "管理员密码至少6个字符"
	},
	name: {
		required: true,
		type: String,
		trim: true,
		maxlength: 50,
		msg: "管理员姓名不能超过50个字符"
	},
	role: {
		type: String,
		enum: ['super', 'operator', 'auditor'],
		default: 'operator',
		msg: "管理员角色必须是：super、operator、auditor"
	},
	status: {
		type: String,
		enum: ['active', 'disabled'],
		default: 'active',
		msg: "管理员状态必须是：active、disabled"
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确']
	},
	phone: {
		type: String,
		trim: true,
		match: [/^1[3-9]\d{9}$/, '手机号格式不正确']
	},
	avatar: {
		type: String,
		trim: true
	},
	permissions: {
		type: [String],
		default: []
	},
	lastLoginAt: {
		type: Date
	},
	lastLoginIp: {
		type: String,
		trim: true
	},
	loginCount: {
		type: Number,
		default: 0
	}
}; 