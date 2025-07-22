<template>
  <view class="match-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">发布约球</text>
      <view class="nav-right">
        <button class="publish-btn" @click="handlePublish" :disabled="!canPublish">
          发布
        </button>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 内容描述 -->
      <view class="form-section">
        <textarea 
          class="content-input" 
          v-model="content"
          placeholder="描述一下你想约球的情况..."
          maxlength="500"
          auto-height
        ></textarea>
        <text class="char-count">{{ content.length }}/500</text>
      </view>
      
      <!-- 运动类型 -->
      <view class="form-section">
        <text class="section-title">运动类型</text>
        <view class="sport-selector">
          <view 
            class="sport-item" 
            :class="{ active: selectedSport === sport }"
            v-for="sport in sports"
            :key="sport"
            @click="selectSport(sport)"
          >
            <text class="sport-icon">{{ getSportIcon(sport) }}</text>
            <text class="sport-text">{{ sport }}</text>
          </view>
        </view>
      </view>
      
      <!-- 约球时间 -->
      <view class="form-section">
        <text class="section-title">约球时间</text>
        <view class="time-input" @click="chooseTime">
          <text class="time-icon">🕐</text>
          <text class="time-text">{{ matchTime || '选择约球时间' }}</text>
          <text class="time-arrow">></text>
        </view>
      </view>
      
      <!-- 约球地点 -->
      <view class="form-section">
        <text class="section-title">约球地点</text>
        <view class="location-input" @click="chooseLocation">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ location || '选择约球地点' }}</text>
          <text class="location-arrow">></text>
        </view>
      </view>
      
      <!-- 人数需求 -->
      <view class="form-section">
        <text class="section-title">人数需求</text>
        <view class="people-selector">
          <view class="people-input">
            <text class="people-label">需要人数：</text>
            <input 
              class="people-number" 
              v-model="needPeople" 
              type="number" 
              placeholder="1"
            />
            <text class="people-unit">人</text>
          </view>
        </view>
      </view>
      
      <!-- 技能水平 -->
      <view class="form-section">
        <text class="section-title">技能水平要求</text>
        <view class="level-selector">
          <view 
            class="level-item" 
            :class="{ active: selectedLevel === level }"
            v-for="level in levels"
            :key="level"
            @click="selectLevel(level)"
          >
            <text class="level-text">{{ level }}</text>
          </view>
        </view>
      </view>
      
      <!-- 联系方式 -->
      <view class="form-section">
        <text class="section-title">联系方式</text>
        <input 
          class="contact-input" 
          v-model="contact"
          placeholder="微信号或手机号"
        />
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
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'

const { isLoggedIn } = useAuth()

// 响应式数据
const content = ref('')
const selectedSport = ref('')
const matchTime = ref('')
const location = ref('')
const needPeople = ref('')
const selectedLevel = ref('')
const contact = ref('')
const images = ref([])

// 选项数据
const sports = ['足球', '篮球', '羽毛球', '网球', '乒乓球', '排球', '其他']
const levels = ['新手', '入门', '进阶', '高手', '不限']

// 计算属性
const canPublish = computed(() => {
  return content.value.trim().length > 0 && selectedSport.value && matchTime.value && location.value
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 选择运动类型
const selectSport = (sport) => {
  selectedSport.value = sport
}

// 获取运动图标
const getSportIcon = (sport) => {
  const icons = {
    '足球': '⚽',
    '篮球': '🏀',
    '羽毛球': '🏸',
    '网球': '🎾',
    '乒乓球': '🏓',
    '排球': '🏐',
    '其他': '🎯'
  }
  return icons[sport] || '🎯'
}

// 选择时间
const chooseTime = () => {
  uni.showDatePickerView({
    mode: 'datetime',
    success: (res) => {
      const date = new Date(res.value)
      matchTime.value = date.toLocaleString('zh-CN')
    }
  })
}

// 选择位置
const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name
    }
  })
}

// 选择技能水平
const selectLevel = (level) => {
  selectedLevel.value = level
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

// 发布内容
const handlePublish = () => {
  if (!canPublish.value) {
    uni.showToast({
      title: '请填写完整信息',
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
    selectedSport.value = ''
    matchTime.value = ''
    location.value = ''
    needPeople.value = ''
    selectedLevel.value = ''
    contact.value = ''
    images.value = []
    
    // 返回首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/home/index'
      })
    }, 1500)
  }, 2000)
}

onMounted(() => {
  console.log('发布约球页面加载')
})
</script>

<style scoped>
.match-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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

.sport-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.sport-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
  min-width: 120rpx;
  transition: all 0.3s ease;
}

.sport-item.active {
  border-color: #007aff;
  background-color: #f0f8ff;
}

.sport-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.sport-text {
  font-size: 24rpx;
  color: #333;
}

.time-input,
.location-input {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
}

.time-icon,
.location-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.time-text,
.location-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.time-arrow,
.location-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.people-selector {
  display: flex;
  align-items: center;
}

.people-input {
  display: flex;
  align-items: center;
  flex: 1;
}

.people-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.people-number {
  width: 100rpx;
  height: 60rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.people-unit {
  font-size: 28rpx;
  color: #333;
}

.level-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.level-item {
  padding: 20rpx 30rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 50rpx;
  transition: all 0.3s ease;
}

.level-item.active {
  border-color: #007aff;
  background-color: #007aff;
}

.level-text {
  font-size: 28rpx;
  color: #333;
}

.level-item.active .level-text {
  color: white;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
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
</style> 