// API 基础配置
export const API_BASE_URL = 'http://116.62.127.61:3000/api';

// 分页配置
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

// 用户状态枚举
export const USER_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  FROZEN: 'frozen',
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.DISABLED]: '禁用',
  [USER_STATUS.FROZEN]: '冻结',
};

export const USER_STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'green',
  [USER_STATUS.DISABLED]: 'red',
  [USER_STATUS.FROZEN]: 'orange',
};

// 登录方式枚举
export const LOGIN_TYPE = {
  PASSWORD: 'password',
  WECHAT: 'wechat',
} as const;

export const LOGIN_TYPE_LABELS = {
  [LOGIN_TYPE.PASSWORD]: '密码登录',
  [LOGIN_TYPE.WECHAT]: '微信登录',
};

// 约球状态枚举
export const MATCH_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.ACTIVE]: '进行中',
  [MATCH_STATUS.COMPLETED]: '已完成',
  [MATCH_STATUS.CANCELLED]: '已取消',
};

export const MATCH_STATUS_COLORS = {
  [MATCH_STATUS.ACTIVE]: 'processing',
  [MATCH_STATUS.COMPLETED]: 'success',
  [MATCH_STATUS.CANCELLED]: 'default',
};

// 运动类型
export const SPORT_TYPES = [
  '足球',
  '篮球',
  '羽毛球',
  '网球',
  '乒乓球',
  '排球',
  '其他',
];

// 技能水平
export const SKILL_LEVELS = [
  '新手',
  '入门',
  '进阶',
  '高手',
  '不限',
];

// 管理员角色
export const ADMIN_ROLES = {
  SUPER: 'super',
  OPERATOR: 'operator',
  AUDITOR: 'auditor',
} as const;

export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.SUPER]: '超级管理员',
  [ADMIN_ROLES.OPERATOR]: '运营管理员',
  [ADMIN_ROLES.AUDITOR]: '内容审核员',
};

// 侧边栏菜单配置
export const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: '数据概览',
    path: '/dashboard',
    icon: 'DashboardOutlined',
  },
  {
    key: 'user',
    label: '用户管理',
    path: '/user',
    icon: 'UserOutlined',
    children: [
      {
        key: 'user-list',
        label: '用户列表',
        path: '/user/list',
      },
    ],
  },
  {
    key: 'match',
    label: '约球管理',
    path: '/match',
    icon: 'TeamOutlined',
    children: [
      {
        key: 'match-list',
        label: '约球列表',
        path: '/match/list',
      },
    ],
  },
  {
    key: 'audit',
    label: '内容审核',
    path: '/audit',
    icon: 'SafetyCertificateOutlined',
    children: [
      {
        key: 'audit-queue',
        label: '审核队列',
        path: '/audit/queue',
      },
      {
        key: 'audit-records',
        label: '审核记录',
        path: '/audit/records',
      },
    ],
  },
  {
    key: 'analytics',
    label: '数据分析',
    path: '/analytics',
    icon: 'BarChartOutlined',
    children: [
      {
        key: 'analytics-overview',
        label: '平台概览',
        path: '/analytics/overview',
      },
      {
        key: 'analytics-users',
        label: '用户分析',
        path: '/analytics/users',
      },
      {
        key: 'analytics-matches',
        label: '约球分析',
        path: '/analytics/matches',
      },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    path: '/system',
    icon: 'SettingOutlined',
    children: [
      {
        key: 'system-config',
        label: '系统配置',
        path: '/system/config',
      },
      {
        key: 'system-logs',
        label: '操作日志',
        path: '/system/logs',
      },
    ],
  },
];

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'hyyq_admin_token',
  USER_INFO: 'hyyq_admin_user',
  THEME: 'hyyq_admin_theme',
  SIDEBAR_COLLAPSED: 'hyyq_admin_sidebar_collapsed',
}; 