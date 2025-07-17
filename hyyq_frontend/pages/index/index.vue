<template>
  <view class="index-container">
    <view class="header">
      <view class="welcome-section">
        <text class="welcome-text">欢迎使用</text>
        <text class="app-name">约约球球</text>
      </view>
      
      <view v-if="isLoggedInComputed" class="user-info">
        <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
        <view class="user-details">
          <text class="username">{{ userInfo.username || '用户' }}</text>
          <text class="user-phone">{{ userInfo.phone || '' }}</text>
        </view>
      </view>
      
      <view v-else class="login-prompt">
        <text class="prompt-text">请先登录</text>
        <button class="login-btn" @click="goToLoginPage">立即登录</button>
      </view>
    </view>

    <view class="content">
      <view v-if="isLoggedInComputed" class="logged-in-content">
        <view class="feature-card">
          <text class="card-title">用户信息</text>
          <view class="info-item">
            <text class="label">用户名：</text>
            <text class="value">{{ userInfo.username }}</text>
          </view>
          <view class="info-item">
            <text class="label">手机号：</text>
            <text class="value">{{ userInfo.phone }}</text>
          </view>
          <view class="info-item">
            <text class="label">注册时间：</text>
            <text class="value">{{ formatDate(userInfo.createTime) }}</text>
          </view>
        </view>

        <view class="action-buttons">
          <button class="action-btn primary" @click="refreshUserInfo">
            刷新用户信息
          </button>
          <button class="action-btn secondary" @click="handleLogout">
            退出登录
          </button>
        </view>
      </view>

      <view v-else class="guest-content">
        <view class="feature-card">
          <text class="card-title">功能特色</text>
          <view class="feature-list">
            <view class="feature-item">
              <text class="feature-icon">🔐</text>
              <text class="feature-text">安全登录注册</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">📱</text>
              <text class="feature-text">手机验证码</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">🔄</text>
              <text class="feature-text">密码重置</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">🎨</text>
              <text class="feature-text">现代化UI</text>
            </view>
          </view>
        </view>

        <view class="action-buttons">
          <button class="action-btn primary" @click="goToLoginPage">
            立即登录
          </button>
          <button class="action-btn secondary" @click="goToRegister">
            注册账户
          </button>
        </view>

        <view v-if="showWechatLogin" class="wechat-login-section">
          <view class="divider">
            <text class="divider-text">或</text>
          </view>
          <button class="wechat-btn" @click="handleWechatLogin">
            <text class="wechat-icon">微信</text>
            <text class="wechat-text">微信一键登录</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isLoggedIn, getUserInfo, clearAuth, goToLogin } from '@/utils/auth.js'
import { getUserInfo as fetchUserInfo, logout, wechatLogin } from '@/api/user.js'
import { wechatLogin as wechatLoginUtil } from '@/utils/wechat.js'
import { supportWechatLogin, isWechatMiniProgram } from '@/utils/platform.js'
import { handleAsyncWithLoading, handleAsync } from '@/utils/async.js'

// 响应式数据
const userInfo = ref({})
const showWechatLogin = ref(false)
const loginStatus = ref(false)

// 计算属性
const isLoggedInComputed = computed(() => {
  return loginStatus.value
})

// 检查登录状态
const checkLoginStatus = () => {
  const loggedIn = isLoggedIn()
  loginStatus.value = loggedIn
  if (loggedIn) {
    userInfo.value = getUserInfo() || {}
    loadUserInfo()
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  const [response, error] = await handleAsync(
    fetchUserInfo(),
    {
      showToast: false,
      onError: (error) => {
        // 如果获取用户信息失败，可能是token过期，清除登录状态
        if (error.statusCode === 401) {
          handleLogout()
        }
      }
    }
  )
  
  if (response) {
    userInfo.value = response.data || {}
  }
}

// 刷新用户信息
const refreshUserInfo = async () => {
  const [success, error] = await handleAsyncWithLoading(
    loadUserInfo(),
    {
      loading: { loading: ref(false) },
      loadingText: '刷新中...',
      successMsg: '刷新成功',
      errorMsg: '刷新失败'
    }
  )
}

// 处理退出登录
const handleLogout = async () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        const [data, error] = await handleAsync(
          logout(),
          {
            showToast: false,
            onError: (error) => {
              console.error('退出登录失败:', error)
            }
          }
        )
        
        // 无论接口是否成功，都清除本地数据
        clearAuth()
        userInfo.value = {}
        loginStatus.value = false
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

// 跳转到登录页
const goToLoginPage = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 检查微信登录支持
const checkWechatLoginSupport = () => {
  showWechatLogin.value = supportWechatLogin()
}

// 处理微信登录
const handleWechatLogin = async () => {
  const [wechatResult, wechatError] = await handleAsync(
    wechatLoginUtil(),
    {
      showToast: false,
      onError: (error) => {
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

  if (wechatError) return

  const [response, loginError] = await handleAsync(
    wechatLogin({
      code: wechatResult.code,
      userInfo: wechatResult.userInfo,
      platform: isWechatMiniProgram() ? 'mp-weixin' : 'app-plus'
    }),
    {
      successMsg: '微信登录成功',
      errorMsg: '微信登录失败，请重试',
      onSuccess: (data) => {
        // 保存token和用户信息
        userInfo.value = data.userInfo || {}
        loginStatus.value = true
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      }
    }
  )
}

// 生命周期
onMounted(() => {
  checkLoginStatus()
  checkWechatLoginSupport()
})

onLoad(() => {
  checkLoginStatus()
  checkWechatLoginSupport()
})

onShow(() => {
  checkLoginStatus()
  checkWechatLoginSupport()
})
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40rpx;
}

.header {
  margin-bottom: 60rpx;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40rpx;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 30rpx;
}

.user-details {
  flex: 1;
}

.username {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-phone {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.login-prompt {
  text-align: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.prompt-text {
  display: block;
  font-size: 32rpx;
  color: #666;
  margin-bottom: 30rpx;
}

.login-btn {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.content {
  flex: 1;
}

.feature-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.feature-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: #fff;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 2rpx solid #e5e5e5;
}

.action-btn:active {
  transform: scale(0.98);
}

.wechat-login-section {
  margin-top: 40rpx;
}

.divider {
  position: relative;
  text-align: center;
  margin: 30rpx 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2rpx;
  background: #e5e5e5;
}

.divider-text {
  background: #fff;
  padding: 0 20rpx;
  color: #999;
  font-size: 24rpx;
}

.wechat-btn {
  width: 100%;
  height: 88rpx;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.wechat-btn:active {
  background: #06ad56;
  transform: scale(0.98);
}

.wechat-icon {
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 16rpx;
}

.wechat-text {
  font-weight: 500;
}
</style>
