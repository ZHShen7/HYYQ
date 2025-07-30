import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { MENU_ITEMS } from '../../constants';

const { Header, Sider, Content } = Layout;

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  SettingOutlined: <SettingOutlined />,
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userInfo, logout } = useAuthStore();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    breadcrumbs, 
    pageTitle 
  } = useAppStore();

  // 构建菜单项
  const buildMenuItems = (items: typeof MENU_ITEMS): any[] => {
    return items.map(item => ({
      key: item.key,
      icon: iconMap[item.icon],
      label: item.label,
      onClick: item.children ? undefined : () => navigate(item.path),
      children: item.children ? buildMenuItems(item.children as any) : undefined,
    }));
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  // 获取当前选中的菜单键
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/user')) return ['user-list'];
    if (path.startsWith('/match')) return ['match-list'];
    if (path.startsWith('/audit')) return path.includes('/records') ? ['audit-records'] : ['audit-queue'];
    if (path.startsWith('/analytics')) {
      if (path.includes('/users')) return ['analytics-users'];
      if (path.includes('/matches')) return ['analytics-matches'];
      return ['analytics-overview'];
    }
    if (path.startsWith('/system')) return path.includes('/logs') ? ['system-logs'] : ['system-config'];
    return ['dashboard'];
  };

  // 获取展开的菜单键
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];
    if (path.startsWith('/user')) openKeys.push('user');
    if (path.startsWith('/match')) openKeys.push('match');
    if (path.startsWith('/audit')) openKeys.push('audit');
    if (path.startsWith('/analytics')) openKeys.push('analytics');
    if (path.startsWith('/system')) openKeys.push('system');
    return openKeys;
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={sidebarCollapsed}
        className="bg-white border-r border-gray-200 shadow-sm"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 text-lg font-bold text-blue-600">
          {sidebarCollapsed ? '约球' : '约球管理后台'}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          className="h-[calc(100%-64px)] border-r-0"
          items={buildMenuItems(MENU_ITEMS)}
        />
      </Sider>
      
      <Layout>
        <Header className="px-0 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-16 h-16 text-base hover:bg-gray-50"
            />
            
            <div className="ml-4">
              <h1 className="m-0 text-xl font-medium text-gray-800">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="pr-6">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                <Avatar 
                  size="small" 
                  src={userInfo?.avatar} 
                  icon={<UserOutlined />}
                  className="mr-2"
                />
                <span className="text-gray-700">{userInfo?.name || userInfo?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="m-4 p-6 bg-white rounded-lg shadow-sm">
          {breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-4">
              {breadcrumbs.map((item, index) => (
                <Breadcrumb.Item 
                  key={index}
                  onClick={item.path ? () => navigate(item.path!) : undefined}
                  className={item.path ? 'cursor-pointer hover:text-blue-600' : ''}
                >
                  {item.title}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 