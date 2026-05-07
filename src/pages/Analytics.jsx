import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, TrendingUp, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeatmapCalendar from '../components/HeatmapCalendar';
import { analyticsService } from '../services/analyticsService';
import { habitService } from '../services/habitService';
import { logService } from '../services/logService';

const Analytics = () => {
  const [streaks, setStreaks] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHabit) {
      loadHeatmapData(selectedHabit.habit_id);
    }
  }, [selectedHabit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [streaksData, weeklyData, habitsData] = await Promise.all([
        analyticsService.getStreaks(),
        analyticsService.getWeeklySummary(),
        habitService.getHabits(true),
      ]);
      
      setStreaks(streaksData);
      setWeeklySummary(weeklyData);
      setHabits(habitsData);
      
      if (streaksData.length > 0) {
        setSelectedHabit(streaksData[0]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHeatmapData = async (habitId) => {
    try {
      const data = await logService.getHeatmapData(habitId);
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap:', error);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Insights</h1>

        {/* Streaks Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Streaks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streaks.map((streak) => (
              <div
                key={streak.habit_id}
                className="card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedHabit(streak)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{streak.habit_name}</h3>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: streak.color }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Flame size={18} className="text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {streak.current_streak}
                    </span>
                    <span className="text-sm text-gray-600">days</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Best streak: {streak.best_streak} days</span>
                    <span>{streak.total_completions} total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Section */}
        {selectedHabit && heatmapData && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Activity for {selectedHabit.habit_name}
            </h2>
            <HeatmapCalendar data={heatmapData.data} color={selectedHabit.color} />
          </div>
        )}

        {/* Weekly Summary */}
        {weeklySummary && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Weekly Summary</h2>
                <p className="text-sm text-gray-600">{weeklySummary.period}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">
                  {weeklySummary.overall.percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">
                  {weeklySummary.overall.habits_met}/{weeklySummary.overall.total_habits} goals met
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySummary.habits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="habit_name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="completions" 
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {weeklySummary.habits.map((habit) => (
                <div key={habit.habit_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {habit.habit_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {habit.completions}/{habit.target}
                    </span>
                    {habit.met_goal && (
                      <Award size={18} className="text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="text-primary-600" size={24} />
              <h3 className="font-semibold text-gray-900">Total Habits</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{habits.length}</p>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <Flame className="text-orange-600" size={24} />
              <h3 className="font-semibold text-gray-900">Average Streak</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {streaks.length > 0
                ? Math.round(streaks.reduce((sum, s) => sum + s.current_streak, 0) / streaks.length)
                : 0}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-2">
              <Award className="text-primary-600" size={24} />
              <h3 className="font-semibold text-gray-900">Total Completions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {streaks.reduce((sum, s) => sum + s.total_completions, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;