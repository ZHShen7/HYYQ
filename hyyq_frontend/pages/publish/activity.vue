<template>
  <view class="activity-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">发布活动</text>
      <view class="nav-right">
        <button class="publish-btn" @click="handlePublish" :disabled="!canPublish">
          发布
        </button>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 活动标题 -->
      <view class="form-section">
        <text class="section-title">活动标题</text>
        <input class="title-input" v-model="title" placeholder="请输入活动标题" maxlength="50" />
        <text class="char-count">{{ title.length }}/50</text>
      </view>

      <!-- 活动描述 -->
      <view class="form-section">
        <text class="section-title">活动描述</text>
        <textarea class="content-input" v-model="content" placeholder="详细描述活动内容、规则和要求..." maxlength="1000"
          auto-height></textarea>
        <text class="char-count">{{ content.length }}/1000</text>
      </view>

      <!-- 活动类型 -->
      <view class="form-section">
        <text class="section-title">活动类型</text>
        <view class="activity-selector">
          <view class="activity-item" :class="{ active: selectedActivity === activity }" v-for="activity in activities"
            :key="activity" @click="selectActivity(activity)">
            <text class="activity-icon">{{ getActivityIcon(activity) }}</text>
            <text class="activity-text">{{ activity }}</text>
          </view>
        </view>
      </view>

      <!-- 活动时间 -->
      <view class="form-section">
        <text class="section-title">活动时间</text>
        <view class="time-range">
          <view class="time-item" @click="chooseStartTime">
            <text class="time-label">开始时间</text>
            <text class="time-value">{{ startTime || '选择开始时间' }}</text>
          </view>
          <view class="time-item" @click="chooseEndTime">
            <text class="time-label">结束时间</text>
            <text class="time-value">{{ endTime || '选择结束时间' }}</text>
          </view>
        </view>
      </view>

      <!-- 活动地点 -->
      <view class="form-section">
        <text class="section-title">活动地点</text>
        <view class="location-input" @click="chooseLocation">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ location || '选择活动地点' }}</text>
          <text class="location-arrow">></text>
        </view>
      </view>

      <!-- 参与人数 -->
      <view class="form-section">
        <text class="section-title">参与人数</text>
        <view class="people-range">
          <view class="people-input">
            <text class="people-label">最少：</text>
            <input class="people-number" v-model="minPeople" type="number" placeholder="1" />
            <text class="people-unit">人</text>
          </view>
          <view class="people-input">
            <text class="people-label">最多：</text>
            <input class="people-number" v-model="maxPeople" type="number" placeholder="不限" />
            <text class="people-unit">人</text>
          </view>
        </view>
      </view>

      <!-- 报名费用 -->
      <view class="form-section">
        <text class="section-title">报名费用</text>
        <view class="fee-input">
          <text class="fee-label">费用：</text>
          <input class="fee-number" v-model="fee" type="number" placeholder="0" />
          <text class="fee-unit">元</text>
          <text class="fee-note">（0表示免费）</text>
        </view>
      </view>

      <!-- 报名截止时间 -->
      <view class="form-section">
        <text class="section-title">报名截止时间</text>
        <view class="deadline-input" @click="chooseDeadline">
          <text class="deadline-icon">⏰</text>
          <text class="deadline-text">{{ deadline || '选择报名截止时间' }}</text>
          <text class="deadline-arrow">></text>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="form-section">
        <text class="section-title">联系方式</text>
        <input class="contact-input" v-model="contact" placeholder="微信号或手机号" />
      </view>

      <!-- 图片上传 -->
      <view class="form-section">
        <text class="section-title">活动图片</text>
        <view class="image-uploader">
          <view class="upload-item" v-for="(image, index) in images" :key="index">
            <image :src="image" mode="aspectFill" class="uploaded-image"></image>
            <view class="delete-btn" @click="deleteImage(index)">×</view>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="images.length < 9">
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
const title = ref('')
const content = ref('')
const selectedActivity = ref('')
const startTime = ref('')
const endTime = ref('')
const location = ref('')
const minPeople = ref('')
const maxPeople = ref('')
const fee = ref('')
const deadline = ref('')
const contact = ref('')
const images = ref([])

// 选项数据
const activities = ['足球比赛', '篮球比赛', '羽毛球比赛', '网球比赛', '跑步活动', '健身活动', '其他活动']

// 计算属性
const canPublish = computed(() => {
  return title.value.trim().length > 0 &&
    content.value.trim().length > 0 &&
    selectedActivity.value &&
    startTime.value &&
    endTime.value &&
    location.value
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 选择活动类型
const selectActivity = (activity) => {
  selectedActivity.value = activity
}

// 获取活动图标
const getActivityIcon = (activity) => {
  const icons = {
    '足球比赛': '⚽',
    '篮球比赛': '🏀',
    '羽毛球比赛': '🏸',
    '网球比赛': '🎾',
    '跑步活动': '🏃',
    '健身活动': '💪',
    '其他活动': '🎯'
  }
  return icons[activity] || '🎯'
}

// 选择开始时间
const chooseStartTime = () => {
  uni.showDatePickerView({
    mode: 'datetime',
    success: (res) => {
      const date = new Date(res.value)
      startTime.value = date.toLocaleString('zh-CN')
    }
  })
}

// 选择结束时间
const chooseEndTime = () => {
  uni.showDatePickerView({
    mode: 'datetime',
    success: (res) => {
      const date = new Date(res.value)
      endTime.value = date.toLocaleString('zh-CN')
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

// 选择截止时间
const chooseDeadline = () => {
  uni.showDatePickerView({
    mode: 'datetime',
    success: (res) => {
      const date = new Date(res.value)
      deadline.value = date.toLocaleString('zh-CN')
    }
  })
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
    title.value = ''
    content.value = ''
    selectedActivity.value = ''
    startTime.value = ''
    endTime.value = ''
    location.value = ''
    minPeople.value = ''
    maxPeople.value = ''
    fee.value = ''
    deadline.value = ''
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

</script>

<style scoped>
.activity-container {
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

.title-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.char-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 20rpx;
  display: block;
}

.activity-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.activity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
  min-width: 120rpx;
  transition: all 0.3s ease;
}

.activity-item.active {
  border-color: #007aff;
  background-color: #f0f8ff;
}

.activity-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.activity-text {
  font-size: 24rpx;
  color: #333;
}

.time-range {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
}

.time-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.time-value {
  font-size: 28rpx;
  color: #666;
}

.location-input,
.deadline-input {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
}

.location-icon,
.deadline-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.location-text,
.deadline-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.location-arrow,
.deadline-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.people-range {
  display: flex;
  gap: 40rpx;
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

.fee-input {
  display: flex;
  align-items: center;
}

.fee-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.fee-number {
  width: 120rpx;
  height: 60rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
  margin-right: 10rpx;
}

.fee-unit {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.fee-note {
  font-size: 24rpx;
  color: #999;
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