import { Check, Flame, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { logService } from '../services/logService';

const HabitCard = ({ habit, onToggle, onDelete, onEdit, todayLogs }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCompletedToday = todayLogs?.some(log => log.habit_id === habit.id);

  const handleToggle = async () => {
  setLoading(true);
  try {
    if (isCompletedToday) {
      // Find the log for today and delete it
      const todayLog = todayLogs.find(log => log.habit_id === habit.id);
      if (todayLog) {
        await logService.deleteLog(todayLog.id);
      }
    } else {
      // Create new log - don't pass completed_date, let backend default to today
      await logService.createLog(habit.id, null);
    }
    onToggle();
  } catch (error) {
    console.error('Error toggling habit:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="flex items-start space-x-4 flex-1 cursor-pointer"
          onClick={handleToggle}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompletedToday
                ? 'bg-primary-600 border-primary-600'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isCompletedToday ? (
              <Check size={18} className="text-white" />
            ) : null}
          </div>

          <div className="flex-1">
            {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg font-semibold ${
                isCompletedToday ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {habit.name}
              </h3>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
            </div>
            
            {habit.description && (
              <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-orange-600">
                <Flame size={16} />
                <span className="text-sm font-medium">{habit.current_streak || 0} day streak</span>
              </div>
              
              <span className="text-xs text-gray-500">
                {habit.target_frequency === 'daily' ? 'Daily' : 
                 habit.target_frequency === '3x_week' ? '3x per week' :
                 habit.target_frequency === '5x_week' ? '5x per week' : 'Weekly'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;