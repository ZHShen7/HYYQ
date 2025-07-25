<template>
  <view class="custom-tabbar">
    <view 
      class="tab-item" 
      :class="{ active: selected === 0 }"
      @click="switchTab(0, '/pages/home/index')"
    >
      <image 
        :src="selected === 0 ? '/static/tabbar/home-active.png' : '/static/tabbar/home.png'"
        class="tab-icon"
      />
      <text class="tab-text">首页</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{ active: selected === 1 }"
      @click="switchTab(1, '/pages/orders/orders')"
    >
      <image 
        :src="selected === 1 ? '/static/tabbar/order-active.png' : '/static/tabbar/order.png'"
        class="tab-icon"
      />
      <text class="tab-text">约球</text>
    </view>
    
    <!-- 发布按钮 - 特殊样式 -->
    <view class="publish-tab-item" @click="handlePublish">
      <view class="publish-button">
        <text class="publish-icon">+</text>
      </view>
      <text class="publish-text">发布</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{ active: selected === 2 }"
      @click="switchTab(2, '/pages/club/club')"
    >
      <image 
        :src="selected === 2 ? '/static/tabbar/club-active.png' : '/static/tabbar/club.png'"
        class="tab-icon"
      />
      <text class="tab-text">俱乐部</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{ active: selected === 3 }"
      @click="switchTab(3, '/pages/profile/profile')"
    >
      <image 
        :src="selected === 3 ? '/static/tabbar/profile-active.png' : '/static/tabbar/profile.png'"
        class="tab-icon"
      />
      <text class="tab-text">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    selected: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      color: "#7A7E83",
      selectedColor: "#3cc51f",
      list: [
        {
          pagePath: "/pages/home/index",
          iconPath: "/static/tabbar/home.png",
          selectedIconPath: "/static/tabbar/home-active.png",
          text: "首页"
        },
        {
          pagePath: "/pages/orders/orders",
          iconPath: "/static/tabbar/order.png",
          selectedIconPath: "/static/tabbar/order-active.png",
          text: "约球"
        },
        {
          pagePath: "/pages/club/club",
          iconPath: "/static/tabbar/club.png",
          selectedIconPath: "/static/tabbar/club-active.png",
          text: "俱乐部"
        },
        {
          pagePath: "/pages/profile/profile",
          iconPath: "/static/tabbar/profile.png",
          selectedIconPath: "/static/tabbar/profile-active.png",
          text: "我的"
        }
      ]
    }
  },
  methods: {
    switchTab(index, url) {
      if (this.selected === index) {
        return // 如果已经在当前页面，不进行跳转
      }
      
      uni.switchTab({
        url: url
      })
    },
    
    handlePublish() {
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
      uni.showActionSheet({
        itemList: ['发布动态', '发布约球', '发布活动'],
        success: (res) => {
          const routes = [
            '/pages/publish/post',
            '/pages/publish/match',
            '/pages/publish/activity'
          ]
          
          uni.navigateTo({
            url: routes[res.tapIndex]
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1rpx solid #e5e5e5;
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
}

.tab-item.active {
  transform: scale(1.05);
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 8rpx;
}

.tab-text {
  font-size: 20rpx;
  color: #7A7E83;
  transition: color 0.3s ease;
}

.tab-item.active .tab-text {
  color: #3cc51f;
  font-weight: bold;
}

/* 发布按钮特殊样式 */
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
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  top: -10rpx;
}

.publish-button:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.4);
}

.publish-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.publish-text {
  font-size: 20rpx;
  color: #007aff;
  font-weight: bold;
  position: relative;
  top: -10rpx;
}
</style> 