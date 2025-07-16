<template>
  <view class="form-input">
    <view class="input-label" v-if="label">{{ label }}</view>
    <view class="input-wrapper" :class="{ 'input-error': hasError }">
      <input
        v-if="type !== 'textarea'"
        :type="inputType"
        :placeholder="placeholder"
        :value="value"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="input-field"
      />
      <textarea
        v-else
        :placeholder="placeholder"
        :value="value"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="textarea-field"
        :auto-height="autoHeight"
      />
      <view class="input-suffix" v-if="suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </view>
    </view>
    <view class="error-message" v-if="errorMessage">{{ errorMessage }}</view>
  </view>
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    value: {
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
      type: String,
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
  },
  computed: {
    inputType() {
      if (this.type === 'password') {
        return 'password'
      }
      if (this.type === 'number') {
        return 'number'
      }
      if (this.type === 'email') {
        return 'text'
      }
      return 'text'
    },
    hasError() {
      return !!this.errorMessage
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('input', e.detail.value)
    },
    handleFocus(e) {
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.$emit('blur', e)
    }
  }
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
  position: relative;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  background-color: #fff;
  transition: all 0.3s ease;
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
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  box-sizing: border-box;
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
}
</style> 