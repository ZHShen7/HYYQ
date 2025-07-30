import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { login } from '../../services/auth';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);
      
      // 调用管理员登录API
      const response = await login({
        username: values.username,
        password: values.password,
      });

      if (response.code === 200 && response.data) {
        // 构建管理员用户信息
        const adminUserInfo = {
          id: response.data.id,
          username: response.data.username,
          name: response.data.name,
          role: response.data.role,
          avatar: response.data.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${response.data.username}`,
        };

        setAuth(response.token, adminUserInfo);
        message.success('登录成功');
        navigate(from, { replace: true });
      } else {
        message.error(response.msg || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      message.error(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-5">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            约球管理后台
          </h1>
          <p className="text-gray-600 text-sm">
            请使用管理员账号登录
          </p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          className="space-y-4"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入管理员用户名!' },
              { min: 3, message: '用户名至少3个字符!' },
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="管理员用户名" 
              autoComplete="username"
              className="h-12"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              autoComplete="current-password"
              className="h-12"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a href="#" className="text-blue-600 hover:text-blue-700">
                忘记密码？
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-base font-medium"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="mb-1 font-medium">管理员测试账号：</p>
          <p className="mb-1">超级管理员: admin / admin123</p>
          <p className="mb-0">运营管理员: operator / operator123</p>
          <p className="mt-2 text-orange-600">
            💡 首次使用请先运行后端初始化脚本创建管理员账号
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage; 