<template>
  <view class="forgot-password-container">
    <!-- 返回按钮 -->
    <view :style="{ height: `${searchHeight}rpx`, top: `${buttonTop}rpx`}" class="back-button" @click="goToHome">
      <text class="back-icon">←</text>
      <text class="back-text">返回首页</text>
    </view>
    
    <view class="forgot-password-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">重置密码</text>
      <text class="subtitle">请输入手机号获取验证码重置密码</text>
    </view>

    <view class="forgot-password-form">
      <FormInput
        v-model="formData.phone"
        label="手机号"
        placeholder="请输入手机号"
        :error-message="errors.phone"
        @blur="validateField('phone')"
      />

      <view class="code-input-group">
        <FormInput
          v-model="formData.verifyCode"
          label="验证码"
          placeholder="请输入6位验证码"
          :error-message="errors.verifyCode"
          @blur="validateField('verifyCode')"
        />
        <button
          class="send-code-btn"
          :disabled="codeCountdown > 0 || !formData.phone || errors.phone"
          @click="sendVerifyCode"
        >
          {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
        </button>
      </view>

      <FormInput
        v-model="formData.newPassword"
        type="password"
        label="新密码"
        placeholder="请输入至少8位新密码，包含字母和数字"
        :error-message="errors.newPassword"
        @blur="validateField('newPassword')"
      />

      <FormInput
        v-model="formData.confirmPassword"
        type="password"
        label="确认新密码"
        placeholder="请再次输入新密码"
        :error-message="errors.confirmPassword"
        @blur="validateField('confirmPassword')"
      />

      <SubmitButton
        text="重置密码"
        loading-text="重置中..."
        :loading="loading"
        @click="handleResetPassword"
      />

      <view class="back-to-login">
        <text class="link" @click="goToLogin">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import FormInput from '@/components/FormInput.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import { goToHome } from '@/utils/auth.js'
import { sendVerifyCode as sendVerifyCodeApi, resetPassword } from '@/api/user'
import { validatePassword, validatePhone, validateCode } from '@/utils/validator.js'
import { handleAsyncWithLoading } from '@/utils/async.js'
import { useMenuButton } from '@/utils/use-menu-button.js'

// 响应式数据
const loading = ref(false)
const codeCountdown = ref(0)

// 使用胶囊按钮适配
const { buttonTop, searchHeight } = useMenuButton()

const formData = reactive({
  phone: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  phone: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证单个字段
const validateField = (field) => {
  errors[field] = ''
  
  switch (field) {
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
    case 'newPassword':
      if (!formData.newPassword) {
        errors.newPassword = '请输入新密码'
      } else if (!validatePassword(formData.newPassword)) {
        errors.newPassword = '密码至少8位，包含字母和数字'
      }
      break
    case 'confirmPassword':
      if (!formData.confirmPassword) {
        errors.confirmPassword = '请确认新密码'
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
      }
      break
  }
}

// 验证整个表单
const validateForm = () => {
  validateField('phone')
  validateField('verifyCode')
  validateField('newPassword')
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

  const [data, error] = await handleAsyncWithLoading(
    sendVerifyCodeApi({ phone: formData.phone }),
    {
      loading: { loading },
      loadingText: '发送中...',
      successMsg: '验证码已发送',
      errorMsg: '发送失败，请重试',
      onSuccess: () => {
        // 开始倒计时
        codeCountdown.value = 60
        startCountdown()
      }
    }
  )
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

// 处理重置密码
const handleResetPassword = async () => {
  if (!validateForm()) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  const [response, error] = await handleAsyncWithLoading(
    resetPassword({
      phone: formData.phone,
      verifyCode: formData.verifyCode,
      newPassword: formData.newPassword
    }),
    {
      loading: { loading },
      loadingText: '重置中...',
      successMsg: '密码重置成功',
      errorMsg: '重置失败，请重试',
      onSuccess: () => {
        // 跳转到登录页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  )
}

// 返回登录页
const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.forgot-password-container {
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

.forgot-password-header {
  text-align: center;
  margin-top: 100rpx;
  margin-bottom: 60rpx;
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

.forgot-password-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.code-input-group {
  position: relative;
  margin-bottom: 20rpx;
}

.send-code-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  margin-right: 24rpx;
}

.send-code-btn:disabled {
  background: #ccc;
  color: #999;
}

.back-to-login {
  text-align: center;
  margin-top: 40rpx;
}

.link {
  color: #007aff;
  font-size: 28rpx;
}
</style> 