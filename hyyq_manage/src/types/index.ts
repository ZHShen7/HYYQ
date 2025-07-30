// 用户相关类型定义
export interface User {
  _id: string;
  username: string;
  name?: string;
  phone: string;
  type?: number;
  height?: string | number;
  weight?: string | number;
  age?: string | number;
  sex?: string | number;
  location?: string | number;
  wechatOpenId?: string;
  wechatUnionId?: string;
  wechatNickname?: string;
  wechatAvatar?: string;
  loginType: 'password' | 'wechat';
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'active' | 'disabled' | 'frozen';
  lastLoginAt?: Date;
}

// 约球相关类型定义
export interface Match {
  _id: string;
  content: string;
  sport: '足球' | '篮球' | '羽毛球' | '网球' | '乒乓球' | '排球' | '其他';
  startTime: string;
  duration: number;
  location: string;
  needPeople: number;
  currentPeople: number;
  level: '新手' | '入门' | '进阶' | '高手' | '不限';
  contact?: string;
  images: string[];
  status: 'active' | 'completed' | 'cancelled';
  userId: string;
  userName: string;
  userAvatar?: string;
  participants: Participant[];
  publishTime: Date;
}

export interface Participant {
  userId: string;
  userName: string;
  joinTime: Date;
}

// API 响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  data?: T;
  msg: string;
  token?: string;
}

export interface PaginationResponse<T = any> {
  code: number;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  msg: string;
}

// 查询参数类型定义
export interface UserListParams {
  page?: number;
  limit?: number;
  username?: string;
  phone?: string;
  loginType?: 'password' | 'wechat';
  status?: 'active' | 'disabled' | 'frozen';
  startDate?: string;
  endDate?: string;
}

export interface MatchListParams {
  page?: number;
  limit?: number;
  sport?: '足球' | '篮球' | '羽毛球' | '网球' | '乒乓球' | '排球' | '其他';
  status?: 'active' | 'completed' | 'cancelled';
  level?: '新手' | '入门' | '进阶' | '高手' | '不限';
  keyword?: string;
  userId?: string;
  searchTime?: string;
}

// 管理员相关类型定义
export interface Admin {
  id: string;
  username: string;
  name: string;
  role: 'super' | 'operator' | 'auditor';
  avatar?: string;
  lastLoginAt?: Date;
}

// 表格列配置类型
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  fixed?: 'left' | 'right';
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

// 表单类型定义
export interface FormValues {
  [key: string]: any;
} 