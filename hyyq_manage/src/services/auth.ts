import api from './api';
import type { ApiResponse } from '../types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userInfo: {
    id: string;
    username: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    avatar?: string;
    permissions?: string[];
    lastLoginAt?: Date;
  };
}

// 管理员登录
export const login = async (params: LoginParams): Promise<ApiResponse<LoginResponse['userInfo']> & { token: string }> => {
  const response = await api.post('/admin/login', params) as ApiResponse<LoginResponse['userInfo']> & { token: string };
  
  return {
    code: response.code,
    data: response.data,
    msg: response.msg,
    token: response.token,
  };
};

// 获取当前管理员信息
export const getAdminInfo = (): Promise<ApiResponse<LoginResponse['userInfo']>> => {
  return api.get('/admin/info');
};

// 退出登录
export const logout = (): Promise<ApiResponse> => {
  return api.post('/admin/logout');
};

// 修改密码（后续实现）
export const changePassword = async (params: {
  oldPassword: string;
  newPassword: string;
}): Promise<ApiResponse> => {
  // 后续实现管理员修改密码接口
  console.log('修改密码参数:', params); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '密码修改成功',
  });
}; 