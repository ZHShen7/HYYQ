# API模块结构说明

本文档说明项目中API模块的组织结构和最佳实践。

## 目录结构

```
api/
├── user.js          # 用户相关接口
├── order.js         # 订单相关接口（示例）
├── product.js       # 商品相关接口（示例）
└── index.js         # API统一导出（可选）
```

## 文件说明

### 1. `utils/request.js` - 请求封装

负责HTTP请求的基础封装，包括：
- 请求拦截
- 响应处理
- 错误处理
- 基础配置

```javascript
// utils/request.js
import request from '@/utils/request.js'

// 用户相关接口
export const login = (data) => {
  return request('/api/login', {
    method: 'POST',
    data
  })
}
```

### 2. `api/user.js` - 用户接口

专门处理用户相关的API接口：

```javascript
// api/user.js
import request from '@/utils/request.js'

// 登录接口
export const login = (data) => {
  return request('/api/login', {
    method: 'POST',
    data
  })
}

// 注册接口
export const register = (data) => {
  return request('/api/register', {
    method: 'POST',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request('/api/user/info', {
    method: 'GET',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}
```

## 最佳实践

### 1. 按功能模块划分

```javascript
// api/order.js - 订单相关
export const getOrderList = (params) => {
  return request('/api/orders', {
    method: 'GET',
    data: params
  })
}

export const createOrder = (data) => {
  return request('/api/orders', {
    method: 'POST',
    data
  })
}

// api/product.js - 商品相关
export const getProductList = (params) => {
  return request('/api/products', {
    method: 'GET',
    data: params
  })
}
```

### 2. 统一错误处理

在 `utils/request.js` 中统一处理错误：

```javascript
// utils/request.js
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          // 统一错误处理
          handleError(res, reject)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

const handleError = (res, reject) => {
  switch (res.statusCode) {
    case 401:
      // 未授权，跳转登录
      goToLogin()
      break
    case 403:
      // 权限不足
      uni.showToast({
        title: '权限不足',
        icon: 'none'
      })
      break
    case 500:
      // 服务器错误
      uni.showToast({
        title: '服务器错误',
        icon: 'none'
      })
      break
    default:
      // 其他错误
      uni.showToast({
        title: res.data?.message || '请求失败',
        icon: 'none'
      })
  }
  reject(res)
}
```

### 3. 接口命名规范

- 使用动词+名词的形式
- 保持语义清晰
- 遵循RESTful规范

```javascript
// 好的命名
export const getUserInfo = () => { ... }
export const updateUserInfo = (data) => { ... }
export const deleteUser = (id) => { ... }
export const createUser = (data) => { ... }

// 避免的命名
export const userInfo = () => { ... }
export const user = (data) => { ... }
```

### 4. 参数处理

```javascript
// 支持查询参数
export const getOrderList = (params = {}) => {
  return request('/api/orders', {
    method: 'GET',
    data: {
      page: params.page || 1,
      size: params.size || 10,
      status: params.status,
      ...params
    }
  })
}

// 支持路径参数
export const getOrderDetail = (orderId) => {
  return request(`/api/orders/${orderId}`, {
    method: 'GET'
  })
}
```

### 5. 类型定义（可选）

如果使用TypeScript，可以添加类型定义：

```typescript
// types/api.ts
export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
  userInfo: {
    id: number
    username: string
    phone: string
    email: string
  }
}

// api/user.ts
import { LoginParams, LoginResponse } from '@/types/api'

export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request('/api/login', {
    method: 'POST',
    data
  })
}
```

## 使用示例

### 在页面中使用

```javascript
// pages/login/login.vue
import { login } from '@/api/user.js'
import { handleAsyncWithLoading } from '@/utils/async.js'

export default {
  methods: {
    async handleLogin() {
      const [data, error] = await handleAsyncWithLoading(
        login(this.formData),
        {
          loading: this,
          loadingText: '登录中...',
          successMsg: '登录成功',
          errorMsg: '登录失败',
          onSuccess: (data) => {
            // 处理登录成功
            setToken(data.token)
            setUserInfo(data.userInfo)
          }
        }
      )
    }
  }
}
```

### 批量导入

```javascript
// api/index.js - 统一导出
export * from './user.js'
export * from './order.js'
export * from './product.js'

// 在页面中使用
import { login, register, getOrderList } from '@/api/index.js'
```

## 配置说明

### 1. 基础配置

在 `utils/request.js` 中配置：

```javascript
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://api.yourdomain.com'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-Client-Version': '1.0.0'
}
```

### 2. 环境配置

```javascript
// config/api.js
const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000
  },
  production: {
    baseUrl: 'https://api.yourdomain.com',
    timeout: 15000
  }
}

export default config[process.env.NODE_ENV]
```

## 注意事项

1. **接口地址**: 确保BASE_URL配置正确
2. **错误处理**: 在request.js中统一处理常见错误
3. **权限验证**: 自动添加token到请求头
4. **超时设置**: 根据接口特点设置合适的超时时间
5. **缓存策略**: 对于不常变化的数据可以考虑缓存

通过这种模块化的API组织方式，可以：
- 提高代码的可维护性
- 便于团队协作
- 减少重复代码
- 统一错误处理
- 便于测试和调试 