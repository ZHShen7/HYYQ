<template>
  <view class="main-layout" :style="{ paddingTop: `${statusBarHeight}px` }">
    <!-- 动态内容区域 -->
    <view class="content-area">
      <!-- 首页 -->
      <HomeIndex v-if="activeTabIndex === 0" />
      <!-- 约球 -->
      <OrdersOrders v-else-if="activeTabIndex === 1" />
      <!-- 俱乐部 -->
      <ClubClub v-else-if="activeTabIndex === 2" />
      <!-- 我的 -->
      <ProfileProfile v-else-if="activeTabIndex === 3" />
    </view>
    
    <!-- 固定底部导航栏 -->
    <view class="tabbar-container">
      <CustomTabBar 
        :active-index="activeTabIndex" 
        @tab-change="handleTabChange"
        @publish-click="handlePublish"
      />
    </view>
    
    <!-- 发布弹窗 -->
    <PublishModal ref="publishModalRef" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CustomTabBar from '@/custom-tab-bar/index.vue'
import PublishModal from '@/pages/publish/index.vue'

// 导入各个tab页面组件
import HomeIndex from '@/pages/home/index.vue'
import OrdersOrders from '@/pages/orders/orders.vue'
import ClubClub from '@/pages/club/club.vue'
import ProfileProfile from '@/pages/profile/profile.vue'

// 响应式数据
const activeTabIndex = ref(0)
const publishModalRef = ref(null)
const statusBarHeight = ref(0)

statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight

// Tab配置
const tabTitles = {
  0: '首页',
  1: '约球', 
  2: '俱乐部',
  3: '我的'
}

// 需要登录的tab索引
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

// 处理tab切换
const handleTabChange = (index) => {
  // 检查是否需要登录
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
  
  // 更新活跃tab和页面标题
  activeTabIndex.value = index
  uni.setNavigationBarTitle({
    title: tabTitles[index] || '约约球球'
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

// 生命周期
onMounted(() => {
  // 设置初始页面标题
  uni.setNavigationBarTitle({
    title: tabTitles[activeTabIndex.value]
  })
})
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  position: relative;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
}

.content-area {
  flex: 1;
  width: 100%;
  position: relative;
  /* 允许内容区域滚动 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 确保从顶部开始 */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: calc(100vh - 120rpx); /* 减去底部导航栏的高度 */
}

.tabbar-container {
  width: 100%;
  height: 120rpx;
  min-height: 120rpx;
  background-color: #fff;
  /* 保证tabbar始终在底部 */
  flex-shrink: 0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
