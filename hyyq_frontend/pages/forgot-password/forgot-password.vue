<template>
  <view class="forgot-password-container">
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

<script>
import FormInput from '@/components/FormInput.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import { sendVerifyCode, resetPassword } from '@/api/user'
import { validatePassword, validatePhone, validateCode } from '@/utils/validator.js'
import { handleAsyncWithLoading } from '@/utils/async.js'

export default {
  name: 'ForgotPassword',
  components: {
    FormInput,
    SubmitButton
  },
  data() {
    return {
      loading: false,
      codeCountdown: 0,
      formData: {
        phone: '',
        verifyCode: '',
        newPassword: '',
        confirmPassword: ''
      },
      errors: {
        phone: '',
        verifyCode: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    // 验证单个字段
    validateField(field) {
      this.errors[field] = ''
      
      switch (field) {
        case 'phone':
          if (!this.formData.phone) {
            this.errors.phone = '请输入手机号'
          } else if (!validatePhone(this.formData.phone)) {
            this.errors.phone = '请输入正确的手机号格式'
          }
          break
        case 'verifyCode':
          if (!this.formData.verifyCode) {
            this.errors.verifyCode = '请输入验证码'
          } else if (!validateCode(this.formData.verifyCode)) {
            this.errors.verifyCode = '验证码格式不正确'
          }
          break
        case 'newPassword':
          if (!this.formData.newPassword) {
            this.errors.newPassword = '请输入新密码'
          } else if (!validatePassword(this.formData.newPassword)) {
            this.errors.newPassword = '密码至少8位，包含字母和数字'
          }
          break
        case 'confirmPassword':
          if (!this.formData.confirmPassword) {
            this.errors.confirmPassword = '请确认新密码'
          } else if (this.formData.newPassword !== this.formData.confirmPassword) {
            this.errors.confirmPassword = '两次输入的密码不一致'
          }
          break
      }
    },

    // 验证整个表单
    validateForm() {
      this.validateField('phone')
      this.validateField('verifyCode')
      this.validateField('newPassword')
      this.validateField('confirmPassword')
      
      return !Object.values(this.errors).some(error => error)
    },

    // 发送验证码
    async sendVerifyCode() {
      if (!this.formData.phone) {
        uni.showToast({
          title: '请先输入手机号',
          icon: 'none'
        })
        return
      }

      if (this.errors.phone) {
        uni.showToast({
          title: '请检查手机号格式',
          icon: 'none'
        })
        return
      }

      const [data, error] = await handleAsyncWithLoading(
        sendVerifyCode({ phone: this.formData.phone }),
        {
          loading: this,
          loadingText: '发送中...',
          successMsg: '验证码已发送',
          errorMsg: '发送失败，请重试',
          onSuccess: () => {
            // 开始倒计时
            this.codeCountdown = 60
            this.startCountdown()
          }
        }
      )
    },

    // 倒计时
    startCountdown() {
      if (this.codeCountdown > 0) {
        setTimeout(() => {
          this.codeCountdown--
          this.startCountdown()
        }, 1000)
      }
    },

    // 处理重置密码
    async handleResetPassword() {
      if (!this.validateForm()) {
        uni.showToast({
          title: '请检查输入信息',
          icon: 'none'
        })
        return
      }

      const [response, error] = await handleAsyncWithLoading(
        resetPassword({
          phone: this.formData.phone,
          verifyCode: this.formData.verifyCode,
          newPassword: this.formData.newPassword
        }),
        {
          loading: this,
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
    },

    // 返回登录页
    goToLogin() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
}

.forgot-password-header {
  text-align: center;
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