<template>
  <view class="custom-tabbar">
    <view class="tab-item" :class="{ active: activeIndex === 0 }" @click="switchTab(0, '/pages/home/index')">
      <image :src="activeIndex === 0 ? '/static/tabbar/home-active.png' : '/static/tabbar/home.png'" class="tab-icon" />
      <text class="tab-text">首页</text>
    </view>

    <view class="tab-item" :class="{ active: activeIndex === 1 }" @click="switchTab(1, '/pages/orders/orders')">
      <image :src="activeIndex === 1 ? '/static/tabbar/order-active.png' : '/static/tabbar/order.png'"
        class="tab-icon" />
      <text class="tab-text">约球</text>
    </view>

    <!-- 发布按钮 - 特殊样式 -->
    <view class="publish-tab-item" @click="handlePublish">
      <view class="publish-button">
        <text class="publish-icon">+</text>
      </view>
      <text class="publish-text">发布</text>
    </view>

    <view class="tab-item" :class="{ active: activeIndex === 2 }" @click="switchTab(2, '/pages/club/club')">
      <image :src="activeIndex === 2 ? '/static/tabbar/club-active.png' : '/static/tabbar/club.png'" class="tab-icon" />
      <text class="tab-text">俱乐部</text>
    </view>

    <view class="tab-item" :class="{ active: activeIndex === 3 }" @click="switchTab(3, '/pages/profile/profile')">
      <image :src="activeIndex === 3 ? '/static/tabbar/profile-active.png' : '/static/tabbar/profile.png'"
        class="tab-icon" />
      <text class="tab-text">我的</text>
    </view>
    
    <PublishModal ref="publishModalRef" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/utils/auth.js'
import PublishModal from '@/pages/publish/index.vue'

// Props 定义
const props = defineProps({
  selected: {
    type: Number,
    default: 0
  }
})

// 使用认证钩子
const { isLoggedIn } = useAuth()

// 响应式数据
const publishModalRef = ref(null)

// 计算属性 - 直接使用props
const activeIndex = computed(() => {
  console.log('当前activeIndex:', props.selected)
  return props.selected
})

// 需要登录的页面索引
const LOGIN_REQUIRED_TABS = [1, 2] // 约球(1)、俱乐部(2)

// 检查登录状态
const checkLogin = () => {
  const token = uni.getStorageSync('token')
  return !!token
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}

// 切换Tab方法
const switchTab = (index, url) => {
  console.log('点击tab:', index, '当前高亮:', activeIndex.value)
  
  // 检查是否需要登录的页面
  if (LOGIN_REQUIRED_TABS.includes(index)) {
    if (!checkLogin()) {
      uni.showModal({
        title: '提示',
        content: '请先登录后再使用此功能',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            goToLogin()
          }
        }
      })
      return
    }
  }

  // 执行页面跳转
  uni.switchTab({
    url: url,
    success: () => {
      console.log('跳转成功:', url)
    },
    fail: (err) => {
      console.error('页面跳转失败:', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

// 处理发布按钮点击
const handlePublish = () => {
  // 检查登录状态
  if (!checkLogin()) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再发布内容',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          goToLogin()
        }
      }
    })
    return
  }
  
  // 显示发布选项弹窗
  if (publishModalRef.value) {
    publishModalRef.value.showPublishModal()
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #007aff;
$secondary-color: #0056cc;
$text-color: #7a7e83;
$active-color: #3cc51f;
$border-color: #e5e5e5;
$background-color: #ffffff;

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: $background-color;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1rpx solid $border-color;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  transition: all 0.3s ease;

  &.active {
    transform: scale(1.05);

    .tab-text {
      color: $active-color;
      font-weight: bold;
    }
  }
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 8rpx;
}

.tab-text {
  font-size: 20rpx;
  color: $text-color;
  transition: color 0.3s ease;
}

// 发布按钮特殊样式
.publish-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1.2;
  height: 100%;
  position: relative;
}

.publish-button {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  box-shadow: 0 8rpx 20rpx rgba($primary-color, 0.3);
  transition: all 0.3s ease;
  position: relative;
  top: -10rpx;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 10rpx rgba($primary-color, 0.4);
  }
}

.publish-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.publish-text {
  font-size: 20rpx;
  color: $primary-color;
  font-weight: bold;
  position: relative;
  top: -10rpx;
}
</style>