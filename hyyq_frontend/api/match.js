// 约球相关API接口
import request from '@/utils/request.js'

// 获取约球列表接口
export const getMatches = (params = {}) => {
  return request('/api/matches', {
    method: 'GET',
    data: params
  })
}

// 获取我发布的约球列表
export const getMyMatches = () => {
  return request('/api/matches/my', {
    method: 'GET',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}

// 发布约球接口
export const publishMatch = (data) => {
  return request('/api/matches', {
    method: 'POST',
    data,
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}

// 删除约球接口
export const deleteMatch = (matchId) => {
  return request(`/api/matches/${matchId}`, {
    method: 'DELETE',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}

// 更新约球状态接口
export const updateMatchStatus = (matchId, status) => {
  return request(`/api/matches/${matchId}/status`, {
    method: 'PUT',
    data: { status },
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}

// 参加约球接口
export const joinMatch = (matchId) => {
  return request(`/api/matches/${matchId}/join`, {
    method: 'POST',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
}

// 退出约球接口
export const leaveMatch = (matchId) => {
  return request(`/api/matches/${matchId}/leave`, {
    method: 'POST',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
} 