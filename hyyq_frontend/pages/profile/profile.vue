<template>
  <view class="profile-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <text class="navbar-title">我的</text>
        <view class="settings-btn" @click="goToSettings">
          <view class="settings-icon"></view>
        </view>
      </view>
    </view>
    
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="prompt-content">
        <text class="prompt-text">请先登录查看个人信息</text>
        <button class="login-btn" @click="goToLogin">立即登录</button>
      </view>
    </view>
    
    <!-- 已登录状态 -->
    <view v-else class="profile-content">
      <view class="user-info">
        <view class="avatar-section">
          <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
          <view class="user-details">
            <text class="username">{{ userInfo.username || '用户' }}</text>
            <text class="user-id">ID: {{ userInfo.id || '未知' }}</text>
          </view>
        </view>
      </view>
      
      <view class="menu-list">
        <view class="menu-item" @click="handleMenuClick('about')">
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleLogout">
          <text class="menu-text logout-text">退出登录</text>
        </view>
      </view>
    </view>
    
    <!-- 自定义tabBar -->
    <CustomTabBar :selected="3" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'
import { getPlatform, isWechatMiniProgram } from '@/utils/platform.js'

const { isLoggedIn, userInfo, logout } = useAuth()

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}

const goToSettings = () => {
  if (!isLoggedIn.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: '/pages/profile/settings/settings'
  })
}

const handleMenuClick = (type) => {
  switch (type) {
    case 'about':
      uni.showToast({
        title: '关于我们功能开发中',
        icon: 'none'
      })
      break
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  console.log('个人中心页面加载，当前平台：', getPlatform())
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx; /* 为自定义tabBar留出空间 */
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #F8F8F8;
  /* #ifdef MP-WEIXIN */
  padding-top: var(--status-bar-height);
  /* #endif */
  /* #ifdef APP-PLUS */
  padding-top: var(--status-bar-height);
  /* #endif */
  /* #ifdef H5 */
  padding-top: 0;
  /* #endif */
}

.navbar-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 30rpx;
}

.navbar-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.settings-btn {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
}

.settings-icon {
  width: 32rpx;
  height: 32rpx;
  position: relative;
  border-radius: 6rpx;
  background-color: #666;
  transform: rotate(45deg);
}

.settings-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid #f5f5f5;
  border-radius: 50%;
  background-color: transparent;
}

.settings-icon::after {
  content: '';
  position: absolute;
  top: -4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 8rpx;
  height: 40rpx;
  background-color: #666;
  border-radius: 4rpx;
  box-shadow: 40rpx 0 0 #666;
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  padding: 40rpx;
  /* #ifdef MP-WEIXIN */
  margin-top: calc(var(--status-bar-height) + 88rpx);
  /* #endif */
  /* #ifdef APP-PLUS */
  margin-top: calc(var(--status-bar-height) + 88rpx);
  /* #endif */
  /* #ifdef H5 */
  margin-top: 88rpx;
  /* #endif */
}

.prompt-content {
  text-align: center;
}

.prompt-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 40rpx;
  display: block;
}

.login-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}

.profile-content {
  padding: 20rpx;
  /* #ifdef MP-WEIXIN */
  margin-top: calc(var(--status-bar-height) + 88rpx);
  /* #endif */
  /* #ifdef APP-PLUS */
  margin-top: calc(var(--status-bar-height) + 88rpx);
  /* #endif */
  /* #ifdef H5 */
  margin-top: 88rpx;
  /* #endif */
}

.user-info {
  background-color: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.avatar-section {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.menu-list {
  background-color: white;
  border-radius: 20rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 32rpx;
  color: #333;
}

.logout-text {
  color: #ff3b30;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style> 