<template>
  <view class="login-container">
    <!-- 返回按钮 -->
    <view :style="{ height: `${searchHeight}rpx`, top: `${buttonTop}rpx`}" class="back-button" @click="goToHome">
      <text class="back-icon">←</text>
      <text class="back-text">返回首页</text>
    </view>
    
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">欢迎回来</text>
      <text class="subtitle">请登录您的账户</text>
    </view>

    <view class="login-form">
      <FormInput
        v-model="formData.username"
        label="用户名/手机号/邮箱"
        placeholder="请输入用户名、手机号或邮箱"
        :error-message="errors.username"
        @blur="validateField('username')"
        @input="(value) => console.log('Parent received:', value)"
      />

      <FormInput
        v-model="formData.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        :error-message="errors.password"
        @blur="validateField('password')"
        @input="(value) => console.log('Parent received:', value)"
      />

      <view class="form-options">
        <view class="remember-me">
          <checkbox-group @change="formData.rememberMe = !formData.rememberMe">
            <checkbox
              :checked="formData.rememberMe"
              color="#007aff"
            />
          </checkbox-group>
          <text>记住我</text>
        </view>
        <text class="forgot-password" @click="goToForgotPassword">忘记密码？</text>
      </view>

      <SubmitButton
        text="登录"
        loading-text="登录中..."
        :loading="loading"
        @click="handleLogin"
      />

      <WechatLoginButton
        text="微信一键登录"
        loading-text="登录中..."
        :loading="wechatLoading"
        @click="handleWechatLogin"
      />

      <view class="register-link">
        <text>还没有账户？</text>
        <text class="link" @click="goToRegister">立即注册</text>
      </view>
    </view>

    <view class="login-footer">
      <text class="footer-text">登录即表示同意</text>
      <text class="link">《用户协议》</text>
      <text class="footer-text">和</text>
      <text class="link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import FormInput from '@/components/FormInput.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import WechatLoginButton from '@/components/WechatLoginButton.vue'
import { login, wechatLogin } from '@/api/user.js'
import { setToken, setUserInfo, goToHome } from '@/utils/auth.js'
import { validateUsername, validatePassword, validatePhone, validateEmail } from '@/utils/validator.js'
import { wechatLogin as wechatLoginUtil } from '@/utils/wechat.js'
import { supportWechatLogin, isWechatMiniProgram } from '@/utils/platform.js'
import { handleAsyncWithLoading } from '@/utils/async.js'
import { useMenuButton } from '@/utils/use-menu-button.js'

// 响应式数据
const loading = ref(false)
const wechatLoading = ref(false)
const showWechatLogin = ref(false)

// 使用胶囊按钮适配
const { buttonTop, searchHeight } = useMenuButton()

const formData = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  username: '',
  password: ''
})

// 验证单个字段
const validateField = (field) => {
  console.log(formData)
  errors[field] = ''
  
  switch (field) {
    case 'username':
      if (!formData.username) {
        errors.username = '请输入用户名、手机号或邮箱'
      } else if (!isValidUsername(formData.username)) {
        errors.username = '请输入正确的用户名、手机号或邮箱格式'
      } else {
        errors.username = ''
      }
      break
    case 'password':
      if (!formData.password) {
        errors.password = '请输入密码'
      } else if (!validatePassword(formData.password)) {
        errors.password = '密码至少8位，包含字母和数字'
      } else {
        errors.password = ''
      }
      break
  }
}

// 验证用户名格式（支持用户名、手机号、邮箱）
const isValidUsername = (value) => {
  return validateUsername(value) || validatePhone(value) || validateEmail(value)
}

// 验证整个表单
const validateForm = () => {
  validateField('username')
  validateField('password')
  
  return !errors.username && !errors.password
}

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  const [response, error] = await handleAsyncWithLoading(
    login({
      username: formData.username,
      password: formData.password,
      rememberMe: formData.rememberMe
    }),
    {
      loading: { loading },
      loadingText: '登录中...',
      successMsg: '登录成功',
      errorMsg: '登录失败，请重试',
      onSuccess: (data) => {
        // 保存token和用户信息
        setToken(data.token)
        setUserInfo(data.data) // 修复：使用data.data而不是data.userInfo
        
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/home/index'
          })
        }, 1500)
      }
    }
  )
}

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/auth/register'
  })
}

// 跳转到忘记密码页
const goToForgotPassword = () => {
  uni.navigateTo({
    url: '/pages/auth/forgot-password'
  })
}

// 检查微信登录支持
const checkWechatLoginSupport = () => {
  showWechatLogin.value = supportWechatLogin()
}

// 处理微信登录
const handleWechatLogin = async () => {
  const [wechatResult, wechatError] = await handleAsyncWithLoading(
    wechatLoginUtil(),
    {
      loading: { wechatLoading },
      loadingText: '微信登录中...',
      errorMsg: '微信登录失败，请重试',
      onError: (error) => {
        console.log(error)
        // 如果是权限问题，提示用户授权
        if (error.message && error.message.includes('授权')) {
          uni.showModal({
            title: '需要授权',
            content: '请授权获取您的微信信息以完成登录',
            showCancel: false
          })
        }
      }
    }
  )

  if (wechatError) {
    console.log(wechatError)
    return
  }

  const [response, loginError] = await handleAsyncWithLoading(
    wechatLogin({
      code: wechatResult.code,
      userInfo: wechatResult.userInfo,
      platform: isWechatMiniProgram() ? 'mp-weixin' : 'app-plus'
    }),
    {
      loading: { wechatLoading },
      loadingText: '登录中...',
      successMsg: '微信登录成功',
      errorMsg: '微信登录失败，请重试',
      onSuccess: (data) => {
        // 保存token和用户信息
        setToken(data.token)
        setUserInfo(data.data) // 修复：使用data.data而不是data.userInfo
        
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/home/index'
          })
        }, 1500)
      }
    }
  )
}

// 生命周期
onMounted(() => {
  checkWechatLoginSupport()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
}

.back-button {
  position: absolute;
  top: 40rpx;
  left: 40rpx;
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 10;
  transition: all 0.3s ease;
  cursor: pointer;
}

.back-button:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.back-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 8rpx;
  font-weight: bold;
}

.back-text {
  font-size: 26rpx;
  color: #fff;
}

.login-header {
  text-align: center;
  margin-top: 100rpx;
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30rpx 0;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #666;
}

.remember-me text {
  margin-left: 16rpx;
}

.forgot-password {
  font-size: 28rpx;
  color: #007aff;
}

.register-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #666;
}

.link {
  color: #007aff;
  margin-left: 8rpx;
}

.login-footer {
  text-align: center;
  margin-top: 60rpx;
  margin-bottom: 40rpx;
  padding-bottom: 20rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.footer-text {
  margin: 0 8rpx;
}
</style> 