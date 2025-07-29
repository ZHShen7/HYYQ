<template>
  <view class="post-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">发布动态</text>
      <view class="nav-right">
        <button class="publish-btn" @click="handlePublish" :disabled="!canPublish">
          发布
        </button>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 内容输入 -->
      <view class="form-section">
        <textarea 
          class="content-input" 
          v-model="content"
          placeholder="分享你的运动心得和生活点滴..."
          maxlength="500"
          auto-height
        ></textarea>
        <text class="char-count">{{ content.length }}/500</text>
      </view>
      
      <!-- 图片上传 -->
      <view class="form-section">
        <text class="section-title">添加图片</text>
        <view class="image-uploader">
          <view 
            class="upload-item" 
            v-for="(image, index) in images" 
            :key="index"
          >
            <image :src="image" mode="aspectFill" class="uploaded-image"></image>
            <view class="delete-btn" @click="deleteImage(index)">×</view>
          </view>
          <view 
            class="upload-btn" 
            @click="chooseImage" 
            v-if="images.length < 9"
          >
            <text class="upload-icon">+</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>
      
      <!-- 位置信息 -->
      <view class="form-section">
        <text class="section-title">位置信息</text>
        <view class="location-input" @click="chooseLocation">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ location || '添加位置信息' }}</text>
          <text class="location-arrow">></text>
        </view>
      </view>
      
      <!-- 话题标签 -->
      <view class="form-section">
        <text class="section-title">添加话题</text>
        <view class="topic-input" @click="chooseTopic">
          <text class="topic-icon">#</text>
          <text class="topic-text">{{ selectedTopic || '添加话题标签' }}</text>
          <text class="topic-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'

const { isLoggedIn } = useAuth()

// 响应式数据
const content = ref('')
const images = ref([])
const location = ref('')
const selectedTopic = ref('')

// 计算属性
const canPublish = computed(() => {
  return content.value.trim().length > 0
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

// 删除图片
const deleteImage = (index) => {
  images.value.splice(index, 1)
}

// 选择位置
const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name
    }
  })
}

// 选择话题
const chooseTopic = () => {
  // 这里可以弹出一个话题选择器
  const topics = ['运动健身', '足球', '篮球', '羽毛球', '网球', '跑步', '游泳']
  uni.showActionSheet({
    itemList: topics,
    success: (res) => {
      selectedTopic.value = topics[res.tapIndex]
    }
  })
}

// 发布内容
const handlePublish = () => {
  if (!canPublish.value) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({
    title: '发布中...'
  })
  
  // 模拟发布过程
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })
    
    // 清空表单
    content.value = ''
    images.value = []
    location.value = ''
    selectedTopic.value = ''
    
    // 返回首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/home/index'
      })
    }, 1500)
  }, 2000)
}

onMounted(() => {
  console.log('发布动态页面加载')
})
</script>

<style scoped>
.post-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #e5e5e5;
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
  margin-right: 10rpx;
}

.back-text {
  font-size: 28rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  display: flex;
  align-items: center;
}

.publish-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
}

.publish-btn:disabled {
  background-color: #ccc;
}

.content-area {
  margin-top: 88rpx;
  padding: 20rpx;
}

.form-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  border: none;
  font-size: 28rpx;
  line-height: 1.6;
  padding: 0;
}

.char-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 20rpx;
  display: block;
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  color: #ccc;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.location-input,
.topic-input {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
}

.location-icon,
.topic-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.location-text,
.topic-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.location-arrow,
.topic-arrow {
  font-size: 28rpx;
  color: #ccc;
}
</style> 