<template>
  <view class="submit-button-wrapper">
    <button
      :class="['submit-button', buttonClass]"
      :disabled="disabled || loading"
      @click="handleClick"
    >
      <view v-if="loading" class="loading-icon">
        <view class="spinner"></view>
      </view>
      <text>{{ loading ? loadingText : text }}</text>
    </button>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// Props 定义
const props = defineProps({
  text: {
    type: String,
    default: '提交'
  },
  loadingText: {
    type: String,
    default: '提交中...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'primary', // primary, secondary, danger
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'normal', // small, normal, large
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  }
})

// Emits 定义
const emit = defineEmits(['click'])

// 计算属性
const buttonClass = computed(() => {
  return [
    `button-${props.type}`,
    `button-${props.size}`,
    {
      'button-loading': props.loading,
      'button-disabled': props.disabled
    }
  ]
})

// 方法
const handleClick = () => {
  if (!props.loading && !props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.submit-button-wrapper {
  margin-top: 40rpx;
}

.submit-button {
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
}

.button-primary {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: #fff;
}

.button-primary:active {
  background: linear-gradient(135deg, #0056cc, #003d99);
}

.button-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 2rpx solid #e5e5e5;
}

.button-secondary:active {
  background-color: #e5e5e5;
}

.button-danger {
  background: linear-gradient(135deg, #ff3b30, #cc2e26);
  color: #fff;
}

.button-danger:active {
  background: linear-gradient(135deg, #cc2e26, #99221c);
}

.button-small {
  height: 64rpx;
  font-size: 28rpx;
}

.button-large {
  height: 104rpx;
  font-size: 36rpx;
}

.button-loading {
  opacity: 0.8;
}

.button-disabled {
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 