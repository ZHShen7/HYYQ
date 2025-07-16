<template>
  <view class="wechat-login-wrapper">
    <button
      v-if="showWechatLogin"
      :class="['wechat-login-btn', buttonClass]"
      :disabled="disabled || loading"
      @click="handleWechatLogin"
    >
      <view v-if="loading" class="loading-icon">
        <view class="spinner"></view>
      </view>
      <view v-else class="wechat-icon">
        <text class="icon-text">微信</text>
      </view>
      <text class="btn-text">{{ loading ? loadingText : text }}</text>
    </button>
  </view>
</template>

<script>
import { supportWechatLogin, isWechatMiniProgram } from '@/utils/platform.js'

export default {
  name: 'WechatLoginButton',
  props: {
    text: {
      type: String,
      default: '微信一键登录'
    },
    loadingText: {
      type: String,
      default: '登录中...'
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'normal', // small, normal, large
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    }
  },
  data() {
    return {
      showWechatLogin: false
    }
  },
  computed: {
    buttonClass() {
      return [
        `btn-${this.size}`,
        {
          'btn-loading': this.loading,
          'btn-disabled': this.disabled
        }
      ]
    }
  },
  mounted() {
    this.checkWechatLoginSupport()
  },
  methods: {
    // 检查是否支持微信登录
    checkWechatLoginSupport() {
      this.showWechatLogin = supportWechatLogin()
    },

    // 处理微信登录
    handleWechatLogin() {
      if (!this.loading && !this.disabled) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped>
.wechat-login-wrapper {
  margin-top: 20rpx;
}

.wechat-login-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 12rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  background: #07c160;
  color: #fff;
}

.wechat-login-btn:active {
  background: #06ad56;
  transform: scale(0.98);
}

.btn-small {
  height: 64rpx;
  font-size: 28rpx;
}

.btn-large {
  height: 104rpx;
  font-size: 36rpx;
}

.btn-loading {
  opacity: 0.8;
}

.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.loading-icon {
  margin-right: 16rpx;
}

.spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top: 3rpx solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.wechat-icon {
  margin-right: 16rpx;
  display: flex;
  align-items: center;
}

.icon-text {
  font-size: 24rpx;
  font-weight: bold;
}

.btn-text {
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 