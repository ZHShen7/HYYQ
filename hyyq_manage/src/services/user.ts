import api from './api';
import type { User, UserListParams, ApiResponse, PaginationResponse } from '../types';

// 获取用户列表
export const getUserList = async (params: UserListParams): Promise<PaginationResponse<User>> => {
  return api.get('/admin/users', { params });
};

// 获取用户详情
export const getUserDetail = async (userId: string): Promise<ApiResponse<User>> => {
  return api.get(`/admin/users/${userId}`);
};

// 更新用户状态
export const updateUserStatus = async (userId: string, status: 'active' | 'disabled' | 'frozen'): Promise<ApiResponse> => {
  return api.put(`/admin/users/${userId}/status`, { status });
};

// 重置用户密码（暂未实现）
export const resetUserPassword = async (userId: string, newPassword: string): Promise<ApiResponse> => {
  console.log('重置密码参数:', { userId, newPassword }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '密码重置成功',
  });
};

// 获取用户统计信息（暂未实现）
export const getUserStats = async (userId: string): Promise<ApiResponse<{
  publishedMatches: number;
  joinedMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  activeDays: number;
  lastActiveTime: string;
}>> => {
  console.log('获取用户统计:', userId); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    data: {
      publishedMatches: Math.floor(Math.random() * 20) + 1,
      joinedMatches: Math.floor(Math.random() * 50) + 10,
      completedMatches: Math.floor(Math.random() * 30) + 5,
      cancelledMatches: Math.floor(Math.random() * 5),
      activeDays: Math.floor(Math.random() * 100) + 30,
      lastActiveTime: new Date().toISOString(),
    },
    msg: '获取用户统计成功',
  });
};

// 发送系统消息给用户（暂未实现）
export const sendMessageToUser = async (userId: string, params: {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'error';
}): Promise<ApiResponse> => {
  console.log('发送消息:', { userId, params }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '消息发送成功',
  });
};

// 添加用户备注（暂未实现）
export const addUserNote = async (userId: string, note: string): Promise<ApiResponse> => {
  console.log('添加备注:', { userId, note }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '备注添加成功',
  });
};

// 获取用户备注列表（暂未实现）
export const getUserNotes = async (userId: string): Promise<ApiResponse<Array<{
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}>>> => {
  console.log('获取用户备注:', userId); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    data: [
      {
        id: '1',
        note: '用户反馈积极，活跃度高',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
      },
    ],
    msg: '获取用户备注成功',
  });
};

// 导出用户数据（暂未实现）
export const exportUserData = async (params: UserListParams): Promise<Blob> => {
  console.log('导出用户数据:', params); // 避免未使用参数警告
  
  // 简单的CSV导出模拟
  const csvContent = 'ID,用户名,姓名,手机号,登录方式,状态,注册时间\n' +
    '示例数据,导出功能待实现...';
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  return Promise.resolve(blob);
}; 