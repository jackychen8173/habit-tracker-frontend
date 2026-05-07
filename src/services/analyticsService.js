import api from './api';

export const analyticsService = {
  // Get all streaks
  getStreaks: async () => {
    const response = await api.get('/analytics/streaks');
    return response.data.streaks;
  },

  // Get weekly summary
  getWeeklySummary: async () => {
    const response = await api.get('/analytics/weekly');
    return response.data;
  },

  // Get monthly summary
  getMonthlySummary: async () => {
    const response = await api.get('/analytics/monthly');
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
};