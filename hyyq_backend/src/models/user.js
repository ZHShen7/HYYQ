export default {
	username: {
		match: /^.{1,12}$/,
		msg: "用户名只能由1到12位任意字符组成",
		required: true,
		trim: true,
		type: String
	},
	name:{
		match: /^.{1,12}$/,
		msg: "姓名只能由1到12位任意字符组成",
		trim: true,
		type: String
	},
	password: {
		required: true,
		type: String
	},
	phone: {
		required: true,
		type: String
	},
	type:{
		match:/0-2/,
		required: true,
		type: Number
	},
	height:{
		type: String || Number
	},
	weight:{
		type: String || Number
	},
	age:{
		type: String || Number
	},
	sex:{
		type: String || Number
	},
	location:{
		type: String || Number
	}
};