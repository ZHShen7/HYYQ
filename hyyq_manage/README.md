# 约球系统管理后台

基于 React + TypeScript + Vite + Ant Design + Tailwind CSS 构建的约球系统管理后台。

## 技术栈

- **前端框架**: React 18
- **类型检查**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5.x
- **样式框架**: Tailwind CSS
- **状态管理**: Zustand
- **路由管理**: React Router v6
- **HTTP 客户端**: Axios
- **时间处理**: Day.js

## 功能模块

### ✅ 已完成模块

1. **管理员认证**
   - 独立的管理员登录系统
   - 基于角色的权限控制（超级管理员、运营管理员、审核员）
   - 登录状态管理和持久化
   - 路由权限守卫

2. **用户管理**
   - 用户列表查看（支持搜索、筛选、分页）
   - 用户详情查看
   - 用户状态管理（启用/禁用/冻结）
   - 用户数据导出

3. **约球管理**
   - 约球列表查看（支持搜索、筛选、分页）
   - 约球详情查看（包含参与者列表、图片展示）
   - 约球信息编辑
   - 约球状态管理（进行中/已完成/已取消）
   - 约球删除功能
   - 约球数据导出

### 🚧 占位模块

- 内容审核模块
- 数据分析模块
- 系统管理模块

## 项目结构

```
hyyq_manage/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── auth/            # 认证相关组件
│   │   └── layout/          # 布局组件
│   ├── pages/               # 页面组件
│   │   ├── auth/            # 认证页面
│   │   ├── user/            # 用户管理页面
│   │   ├── match/           # 约球管理页面
│   │   ├── dashboard/       # 仪表盘页面
│   │   └── error/           # 错误页面
│   ├── services/            # API 服务
│   ├── stores/              # 状态管理
│   ├── utils/               # 工具函数
│   ├── types/               # TypeScript 类型定义
│   ├── constants/           # 常量定义
│   └── router/              # 路由配置
├── public/                  # 静态资源
└── ...
```

## 开发环境搭建

### 前置要求

- Node.js >= 16
- npm 或 yarn
- MongoDB 数据库

### 后端初始化

1. 启动后端服务：
```bash
cd hyyq_backend
npm install
npm start
```

2. 初始化管理员账号：
```bash
cd hyyq_backend
node scripts/init-admin.js
```

这将创建以下管理员账号：
- 超级管理员：admin / admin123
- 运营管理员：operator / operator123

### 前端启动

1. 安装依赖：
```bash
cd hyyq_manage
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

项目将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

## 后端接口说明

### 管理员认证接口
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/info` - 获取管理员信息
- `POST /api/admin/logout` - 管理员退出

### 用户管理接口
- `GET /api/admin/users` - 获取用户列表（支持分页和筛选）
- `PUT /api/admin/users/:id/status` - 更新用户状态

### 约球管理接口
- `GET /api/admin/matches` - 获取约球列表（支持分页和筛选）
- `PUT /api/admin/matches/:id` - 更新约球信息
- `PUT /api/admin/matches/:id/status` - 更新约球状态
- `DELETE /api/admin/matches/:id` - 删除约球

### 用户约球接口（现有）
- `GET /api/matches` - 获取约球列表
- `POST /api/matches` - 发布约球
- `PUT /api/matches/:id` - 修改约球
- `PUT /api/matches/:id/status` - 更新约球状态

## 登录说明

### 管理员登录

系统使用独立的管理员账号体系，与普通用户系统分离：

1. 访问 http://localhost:5173
2. 使用管理员账号登录：
   - 超级管理员: admin / admin123
   - 运营管理员: operator / operator123
3. 登录成功后即可使用管理功能

### 权限说明

- **超级管理员 (super)**: 拥有所有权限
- **运营管理员 (operator)**: 用户管理、约球管理权限
- **审核员 (auditor)**: 内容审核权限

## 开发规范

### 代码风格
- 使用 ESLint 和 Prettier 进行代码格式化
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 优先使用 Tailwind CSS 类名进行样式设置

### Git 提交规范
```
<类型>(<范围>): <简短描述>

feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建或辅助工具变动
```

## 部署说明

### 生产环境配置

1. 修改 `src/constants/index.ts` 中的 `API_BASE_URL` 为生产环境地址
2. 运行 `npm run build` 构建生产版本
3. 将 `dist` 目录部署到 Web 服务器

### 环境变量

可以通过环境变量配置不同环境的 API 地址：

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:3000

# 生产环境
VITE_API_BASE_URL=https://your-api-domain.com
```

## 数据库初始化

### 管理员账号初始化

运行初始化脚本创建默认管理员账号：

```bash
cd hyyq_backend
node scripts/init-admin.js
```

### 数据库结构

系统包含以下数据模型：

1. **Admin** - 管理员账号
   - username: 用户名
   - password: 密码
   - name: 姓名
   - role: 角色 (super/operator/auditor)
   - status: 状态 (active/disabled)

2. **User** - 普通用户
   - username, name, phone: 基本信息
   - loginType: 登录方式 (password/wechat)
   - status: 用户状态

3. **Match** - 约球信息
   - content, sport, matchTime, location: 约球详情
   - needPeople, currentPeople: 人数信息
   - status: 约球状态 (active/completed/cancelled)

## 系统特性

### 🔐 独立管理员系统
- 与普通用户系统完全分离
- 基于角色的权限控制
- 安全的token认证机制

### 📊 完整的约球管理
- 实时约球数据管理
- 支持约球信息修改
- 灵活的状态控制

### 👥 全面的用户管理
- 用户信息查看和管理
- 用户状态控制
- 数据导出功能

### 🎨 现代化界面
- 响应式设计
- Tailwind CSS 样式系统
- Ant Design 组件库

## 后续开发计划

1. **功能完善**: 完成用户消息推送、数据统计等功能
2. **权限细化**: 实现更细粒度的权限控制
3. **数据分析**: 完善数据分析模块，提供图表和统计功能
4. **内容审核**: 实现内容审核工作流
5. **系统配置**: 添加系统参数配置功能
6. **操作日志**: 记录管理员操作日志

## 技术支持

如有问题，请联系开发团队或在项目中提交 Issue。
