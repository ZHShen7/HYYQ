import "../src/database/index.js";
import { AdminModel } from "../src/models/index.js";

async function initAdmin() {
	try {
		// 检查是否已有管理员
		const existingAdmin = await AdminModel.findOne();
		if (existingAdmin) {
			console.log('管理员账号已存在，无需初始化');
			return;
		}

		// 创建默认管理员账号
		const admins = [
			{
				username: 'admin',
				password: 'admin123',
				name: '超级管理员',
				role: 'super',
				email: 'admin@hyyq.com',
				phone: '13800138000',
				permissions: ['*']
			},
			{
				username: 'operator',
				password: 'operator123',
				name: '运营管理员',
				role: 'operator',
				email: 'operator@hyyq.com',
				phone: '13800138001',
				permissions: ['user:read', 'user:write', 'match:read', 'match:write']
			}
		];

		for (const adminData of admins) {
			const admin = new AdminModel(adminData);
			await admin.save();
			console.log(`创建管理员: ${adminData.username} (${adminData.name})`);
		}

		console.log('管理员账号初始化完成！');
		console.log('登录信息:');
		console.log('超级管理员: admin / admin123');
		console.log('运营管理员: operator / operator123');
		
	} catch (error) {
		console.error('初始化管理员失败:', error);
	} finally {
		process.exit(0);
	}
}

initAdmin(); 