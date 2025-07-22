<template>
  <view class="settings-container">
    <!-- 设置列表 -->
    <view class="settings-content">
      <!-- 账户设置 -->
      <view class="settings-section">
        <text class="section-title">账户设置</text>
        <view class="settings-group">
          <view class="setting-item" @click="handleSettingClick('bindPhone')">
            <view class="item-left">
              <text class="item-icon">📱</text>
              <text class="item-title">绑定手机</text>
            </view>
            <view class="item-right">
              <text class="item-value">{{ phoneDisplay }}</text>
              <text class="item-arrow">></text>
            </view>
          </view>
          
          <view class="setting-item" @click="handleSettingClick('addressManage')">
            <view class="item-left">
              <text class="item-icon">📍</text>
              <text class="item-title">地址管理</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 隐私设置 -->
      <view class="settings-section">
        <text class="section-title">隐私设置</text>
        <view class="settings-group">
          <view class="setting-item" @click="handleSettingClick('privacyManage')">
            <view class="item-left">
              <text class="item-icon">🔒</text>
              <text class="item-title">隐私管理</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 法律条款 -->
      <view class="settings-section">
        <text class="section-title">法律条款</text>
        <view class="settings-group">
          <view class="setting-item" @click="handleSettingClick('userPrivacy')">
            <view class="item-left">
              <text class="item-icon">📋</text>
              <text class="item-title">用户隐私</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">></text>
            </view>
          </view>
          
          <view class="setting-item" @click="handleSettingClick('userAgreement')">
            <view class="item-left">
              <text class="item-icon">📄</text>
              <text class="item-title">用户协议</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="settings-section">
        <text class="section-title">关于</text>
        <view class="settings-group">
          <view class="setting-item" @click="handleSettingClick('about')">
            <view class="item-left">
              <text class="item-icon">ℹ️</text>
              <text class="item-title">关于约约球球</text>
            </view>
            <view class="item-right">
              <text class="item-value">v1.0.0</text>
              <text class="item-arrow">></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 账号操作 -->
      <view class="settings-section">
        <view class="settings-group">
          <view class="setting-item danger-item" @click="handleLogout">
            <view class="item-left">
              <text class="item-icon">🚪</text>
              <text class="item-title danger-text">账号注销</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'
import { getPlatform } from '@/utils/platform.js'

const { userInfo, logout } = useAuth()

// 手机号显示
const phoneDisplay = computed(() => {
  if (userInfo.value?.phone) {
    return userInfo.value.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return '未绑定'
})

// 处理设置项点击
const handleSettingClick = (type) => {
  switch (type) {
    case 'bindPhone':
      uni.showToast({
        title: '绑定手机功能开发中',
        icon: 'none'
      })
      break
    case 'addressManage':
      uni.showToast({
        title: '地址管理功能开发中',
        icon: 'none'
      })
      break
    case 'privacyManage':
      uni.showToast({
        title: '隐私管理功能开发中',
        icon: 'none'
      })
      break
    case 'userPrivacy':
      // 可以跳转到隐私政策页面或显示弹窗
      uni.showModal({
        title: '用户隐私政策',
        content: '我们非常重视您的隐私保护，具体隐私政策请查看详细条款。',
        confirmText: '查看详情',
        success: (res) => {
          if (res.confirm) {
            // 可以跳转到详细隐私政策页面
            uni.showToast({
              title: '隐私政策页面开发中',
              icon: 'none'
            })
          }
        }
      })
      break
    case 'userAgreement':
      // 可以跳转到用户协议页面或显示弹窗
      uni.showModal({
        title: '用户协议',
        content: '使用约约球球即表示您同意我们的用户协议，具体条款请查看详细内容。',
        confirmText: '查看详情',
        success: (res) => {
          if (res.confirm) {
            // 可以跳转到详细用户协议页面
            uni.showToast({
              title: '用户协议页面开发中',
              icon: 'none'
            })
          }
        }
      })
      break
    case 'about':
      uni.showModal({
        title: '关于约约球球',
        content: '约约球球是一个专业的球类运动社交平台，让运动爱好者能够轻松找到球友，组织活动。\n\n版本：v1.0.0\n平台：' + getPlatform(),
        confirmText: '确定',
        showCancel: false
      })
      break
  }
}

// 账号注销
const handleLogout = () => {
  uni.showModal({
    title: '账号注销',
    content: '注销账号后，您的所有数据将被清除且无法恢复。确定要注销账号吗？',
    confirmText: '确定注销',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        // 二次确认
        uni.showModal({
          title: '最后确认',
          content: '账号注销后无法恢复，请再次确认是否要注销账号？',
          confirmText: '确定注销',
          confirmColor: '#ff3b30',
          success: (res) => {
            if (res.confirm) {
              // 执行注销逻辑
              logout()
              uni.showToast({
                title: '账号已注销',
                icon: 'success'
              })
              // 返回到登录页面
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/auth/login'
                })
              }, 1500)
            }
          }
        })
      }
    }
  })
}

onMounted(() => {
  console.log('设置页面加载，当前平台：', getPlatform())
})
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.settings-content {
  padding: 20rpx;
}

.settings-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 30rpx 10rpx 30rpx;
  display: block;
}

.settings-group {
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger-item {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
}

.item-title {
  font-size: 32rpx;
  color: #333;
}

.item-title.danger-text {
  color: #ff3b30;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: 28rpx;
  color: #999;
  margin-right: 10rpx;
}

.item-arrow {
  font-size: 28rpx;
  color: #ccc;
}

/* 点击效果 */
.setting-item:active {
  background-color: #f8f8f8;
}

/* 平台兼容性调整 */
/* #ifdef MP-WEIXIN */
.settings-container {
  padding-top: 20rpx;
}
/* #endif */

/* #ifdef APP-PLUS */
.settings-container {
  padding-top: 20rpx;
}
/* #endif */

/* #ifdef H5 */
.settings-container {
  padding-top: 20rpx;
}
/* #endif */
</style> 