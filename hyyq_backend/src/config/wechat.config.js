// 微信小程序配置
export default {
	// 微信小程序AppID
	appId: process.env.WECHAT_APP_ID || 'wxd03c469e7b52de9c',
	
	// 微信小程序AppSecret
	// 注意：这里需要替换为您的真实AppSecret
	// 您可以在微信公众平台获取：https://mp.weixin.qq.com/
	// 路径：开发 -> 开发管理 -> 开发设置 -> AppSecret(小程序密钥)
	appSecret: process.env.WECHAT_APP_SECRET || '9e4b74c06be4720b47b30af352fb2677',
	
	// 微信API接口地址
	apiUrl: 'https://api.weixin.qq.com',
	
	// 登录凭证校验接口
	code2SessionUrl: 'https://api.weixin.qq.com/sns/jscode2session',
	
	// 获取access_token接口
	accessTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
	
	// 获取用户信息接口
	userInfoUrl: 'https://api.weixin.qq.com/sns/userinfo',
	
	// 配置说明
	// 1. 在微信公众平台获取AppID和AppSecret
	// 2. 设置环境变量：
	//    WECHAT_APP_ID=your_app_id
	//    WECHAT_APP_SECRET=your_app_secret
	// 3. 或者直接在代码中替换默认值
}; 