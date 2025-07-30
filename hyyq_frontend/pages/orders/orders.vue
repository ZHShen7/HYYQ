<template>
  <view class="match-container">
    <!-- 未登录状态提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="prompt-content">
        <text class="prompt-text">请先登录查看约球信息</text>
        <button class="login-btn" @click="goToLogin">立即登录</button>
      </view>
    </view>
    
    <!-- 已登录状态内容 -->
    <view v-else class="match-content">
      <!-- 顶部导航标签 -->
      <view class="tab-nav">
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
        >
          <text class="tab-text">全部约球</text>
        </view>
        <view 
          class="tab-item"
          :class="{ active: activeTab === 'my' }"
          @click="switchTab('my')"
        >
          <text class="tab-text">我的约球</text>
        </view>
      </view>
      
      <!-- 筛选器 -->
      <view class="filter-section">
        <scroll-view class="sport-filter" scroll-x>
          <view 
            class="filter-item"
            :class="{ active: selectedSport === '' }"
            @click="selectSport('')"
          >
            <text class="filter-text">全部</text>
          </view>
          <view 
            class="filter-item"
            :class="{ active: selectedSport === sport }"
            v-for="sport in sports"
            :key="sport"
            @click="selectSport(sport)"
          >
            <text class="filter-icon">{{ getSportIcon(sport) }}</text>
            <text class="filter-text">{{ sport }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 约球列表 -->
      <view class="match-list">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 空状态 -->
        <view v-else-if="filteredMatches.length === 0" class="empty-state">
          <text class="empty-icon">🏀</text>
          <text class="empty-text">{{ activeTab === 'my' ? '还没有发布约球' : '暂无约球信息' }}</text>
          <button v-if="activeTab === 'my'" class="publish-btn" @click="goToPublish">
            发布约球
          </button>
        </view>
        
        <!-- 约球卡片列表 -->
        <view v-else>
          <view 
            class="match-card"
            v-for="match in filteredMatches"
            :key="match.id"
          >
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="user-info">
                <image class="avatar" :src="match.userAvatar || '/static/logo.png'" />
                <text class="username">{{ match.userName }}</text>
              </view>
              <view class="sport-badge">
                <text class="sport-icon">{{ getSportIcon(match.sport) }}</text>
                <text class="sport-name">{{ match.sport }}</text>
              </view>
            </view>
            
            <!-- 约球内容 -->
            <view class="card-content">
              <text class="match-content">{{ match.content }}</text>
            </view>
            
            <!-- 约球信息 -->
            <view class="match-info">
              <view class="info-item">
                <text class="info-icon">🕐</text>
                <text class="info-text">{{ match.matchTime }}</text>
              </view>
              <view class="info-item">
                <text class="info-icon">📍</text>
                <text class="info-text">{{ match.location }}</text>
              </view>
              <view class="info-item">
                <text class="info-icon">👥</text>
                <text class="info-text">{{ match.currentPeople }}/{{ match.needPeople }}人</text>
              </view>
              <view class="info-item" v-if="match.level">
                <text class="info-icon">⭐</text>
                <text class="info-text">{{ match.level }}</text>
              </view>
            </view>
            
            <!-- 图片展示 -->
            <view v-if="match.images && match.images.length > 0" class="match-images">
              <image 
                v-for="(image, index) in match.images.slice(0, 3)"
                :key="index"
                :src="image"
                class="match-image"
                mode="aspectFill"
                @click="previewImage(match.images, index)"
              />
              <view v-if="match.images.length > 3" class="more-images">
                <text class="more-text">+{{ match.images.length - 3 }}</text>
              </view>
            </view>
            
            <!-- 卡片底部操作 -->
            <view class="card-footer">
              <text class="publish-time">{{ formatTime(match.publishTime) }}</text>
              
              <!-- 我的约球操作 -->
              <view v-if="activeTab === 'my'" class="my-actions">
                <button 
                  class="action-btn edit-btn"
                  @click="editMatch(match)"
                >
                  编辑
                </button>
                <button 
                  class="action-btn delete-btn"
                  @click="confirmDelete(match)"
                >
                  删除
                </button>
                <button 
                  class="action-btn status-btn"
                  :class="{ completed: match.status === 'completed' }"
                  @click="toggleMatchStatus(match)"
                >
                  {{ match.status === 'completed' ? '已完成' : '标记完成' }}
                </button>
              </view>
              
              <!-- 其他人约球操作 -->
              <view v-else class="other-actions">
                <button 
                  class="action-btn contact-btn"
                  @click="contactUser(match)"
                >
                  联系TA
                </button>
                <button 
                  class="action-btn join-btn"
                  :class="{ joined: match.isJoined }"
                  @click="toggleJoin(match)"
                  :disabled="match.currentPeople >= match.needPeople && !match.isJoined"
                >
                  {{ match.isJoined ? '已参加' : (match.currentPeople >= match.needPeople ? '已满员' : '参加') }}
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/utils/auth.js'
import { getMatches, getMyMatches, deleteMatch, updateMatchStatus, joinMatch, leaveMatch } from '@/api/match.js'

const { isLoggedIn } = useAuth()

// 响应式数据
const activeTab = ref('all')
const selectedSport = ref('')
const loading = ref(false)
const allMatches = ref([])
const myMatches = ref([])

// 运动类型列表
const sports = ['足球', '篮球', '羽毛球', '网球', '乒乓球', '排球', '其他']

// 计算属性：当前显示的约球列表
const currentMatches = computed(() => {
  return activeTab.value === 'all' ? allMatches.value : myMatches.value
})

// 计算属性：筛选后的约球列表
const filteredMatches = computed(() => {
  if (!selectedSport.value) {
    return currentMatches.value
  }
  return currentMatches.value.filter(match => match.sport === selectedSport.value)
})

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab
  selectedSport.value = '' // 切换标签时重置筛选
  loadMatches()
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

// 加载约球数据
const loadMatches = async () => {
  if (!isLoggedIn.value) return
  
  loading.value = true
  try {
    if (activeTab.value === 'all') {
      const params = selectedSport.value ? { sport: selectedSport.value } : {}
      const response = await getMatches(params)
      if (response.code === 200) {
        allMatches.value = response.data || []
        // 为每个约球项添加isJoined状态
        const token = uni.getStorageSync('token')
        const userId = token ? token.split('_')[1] : null
        allMatches.value = allMatches.value.map(match => ({
          ...match,
          isJoined: match.participants.some(p => p.userId === userId)
        }))
      } else {
        throw new Error(response.msg || '获取数据失败')
      }
    } else {
      const response = await getMyMatches()
      if (response.code === 200) {
        myMatches.value = response.data || []
      } else {
        throw new Error(response.msg || '获取数据失败')
      }
    }
  } catch (error) {
    console.error('加载约球数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    
    // 模拟数据（开发阶段使用）
    if (activeTab.value === 'all') {
      allMatches.value = mockAllMatches
    } else {
      myMatches.value = mockMyMatches
    }
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return date.toLocaleDateString()
}

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current: current
  })
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}

// 跳转到发布页
const goToPublish = () => {
  uni.navigateTo({
    url: '/pages/publish/match'
  })
}

// 编辑约球
const editMatch = (match) => {
  uni.navigateTo({
    url: `/pages/publish/match?id=${match.id}`
  })
}

// 确认删除约球
const confirmDelete = (match) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个约球吗？',
    success: async (res) => {
      if (res.confirm) {
        await handleDeleteMatch(match.id)
      }
    }
  })
}

// 删除约球
const handleDeleteMatch = async (matchId) => {
  try {
    await deleteMatch(matchId)
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
    loadMatches()
  } catch (error) {
    console.error('删除约球失败:', error)
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    })
  }
}

// 切换约球状态
const toggleMatchStatus = async (match) => {
  const newStatus = match.status === 'completed' ? 'active' : 'completed'
  try {
    await updateMatchStatus(match.id, newStatus)
    match.status = newStatus
    uni.showToast({
      title: newStatus === 'completed' ? '已标记完成' : '已重新激活',
      icon: 'success'
    })
  } catch (error) {
    console.error('更新状态失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 联系用户
const contactUser = (match) => {
  if (match.contact) {
    uni.showModal({
      title: '联系方式',
      content: match.contact,
      showCancel: false
    })
  } else {
    uni.showToast({
      title: '暂无联系方式',
      icon: 'none'
    })
  }
}

// 切换参加状态
const toggleJoin = async (match) => {
  try {
    if (match.isJoined) {
      await leaveMatch(match.id)
      match.isJoined = false
      match.currentPeople--
      uni.showToast({
        title: '已退出约球',
        icon: 'success'
      })
    } else {
      await joinMatch(match.id)
      match.isJoined = true
      match.currentPeople++
      uni.showToast({
        title: '参加成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('操作失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}

// 监听登录状态变化
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    loadMatches()
  }
})

onMounted(() => {
  console.log('约球页面加载')
  if (isLoggedIn.value) {
    loadMatches()
  }
})
</script>

<style scoped>
.match-container {
  min-height: calc(100vh - 120rpx);
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  padding: 40rpx;
}

.prompt-content {
  text-align: center;
}

.prompt-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 40rpx;
  display: block;
}

.login-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}

.match-content {
  padding: 20rpx;
}

.tab-nav {
  display: flex;
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  position: relative;
}

.tab-item.active {
  background-color: #007aff;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: white;
  font-weight: bold;
}

.filter-section {
  margin-bottom: 20rpx;
}

.sport-filter {
  white-space: nowrap;
  background-color: white;
  width: calc(100% - 40rpx);
  border-radius: 20rpx;
  padding: 20rpx;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 24rpx;
  margin-right: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 50rpx;
  transition: all 0.3s ease;
}

.filter-item.active {
  border-color: #007aff;
  background-color: #007aff;
}

.filter-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.filter-text {
  font-size: 24rpx;
  color: #333;
}

.filter-item.active .filter-text {
  color: white;
}

.match-list {
  min-height: 400rpx;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  background-color: white;
  border-radius: 20rpx;
}

.loading-text,
.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.publish-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.match-card {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.username {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.sport-badge {
  display: flex;
  align-items: center;
  background-color: #f0f8ff;
  padding: 12rpx 20rpx;
  border-radius: 50rpx;
  border: 2rpx solid #007aff;
}

.sport-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.sport-name {
  font-size: 24rpx;
  color: #007aff;
  font-weight: bold;
}

.card-content {
  margin-bottom: 20rpx;
}

.match-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.match-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
}

.info-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
}

.match-images {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.match-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
}

.more-images {
  width: 150rpx;
  height: 150rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
}

.more-text {
  color: white;
  font-size: 24rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.publish-time {
  font-size: 24rpx;
  color: #999;
}

.my-actions,
.other-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 50rpx;
  font-size: 24rpx;
  border: none;
}

.edit-btn {
  background-color: #f0f8ff;
  color: #007aff;
}

.delete-btn {
  background-color: #ffebee;
  color: #f44336;
}

.status-btn {
  background-color: #f0f8ff;
  color: #007aff;
}

.status-btn.completed {
  background-color: #e8f5e8;
  color: #4caf50;
}

.contact-btn {
  background-color: #fff3e0;
  color: #ff9800;
}

.join-btn {
  background-color: #e8f5e8;
  color: #4caf50;
}

.join-btn.joined {
  background-color: #f0f8ff;
  color: #007aff;
}

.join-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
}
</style> 