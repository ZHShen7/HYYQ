import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from '../constants';
import { tokenUtils } from '../utils';

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证 token
    const token = tokenUtils.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 后端返回格式：{ code: 200, data: {...}, msg: "success", token?: "..." }
    if (data.code === 200) {
      return data;
    } else if (data.code === 401) {
      // 未授权，清除token并跳转到登录页
      tokenUtils.remove();
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
      return Promise.reject(new Error('Unauthorized'));
    } else {
      // 其他错误
      message.error(data.msg || '请求失败');
      return Promise.reject(new Error(data.msg || 'Request failed'));
    }
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          tokenUtils.remove();
          window.location.href = '/login';
          message.error('登录已过期，请重新登录');
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('接口不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data?.msg || '请求失败');
      }
    } else if (error.request) {
      // 网络错误
      message.error('网络连接失败，请检查网络');
    } else {
      // 其他错误
      message.error('请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default api; 