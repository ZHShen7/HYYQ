# UniApp 登录注册系统

这是一个基于 UniApp 开发的现代化登录注册系统，包含完整的用户认证功能。

## 功能特性

- 🔐 用户登录（支持用户名、手机号、邮箱登录）
- 🟢 微信一键登录（小程序和APP端）
- 📝 用户注册（手机号验证码注册）
- 🔄 密码重置（手机验证码重置）
- 📱 手机验证码功能
- 🎨 现代化UI设计
- 📦 模块化代码结构
- ✅ 完整的表单验证
- 🔒 安全的token管理
- 📱 多平台兼容（小程序、APP、H5）

## 项目结构

```
hyyq_frontend/
├── api/                 # API接口模块
│   └── user.js         # 用户相关接口
├── components/           # 公共组件
│   ├── FormInput.vue    # 表单输入组件
│   ├── SubmitButton.vue # 提交按钮组件
│   └── WechatLoginButton.vue # 微信登录按钮组件
├── pages/               # 页面
│   ├── index/           # 首页
│   ├── login/           # 登录页
│   ├── register/        # 注册页
│   └── forgot-password/ # 忘记密码页
├── utils/               # 工具模块
│   ├── request.js       # 请求封装
│   ├── auth.js         # 认证工具
│   ├── validator.js    # 表单验证
│   ├── platform.js     # 平台检测
│   ├── wechat.js       # 微信登录工具
│   └── async.js        # 异步操作工具
├── static/              # 静态资源
├── App.vue             # 应用入口
├── main.js             # 主入口
├── pages.json          # 页面配置
└── README.md           # 项目说明
```

## 快速开始

### 1. 配置后端接口

在 `utils/request.js` 文件中修改 `BASE_URL` 为你的后端接口地址：

```javascript
const BASE_URL = 'http://your-backend-api.com' // 替换为你的后端接口地址
```

### 2. 后端接口要求

系统需要以下后端接口：

#### 登录接口
- **URL**: `POST /api/login`
- **参数**: 
  ```json
  {
    "username": "用户名/手机号/邮箱",
    "password": "密码",
    "rememberMe": true/false
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "jwt_token",
      "userInfo": {
        "id": 1,
        "username": "用户名",
        "phone": "手机号",
        "email": "邮箱",
        "avatar": "头像URL",
        "createTime": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

#### 注册接口
- **URL**: `POST /api/register`
- **参数**:
  ```json
  {
    "username": "用户名",
    "phone": "手机号",
    "verifyCode": "验证码",
    "password": "密码"
  }
  ```

#### 发送验证码接口
- **URL**: `POST /api/send-verify-code`
- **参数**:
  ```json
  {
    "phone": "手机号"
  }
  ```

#### 重置密码接口
- **URL**: `POST /api/reset-password`
- **参数**:
  ```json
  {
    "phone": "手机号",
    "verifyCode": "验证码",
    "newPassword": "新密码"
  }
  ```

#### 获取用户信息接口
- **URL**: `GET /api/user/info`
- **Header**: `Authorization: Bearer {token}`

#### 微信登录接口
- **URL**: `POST /api/wechat/login`
- **参数**:
  ```json
  {
    "code": "微信登录凭证",
    "userInfo": {
      "nickName": "用户昵称",
      "avatarUrl": "头像URL",
      "gender": 1,
      "country": "国家",
      "province": "省份",
      "city": "城市"
    },
    "platform": "mp-weixin" // 或 "app-plus"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "jwt_token",
      "userInfo": {
        "id": 1,
        "username": "用户名",
        "phone": "手机号",
        "email": "邮箱",
        "avatar": "头像URL",
        "createTime": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

#### 退出登录接口
- **URL**: `POST /api/logout`
- **Header**: `Authorization: Bearer {token}`

### 3. 运行项目

```bash
# 安装依赖
npm install

# 运行到H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到APP
npm run dev:app
```

## 组件说明

### FormInput 组件

通用的表单输入组件，支持多种输入类型和验证。

```vue
<FormInput
  v-model="formData.username"
  label="用户名"
  placeholder="请输入用户名"
  :error-message="errors.username"
  @blur="validateField('username')"
/>
```

**Props**:
- `value`: 输入值
- `type`: 输入类型 (text, password, email, number, textarea)
- `label`: 标签文本
- `placeholder`: 占位符
- `maxlength`: 最大长度
- `disabled`: 是否禁用
- `errorMessage`: 错误信息
- `autoHeight`: 是否自动高度（仅textarea）

### SubmitButton 组件

通用的提交按钮组件，支持加载状态和多种样式。

```vue
<SubmitButton
  text="登录"
  loading-text="登录中..."
  :loading="loading"
  @click="handleLogin"
/>
```

**Props**:
- `text`: 按钮文本
- `loadingText`: 加载时文本
- `loading`: 是否加载中
- `disabled`: 是否禁用
- `type`: 按钮类型 (primary, secondary, danger)
- `size`: 按钮大小 (small, normal, large)

### WechatLoginButton 组件

微信登录按钮组件，仅在支持微信登录的平台显示。

```vue
<WechatLoginButton
  text="微信一键登录"
  loading-text="登录中..."
  :loading="loading"
  @click="handleWechatLogin"
/>
```

**Props**:
- `text`: 按钮文本
- `loadingText`: 加载时文本
- `loading`: 是否加载中
- `disabled`: 是否禁用
- `size`: 按钮大小 (small, normal, large)

## 工具模块

### 请求封装模块 (`utils/request.js`)

封装了HTTP请求的基础功能，包括请求拦截和错误处理。

### API接口模块 (`api/user.js`)

封装了用户相关的API接口调用，包括登录、注册、用户信息等。

### 认证工具 (`utils/auth.js`)

处理用户认证相关的逻辑，包括token管理、用户信息存储等。

### 验证工具 (`utils/validator.js`)

提供各种表单验证函数，包括手机号、邮箱、密码强度等验证。

### 平台检测工具 (`utils/platform.js`)

检测当前运行平台，判断是否支持特定功能。

### 微信登录工具 (`utils/wechat.js`)

处理微信登录相关逻辑，支持小程序和APP端微信登录。

### 异步操作工具 (`utils/async.js`)

提供统一的异步操作错误处理，简化try-catch代码。

**主要函数**:
- `to(promise)`: 将Promise转换为 `[data, error]` 格式
- `handleAsync(promise, options)`: 处理异步操作，自动显示提示
- `handleAsyncWithLoading(promise, options)`: 带loading状态的异步处理
- `handleAsyncBoolean(promise, options)`: 返回布尔值的异步处理
- `retry(fn, maxRetries, delay)`: 重试机制
- `withTimeout(promise, timeout)`: 超时控制

**使用示例**:
```javascript
// 传统方式
try {
  const data = await api.login(params)
  // 处理成功
} catch (error) {
  // 处理错误
}

// 使用异步工具
const [data, error] = await handleAsyncWithLoading(
  api.login(params),
  {
    loading: this,
    loadingText: '登录中...',
    successMsg: '登录成功',
    errorMsg: '登录失败',
    onSuccess: (data) => {
      // 处理成功
    },
    onError: (error) => {
      // 处理错误
    }
  }
)
```

## 页面说明

### 登录页 (`pages/login/login.vue`)

- 支持用户名、手机号、邮箱登录
- 微信一键登录（小程序和APP端）
- 记住登录状态
- 表单验证
- 跳转到注册和忘记密码

### 注册页 (`pages/register/register.vue`)

- 用户名注册
- 手机号验证码
- 密码强度验证
- 用户协议确认

### 忘记密码页 (`pages/forgot-password/forgot-password.vue`)

- 手机号验证码重置密码
- 新密码设置
- 密码确认

### 首页 (`pages/index/index.vue`)

- 登录状态检查
- 用户信息显示
- 功能特色展示
- 微信一键登录（未登录状态）
- 退出登录

## 样式设计

项目采用现代化的设计风格：

- 渐变背景
- 圆角卡片
- 阴影效果
- 响应式布局
- 统一的颜色主题

## 注意事项

1. 请确保后端接口返回的数据格式与前端期望的格式一致
2. 验证码发送有60秒倒计时限制
3. 密码必须包含字母和数字，至少8位
4. 用户名支持3-20位字母、数字、下划线
5. 手机号必须符合中国大陆手机号格式
6. 微信登录仅支持微信小程序和APP端
7. 小程序端需要配置微信小程序的AppID和AppSecret
8. APP端需要集成微信SDK并配置相关参数

## 开发建议

1. 根据实际需求调整表单验证规则
2. 可以添加更多的用户信息字段
3. 可以扩展更多的认证方式（如QQ登录、支付宝登录等）
4. 建议添加请求拦截器处理token过期的情况
5. 可以根据需要调整UI样式和主题色彩
6. 微信登录需要后端配合处理微信API调用
7. 建议添加用户头像上传功能
8. 可以考虑添加第三方登录绑定功能

## 许可证

MIT License 