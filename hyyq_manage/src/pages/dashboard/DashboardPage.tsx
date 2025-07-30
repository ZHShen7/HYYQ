import React, { useEffect } from 'react';
import { Card, Alert } from 'antd';
import { useAppStore } from '../../stores/appStore';

const DashboardPage: React.FC = () => {
  const { setPageTitle, setBreadcrumbs } = useAppStore();

  useEffect(() => {
    setPageTitle('数据概览');
    setBreadcrumbs([
      { title: '首页' },
      { title: '数据概览' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <Alert
        message="模块开发中"
        description="数据概览模块正在开发中，敬请期待..."
        type="info"
        showIcon
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">1,234</div>
          <div className="text-gray-600">总用户数</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">567</div>
          <div className="text-gray-600">活跃约球</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">89</div>
          <div className="text-gray-600">今日新增</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">98.5%</div>
          <div className="text-gray-600">系统稳定性</div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 