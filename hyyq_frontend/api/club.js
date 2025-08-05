import request from '@/utils/request.js'

// 创建俱乐部
export const createClub = (data) => {
  return request('/api/club/create', {
    method: 'POST',
    data
  })
}

// 获取俱乐部列表
export const getClubList = (params) => {
  return request('/api/club/list', {
    method: 'GET',
    data: params
  })
}

// 获取俱乐部详情
export const getClubDetail = (id) => {
  return request(`/api/club/${id}`, {
    method: 'GET'
  })
}

// 加入俱乐部
export const joinClub = (id) => {
  return request(`/api/club/${id}/join`, {
    method: 'POST'
  })
}

// 离开俱乐部
export const leaveClub = (id) => {
  return request(`/api/club/${id}/leave`, {
    method: 'POST'
  })
}

// 解散俱乐部
export const disbandClub = (id) => {
  return request(`/api/club/${id}`, {
    method: 'DELETE'
  })
}

// 获取我的俱乐部
export const getMyClubs = () => {
  return request('/api/club/my/clubs', {
    method: 'GET'
  })
}