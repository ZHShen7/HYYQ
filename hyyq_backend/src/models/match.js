export default {
	content: {
		required: true,
		type: String,
		trim: true,
		maxlength: 500,
		msg: "约球内容不能为空且不超过500字符"
	},
	sport: {
		required: true,
		type: String,
		enum: ['足球', '篮球', '羽毛球', '网球', '乒乓球', '排球', '其他'],
		msg: "运动类型必须是：足球、篮球、羽毛球、网球、乒乓球、排球、其他"
	},
	matchTime: {
		required: true,
		type: String,
		trim: true,
		msg: "约球时间不能为空"
	},
	location: {
		required: true,
		type: String,
		trim: true,
		msg: "约球地点不能为空"
	},
	needPeople: {
		required: true,
		type: Number,
		min: 1,
		max: 50,
		msg: "需要人数必须在1-50之间"
	},
	currentPeople: {
		type: Number,
		default: 1,
		min: 0
	},
	level: {
		type: String,
		enum: ['新手', '入门', '进阶', '高手', '不限'],
		default: '不限',
		msg: "技能水平必须是：新手、入门、进阶、高手、不限"
	},
	contact: {
		type: String,
		trim: true,
		msg: "联系方式格式不正确"
	},
	images: {
		type: [String],
		default: [],
		validate: {
			validator: function(v) {
				return v.length <= 9;
			},
			message: "图片数量不能超过9张"
		}
	},
	status: {
		type: String,
		enum: ['active', 'completed', 'cancelled'],
		default: 'active',
		msg: "状态必须是：active、completed、cancelled"
	},
	userId: {
		required: true,
		type: String,
		ref: 'user',
		msg: "发布者ID不能为空"
	},
	userName: {
		required: true,
		type: String,
		trim: true,
		msg: "发布者姓名不能为空"
	},
	userAvatar: {
		type: String,
		trim: true
	},
	participants: {
		type: [{
			userId: {
				type: String,
				required: true,
				ref: 'user'
			},
			userName: {
				type: String,
				required: true
			},
			joinTime: {
				type: Date,
				default: Date.now
			}
		}],
		default: []
	},
	publishTime: {
		type: Date,
		default: Date.now
	}
}; 