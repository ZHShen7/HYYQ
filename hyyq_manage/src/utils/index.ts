import dayjs from 'dayjs';
import { STORAGE_KEYS } from '../constants';

// 格式化时间
export const formatTime = (time: string | Date | undefined, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '-';
  return dayjs(time).format(format);
};

// 格式化相对时间
export const formatRelativeTime = (time: string | Date | undefined) => {
  if (!time) return '-';
  const now = dayjs();
  const target = dayjs(time);
  
  const diffDays = now.diff(target, 'day');
  const diffHours = now.diff(target, 'hour');
  const diffMinutes = now.diff(target, 'minute');
  
  if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`;
  } else {
    return '刚刚';
  }
};

// 本地存储操作
export const storage = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  get: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

// Token 操作
export const tokenUtils = {
  get: () => storage.get<string>(STORAGE_KEYS.TOKEN),
  set: (token: string) => storage.set(STORAGE_KEYS.TOKEN, token),
  remove: () => storage.remove(STORAGE_KEYS.TOKEN),
};

// 手机号脱敏
export const maskPhone = (phone: string) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 身份证号脱敏
export const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 15) return idCard;
  return idCard.replace(/(\d{6})\d*(\d{4})/, '$1******$2');
};

// 数字格式化
export const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString();
};

// 文件大小格式化
export const formatFileSize = (bytes: number | undefined) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
};

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// URL 参数解析
export const parseQuery = (search: string) => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

// 生成随机字符串
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// 验证手机号
export const validatePhone = (phone: string) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证邮箱
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 