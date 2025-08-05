<template>
  <view class="club-container">
    <!-- 未登录状态提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="prompt-content">
        <text class="prompt-text">请先登录查看俱乐部</text>
        <SubmitButton
          text="立即登录"
          type="primary"
          size="normal"
          @click="goToLogin"
        />
      </view>
    </view>
    
    <!-- 已登录状态内容 -->
    <view v-else class="club-content">
      <!-- 页面头部 -->
      <view class="club-header">
        <text class="header-title">俱乐部</text>
        <view class="header-actions">
          <SubmitButton
            text="创建俱乐部"
            type="primary"
            size="small"
            @click="showCreateModal = true"
          />
          <SubmitButton
            text="我的俱乐部"
            type="secondary"
            size="small"
            @click="showMyClubs"
          />
        </view>
      </view>

      <!-- 搜索和筛选 -->
      <view class="search-section">
        <view class="search-bar">
          <FormInput
            v-model="searchQuery"
            placeholder="搜索俱乐部名称"
            @input="onSearchInput"
          />
        </view>
        <view class="filter-tabs">
          <view
            v-for="tab in filterTabs"
            :key="tab.key"
            :class="['filter-tab', { active: activeFilter === tab.key }]"
            @click="setActiveFilter(tab.key)"
          >
            {{ tab.label }}
          </view>
        </view>
      </view>
      
      <!-- 俱乐部列表 -->
      <view class="club-list">
        <view v-if="loading" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view v-else-if="clubList.length === 0" class="empty-state">
          <text class="empty-text">{{ emptyText }}</text>
        </view>
        
        <view v-else class="club-items">
          <view
            v-for="club in clubList"
            :key="club._id"
            class="club-item"
            @click="viewClubDetail(club)"
          >
            <view class="club-avatar">
              <image
                v-if="club.avatar"
                :src="club.avatar"
                class="avatar-img"
                mode="aspectFill"
              />
              <view v-else class="avatar-placeholder">
                <text class="avatar-text">{{ club.name.charAt(0) }}</text>
              </view>
            </view>
            
            <view class="club-info">
              <view class="club-name">{{ club.name }}</view>
              <view class="club-desc">{{ club.description || '暂无描述' }}</view>
              <view class="club-meta">
                <text class="member-count">{{ club.currentMembers }}/{{ club.maxMembers }}人</text>
                <text v-if="club.location" class="location">{{ club.location }}</text>
              </view>
              <view v-if="club.tags && club.tags.length > 0" class="club-tags">
                <text
                  v-for="tag in club.tags.slice(0, 3)"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </text>
              </view>
            </view>
            
            <view class="club-actions">
              <button
                v-if="!club.isMember"
                class="join-btn"
                @click.stop="joinClub(club._id)"
                :disabled="club.currentMembers >= club.maxMembers"
              >
                {{ club.currentMembers >= club.maxMembers ? '已满' : '加入' }}
              </button>
              <view v-else class="member-status">
                <text class="status-text">{{ getMemberStatusText(club.memberRole) }}</text>
                <button
                  v-if="club.memberRole === 'creator'"
                  class="disband-btn"
                  @click.stop="disbandClub(club._id)"
                >
                  解散
                </button>
                <button
                  v-else
                  class="leave-btn"
                  @click.stop="leaveClub(club._id)"
                >
                  退出
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more">
        <SubmitButton
          text="加载更多"
          type="secondary"
          size="normal"
          @click="loadMore"
        />
      </view>
    </view>

    <!-- 创建俱乐部弹窗 -->
    <view v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建俱乐部</text>
          <text class="close-btn" @click="closeCreateModal">×</text>
        </view>
        
        <view class="form-content">
          <FormInput
            v-model="createForm.name"
            label="俱乐部名称"
            placeholder="请输入俱乐部名称"
            :maxlength="30"
          />
          
          <FormInput
            v-model="createForm.description"
            label="俱乐部描述"
            type="textarea"
            placeholder="请输入俱乐部描述"
            :maxlength="500"
            :auto-height="true"
          />
          
          <FormInput
            v-model="createForm.maxMembers"
            label="最大成员数"
            type="number"
            placeholder="请输入最大成员数(1-1000)"
          />
          
          <FormInput
            v-model="createForm.location"
            label="所在地区"
            placeholder="请输入所在地区"
          />
          
          <view class="form-item">
            <FormInput
              v-model="tagInput"
              label="俱乐部标签"
              placeholder="输入标签后按回车添加(最多5个)"
              @blur="addTag"
            />
            <view v-if="createForm.tags.length > 0" class="tag-list">
              <view
                v-for="(tag, index) in createForm.tags"
                :key="index"
                class="tag-item"
              >
                <text class="tag-text">{{ tag }}</text>
                <text class="remove-tag" @click="removeTag(index)">×</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-actions">
          <SubmitButton
            text="取消"
            type="secondary"
            size="normal"
            @click="closeCreateModal"
          />
          <SubmitButton
            text="创建"
            type="primary"
            size="normal"
            :loading="createLoading"
            :disabled="!createForm.name.trim()"
            @click="createClubSubmit"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'
import { getClubList, createClub, joinClub as joinClubApi, leaveClub as leaveClubApi, disbandClub as disbandClubApi, getMyClubs } from '@/api/club.js'
import FormInput from '@/components/FormInput.vue'
import SubmitButton from '@/components/SubmitButton.vue'

const { isLoggedIn } = useAuth()

// 响应式数据
const loading = ref(false)
const clubList = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const activeFilter = ref('all')
const showCreateModal = ref(false)
const tagInput = ref('')
const createLoading = ref(false)

// 创建俱乐部表单
const createForm = reactive({
  name: '',
  description: '',
  maxMembers: 100,
  location: '',
  tags: []
})

// 筛选选项
const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'available', label: '可加入' },
  { key: 'nearby', label: '附近' }
]

// 计算属性
const hasMore = computed(() => currentPage.value < totalPages.value)
const emptyText = computed(() => {
  if (activeFilter.value === 'available') return '暂无可加入的俱乐部'
  if (activeFilter.value === 'nearby') return '附近暂无俱乐部'
  return searchQuery.value ? '未找到相关俱乐部' : '暂无俱乐部'
})

// 页面初始化
onMounted(() => {
  if (isLoggedIn.value) {
    loadClubList()
  }
})

// 加载俱乐部列表
const loadClubList = async (reset = true) => {
  try {
    loading.value = true
    
    if (reset) {
      currentPage.value = 1
      clubList.value = []
    }
    
    const params = {
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value
    }
    
    // 根据筛选条件添加参数
    if (activeFilter.value === 'available') {
      // 可加入的俱乐部 - 在后端逻辑中处理
    }
    
    const response = await getClubList(params)
    
    if (response.success) {
      if (reset) {
        clubList.value = response.data.clubs
      } else {
        clubList.value.push(...response.data.clubs)
      }
      totalPages.value = response.data.totalPages
    } else {
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载俱乐部列表失败:', error)
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 搜索输入处理
let searchTimer = null
const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadClubList(true)
  }, 500)
}

// 设置筛选条件
const setActiveFilter = (filter) => {
  activeFilter.value = filter
  loadClubList(true)
}

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  
  currentPage.value++
  loadClubList(false)
}

// 查看俱乐部详情
const viewClubDetail = (club) => {
  // 这里可以导航到俱乐部详情页面
  uni.showToast({
    title: `查看 ${club.name} 详情`,
    icon: 'none'
  })
}

// 加入俱乐部
const joinClub = async (clubId) => {
  try {
    const response = await joinClubApi(clubId)
    
    if (response.success) {
      uni.showToast({
        title: '加入成功',
        icon: 'success'
      })
      // 更新列表中的俱乐部状态
      const club = clubList.value.find(c => c._id === clubId)
      if (club) {
        club.isMember = true
        club.memberRole = 'member'
        club.currentMembers++
      }
    } else {
      uni.showToast({
        title: response.message || '加入失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加入俱乐部失败:', error)
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  }
}

// 离开俱乐部
const leaveClub = async (clubId) => {
  uni.showModal({
    title: '确认离开',
    content: '确定要离开这个俱乐部吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await leaveClubApi(clubId)
          
          if (response.success) {
            uni.showToast({
              title: '已离开俱乐部',
              icon: 'success'
            })
            // 更新列表中的俱乐部状态
            const club = clubList.value.find(c => c._id === clubId)
            if (club) {
              club.isMember = false
              club.memberRole = null
              club.currentMembers--
            }
          } else {
            uni.showToast({
              title: response.message || '操作失败',  
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('离开俱乐部失败:', error)
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 解散俱乐部
const disbandClub = async (clubId) => {
  uni.showModal({
    title: '确认解散',
    content: '解散后俱乐部将无法恢复，确定要解散吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await disbandClubApi(clubId)
          
          if (response.success) {
            uni.showToast({
              title: '俱乐部已解散',
              icon: 'success'
            })
            // 从列表中移除
            const index = clubList.value.findIndex(c => c._id === clubId)
            if (index !== -1) {
              clubList.value.splice(index, 1)
            }
          } else {
            uni.showToast({
              title: response.message || '操作失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('解散俱乐部失败:', error)
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 获取成员状态文本
const getMemberStatusText = (role) => {
  switch (role) {
    case 'creator': return '创建者'
    case 'admin': return '管理员'
    case 'member': return '成员'
    default: return ''
  }
}

// 显示我的俱乐部
const showMyClubs = () => {
  // 这里可以导航到我的俱乐部页面或者弹窗显示
  uni.showToast({
    title: '我的俱乐部功能开发中',
    icon: 'none'
  })
}

// 关闭创建弹窗
const closeCreateModal = () => {
  showCreateModal.value = false
  // 重置表单
  Object.assign(createForm, {
    name: '',
    description: '',
    maxMembers: 100,
    location: '',
    tags: []
  })
  tagInput.value = ''
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !createForm.tags.includes(tag) && createForm.tags.length < 5) {
    createForm.tags.push(tag)
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (index) => {
  createForm.tags.splice(index, 1)
}

// 创建俱乐部提交
const createClubSubmit = async () => {
  if (!createForm.name.trim()) {
    uni.showToast({
      title: '请输入俱乐部名称',
      icon: 'none'
    })
    return
  }

  try {
    createLoading.value = true
    const response = await createClub({
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      maxMembers: createForm.maxMembers || 100,
      location: createForm.location.trim(),
      tags: createForm.tags,
      isPublic: true
    })
    
    if (response.success) {
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })
      closeCreateModal()
      loadClubList(true) // 重新加载列表
    } else {
      uni.showToast({
        title: response.message || '创建失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('创建俱乐部失败:', error)
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  } finally {
    createLoading.value = false
  }
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}
</script>

<style lang="scss" scoped>
// 变量定义
$primary-color: #007aff;
$secondary-color: #34c759;
$danger-color: #ff3b30;
$warning-color: #ff9500;
$text-color: #333;
$text-light: #666;
$text-muted: #999;
$bg-color: #f5f5f5;
$white: #ffffff;
$border-radius: 20rpx;
$small-radius: 8rpx;

.club-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 160rpx;
  box-sizing: border-box;

  // 未登录状态提示
  .login-prompt {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
    padding: 40rpx;

    .prompt-content {
      text-align: center;
    }

    .prompt-text {
      font-size: 32rpx;
      color: $text-light;
      margin-bottom: 40rpx;
      display: block;
    }


  }

  // 已登录状态内容
  .club-content {
    padding: 20rpx;

    // 页面头部
    .club-header {
      background-color: $white;
      padding: 30rpx;
      border-radius: $border-radius;
      margin-bottom: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        font-size: 36rpx;
        font-weight: bold;
        color: $text-color;
      }

      .header-actions {
        display: flex;
        gap: 20rpx;
      }
    }

    // 搜索和筛选
    .search-section {
      background-color: $white;
      border-radius: $border-radius;
      padding: 30rpx;
      margin-bottom: 20rpx;

      .search-bar {
        margin-bottom: 20rpx;
      }

      .filter-tabs {
        display: flex;
        gap: 20rpx;

        .filter-tab {
          padding: 12rpx 24rpx;
          border-radius: 50rpx;
          font-size: 24rpx;
          color: $text-light;
          background-color: #f8f8f8;
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            background-color: $primary-color;
            color: $white;
          }
        }
      }
    }

    // 俱乐部列表
    .club-list {
      background-color: $white;
      border-radius: $border-radius;
      min-height: 400rpx;

      .loading-state, .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400rpx;

        .loading-text, .empty-text {
          font-size: 28rpx;
          color: $text-muted;
        }
      }

      .club-items {
        padding: 20rpx;

        .club-item {
          display: flex;
          padding: 30rpx;
          border-bottom: 1rpx solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.3s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f8f8f8;
          }

          .club-avatar {
            width: 100rpx;
            height: 100rpx;
            margin-right: 20rpx;
            flex-shrink: 0;

            .avatar-img {
              width: 100%;
              height: 100%;
              border-radius: $small-radius;
            }

            .avatar-placeholder {
              width: 100%;
              height: 100%;
              background-color: $primary-color;
              border-radius: $small-radius;
              display: flex;
              align-items: center;
              justify-content: center;

              .avatar-text {
                color: $white;
                font-size: 32rpx;
                font-weight: bold;
              }
            }
          }

          .club-info {
            flex: 1;
            margin-right: 20rpx;

            .club-name {
              font-size: 32rpx;
              font-weight: bold;
              color: $text-color;
              margin-bottom: 10rpx;
            }

            .club-desc {
              font-size: 26rpx;
              color: $text-light;
              margin-bottom: 10rpx;
              line-height: 1.4;
            }

            .club-meta {
              display: flex;
              gap: 20rpx;
              margin-bottom: 10rpx;

              .member-count, .location {
                font-size: 24rpx;
                color: $text-muted;
              }
            }

            .club-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 10rpx;

              .tag {
                padding: 6rpx 12rpx;
                background-color: #f0f0f0;
                border-radius: 20rpx;
                font-size: 20rpx;
                color: $text-light;
              }
            }
          }

          .club-actions {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            gap: 10rpx;

            .join-btn {
              padding: 12rpx 24rpx;
              background-color: $secondary-color;
              color: $white;
              border: none;
              border-radius: 50rpx;
              font-size: 24rpx;

              &:disabled {
                background-color: $text-muted;
              }
            }

            .member-status {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 10rpx;

              .status-text {
                font-size: 24rpx;
                color: $text-muted;
              }

              .leave-btn, .disband-btn {
                padding: 8rpx 16rpx;
                border: none;
                border-radius: 20rpx;
                font-size: 22rpx;
              }

              .leave-btn {
                background-color: $warning-color;
                color: $white;
              }

              .disband-btn {
                background-color: $danger-color;
                color: $white;
              }
            }
          }
        }
      }
    }

    // 加载更多
    .load-more {
      padding: 40rpx;
    }
  }

  // 创建俱乐部弹窗
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .modal-content {
      background-color: $white;
      border-radius: $border-radius;
      margin: 40rpx;
      max-height: 80vh;
      overflow-y: auto;
      max-width: 600rpx;
      width: 90%;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40rpx;
        border-bottom: 1rpx solid #f0f0f0;

        .modal-title {
          font-size: 32rpx;
          font-weight: bold;
          color: $text-color;
        }

        .close-btn {
          font-size: 48rpx;
          color: $text-muted;
          cursor: pointer;
        }
      }

      .form-content {
        padding: 40rpx;

        .form-item {
          .tag-list {
            margin-top: 20rpx;
            display: flex;
            flex-wrap: wrap;
            gap: 10rpx;

            .tag-item {
              display: flex;
              align-items: center;
              background-color: $primary-color;
              border-radius: 20rpx;
              padding: 6rpx 12rpx;

              .tag-text {
                color: $white;
                font-size: 24rpx;
                margin-right: 8rpx;
              }

              .remove-tag {
                color: $white;
                font-size: 28rpx;
                cursor: pointer;
              }
            }
          }
        }
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 20rpx;
        padding: 40rpx;
        border-top: 1rpx solid #f0f0f0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .club-container .club-content {
    padding: 10rpx;
    
    .club-header .header-actions {
      flex-direction: column;
      gap: 10rpx;
    }
  }
}
</style> 