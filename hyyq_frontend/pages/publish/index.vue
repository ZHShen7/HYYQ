<template>
  <view class="publish-modal" v-if="showModal">
    <!-- 遮罩层 -->
    <view class="modal-mask" @click="closeModal"></view>
    
    <!-- 弹出窗口 -->
    <view class="modal-content" :class="{ 'modal-show': showModal }">
      <!-- 标题栏 -->
      <view class="modal-header">
        <text class="modal-title">选择发布类型</text>
        <view class="close-btn" @click="closeModal">×</view>
      </view>
      
      <!-- 发布选项 -->
      <view class="publish-options">
        <view class="option-item" @click="selectPublishType('post')">
          <view class="option-icon">📝</view>
          <view class="option-info">
            <text class="option-title">发布动态</text>
            <text class="option-desc">分享你的运动心得和生活点滴</text>
          </view>
          <view class="option-arrow">></view>
        </view>
        
        <view class="option-item" @click="selectPublishType('match')">
          <view class="option-icon">⚽</view>
          <view class="option-info">
            <text class="option-title">发布约球</text>
            <text class="option-desc">寻找球友，组织比赛</text>
          </view>
          <view class="option-arrow">></view>
        </view>
        
        <view class="option-item" @click="selectPublishType('activity')">
          <view class="option-icon">🎯</view>
          <view class="option-info">
            <text class="option-title">发布活动</text>
            <text class="option-desc">组织运动活动和比赛</text>
          </view>
          <view class="option-arrow">></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'

const { isLoggedIn } = useAuth()

// 响应式数据
const showModal = ref(false)

// 显示弹窗
const showPublishModal = () => {
  if (!isLoggedIn.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 选择发布类型
const selectPublishType = (type) => {
  closeModal()
  
  // 根据类型跳转到对应的发布页面
  const routes = {
    post: '/pages/publish/post',
    match: '/pages/publish/match',
    activity: '/pages/publish/activity'
  }
  
  uni.navigateTo({
    url: routes[type]
  })
}

// 暴露方法给父组件调用
defineExpose({
  showPublishModal
})

</script>

<style scoped>
.publish-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 100%;
  background-color: white;
  border-radius: 20rpx 20rpx 0 0;
  padding: 40rpx;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.modal-content.modal-show {
  transform: translateY(0);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666;
}

.publish-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.option-item:active {
  background-color: #e9ecef;
  transform: scale(0.98);
}

.option-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.option-info {
  flex: 1;
}

.option-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.option-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.option-arrow {
  font-size: 28rpx;
  color: #ccc;
}
</style> 