<template>
  <view class="index-container">
    <!-- 顶部欢迎区域 -->
    <view class="header">
      <view class="welcome-section">
        <text class="welcome-text">欢迎使用</text>
        <text class="app-name">约约球球</text>
      </view>
      
      <!-- 未登录状态提示 -->
      <view v-if="!isLoggedInComputed" class="login-prompt">
        <text class="prompt-text">登录后享受更多功能</text>
        <button class="login-btn" @click="goToLoginPage">立即登录</button>
      </view>
      
      <!-- 已登录状态用户信息 -->
      <view v-else class="user-info">
        <image 
          class="avatar" 
          :src="userInfo.avatar || userInfo.wechatAvatar || '/static/logo.png'" 
          mode="aspectFill"
          @error="handleAvatarError"
        ></image>
        <view class="user-details">
          <text class="username">{{ userInfo.username || userInfo.wechatNickname || '用户' }}</text>
          <text class="user-phone">{{ userInfo.phone || '' }}</text>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 功能卡片区域 -->
      <view class="feature-cards">
        <view class="feature-card" @click="handleFeatureClick('booking')">
          <view class="card-icon">🏟️</view>
          <text class="card-title">场地预订</text>
          <text class="card-desc">快速预订运动场地</text>
        </view>
        
        <view class="feature-card" @click="handleFeatureClick('match')">
          <view class="card-icon">⚽</view>
          <text class="card-title">约球匹配</text>
          <text class="card-desc">找到志同道合的球友</text>
        </view>
        
        <view class="feature-card" @click="handleFeatureClick('training')">
          <view class="card-icon">🎯</view>
          <text class="card-title">训练计划</text>
          <text class="card-desc">专业训练指导</text>
        </view>
        
        <view class="feature-card" @click="handleFeatureClick('community')">
          <view class="card-icon">👥</view>
          <text class="card-title">球友社区</text>
          <text class="card-desc">分享运动心得</text>
        </view>
      </view>
      
      <!-- 发布按钮 -->
      <view class="publish-section">
        <button class="publish-button" @click="showPublishModal">
          <text class="publish-icon">+</text>
          <text class="publish-text">发布内容</text>
        </button>
      </view>

      <!-- 推荐内容区域 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="section-title">热门推荐</text>
        </view>
        
        <view class="recommend-list">
          <view class="recommend-item">
            <image class="recommend-image" src="/static/logo.png" mode="aspectFill"></image>
            <view class="recommend-info">
              <text class="recommend-title">新手入门指南</text>
              <text class="recommend-desc">从零开始学习运动技巧</text>
            </view>
          </view>
          
          <view class="recommend-item">
            <image class="recommend-image" src="/static/logo.png" mode="aspectFill"></image>
            <view class="recommend-info">
              <text class="recommend-title">附近热门场地</text>
              <text class="recommend-desc">发现身边的运动好去处</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 未登录状态额外提示 -->
      <view v-if="!isLoggedInComputed" class="guest-tips">
        <view class="tips-card">
          <text class="tips-title">更多功能等你发现</text>
          <text class="tips-desc">登录后可以查看订单、加入俱乐部、管理个人信息等</text>
          <view class="tips-buttons">
            <button class="tips-btn primary" @click="goToLoginPage">立即登录</button>
            <button class="tips-btn secondary" @click="goToRegister">注册账户</button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 发布弹窗组件 -->
    <PublishModal ref="publishModalRef" />
    
    <!-- 自定义tabBar -->
    <CustomTabBar :selected="0" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isLoggedIn, getUserInfo } from '@/utils/auth.js'
import PublishModal from '@/pages/publish/index.vue'

// 响应式数据
const userInfo = ref({})
const loginStatus = ref(false)
const publishModalRef = ref(null)

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
  }
}

// 跳转到登录页
const goToLoginPage = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/auth/register'
  })
}

// 处理功能点击
const handleFeatureClick = (feature) => {
  if (!isLoggedInComputed.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  switch (feature) {
    case 'booking':
      uni.showToast({
        title: '场地预订功能开发中',
        icon: 'none'
      })
      break
    case 'match':
      uni.showToast({
        title: '约球匹配功能开发中',
        icon: 'none'
      })
      break
    case 'training':
      uni.showToast({
        title: '训练计划功能开发中',
        icon: 'none'
      })
      break
    case 'community':
      uni.showToast({
        title: '球友社区功能开发中',
        icon: 'none'
      })
      break
  }
}

// 显示发布弹窗
const showPublishModal = () => {
  if (publishModalRef.value) {
    publishModalRef.value.showPublishModal()
  }
}

// 处理头像加载错误
const handleAvatarError = (e) => {
  console.log('头像加载失败:', e)
}

// 生命周期
onMounted(() => {
  checkLoginStatus()
})

onLoad(() => {
  checkLoginStatus()
})

onShow(() => {
  checkLoginStatus()
})
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40rpx;
  padding-bottom: 160rpx; /* 为自定义tabBar留出空间 */
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

.login-prompt {
  text-align: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.prompt-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.login-btn {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
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
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-details {
  flex: 1;
}

.username {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-phone {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.content {
  flex: 1;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.feature-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:active {
  transform: scale(0.95);
}

.card-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.publish-section {
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
}

.publish-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 10rpx 30rpx rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
}

.publish-button:active {
  transform: scale(0.95);
}

.publish-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.publish-text {
  font-weight: 500;
}

.recommend-section {
  margin-bottom: 40rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.recommend-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.recommend-item {
  display: flex;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.recommend-item:last-child {
  border-bottom: none;
}

.recommend-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.recommend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.recommend-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.recommend-desc {
  font-size: 24rpx;
  color: #666;
}

.guest-tips {
  margin-top: 40rpx;
}

.tips-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.tips-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tips-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  line-height: 1.5;
}

.tips-buttons {
  display: flex;
  gap: 20rpx;
}

.tips-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 50rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
}

.tips-btn.primary {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: #fff;
}

.tips-btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 2rpx solid #e5e5e5;
}
</style>
