import api from './api';

export const logService = {
  // Get all logs
  getLogs: async (startDate = null, endDate = null) => {
    let url = '/logs';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data.logs;
  },

  // Get today's logs
  getTodayLogs: async () => {
    const response = await api.get('/logs/today');
    return response.data.logs;
  },

  // Get heatmap data for a habit
  getHeatmapData: async (habitId) => {
    const response = await api.get(`/logs/heatmap/${habitId}`);
    return response.data;
  },

  // Get logs for calendar view
  getCalendarLogs: async (startDate, endDate) => {
    const response = await api.get(
      `/logs/calendar?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data.logs;
  },

  // Get logs for a specific habit
  getHabitLogs: async (habitId, startDate = null, endDate = null) => {
    let url = `/logs/habit/${habitId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data.logs;
  },

  // Create a log (mark habit as complete)
  createLog: async (habitId, notes = null, completedDate = null) => {
  const data = { habit_id: habitId };
  if (notes) data.notes = notes;
  // Only include completed_date if it's explicitly provided
  if (completedDate) data.completed_date = completedDate;
  
  const response = await api.post('/logs', data);
  return response.data.log;
},

  // Update a log
  updateLog: async (id, updates) => {
    const response = await api.put(`/logs/${id}`, updates);
    return response.data.log;
  },

  // Delete a log (undo completion)
  deleteLog: async (id) => {
    const response = await api.delete(`/logs/${id}`);
    return response.data;
  },
};