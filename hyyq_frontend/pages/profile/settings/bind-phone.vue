<template>
  <view class="bind-phone-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <view class="nav-title">绑定手机号</view>
      <view class="nav-right"></view>
    </view>

    <!-- 页面内容 -->
    <view class="content">
      <!-- 当前手机号显示 -->
      <view class="current-phone-section">
        <text class="section-title">当前手机号</text>
        <view class="phone-display">
          <text class="phone-number">{{ currentPhoneDisplay }}</text>
        </view>
      </view>

      <!-- 新手机号输入 -->
      <view class="new-phone-section">
        <FormInput 
          v-model="formData.newPhone" 
          label="新手机号" 
          placeholder="请输入新手机号" 
          :error-message="errors.newPhone"
          @blur="validateField('newPhone')" 
        />

        <FormInput 
          v-model="formData.verifyCode" 
          label="验证码" 
          placeholder="请输入6位验证码" 
          :error-message="errors.verifyCode"
          @blur="validateField('verifyCode')" 
          :suffix="true"
        >
          <template #suffix>
            <button 
              class="send-code-btn" 
              :disabled="buttonDisabled" 
              @click="sendVerifyCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
            </button>
          </template>
        </FormInput>
      </view>

      <!-- 提交按钮 -->
      <SubmitButton 
        text="确认绑定" 
        loading-text="绑定中..." 
        :loading="loading"
        :disabled="!canSubmit" 
        @click="handleBindPhone" 
      />

      <!-- 温馨提示 -->
      <view class="tips">
        <text class="tips-title">温馨提示：</text>
        <text class="tips-content">• 修改手机号需要验证新手机号</text>
        <text class="tips-content">• 验证码有效期为5分钟</text>
        <text class="tips-content">• 新手机号不能与其他用户重复</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import FormInput from '@/components/FormInput.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import { useAuth } from '@/utils/auth.js'
import { sendVerifyCode as sendVerifyCodeApi, updateUserInfo } from '@/api/user.js'
import { validatePhone, validateCode } from '@/utils/validator.js'
import { handleAsyncWithLoading } from '@/utils/async.js'

// 使用认证信息
const { userInfo, refreshUserInfo } = useAuth()

// 响应式数据
const loading = ref(false)
const codeCountdown = ref(0)

const formData = reactive({
  newPhone: '',
  verifyCode: ''
})

const errors = reactive({
  newPhone: '',
  verifyCode: ''
})

// 当前手机号显示
const currentPhoneDisplay = computed(() => {
  if (userInfo.value?.phone) {
    return userInfo.value.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return '未绑定'
})

// 发送验证码按钮禁用状态
const buttonDisabled = computed(() => {
  const countdownCheck = codeCountdown.value > 0
  const phoneCheck = !formData.newPhone
  const errorCheck = !!errors.newPhone
  const samePhoneCheck = formData.newPhone === userInfo.value?.phone
  return countdownCheck || phoneCheck || errorCheck || samePhoneCheck
})

// 提交按钮可用状态
const canSubmit = computed(() => {
  return formData.newPhone && 
         formData.verifyCode && 
         !errors.newPhone && 
         !errors.verifyCode &&
         formData.newPhone !== userInfo.value?.phone
})

// 验证单个字段
const validateField = (field) => {
  errors[field] = ''

  switch (field) {
    case 'newPhone':
      if (!formData.newPhone) {
        errors.newPhone = '请输入新手机号'
      } else if (!validatePhone(formData.newPhone)) {
        errors.newPhone = '请输入正确的手机号格式'
      } else if (formData.newPhone === userInfo.value?.phone) {
        errors.newPhone = '新手机号不能与当前手机号相同'
      }
      break
    case 'verifyCode':
      if (!formData.verifyCode) {
        errors.verifyCode = '请输入验证码'
      } else if (!validateCode(formData.verifyCode)) {
        errors.verifyCode = '验证码格式不正确'
      }
      break
  }
}

// 验证整个表单
const validateForm = () => {
  validateField('newPhone')
  validateField('verifyCode')
  return !Object.values(errors).some(error => error)
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!formData.newPhone) {
    uni.showToast({
      title: '请先输入新手机号',
      icon: 'none'
    })
    return
  }

  if (errors.newPhone) {
    uni.showToast({
      title: '请检查手机号格式',
      icon: 'none'
    })
    return
  }

  const [data, error] = await handleAsyncWithLoading(
    sendVerifyCodeApi({ 
      phone: formData.newPhone,
      type: 'bind_phone'
    }),
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

// 处理绑定手机号
const handleBindPhone = async () => {
  if (!validateForm()) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  const [response, error] = await handleAsyncWithLoading(
    updateUserInfo({
      phone: formData.newPhone,
      verifyCode: formData.verifyCode
    }),
    {
      loading: { loading },
      loadingText: '绑定中...',
      successMsg: '手机号绑定成功',
      errorMsg: '绑定失败，请重试',
      onSuccess: async () => {
        // 刷新用户信息
        await refreshUserInfo()
        
        // 延时返回上一页
        setTimeout(() => {
          goBack()
        }, 1500)
      }
    }
  )
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  // 页面挂载时的初始化逻辑
})
</script>

<style lang="scss" scoped>
.bind-phone-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
  z-index: 999;
}

.nav-left {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-size: 36rpx;
  color: #007aff;
  margin-right: 10rpx;
}

.back-text {
  font-size: 30rpx;
  color: #007aff;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 80rpx;
}

.content {
  padding-top: 108rpx;
  padding: 108rpx 30rpx 30rpx 30rpx;
}

.current-phone-section {
  margin-bottom: 40rpx;
}

.new-phone-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.phone-display {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.phone-number {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.send-code-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 10rpx;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  min-width: 160rpx;
  
  &:disabled {
    background-color: #ccc;
    color: #999;
  }
}

.tips {
  margin-top: 40rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
}

.tips-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 20rpx;
}

.tips-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 10rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

/* 点击效果 */
.nav-left:active {
  opacity: 0.7;
}

/* 平台兼容性调整 */
/* #ifdef MP-WEIXIN */
.navbar {
  padding-top: var(--status-bar-height);
  height: calc(88rpx + var(--status-bar-height));
}

.content {
  padding-top: calc(108rpx + var(--status-bar-height));
}
/* #endif */

/* #ifdef APP-PLUS */
.navbar {
  padding-top: var(--status-bar-height);
  height: calc(88rpx + var(--status-bar-height));
}

.content {
  padding-top: calc(108rpx + var(--status-bar-height));
}
/* #endif */
</style>