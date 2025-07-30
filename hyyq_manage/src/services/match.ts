import api from './api';
import type { Match, MatchListParams, ApiResponse, PaginationResponse } from '../types';

// 获取约球列表
export const getMatchList = async (params: MatchListParams): Promise<PaginationResponse<Match>> => {
  return api.get('/admin/matches', { params });
};

// 获取约球详情
export const getMatchDetail = async (matchId: string): Promise<ApiResponse<Match>> => {
  return api.get(`/admin/matches/${matchId}`);
};

// 更新约球状态
export const updateMatchStatus = async (matchId: string, status: 'active' | 'completed' | 'cancelled'): Promise<ApiResponse> => {
  return api.put(`/admin/matches/${matchId}/status`, { status });
};

// 删除约球
export const deleteMatch = async (matchId: string): Promise<ApiResponse> => {
  return api.delete(`/admin/matches/${matchId}`);
};

// 编辑约球信息
export const updateMatch = async (matchId: string, params: Partial<Match>): Promise<ApiResponse<Match>> => {
  return api.put(`/admin/matches/${matchId}`, params);
};

// 移除约球参与者（暂未实现）
export const removeParticipant = async (matchId: string, userId: string): Promise<ApiResponse> => {
  console.log('移除参与者:', { matchId, userId }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '参与者移除成功',
  });
};

// 设置约球为推荐（暂未实现）
export const setMatchRecommended = async (matchId: string, recommended: boolean): Promise<ApiResponse> => {
  console.log('设置推荐:', { matchId, recommended }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: `${recommended ? '设置' : '取消'}推荐成功`,
  });
};

// 获取约球统计信息（暂未实现）
export const getMatchStats = async (): Promise<ApiResponse<{
  totalMatches: number;
  activeMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  todayMatches: number;
  popularSports: Array<{
    sport: string;
    count: number;
  }>;
  popularLocations: Array<{
    location: string;
    count: number;
  }>;
}>> => {
  return Promise.resolve({
    code: 200,
    data: {
      totalMatches: 0,
      activeMatches: 0,
      completedMatches: 0,
      cancelledMatches: 0,
      todayMatches: 0,
      popularSports: [],
      popularLocations: [],
    },
    msg: '获取约球统计成功',
  });
};

// 举报约球（暂未实现）
export const reportMatch = async (matchId: string, reason: string): Promise<ApiResponse> => {
  console.log('举报约球:', { matchId, reason }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '举报提交成功',
  });
};

// 获取举报列表（暂未实现）
export const getReportList = async (params: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}): Promise<PaginationResponse<{
  id: string;
  matchId: string;
  matchTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  handledAt?: string;
  handledBy?: string;
}>> => {
  console.log('获取举报列表:', params); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    data: [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: 0,
    },
    msg: '获取举报列表成功',
  });
};

// 处理举报（暂未实现）
export const handleReport = async (reportId: string, params: {
  action: 'approve' | 'reject';
  remark?: string;
}): Promise<ApiResponse> => {
  console.log('处理举报:', { reportId, params }); // 避免未使用参数警告
  return Promise.resolve({
    code: 200,
    msg: '举报处理成功',
  });
};

// 导出约球数据（暂未实现）
export const exportMatchData = async (params: MatchListParams): Promise<Blob> => {
  console.log('导出约球数据:', params); // 避免未使用参数警告
  
  // 简单的CSV导出模拟
  const csvContent = 'ID,内容,运动类型,约球时间,地点,状态,发布者,发布时间\n' +
    '示例数据,导出功能待实现...';
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  return Promise.resolve(blob);
}; 