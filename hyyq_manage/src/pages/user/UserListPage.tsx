import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Card,
  Tag,
  Avatar,
  Drawer,
  Modal,
  Form,
  message,
  Popconfirm,
  Badge,
  Descriptions,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  StopOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';
import {
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  LOGIN_TYPE_LABELS,
  DEFAULT_PAGE_SIZE
} from '../../constants';
import { formatTime, maskPhone } from '../../utils';
import type { User, UserListParams } from '../../types';
import {
  getUserList,
  updateUserStatus,
  sendMessageToUser,
  exportUserData
} from '../../services/user';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const UserListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  // 抽屉和弹窗状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { setPageTitle, setBreadcrumbs } = useAppStore();
  const [messageForm] = Form.useForm();

  useEffect(() => {
    setPageTitle('用户列表');
    setBreadcrumbs([
      { title: '首页', path: '/dashboard' },
      { title: '用户管理' },
      { title: '用户列表' },
    ]);

    fetchUsers();
  }, [params]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUserList(params);
      if (response.code === 200) {
        setUsers(response.data);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: {
    username?: string;
    phone?: string;
    loginType?: 'password' | 'wechat';
    status?: 'active' | 'disabled' | 'frozen';
    dateRange?: [import('dayjs').Dayjs, import('dayjs').Dayjs];
  }) => {
    const searchParams: UserListParams = {
      ...params,
      page: 1,
      username: values.username,
      phone: values.phone,
      loginType: values.loginType,
      status: values.status,
    };

    // 处理日期范围
    if (values.dateRange && values.dateRange.length === 2) {
      searchParams.startDate = values.dateRange[0].format('YYYY-MM-DD');
      searchParams.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }

    setParams(searchParams);
  };

  const handleTableChange = (pagination: { 
    current?: number; 
    pageSize?: number; 
  }) => {
    setParams({
      ...params,
      page: pagination.current || 1,
      limit: pagination.pageSize || DEFAULT_PAGE_SIZE,
    });
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setDetailDrawerVisible(true);
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      const response = await updateUserStatus(userId, status as 'active' | 'disabled' | 'frozen');
      if (response.code === 200) {
        message.success('用户状态更新成功');
        fetchUsers();
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      message.error('更新用户状态失败');
    }
  };

  const handleSendMessage = (user: User) => {
    setSelectedUser(user);
    setMessageModalVisible(true);
    messageForm.resetFields();
  };

  const handleSendMessageSubmit = async (values: {
    title: string;
    content: string;
    type: 'info' | 'warning' | 'error';
  }) => {
    try {
      if (!selectedUser) return;

      const response = await sendMessageToUser(selectedUser._id, values);
      if (response.code === 200) {
        message.success('消息发送成功');
        setMessageModalVisible(false);
      }
    } catch (error) {
      console.error('消息发送失败:', error);
      message.error('消息发送失败');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportUserData(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `用户数据_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={record.wechatAvatar}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.name || record.username}
            </div>
            <div className="text-sm text-gray-500">
              {maskPhone(record.phone)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '登录方式',
      dataIndex: 'loginType',
      key: 'loginType',
      width: 100,
      render: (loginType: string) => (
        <Tag color={loginType === 'wechat' ? 'green' : 'blue'}>
          {LOGIN_TYPE_LABELS[loginType as keyof typeof LOGIN_TYPE_LABELS]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Badge
          status={USER_STATUS_COLORS[status as keyof typeof USER_STATUS_COLORS] as 'success' | 'processing' | 'default' | 'error' | 'warning'}
          text={USER_STATUS_LABELS[status as keyof typeof USER_STATUS_LABELS]}
        />
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: Date) => formatTime(date, 'YYYY-MM-DD'),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 150,
      render: (date: Date) => formatTime(date, 'MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            className="p-0"
          >
            详情
          </Button>

          <Button
            type="link"
            icon={<MessageOutlined />}
            onClick={() => handleSendMessage(record)}
            className="p-0"
          >
            发消息
          </Button>

          {record.status === 'active' ? (
            <Popconfirm
              title="确认禁用该用户？"
              onConfirm={() => handleStatusChange(record._id, 'disabled')}
            >
              <Button
                type="link"
                danger
                icon={<StopOutlined />}
                className="p-0"
              >
                禁用
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认启用该用户？"
              onConfirm={() => handleStatusChange(record._id, 'active')}
            >
              <Button
                type="link"
                icon={<EditOutlined />}
                className="p-0"
              >
                启用
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 搜索表单 */}
      <Card className="shadow-sm">
        <Form onFinish={handleSearch}>
          <Row gutter={[16, 16]}>
            {/* 第一行：基础搜索项 */}
            <Col xs={24} sm={12} lg={6}>
              <Form.Item name="username" className="mb-0">
                <Input
                  placeholder="用户名/姓名"
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Form.Item name="phone" className="mb-0">
                <Input
                  placeholder="手机号"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Form.Item name="loginType" className="mb-0">
                <Select
                  placeholder="登录方式"
                  allowClear
                >
                  <Option value="password">密码登录</Option>
                  <Option value="wechat">微信登录</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Form.Item name="status" className="mb-0">
                <Select
                  placeholder="用户状态"
                  allowClear
                >
                  <Option value="active">正常</Option>
                  <Option value="disabled">禁用</Option>
                  <Option value="frozen">冻结</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* 第二行：日期选择器和按钮 */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="dateRange" className="mb-0">
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Form.Item className="mb-0">
                <Space className="w-full" size="middle">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={() => fetchUsers()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-600">
            共 {total} 条记录
          </span>
        </div>

        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出数据
          </Button>
        </Space>
      </div>

      {/* 用户表格 */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: number[]) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="rounded-lg"
        />
      </Card>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        placement="right"
        size="large"
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        className="user-detail-drawer"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-200">
              <Avatar
                src={selectedUser.wechatAvatar}
                icon={<UserOutlined />}
                size={80}
                className="mb-3"
              />
              <Typography.Title level={4} className="mb-1">
                {selectedUser.name || selectedUser.username}
              </Typography.Title>
              <Badge
                status={USER_STATUS_COLORS[selectedUser.status! as keyof typeof USER_STATUS_COLORS] as 'success' | 'processing' | 'default' | 'error' | 'warning'}
                text={USER_STATUS_LABELS[selectedUser.status! as keyof typeof USER_STATUS_LABELS]}
              />
            </div>

            <Descriptions title="基本信息" column={1} bordered>
              <Descriptions.Item label="用户名">
                {selectedUser.username}
              </Descriptions.Item>
              <Descriptions.Item label="姓名">
                {selectedUser.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                {selectedUser.phone}
              </Descriptions.Item>
              <Descriptions.Item label="年龄">
                {selectedUser.age || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="性别">
                {selectedUser.sex === '1' ? '男' : selectedUser.sex === '0' ? '女' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="地区">
                {selectedUser.location || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="登录方式">
                {LOGIN_TYPE_LABELS[selectedUser.loginType]}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {formatTime(selectedUser.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {formatTime(selectedUser.lastLoginAt)}
              </Descriptions.Item>
            </Descriptions>

            {selectedUser.loginType === 'wechat' && (
              <Descriptions title="微信信息" column={1} bordered>
                <Descriptions.Item label="微信昵称">
                  {selectedUser.wechatNickname || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="OpenID">
                  {selectedUser.wechatOpenId || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="UnionID">
                  {selectedUser.wechatUnionId || '-'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Drawer>

      {/* 发送消息弹窗 */}
      <Modal
        title="发送系统消息"
        open={messageModalVisible}
        onCancel={() => setMessageModalVisible(false)}
        footer={null}
        className="message-modal"
      >
        <Form
          form={messageForm}
          layout="vertical"
          onFinish={handleSendMessageSubmit}
          className="mt-4"
        >
          <Form.Item
            label="收件人"
          >
            <Input
              value={selectedUser?.name || selectedUser?.username}
              disabled
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="消息标题"
            rules={[{ required: true, message: '请输入消息标题' }]}
          >
            <Input placeholder="请输入消息标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="消息内容"
            rules={[{ required: true, message: '请输入消息内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入消息内容"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="消息类型"
            initialValue="info"
          >
            <Select>
              <Option value="info">通知</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setMessageModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                发送
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserListPage; 