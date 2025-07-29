<template>
  <view class="profile-container">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="gradient-bg">
        <view class="prompt-content">
          <view class="login-avatar">
            <image class="avatar-placeholder" src="/static/logo.png" mode="aspectFill"></image>
          </view>
          <text class="prompt-text">登录享受更多服务</text>
          <button class="login-btn" @click="goToLogin">立即登录</button>
        </view>
      </view>
    </view>
    
          <!-- 已登录状态 -->
      <view v-else class="profile-content">
        <!-- 用户信息头部 -->
        <view class="user-header">
          <view class="gradient-bg">
            <view class="user-info">
              <view class="avatar-section">
                <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
                <view class="user-details">
                  <text class="username">{{ userInfo.username || '用户' }}</text>
                  <view class="user-level">
                    <text class="level-text">普通会员</text>
                    <text class="level-badge">Lv.1</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      
      <!-- 快捷功能区 -->
      <view class="quick-actions">
        <view class="action-item" @click="handleQuickAction('favorites')">
          <view class="action-icon favorites-icon"></view>
          <text class="action-text">收藏</text>
        </view>
        <view class="action-item" @click="handleQuickAction('footprint')">
          <view class="action-icon footprint-icon"></view>
          <text class="action-text">足迹</text>
        </view>
        <view class="action-item" @click="handleQuickAction('wallet')">
          <view class="action-icon wallet-icon"></view>
          <text class="action-text">钱包</text>
        </view>
        <view class="action-item" @click="handleQuickAction('coupon')">
          <view class="action-icon coupon-icon"></view>
          <text class="action-text">优惠券</text>
        </view>
      </view>
      
      <!-- 订单相关 -->
      <view class="order-section">
        <view class="section-header">
          <text class="section-title">我的订单</text>
          <text class="view-all" @click="goToOrders">查看全部 ></text>
        </view>
        <view class="order-actions">
          <view class="order-item" @click="goToOrders('pending')">
            <view class="order-icon pending-icon"></view>
            <text class="order-text">待付款</text>
          </view>
          <view class="order-item" @click="goToOrders('paid')">
            <view class="order-icon paid-icon"></view>
            <text class="order-text">待使用</text>
          </view>
          <view class="order-item" @click="goToOrders('completed')">
            <view class="order-icon completed-icon"></view>
            <text class="order-text">已完成</text>
          </view>
          <view class="order-item" @click="goToOrders('refund')">
            <view class="order-icon refund-icon"></view>
            <text class="order-text">退款/售后</text>
          </view>
        </view>
      </view>
      
      <!-- 服务菜单 -->
      <view class="service-menu">
        <view class="menu-group">
          <view class="menu-item" @click="handleCustomerService">
            <view class="menu-icon service-icon"></view>
            <text class="menu-text">联系客服</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" @click="goToSettings">
            <view class="menu-icon settings-icon"></view>
            <text class="menu-text">设置</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" @click="handleMenuClick('feedback')">
            <view class="menu-icon feedback-icon"></view>
            <text class="menu-text">意见反馈</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
        
        <view class="menu-group">
          <view class="menu-item" @click="handleMenuClick('privacy')">
            <view class="menu-icon privacy-icon"></view>
            <text class="menu-text">隐私设置</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" @click="handleMenuClick('about')">
            <view class="menu-icon about-icon"></view>
            <text class="menu-text">关于我们</text>
            <text class="menu-arrow">></text>
          </view>
        </view>
        
        <view class="menu-group logout-group">
          <view class="menu-item" @click="handleLogout">
            <view class="menu-icon logout-icon"></view>
            <text class="menu-text logout-text">退出登录</text>
          </view>
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

const goToEditProfile = () => {
  uni.showToast({
    title: '编辑资料功能开发中',
    icon: 'none'
  })
}



const handleCustomerService = () => {
  // #ifdef MP-WEIXIN
  uni.openCustomerServiceChat({
    extInfo: {
      url: ''
    },
    corpId: '',
    success: () => {
      console.log('打开客服会话成功')
    },
    fail: (err) => {
      console.log('打开客服会话失败:', err)
      uni.showToast({
        title: '客服功能开发中',
        icon: 'none'
      })
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({
    title: '客服功能开发中',
    icon: 'none'
  })
  // #endif
}

const handleQuickAction = (type) => {
  switch (type) {
    case 'favorites':
      uni.showToast({
        title: '收藏功能开发中',
        icon: 'none'
      })
      break
    case 'footprint':
      uni.showToast({
        title: '足迹功能开发中',
        icon: 'none'
      })
      break
    case 'wallet':
      uni.showToast({
        title: '钱包功能开发中',
        icon: 'none'
      })
      break
    case 'coupon':
      uni.showToast({
        title: '优惠券功能开发中',
        icon: 'none'
      })
      break
  }
}

const goToOrders = (status = 'all') => {
  uni.showToast({
    title: '订单功能开发中',
    icon: 'none'
  })
}

const handleMenuClick = (type) => {
  switch (type) {
    case 'customer-service':
      uni.showToast({
        title: '客服中心功能开发中',
        icon: 'none'
      })
      break
    case 'feedback':
      uni.showToast({
        title: '意见反馈功能开发中',
        icon: 'none'
      })
      break
    case 'privacy':
      uni.showToast({
        title: '隐私设置功能开发中',
        icon: 'none'
      })
      break
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

<style scoped lang="less">
// 主容器
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 160rpx; // 为自定义tabBar留出空间
  padding-top: 40rpx;
  box-sizing: border-box;
}

// 渐变背景
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 40rpx 40rpx;
}



// 未登录状态
.login-prompt {
  padding-top: 40rpx;

  .prompt-content {
    text-align: center;
    padding: 80rpx 40rpx;
  }

  .login-avatar {
    margin-bottom: 40rpx;
  }

  .avatar-placeholder {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
  }

  .prompt-text {
    font-size: 32rpx;
    color: white;
    margin-bottom: 60rpx;
    display: block;
  }

  .login-btn {
    background-color: white;
    color: #667eea;
    border: none;
    border-radius: 50rpx;
    padding: 24rpx 80rpx;
    font-size: 30rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  }
}

// 已登录状态
.profile-content {
  padding-top: 20rpx;

  // 用户信息头部
  .user-header {
    margin-bottom: 0;

    .user-info {
      padding: 40rpx 30rpx 60rpx;
    }

    .avatar-section {
      display: flex;
      align-items: center;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-right: 30rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
      }

      .user-details {
        flex: 1;

        .username {
          font-size: 40rpx;
          font-weight: bold;
          color: white;
          display: block;
          margin-bottom: 16rpx;
        }

        .user-level {
          display: flex;
          align-items: center;

          .level-text {
            font-size: 26rpx;
            color: rgba(255, 255, 255, 0.8);
            margin-right: 16rpx;
          }

          .level-badge {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 22rpx;
            padding: 6rpx 12rpx;
            border-radius: 20rpx;
          }
        }
      }

      .user-actions {
        display: flex;
        align-items: center;

        .edit-btn {
          color: white;
          font-size: 28rpx;
          padding: 12rpx 24rpx;
          border: 1rpx solid rgba(255, 255, 255, 0.3);
          border-radius: 30rpx;
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  // 快捷功能区
  .quick-actions {
    display: flex;
    background-color: white;
    border-radius: 20rpx 20rpx 0 0;
    margin: 0 20rpx 0;
    padding: 30rpx 0;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .action-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .action-icon {
        width: 60rpx;
        height: 60rpx;
        margin-bottom: 16rpx;
        border-radius: 50%;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32rpx;
          height: 32rpx;
          background-color: white;
          border-radius: 50%;
        }

        &.favorites-icon {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        &.footprint-icon {
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
        }

        &.wallet-icon {
          background: linear-gradient(135deg, #feca57, #ff9ff3);
        }

        &.coupon-icon {
          background: linear-gradient(135deg, #48dbfb, #0abde3);
        }
      }

      .action-text {
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  // 订单相关
  .order-section {
    background-color: white;
    border-radius: 0 0 20rpx 20rpx;
    margin: 0 20rpx 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;

      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .view-all {
        font-size: 26rpx;
        color: #666;
      }
    }

    .order-actions {
      display: flex;

      .order-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        .order-icon {
          width: 60rpx;
          height: 60rpx;
          margin-bottom: 16rpx;
          border-radius: 50%;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 32rpx;
            height: 32rpx;
            background-color: white;
            border-radius: 50%;
          }

          &.pending-icon {
            background: linear-gradient(135deg, #ff9a9e, #fecfef);
          }

          &.paid-icon {
            background: linear-gradient(135deg, #a8edea, #fed6e3);
          }

          &.completed-icon {
            background: linear-gradient(135deg, #96fbc4, #f9f586);
          }

          &.refund-icon {
            background: linear-gradient(135deg, #fad0c4, #ffd1ff);
          }
        }

        .order-text {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
  }

  // 服务菜单
  .service-menu {
    margin: 0 20rpx;

    .menu-group {
      background-color: white;
      border-radius: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

      &.logout-group {
        margin-top: 40rpx;
      }

      .menu-item {
        display: flex;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .menu-icon {
          width: 48rpx;
          height: 48rpx;
          margin-right: 24rpx;
          border-radius: 50%;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24rpx;
            height: 24rpx;
            background-color: white;
            border-radius: 50%;
          }

          &.service-icon {
            background: linear-gradient(135deg, #667eea, #764ba2);
          }

          &.settings-icon {
            background: linear-gradient(135deg, #ff9500, #ff5722);
          }

          &.feedback-icon {
            background: linear-gradient(135deg, #f093fb, #f5576c);
          }

          &.privacy-icon {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
          }

          &.about-icon {
            background: linear-gradient(135deg, #43e97b, #38f9d7);
          }

          &.logout-icon {
            background: linear-gradient(135deg, #fa709a, #fee140);
          }
        }

        .menu-text {
          flex: 1;
          font-size: 32rpx;
          color: #333;

          &.logout-text {
            color: #ff3b30;
          }
        }

        .menu-arrow {
          font-size: 32rpx;
          color: #ccc;
        }
      }
    }
  }
}
</style> 