import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { logService } from '../services/logService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [currentDate]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const logsData = await logService.getCalendarLogs(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getLogsForDate = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayLogs = logs.find(log => {
    const logDate = format(parseISO(log.completed_date), 'yyyy-MM-dd');
    return logDate === dateStr;
  });
  return dayLogs?.habits || [];
};

  // Get all days in the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDay = monthStart.getDay();

  // Create array of days including empty slots for alignment
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  calendarDays.push(...daysInMonth);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayLogs = getLogsForDate(date);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={date.toISOString()}
                  className={`aspect-square border rounded-lg p-2 ${
                    isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  } ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}`}
                >
                  <div className="h-full flex flex-col">
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    
                    <div className="flex-1 flex flex-wrap gap-1 content-start">
                      {dayLogs.slice(0, 3).map((log, idx) => (
                        <div
                          key={idx}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: log.color }}
                          title={log.habit_name}
                        />
                      ))}
                      {dayLogs.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayLogs.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 card">
          <h3 className="font-semibold text-gray-900 mb-3">How to read this calendar</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-600" />
              <span>Each dot represents a completed habit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-primary-500 bg-primary-50 rounded" />
              <span>Today's date is highlighted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;