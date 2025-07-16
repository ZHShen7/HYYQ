# 异步操作工具使用示例

本文档展示如何使用 `utils/async.js` 中的工具函数来简化异步操作。

## 基础用法

### 1. `to()` 函数 - 基础错误处理

将Promise转换为 `[data, error]` 格式，避免try-catch。

```javascript
import { to } from '@/utils/async.js'

// 传统方式
try {
  const data = await getUserInfo()
  console.log(data)
} catch (error) {
  console.error(error)
}

// 使用 to() 函数
const [data, error] = await to(getUserInfo())
if (error) {
  console.error(error)
} else {
  console.log(data)
}
```

### 2. `handleAsync()` 函数 - 自动提示

自动处理成功和错误提示。

```javascript
import { handleAsync } from '@/utils/async.js'

// 基础用法
const [data, error] = await handleAsync(
  login(params),
  {
    successMsg: '登录成功',
    errorMsg: '登录失败，请重试'
  }
)

// 自定义回调
const [data, error] = await handleAsync(
  login(params),
  {
    successMsg: '登录成功',
    errorMsg: '登录失败',
    onSuccess: (data) => {
      // 保存用户信息
      setToken(data.token)
      setUserInfo(data.userInfo)
    },
    onError: (error) => {
      // 特殊错误处理
      if (error.statusCode === 401) {
        goToLogin()
      }
    }
  }
)

// 不显示提示
const [data, error] = await handleAsync(
  getUserInfo(),
  {
    showToast: false
  }
)
```

### 3. `handleAsyncWithLoading()` 函数 - 带Loading状态

自动处理loading状态和提示。

```javascript
import { handleAsyncWithLoading } from '@/utils/async.js'

// 在Vue组件中使用
export default {
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      const [data, error] = await handleAsyncWithLoading(
        login(this.formData),
        {
          loading: this, // 自动设置 this.loading
          loadingText: '登录中...',
          successMsg: '登录成功',
          errorMsg: '登录失败',
          onSuccess: (data) => {
            // 登录成功后的处理
            this.goToHome()
          }
        }
      )
    }
  }
}
```

### 4. `handleAsyncBoolean()` 函数 - 返回布尔值

只关心操作是否成功。

```javascript
import { handleAsyncBoolean } from '@/utils/async.js'

// 检查操作是否成功
const success = await handleAsyncBoolean(
  updateUserInfo(params),
  {
    successMsg: '更新成功',
    errorMsg: '更新失败'
  }
)

if (success) {
  // 操作成功
  this.refreshData()
}
```

## 高级用法

### 1. `retry()` 函数 - 重试机制

自动重试失败的操作。

```javascript
import { retry } from '@/utils/async.js'

// 重试3次，每次间隔1秒
const [data, error] = await retry(
  () => uploadFile(file),
  3,
  1000
)

// 自定义重试逻辑
const [data, error] = await retry(
  async () => {
    const result = await getData()
    if (result.status === 'pending') {
      throw new Error('数据未准备好')
    }
    return result
  },
  5,
  2000
)
```

### 2. `withTimeout()` 函数 - 超时控制

为异步操作添加超时限制。

```javascript
import { withTimeout } from '@/utils/async.js'

// 10秒超时
const [data, error] = await withTimeout(
  downloadLargeFile(),
  10000,
  '下载超时，请重试'
)

// 5秒超时
const [data, error] = await withTimeout(
  getUserInfo(),
  5000
)
```

### 3. `handleAsyncAll()` 函数 - 批量处理

同时处理多个异步操作。

```javascript
import { handleAsyncAll } from '@/utils/async.js'

// 批量获取数据
const [dataArray, errorArray] = await handleAsyncAll([
  getUserInfo(),
  getOrderList(),
  getNotificationCount()
], {
  errorMsg: '部分数据获取失败'
})

// 检查是否有错误
if (errorArray.length > 0) {
  console.log('失败的请求:', errorArray)
}
```

## 在Vue组件中的完整示例

```javascript
<template>
  <view>
    <button @click="handleLogin" :disabled="loading">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </view>
</template>

<script>
import { handleAsyncWithLoading } from '@/utils/async.js'
import { login } from '@/api/user.js'
import { setToken, setUserInfo } from '@/utils/auth.js'

export default {
  data() {
    return {
      loading: false,
      formData: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      // 表单验证
      if (!this.validateForm()) {
        uni.showToast({
          title: '请检查输入信息',
          icon: 'none'
        })
        return
      }

      // 使用异步工具处理登录
      const [data, error] = await handleAsyncWithLoading(
        login(this.formData),
        {
          loading: this,
          loadingText: '登录中...',
          successMsg: '登录成功',
          errorMsg: '登录失败，请重试',
          onSuccess: (data) => {
            // 保存用户信息
            setToken(data.token)
            setUserInfo(data.userInfo)
            
            // 跳转页面
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/home/home'
              })
            }, 1500)
          },
          onError: (error) => {
            // 特殊错误处理
            if (error.statusCode === 401) {
              uni.showModal({
                title: '提示',
                content: '用户名或密码错误',
                showCancel: false
              })
            }
          }
        }
      )
    },

    validateForm() {
      return this.formData.username && this.formData.password
    }
  }
}
</script>
```

## 最佳实践

### 1. 选择合适的函数

- **简单错误处理**: 使用 `to()`
- **需要用户提示**: 使用 `handleAsync()`
- **需要loading状态**: 使用 `handleAsyncWithLoading()`
- **只关心成功/失败**: 使用 `handleAsyncBoolean()`
- **需要重试**: 使用 `retry()`
- **需要超时控制**: 使用 `withTimeout()`

### 2. 错误处理策略

```javascript
// 全局错误处理
const [data, error] = await handleAsync(
  operation(),
  {
    errorMsg: '操作失败',
    onError: (error) => {
      // 记录错误日志
      console.error('API错误:', error)
      
      // 特殊错误处理
      if (error.statusCode === 401) {
        // 未授权，跳转登录
        goToLogin()
      } else if (error.statusCode === 403) {
        // 权限不足
        showPermissionDenied()
      }
    }
  }
)
```

### 3. 组合使用

```javascript
// 重试 + 超时 + 错误处理
const [data, error] = await handleAsync(
  withTimeout(
    retry(
      () => uploadFile(file),
      3,
      1000
    ),
    30000,
    '上传超时'
  ),
  {
    successMsg: '上传成功',
    errorMsg: '上传失败'
  }
)
```

### 4. 性能优化

```javascript
// 并行处理多个请求
const [results, errors] = await handleAsyncAll([
  getUserInfo(),
  getOrderList(),
  getNotificationCount()
], {
  showToast: false // 不显示批量操作的提示
})

// 检查结果
if (errors.length === 0) {
  // 所有请求都成功
  this.processAllData(results)
} else {
  // 部分失败，显示错误
  uni.showToast({
    title: `${errors.length}个请求失败`,
    icon: 'none'
  })
}
```

通过这些工具函数，你可以大大简化异步操作的代码，提高开发效率和代码可读性。 