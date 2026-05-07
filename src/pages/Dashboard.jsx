import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Target, Flame } from 'lucide-react';
import Navbar from '../components/Navbar';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import { habitService } from '../services/habitService';
import { logService } from '../services/logService';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, logsData, dashboard] = await Promise.all([
        habitService.getHabits(true),
        logService.getTodayLogs(),
        analyticsService.getDashboard(),
      ]);
      
      setHabits(habitsData);
      setTodayLogs(logsData);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      await habitService.createHabit(habitData);
      await loadData();
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  };

  const handleUpdateHabit = async (habitData) => {
    try {
      await habitService.updateHabit(editingHabit.id, habitData);
      await loadData();
      setEditingHabit(null);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  };

  const handleDeleteHabit = async (id) => {
    if (window.confirm('Are you sure you want to archive this habit?')) {
      try {
        await habitService.deleteHabit(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const todayData = dashboardData?.today || {};
  const completionPercentage = todayData.completion_percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Today's Habits</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {todayData.completed_count || 0}/{todayData.total_active_habits || 0}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Target className="text-primary-600" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Habits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {habits.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Longest Streak</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {Math.max(...habits.map(h => h.current_streak || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Flame className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Your Habits</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Habit</span>
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No habits yet. Create your first habit to get started!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create First Habit</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayLogs={todayLogs}
                onToggle={loadData}
                onDelete={handleDeleteHabit}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      <HabitModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={editingHabit ? handleUpdateHabit : handleCreateHabit}
        habit={editingHabit}
      />
    </div>
  );
};

export default Dashboard;