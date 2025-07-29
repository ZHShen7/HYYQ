<template>
  <view class="register-container">
    <!-- 返回按钮 -->
    <view :style="{ height: `${searchHeight}rpx`, top: `${buttonTop}rpx`}" class="back-button" @click="goToHome">
      <text class="back-icon">←</text>
      <text class="back-text">返回首页</text>
    </view>
    
    <view class="register-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">创建账户</text>
      <text class="subtitle">请填写以下信息完成注册</text>
    </view>

    <view class="register-form">
      <FormInput v-model="formData.username" label="用户名" placeholder="请输入3-20位字母、数字或下划线"
        :error-message="errors.username" @blur="validateField('username')" />

      <FormInput v-model="formData.phone" label="手机号" placeholder="请输入手机号" :error-message="errors.phone"
        @blur="validateField('phone')" />

      <FormInput v-model="formData.verifyCode" label="验证码" placeholder="请输入6位验证码" :error-message="errors.verifyCode"
        @blur="validateField('verifyCode')" :suffix="true">
        <template #suffix>
          <button class="send-code-btn" :disabled="buttonDisabled" @click="sendVerifyCode">
            {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
          </button>
        </template>
      </FormInput>

      <FormInput v-model="formData.password" type="password" label="密码" placeholder="请输入至少8位密码，包含字母和数字"
        :error-message="errors.password" @blur="validateField('password')" />

      <FormInput v-model="formData.confirmPassword" type="password" label="确认密码" placeholder="请再次输入密码"
        :error-message="errors.confirmPassword" @blur="validateField('confirmPassword')" />

      <view class="agreement">
        <checkbox-group @change="formData.agreeTerms = !formData.agreeTerms">
          <checkbox :checked="formData.agreeTerms" color="#007aff" />
          <text class="agreement-text">
            我已阅读并同意
            <text class="link">《用户协议》</text>
            和
            <text class="link">《隐私政策》</text>
          </text>
        </checkbox-group>
      </view>

      <SubmitButton text="注册" loading-text="注册中..." :loading="loading"
        :disabled="!formData.agreeTerms || !formData.phone" @click="handleRegister" />

      <view class="login-link">
        <text>已有账户？</text>
        <text class="link" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import FormInput from '@/components/FormInput.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import { goToHome } from '@/utils/auth.js'
import { register, sendVerifyCode as sendVerifyCodeApi } from '@/api/user.js'
import { validateUsername, validatePassword, validatePhone, validateCode } from '@/utils/validator.js'
import { handleAsyncWithLoading } from '@/utils/async.js'
import { useMenuButton } from '@/utils/use-menu-button.js'

// 响应式数据
const loading = ref(false)
const codeCountdown = ref(0)

// 使用胶囊按钮适配
const { buttonTop, searchHeight } = useMenuButton()

const formData = reactive({
  username: '',
  phone: '',
  verifyCode: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 计算按钮禁用状态，添加调试信息
const buttonDisabled = computed(() => {
  const countdownCheck = codeCountdown.value > 0
  const phoneCheck = !formData.phone
  const errorCheck = !!errors.phone
  return countdownCheck || phoneCheck || errorCheck
})


const errors = reactive({
  username: '',
  phone: '',
  verifyCode: '',
  password: '',
  confirmPassword: ''
})

// 验证单个字段
const validateField = (field) => {
  errors[field] = ''

  switch (field) {
    case 'username':
      if (!formData.username) {
        errors.username = '请输入用户名'
      } else if (!validateUsername(formData.username)) {
        errors.username = '用户名格式不正确，3-20位字母、数字或下划线'
      }
      break
    case 'phone':
      if (!formData.phone) {
        errors.phone = '请输入手机号'
      } else if (!validatePhone(formData.phone)) {
        errors.phone = '请输入正确的手机号格式'
      }
      break
    case 'verifyCode':
      if (!formData.verifyCode) {
        errors.verifyCode = '请输入验证码'
      } else if (!validateCode(formData.verifyCode)) {
        errors.verifyCode = '验证码格式不正确'
      }
      break
    case 'password':
      if (!formData.password) {
        errors.password = '请输入密码'
      } else if (!validatePassword(formData.password)) {
        errors.password = '密码至少8位，包含字母和数字'
      }
      break
    case 'confirmPassword':
      if (!formData.confirmPassword) {
        errors.confirmPassword = '请确认密码'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
      }
      break
  }
}

// 验证整个表单
const validateForm = () => {
  validateField('username')
  validateField('phone')
  validateField('verifyCode')
  validateField('password')
  validateField('confirmPassword')

  return !Object.values(errors).some(error => error)
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!formData.phone) {
    uni.showToast({
      title: '请先输入手机号',
      icon: 'none'
    })
    return
  }

  if (errors.phone) {
    uni.showToast({
      title: '请检查手机号格式',
      icon: 'none'
    })
    return
  }
  uni.showToast({
    title: '验证码功能开发中',
    icon: 'none'
  })
  // console.log('我出发了')
  // const [data, error] = await handleAsyncWithLoading(
  //   sendVerifyCodeApi({ phone: formData.phone }),
  //   {
  //     loading: { loading },
  //     loadingText: '发送中...',
  //     successMsg: '验证码已发送',
  //     errorMsg: '发送失败，请重试',
  //     onSuccess: () => {
  //       // 开始倒计时
  //       codeCountdown.value = 60
  //       startCountdown()
  //     }
  //   }
  // )
}

// 倒计时
const startCountdown = () => {
  if (codeCountdown.value > 0) {
    setTimeout(() => {
      codeCountdown.value--
      startCountdown()
    }, 1000)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!formData.agreeTerms) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none'
    })
    return
  }

  if (!validateForm()) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  const [response, error] = await handleAsyncWithLoading(
    register({
      username: formData.username,
      phone: formData.phone,
      verifyCode: formData.verifyCode,
      password: formData.password
    }),
    {
      loading: { loading },
      loadingText: '注册中...',
      successMsg: '注册成功',
      errorMsg: '注册失败，请重试',
      onSuccess: () => {
        // 跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/auth/login'
          })
        }, 1500)
      }
    }
  )
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  position: relative;
  box-sizing: border-box;
}

.back-button {
  position: absolute;
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

.register-header {
  text-align: center;
  margin-bottom: 60rpx;
  margin-top: 100rpx;
}

.logo {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 30rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.register-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.send-code-btn {
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}

.send-code-btn:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
}

.send-code-btn:disabled {
  background: #ccc;
  color: #999;
}

.agreement {
  display: flex;
  align-items: flex-start;
  margin: 30rpx 0;
  font-size: 26rpx;
  color: #666;
}

.agreement-text {
  margin-left: 16rpx;
  line-height: 1.5;
}

.link {
  color: #007aff;
}

.login-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #666;
}
</style>