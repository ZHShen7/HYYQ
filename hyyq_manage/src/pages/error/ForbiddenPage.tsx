import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面"
        extra={
          <div className="space-x-4">
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
            <Button onClick={() => navigate(-1)}>
              返回上页
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default ForbiddenPage; 