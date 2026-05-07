import api from './api';

export const habitService = {
  // Get all habits
  getHabits: async (withStats = true) => {
    const response = await api.get(`/habits?with_stats=${withStats}`);
    return response.data.habits;
  },

  // Get single habit
  getHabit: async (id) => {
    const response = await api.get(`/habits/${id}`);
    return response.data.habit;
  },

  // Create habit
  createHabit: async (habitData) => {
    const response = await api.post('/habits', habitData);
    return response.data.habit;
  },

  // Update habit
  updateHabit: async (id, updates) => {
    const response = await api.put(`/habits/${id}`, updates);
    return response.data.habit;
  },

  // Delete habit (archive)
  deleteHabit: async (id, permanent = false) => {
    const response = await api.delete(`/habits/${id}?permanent=${permanent}`);
    return response.data;
  },

  // Get habit statistics
  getHabitStats: async (id, days = 365) => {
    const response = await api.get(`/habits/${id}/stats?days=${days}`);
    return response.data.stats;
  },
};