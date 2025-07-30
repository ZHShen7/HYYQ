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
  Image,
  List,
  Switch,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';
import { 
  MATCH_STATUS_LABELS, 
  MATCH_STATUS_COLORS, 
  SPORT_TYPES,
  SKILL_LEVELS,
  DEFAULT_PAGE_SIZE 
} from '../../constants';
import { formatTime } from '../../utils';
import type { Match, MatchListParams } from '../../types';
import {
  getMatchList,
  updateMatchStatus,
  deleteMatch,
  updateMatch,
  setMatchRecommended,
  exportMatchData,
} from '../../services/match';

const { Option } = Select;
const { TextArea } = Input;

const MatchListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<MatchListParams>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  
  // 抽屉和弹窗状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  const { setPageTitle, setBreadcrumbs } = useAppStore();
  const [editForm] = Form.useForm();

  useEffect(() => {
    setPageTitle('约球列表');
    setBreadcrumbs([
      { title: '首页', path: '/dashboard' },
      { title: '约球管理' },
      { title: '约球列表' },
    ]);
    
    fetchMatches();
  }, [params]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await getMatchList(params);
      if (response.code === 200) {
        setMatches(response.data);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('获取约球列表失败:', error);
      message.error('获取约球列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: {
    keyword?: string;
    sport?: '足球' | '篮球' | '羽毛球' | '网球' | '乒乓球' | '排球' | '其他';
    status?: 'active' | 'completed' | 'cancelled';
    level?: '新手' | '入门' | '进阶' | '高手' | '不限';
    searchTime?: import('dayjs').Dayjs;
  }) => {
    const searchParams: MatchListParams = {
      ...params,
      page: 1,
      keyword: values.keyword,
      sport: values.sport,
      status: values.status,
      level: values.level,
    };
    
    // 处理时间点搜索
    if (values.searchTime) {
      searchParams.searchTime = values.searchTime.toISOString();
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

  const handleViewDetail = (match: Match) => {
    setSelectedMatch(match);
    setDetailDrawerVisible(true);
  };

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      content: match.content,
      sport: match.sport,
      location: match.location,
      needPeople: match.needPeople,
      level: match.level,
      contact: match.contact,
    });
  };

  const handleEditSubmit = async (values: {
    content: string;
    sport: '足球' | '篮球' | '羽毛球' | '网球' | '乒乓球' | '排球' | '其他';
    location: string;
    needPeople: number;
    level: '新手' | '入门' | '进阶' | '高手' | '不限';
    contact: string;
  }) => {
    try {
      if (!selectedMatch) return;
      
      const response = await updateMatch(selectedMatch._id, values);
      if (response.code === 200) {
        message.success('约球信息更新成功');
        setEditModalVisible(false);
        fetchMatches();
      }
    } catch (error) {
      console.error('更新约球信息失败:', error);
      message.error('更新约球信息失败');
    }
  };

  const handleStatusChange = async (matchId: string, status: string) => {
    try {
      const response = await updateMatchStatus(matchId, status as 'active' | 'completed' | 'cancelled');
      if (response.code === 200) {
        message.success('约球状态更新成功');
        fetchMatches();
      }
    } catch (error) {
      console.error('更新约球状态失败:', error);
      message.error('更新约球状态失败');
    }
  };

  const handleDelete = async (matchId: string) => {
    try {
      const response = await deleteMatch(matchId);
      if (response.code === 200) {
        message.success('约球删除成功');
        fetchMatches();
      }
    } catch (error) {
      console.error('删除约球失败:', error);
      message.error('删除约球失败');
    }
  };

  const handleRecommendToggle = async (matchId: string, recommended: boolean) => {
    try {
      const response = await setMatchRecommended(matchId, recommended);
      if (response.code === 200) {
        message.success(`${recommended ? '设置' : '取消'}推荐成功`);
        fetchMatches();
      }
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMatchData(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `约球数据_${new Date().toISOString().split('T')[0]}.csv`;
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

  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      '足球': 'green',
      '篮球': 'orange',
      '羽毛球': 'blue',
      '网球': 'cyan',
      '乒乓球': 'purple',
      '排球': 'magenta',
      '其他': 'default',
    };
    return colors[sport] || 'default';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      '新手': 'green',
      '入门': 'blue',
      '进阶': 'orange',
      '高手': 'red',
      '不限': 'default',
    };
    return colors[level] || 'default';
  };

  const columns = [
    {
      title: '约球信息',
      key: 'matchInfo',
      width: 180,
      render: (record: Match) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Tag color={getSportColor(record.sport)}>{record.sport}</Tag>
            <Tag color={getLevelColor(record.level)}>{record.level}</Tag>
          </div>
          <div className="font-medium text-gray-900 line-clamp-2">
            {record.content}
          </div>
          <div className="text-sm text-gray-500">
            📍 {record.location} 👥 {record.currentPeople}/{record.needPeople}人
          </div>
        </div>
      ),
    },
    {
      title: '发布者',
      key: 'publisher',
      width: 150,
      render: (record: Match) => (
        <div className="flex items-center space-x-2">
          <Avatar 
            src={record.userAvatar} 
            icon={<UserOutlined />}
            size={32}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.userName}
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(record.publishTime, 'MM-DD HH:mm')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '约球时间',
      key: 'matchTime',
      width: 100,
      render: (record: Match) => {
        // 检查数据是否存在
        if (!record.startTime || typeof record.startTime !== 'string') {
          return <div className="text-sm text-gray-500">无效时间数据</div>
        }
        
        try {
          const startTimeStr = record.startTime.trim();
          const duration = typeof record.duration === 'number' ? record.duration : 2;
          
          // 提取时间信息，支持1-2位数字
          const timeMatch = startTimeStr.match(/(\d{1,2})月(\d{1,2})日.*?(\d{1,2})时(\d{1,2})分/);
          if (!timeMatch) {
            return <div className="text-sm text-gray-500">时间格式错误</div>
          }
          
          const month = parseInt(timeMatch[1], 10);
          const day = parseInt(timeMatch[2], 10);
          const hour = parseInt(timeMatch[3], 10);
          const minute = parseInt(timeMatch[4], 10);
          
          // 验证数值范围
          if (month < 1 || month > 12 || day < 1 || day > 31 || 
              hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            return <div className="text-sm text-gray-500">时间数值无效</div>
          }
          
          // 创建日期对象
          const currentYear = new Date().getFullYear();
          const startDate = new Date(currentYear, month - 1, day, hour, minute, 0, 0);
          
          // 检查日期是否有效
          if (isNaN(startDate.getTime())) {
            return <div className="text-sm text-gray-500">日期创建失败</div>
          }
          
          const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
          
          return (
            <div className="text-sm">
              <div>{month.toString().padStart(2, '0')}-{day.toString().padStart(2, '0')}</div>
              <div className="text-gray-500">
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} - {endDate.getHours().toString().padStart(2, '0')}:{endDate.getMinutes().toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-blue-500">{duration}小时</div>
            </div>
          );
        } catch (error) {
          return <div className="text-sm text-gray-500">解析异常</div>
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Badge 
          status={MATCH_STATUS_COLORS[status as keyof typeof MATCH_STATUS_COLORS] as 'success' | 'processing' | 'default' | 'error' | 'warning'}
          text={MATCH_STATUS_LABELS[status as keyof typeof MATCH_STATUS_LABELS]}
        />
      ),
    },
    {
      title: '推荐',
      key: 'recommended',
      width: 70,
      render: (record: Match) => (
        <Switch
          checkedChildren={<StarFilled />}
          unCheckedChildren={<StarOutlined />}
          defaultChecked={false}
          onChange={(checked: boolean) => handleRecommendToggle(record._id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right' as const,
      render: (record: Match) => (
        <Space size="small" direction="vertical">
          <div>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="p-0 h-auto"
            >
              详情
            </Button>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="p-0 h-auto ml-2"
            >
              编辑
            </Button>
          </div>
          
          <div>
            {record.status === 'active' && (
              <Popconfirm
                title="确认完成此约球？"
                onConfirm={() => handleStatusChange(record._id, 'completed')}
              >
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  className="p-0 h-auto text-green-600"
                >
                  完成
                </Button>
              </Popconfirm>
            )}
            
            <Popconfirm
              title="确认删除此约球？"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                className="p-0 h-auto ml-2"
              >
                删除
              </Button>
            </Popconfirm>
          </div>
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
              <Form.Item name="keyword" className="mb-0">
                <Input 
                  placeholder="搜索约球内容/地点" 
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Form.Item name="sport" className="mb-0">
                <Select 
                  placeholder="运动类型" 
                  allowClear
                >
                  {SPORT_TYPES.map(sport => (
                    <Option key={sport} value={sport}>{sport}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Form.Item name="status" className="mb-0">
                <Select 
                  placeholder="约球状态" 
                  allowClear
                >
                  <Option value="active">进行中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Form.Item name="level" className="mb-0">
                <Select 
                  placeholder="技能水平" 
                  allowClear
                >
                  {SKILL_LEVELS.map(level => (
                    <Option key={level} value={level}>{level}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            {/* 第二行：时间选择器和按钮 */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="searchTime" className="mb-0">
                <DatePicker 
                  placeholder="选择约球时间点"
                  showTime={{ 
                    format: 'HH:mm',
                    minuteStep: 30 
                  }}
                  format="YYYY-MM-DD HH:mm"
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
                  <Button icon={<ReloadOutlined />} onClick={() => fetchMatches()}>
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

      {/* 约球表格 */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={matches}
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
          scroll={{ x: 900 }}
          className="rounded-lg"
        />
      </Card>

      {/* 约球详情抽屉 */}
      <Drawer
        title="约球详情"
        placement="right"
        size="large"
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        className="match-detail-drawer"
      >
        {selectedMatch && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Tag color={getSportColor(selectedMatch.sport)} className="text-base px-3 py-1">
                  {selectedMatch.sport}
                </Tag>
                <Tag color={getLevelColor(selectedMatch.level)} className="text-base px-3 py-1">
                  {selectedMatch.level}
                </Tag>
                <Badge 
                  status={MATCH_STATUS_COLORS[selectedMatch.status as keyof typeof MATCH_STATUS_COLORS] as 'success' | 'processing' | 'default' | 'error' | 'warning'}
                  text={MATCH_STATUS_LABELS[selectedMatch.status as keyof typeof MATCH_STATUS_LABELS]}
                />
              </div>
              <Typography.Title level={4} className="mb-2">
                {selectedMatch.content}
              </Typography.Title>
              <div className="text-gray-600">
                发布时间：{formatTime(selectedMatch.publishTime)}
              </div>
            </div>

            <Descriptions title="基本信息" column={1} bordered>
              <Descriptions.Item label="约球时间段">
                {(() => {
                  if (!selectedMatch.startTime || typeof selectedMatch.startTime !== 'string') {
                    return '无效时间数据';
                  }
                  
                  try {
                    const startTimeStr = selectedMatch.startTime.trim();
                    const duration = typeof selectedMatch.duration === 'number' ? selectedMatch.duration : 2;
                    
                    const timeMatch = startTimeStr.match(/(\d{1,2})月(\d{1,2})日.*?(\d{1,2})时(\d{1,2})分/);
                    if (!timeMatch) return '时间格式错误';
                    
                    const month = parseInt(timeMatch[1], 10);
                    const day = parseInt(timeMatch[2], 10);
                    const hour = parseInt(timeMatch[3], 10);
                    const minute = parseInt(timeMatch[4], 10);
                    
                    // 验证数值范围
                    if (month < 1 || month > 12 || day < 1 || day > 31 || 
                        hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                      return '时间数值无效';
                    }
                    
                    const currentYear = new Date().getFullYear();
                    const startDate = new Date(currentYear, month - 1, day, hour, minute, 0, 0);
                    
                    if (isNaN(startDate.getTime())) {
                      return '日期创建失败';
                    }
                    
                    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
                    
                    return `${startTimeStr} - ${endDate.getHours().toString().padStart(2, '0')}时${endDate.getMinutes().toString().padStart(2, '0')}分 (${duration}小时)`;
                  } catch {
                    return '解析异常';
                  }
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="活动地点">
                {selectedMatch.location}
              </Descriptions.Item>
              <Descriptions.Item label="所需人数">
                {selectedMatch.needPeople}人
              </Descriptions.Item>
              <Descriptions.Item label="当前人数">
                {selectedMatch.currentPeople}人
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {selectedMatch.contact}
              </Descriptions.Item>
              <Descriptions.Item label="发布者">
                <div className="flex items-center space-x-2">
                  <Avatar 
                    src={selectedMatch.userAvatar} 
                    icon={<UserOutlined />}
                    size={24}
                  />
                  <span>{selectedMatch.userName}</span>
                </div>
              </Descriptions.Item>
            </Descriptions>

            {selectedMatch.images.length > 0 && (
              <div>
                <Typography.Title level={5} className="mb-3">
                  相关图片
                </Typography.Title>
                <div className="grid grid-cols-2 gap-4">
                  {selectedMatch.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`约球图片${index + 1}`}
                      className="rounded-lg"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedMatch.participants.length > 0 && (
              <div>
                <Typography.Title level={5} className="mb-3">
                  参与者列表 ({selectedMatch.participants.length}人)
                </Typography.Title>
                <List
                  dataSource={selectedMatch.participants}
                  renderItem={(participant) => (
                    <List.Item>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <Avatar icon={<UserOutlined />} />
                          <span>{participant.userName}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {formatTime(participant.joinTime, 'MM-DD HH:mm')}
                        </span>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 编辑约球弹窗 */}
      <Modal
        title="编辑约球信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        className="edit-match-modal"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="mt-4"
        >
          <Form.Item
            name="content"
            label="约球内容"
            rules={[{ required: true, message: '请输入约球内容' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入约球内容"
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sport"
              label="运动类型"
              rules={[{ required: true, message: '请选择运动类型' }]}
            >
              <Select placeholder="请选择运动类型">
                {SPORT_TYPES.map(sport => (
                  <Option key={sport} value={sport}>{sport}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="level"
              label="技能水平"
              rules={[{ required: true, message: '请选择技能水平' }]}
            >
              <Select placeholder="请选择技能水平">
                {SKILL_LEVELS.map(level => (
                  <Option key={level} value={level}>{level}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="location"
            label="活动地点"
            rules={[{ required: true, message: '请输入活动地点' }]}
          >
            <Input placeholder="请输入活动地点" />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="needPeople"
              label="所需人数"
              rules={[{ required: true, message: '请输入所需人数' }]}
            >
              <Input 
                type="number" 
                placeholder="请输入所需人数"
                min={1}
                max={100}
              />
            </Form.Item>
            
            <Form.Item
              name="contact"
              label="联系方式"
              rules={[{ required: true, message: '请输入联系方式' }]}
            >
              <Input placeholder="请输入联系方式" />
            </Form.Item>
          </div>
          
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchListPage; 