import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UserListPage from '../pages/user/UserListPage';
import MatchListPage from '../pages/match/MatchListPage';
import NotFoundPage from '../pages/error/NotFoundPage';
import ForbiddenPage from '../pages/error/ForbiddenPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'user',
        children: [
          {
            path: 'list',
            element: (
              <ProtectedRoute requiredPermission="user:read">
                <UserListPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'match',
        children: [
          {
            path: 'list',
            element: (
              <ProtectedRoute requiredPermission="match:read">
                <MatchListPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // 其他模块的占位路由
      {
        path: 'audit/*',
        element: (
          <ProtectedRoute requiredPermission="audit:read">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">内容审核模块</h3>
                <p className="text-gray-500 mt-2">该模块正在开发中，敬请期待...</p>
              </div>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics/*',
        element: (
          <ProtectedRoute requiredPermission="analytics:read">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">数据分析模块</h3>
                <p className="text-gray-500 mt-2">该模块正在开发中，敬请期待...</p>
              </div>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system/*',
        element: (
          <ProtectedRoute requiredRole="super">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">系统管理模块</h3>
                <p className="text-gray-500 mt-2">该模块正在开发中，敬请期待...</p>
              </div>
            </div>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router; 