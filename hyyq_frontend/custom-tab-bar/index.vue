<template>
  <view class="custom-tabbar">
    <view class="tab-item" :class="{ active: props.activeIndex === 0 }" @click="switchTab(0)">
      <image :src="props.activeIndex === 0 ? '/static/tabbar/home-active.png' : '/static/tabbar/home.png'" class="tab-icon" />
      <text class="tab-text">首页</text>
    </view>

    <view class="tab-item" :class="{ active: props.activeIndex === 1 }" @click="switchTab(1)">
      <image :src="props.activeIndex === 1 ? '/static/tabbar/order-active.png' : '/static/tabbar/order.png'"
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

    <view class="tab-item" :class="{ active: props.activeIndex === 2 }" @click="switchTab(2)">
      <image :src="props.activeIndex === 2 ? '/static/tabbar/club-active.png' : '/static/tabbar/club.png'" class="tab-icon" />
      <text class="tab-text">俱乐部</text>
    </view>

    <view class="tab-item" :class="{ active: props.activeIndex === 3 }" @click="switchTab(3)">
      <image :src="props.activeIndex === 3 ? '/static/tabbar/profile-active.png' : '/static/tabbar/profile.png'"
        class="tab-icon" />
      <text class="tab-text">我的</text>
    </view>
  </view>
</template>

<script setup>
// Props
const props = defineProps({
  activeIndex: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['tab-change', 'publish-click'])

// 切换Tab方法
const switchTab = (index) => {
  // 通过事件通知父组件切换tab
  emit('tab-change', index)
}

// 处理发布按钮点击
const handlePublish = () => {
  // 通过事件通知父组件处理发布
  emit('publish-click')
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