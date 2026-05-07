import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, startOfYear, endOfDay, addDays } from 'date-fns';

const HeatmapCalendar = ({ data, color = '#10b981' }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  // Get dates for the last 365 days
  const endDate = new Date();
  const startDate = addDays(endDate, -364);
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  // Create a map of date -> count
  const dataMap = {};
  data?.forEach((item) => {
    dataMap[item.date] = item.count;
  });

  // Calculate max count for color intensity
  const maxCount = Math.max(...(data?.map(d => d.count) || [1]));

  // Get color intensity based on count
  const getColor = (count) => {
    if (!count) return '#ebedf0';
    const intensity = count / maxCount;
    const alpha = Math.max(0.2, intensity);
    return `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
  };

  // Group dates by week
  const weeks = [];
  let currentWeek = [];
  
  allDates.forEach((date, index) => {
    const day = date.getDay();
    
    if (index === 0 && day !== 0) {
      // Fill empty days at the start
      for (let i = 0; i < day; i++) {
        currentWeek.push(null);
      }
    }
    
    currentWeek.push(date);
    
    if (day === 6 || index === allDates.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const handleMouseEnter = (date, event) => {
    setHoveredDate(date);
    const rect = event.target.getBoundingClientRect();
    setHoveredPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto pb-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={dayIndex} className="w-3 h-3" />;
              }
              
              const dateStr = format(date, 'yyyy-MM-dd');
              const count = dataMap[dateStr] || 0;
              
              return (
                <div
                  key={dayIndex}
                  className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-gray-400"
                  style={{ backgroundColor: getColor(count) }}
                  onMouseEnter={(e) => handleMouseEnter(date, e)}
                  onMouseLeave={() => setHoveredDate(null)}
                  title={`${format(date, 'MMM d, yyyy')} - ${count} completion${count !== 1 ? 's' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none"
          style={{
            left: hoveredPosition.x,
            top: hoveredPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div>{format(hoveredDate, 'MMM d, yyyy')}</div>
          <div className="text-xs text-gray-300">
            {dataMap[format(hoveredDate, 'yyyy-MM-dd')] || 0} completion
            {dataMap[format(hoveredDate, 'yyyy-MM-dd')] !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center space-x-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(0.25) }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(0.5) }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(0.75) }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(1) }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;