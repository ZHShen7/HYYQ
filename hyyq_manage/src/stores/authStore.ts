import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenUtils, storage } from '../utils';
import { STORAGE_KEYS } from '../constants';

interface UserInfo {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  // 状态
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  token: string | null;
  
  // 操作
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
  
  // 权限检查
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      userInfo: null,
      token: null,
      
      // 登录
      login: (token: string, userInfo: UserInfo) => {
        tokenUtils.set(token);
        storage.set(STORAGE_KEYS.USER_INFO, userInfo);
        
        set({
          isAuthenticated: true,
          token,
          userInfo,
        });
      },
      
      // 退出登录
      logout: () => {
        tokenUtils.remove();
        storage.remove(STORAGE_KEYS.USER_INFO);
        
        set({
          isAuthenticated: false,
          token: null,
          userInfo: null,
        });
      },
      
      // 更新用户信息
      updateUserInfo: (newUserInfo: Partial<UserInfo>) => {
        const { userInfo } = get();
        if (userInfo) {
          const updatedUserInfo = { ...userInfo, ...newUserInfo };
          storage.set(STORAGE_KEYS.USER_INFO, updatedUserInfo);
          
          set({
            userInfo: updatedUserInfo,
          });
        }
      },
      
      // 权限检查 - 简单实现，实际项目中需要更复杂的权限系统
      hasPermission: (permission: string) => {
        const { userInfo } = get();
        if (!userInfo) return false;
        
        // 超级管理员拥有所有权限
        if (userInfo.role === 'super') return true;
        
        // 这里可以根据实际需求实现更复杂的权限判断
        const rolePermissions: Record<string, string[]> = {
          super: ['*'], // 所有权限
          operator: [
            'user:read',
            'user:write',
            'match:read',
            'match:write',
            'analytics:read',
          ],
          auditor: [
            'user:read',
            'match:read',
            'audit:read',
            'audit:write',
          ],
        };
        
        const permissions = rolePermissions[userInfo.role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      },
      
      // 角色检查
      hasRole: (role: string) => {
        const { userInfo } = get();
        return userInfo?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userInfo: state.userInfo,
        token: state.token,
      }),
    }
  )
); 