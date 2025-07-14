import KoaRouter from "koa-router";
import { AsyncTo } from "../../utils/function.js";

import { UserModel } from "../../models/index.js";

import AppConfig from "../../app.config.js";

const Router = KoaRouter();

Router.post(`${AppConfig.publicPath}/users/register`, async ctx => {
	const params = ctx.request.body;
	// 判断产品是否存在
	const [err1, res1] = await AsyncTo(UserModel.findOne({ username: params.username }));
	if (err1) {
		ctx.body = { code: 400, msg: "新增用户失败" };
		return false;
	}
	if (res1) {
		ctx.body = { code: 400, msg: "当前用户已存在" };
		return false;
	}
	// 新增产品
	const [err2, res2] = await AsyncTo(UserModel.create(params));
	if (!err2 && res2) {
		ctx.body = { code: 200, data: res2, msg: "新增用户成功" };
	} else {
		ctx.body = { code: 400, msg: "新增用户失败" };
		console.log(err2)
	}
});

Router.post(`${AppConfig.publicPath}/users/login`, async ctx => {
	const params = ctx.request.body;
	// 判断用户是否存在
	const [err1, res1] = await AsyncTo(UserModel.findOne({ username: params.username }));
	if (err1) {
		ctx.body = { code: 400, msg: "登录失败" };
		console.log('1')
		return false;
	}
	if (!res1){
		ctx.body = { code: 400, msg: "未找到该用户" };
		console.log('2')
		return false;
	}
	if (res1.password === params.password) {
		ctx.body = { code: 200, msg: "登录成功", token: 1 };
	}
	else{
		ctx.body = { code: 200, msg: "密码错误", token: 0 };
	}
});



export default Router;