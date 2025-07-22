<template>
  <view class="club-container">
    <!-- 未登录状态提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="prompt-content">
        <text class="prompt-text">请先登录查看俱乐部</text>
        <button class="login-btn" @click="goToLogin">立即登录</button>
      </view>
    </view>
    
    <!-- 已登录状态内容 -->
    <view v-else class="club-content">
      <view class="club-header">
        <text class="header-title">俱乐部</text>
      </view>
      
      <view class="club-list">
        <!-- 俱乐部列表内容将在这里实现 -->
        <view class="empty-state">
          <text class="empty-text">暂无俱乐部信息</text>
        </view>
      </view>
    </view>
    
    <!-- 自定义tabBar -->
    <CustomTabBar :selected="2" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'

const { isLoggedIn } = useAuth()

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}

onMounted(() => {
  console.log('俱乐部页面加载')
})
</script>

<style scoped>
.club-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx; /* 为自定义tabBar留出空间 */
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  padding: 40rpx;
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

.club-content {
  padding: 20rpx;
}

.club-header {
  background-color: white;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.club-list {
  background-color: white;
  border-radius: 20rpx;
  min-height: 400rpx;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 