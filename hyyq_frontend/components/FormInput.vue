<template>
  <view class="form-input">
    <view class="input-label" v-if="label">{{ label }}</view>
    <view class="input-wrapper" :class="{ 'input-error': hasError }">
      <input
        v-if="type !== 'textarea'"
        :type="inputType"
        :password="isPasswordType"
        :placeholder="placeholder"
        :value="modelValue"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="input-field"
        :class="{ 'has-suffix': suffix }"
        :style="{ pointerEvents: 'auto' }"
      />
      <textarea
        v-else
        :placeholder="placeholder"
        :value="modelValue"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="textarea-field"
        :auto-height="autoHeight"
        :style="{ pointerEvents: 'auto' }"
      />
      <view class="input-suffix" v-if="suffix">
        <slot name="suffix"></slot>
      </view>
    </view>
    <view class="error-message" v-if="errorMessage">{{ errorMessage }}</view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// Props 定义
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  maxlength: {
    type: Number,
    default: -1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  suffix: {
    type: Boolean,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  autoHeight: {
    type: Boolean,
    default: false
  }
})

// Emits 定义
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// 计算属性
const inputType = computed(() => {
  // 在微信小程序中，密码输入框使用password属性而不是type
  if (props.type === 'password') {
    return 'text'  // 微信小程序中密码输入框的type应该是text
  }
  if (props.type === 'number') {
    return 'number'
  }
  if (props.type === 'email') {
    return 'text'
  }
  return 'text'
})

// 判断是否为密码类型
const isPasswordType = computed(() => {
  return props.type === 'password'
})

const hasError = computed(() => {
  return !!props.errorMessage
})

// 方法
const handleInput = (e) => {
  // H5 端使用 e.target.value，小程序端使用 e.detail.value
  const value = e.detail.value
  emit('update:modelValue', value)
}

const handleFocus = (e) => {
  emit('focus', e)
}

const handleBlur = (e) => {
  emit('blur', e)
}
</script>

<style scoped>
.form-input {
  margin-bottom: 20rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.input-wrapper {
  height: 80rpx;
  position: relative;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  background-color: #fff;
  transition: all 0.3s ease;
  /* 确保输入框可以正常点击 */
  pointer-events: auto;
}

.input-wrapper:focus-within {
  border-color: #007aff;
  box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.1);
}

.input-error {
  border-color: #ff3b30;
}

.input-field,
.textarea-field {
  width: 100%;
  height: 100%;
  font-size: 28rpx;
  padding-left: 24rpx;
  padding-right: 24rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  box-sizing: border-box;
}

/* 有后缀时增加右边距，为按钮留空间 */
.input-field.has-suffix {
  padding-right: 140rpx;
}

.textarea-field {
  min-height: 120rpx;
  resize: none;
}

.input-suffix {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #999;
  /* 允许后缀内容接收点击事件 */
  pointer-events: auto;
  z-index: 2;
}

.error-message {
  font-size: 24rpx;
  color: #ff3b30;
  margin-top: 8rpx;
  padding-left: 8rpx;
}

.input-field:disabled,
.textarea-field:disabled {
  background-color: #f5f5f5;
  color: #999;
  pointer-events: none;
}

</style> 