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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import PublishModal from '@/pages/publish/index.vue'

// Props 定义
const props = defineProps({
  selected: {
    type: Number,
    default: 0
  }
})

// 响应式数据
const currentSelected = ref(null)
const publishModalRef = ref(null)

// 常量数据 - 使用 reactive 包装对象数据
const tabConfig = reactive({
  color: '#7A7E83',
  selectedColor: '#3cc51f',
  list: [
    {
      pagePath: '/pages/home/index',
      iconPath: '/static/tabbar/home.png',
      selectedIconPath: '/static/tabbar/home-active.png',
      text: '首页'
    },
    {
      pagePath: '/pages/orders/orders',
      iconPath: '/static/tabbar/order.png',
      selectedIconPath: '/static/tabbar/order-active.png',
      text: '约球'
    },
    {
      pagePath: '/pages/club/club',
      iconPath: '/static/tabbar/club.png',
      selectedIconPath: '/static/tabbar/club-active.png',
      text: '俱乐部'
    },
    {
      pagePath: '/pages/profile/profile',
      iconPath: '/static/tabbar/profile.png',
      selectedIconPath: '/static/tabbar/profile-active.png',
      text: '我的'
    }
  ]
})

// 计算属性
const activeIndex = computed(() => {
  // 优先使用currentSelected，如果为null则使用props中的selected
  return currentSelected.value !== null ? currentSelected.value : props.selected
})

// Tab路由映射常量
const TAB_ROUTES = {
  'pages/home/index': 0,
  'pages/orders/orders': 1,
  'pages/club/club': 2,
  'pages/profile/profile': 3
}

// 方法定义
const updateCurrentTab = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const route = currentPage.route

    const tabIndex = TAB_ROUTES[route]
    if (tabIndex !== undefined) {
      currentSelected.value = tabIndex
    }
  }
}

const switchTab = (index, url) => {
  if (activeIndex.value === index) {
    return // 如果已经在当前页面，不进行跳转
  }

  // 立即更新选中状态
  currentSelected.value = index

  uni.switchTab({
    url: url,
    success: () => {
      // 跳转成功后再次确保状态正确
      updateCurrentTab()
    },
    fail: (err) => {
      console.error('页面跳转失败:', err)
      // 跳转失败时恢复原状态
      updateCurrentTab()
    }
  })
}

const handlePublish = () => {
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  // 显示发布选项弹窗
  if (publishModalRef.value) {
    publishModalRef.value.showPublishModal()
  }
}

// 监听器
watch(
  () => props.selected,
  (newVal) => {
    if (currentSelected.value === null || currentSelected.value === 0) {
      currentSelected.value = newVal
    }
  },
  { immediate: true }
)

// 生命周期钩子
onMounted(() => {
  updateCurrentTab()
})
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