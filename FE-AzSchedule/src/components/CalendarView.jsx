import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Card, CardContent } from './ui/Card.jsx';
import { 
  CALENDAR_VIEWS, 
  getWeekRange, 
  getWeekDays, 
  getMonthDays, 
  groupTasksByDate, 
  isToday, 
  getDayOfMonth,
  formatDateRange,
  formatMonthYear,
  getPriorityColor,
  getStatusColor,
  formatTime,
  extractTime
} from '../utils/calendarUtils.js';
import dayjs from 'dayjs';

// WeekView Component
const WeekView = ({ tasks, currentDate, onEditTask }) => {
  const weekDays = getWeekDays(currentDate);
  const groupedTasks = groupTasksByDate(tasks);
  const HOUR_HEIGHT = 60;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getDayShort = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const categorizeTasks = (dayTasks) => {
    const allDayTasks = dayTasks.filter(task => !task.startTime || !task.endTime);
    const timedTasks = dayTasks.filter(task => task.startTime && task.endTime);
    return { allDayTasks, timedTasks };
  };

  const getTaskPosition = (task) => {
    if (task.startTime && task.endTime) {
      const startTime = extractTime(task.startTime);
      const endTime = extractTime(task.endTime);
      
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      
      return {
        top: (startMinutes / 60) * HOUR_HEIGHT,
        height: Math.max(30, (duration / 60) * HOUR_HEIGHT)
      };
    }
    
    return { top: 0, height: 70 };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col overflow-y-auto">
      {/* Week Header (Sticky) */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-20 p-4 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">TIME</div>
          </div>
          {weekDays.map((day) => {
            const isCurrentDay = isToday(day);
            return (
              <div 
                key={day.toISOString()} 
                className={`flex-1 p-4 text-center border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${
                  isCurrentDay ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                  isCurrentDay ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getDayShort(day.getDay())}
                </div>
                <div className={`text-xl font-bold ${
                  isCurrentDay ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
                }`}>
                  {getDayOfMonth(day)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex flex-col flex-1">
        {/* All-Day Tasks Section (Scrollable) */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex min-h-[60px]">
            <div className="w-20 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center sticky left-0">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">
                ALL-DAY
              </div>
            </div>
            
            {weekDays.map((day) => {
              const isCurrentDay = isToday(day);
              const dayKey = dayjs(day).format('YYYY-MM-DD');
              const dayTasks = groupedTasks[dayKey] || [];
              const { allDayTasks } = categorizeTasks(dayTasks);
              
              return (
                <div 
                  key={`allday-${day.toISOString()}`} 
                  className={`flex-1 border-r border-gray-200 dark:border-gray-600 last:border-r-0 p-2 ${
                    isCurrentDay ? 'bg-primary-50/30 dark:bg-primary-900/10' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="space-y-1">
                    {allDayTasks.map((task) => (
                      <div
                        key={`allday-${task.id}`}
                        className="text-xs px-2 py-1 rounded cursor-pointer transition-colors hover:opacity-80"
                        style={{ backgroundColor: getPriorityColor(task.priority), color: 'white' }}
                        onClick={() => onEditTask?.(task)}
                        title={task.title}
                      >
                        {task.title.length > 15 ? `${task.title.substring(0, 15)}...` : task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Grid (Scrollable) */}
        <div className="flex flex-1">
          {/* Time Column */}
          <div className="w-20 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 sticky left-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-b border-gray-200 dark:border-gray-600 flex items-start justify-center pt-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {formatTime(hour)}
                </div>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 flex">
            {weekDays.map((day) => {
              const isCurrentDay = isToday(day);
              const dayKey = dayjs(day).format('YYYY-MM-DD');
              const dayTasks = groupedTasks[dayKey] || [];
              const { timedTasks } = categorizeTasks(dayTasks);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`flex-1 border-r border-gray-200 dark:border-gray-600 last:border-r-0 relative ${
                    isCurrentDay ? 'bg-primary-50/30 dark:bg-primary-900/10' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-gray-100 dark:border-gray-700" />
                  ))}

                  {/* Timed Tasks */}
                  {timedTasks.map((task) => {
                    const position = getTaskPosition(task);
                    return (
                      <div
                        key={task.id}
                        className="absolute left-1 right-1 rounded shadow-sm cursor-pointer transition-transform hover:scale-105"
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white',
                        }}
                        onClick={() => onEditTask?.(task)}
                      >
                        <div className="p-2 h-full overflow-hidden">
                          <div className="font-semibold text-sm leading-tight mb-1">
                            {task.title}
                          </div>
                          <div className="text-xs opacity-90">
                            {extractTime(task.startTime)} - {extractTime(task.endTime)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Current time indicator for today */}
                  {isToday(day) && (() => {
                    const now = new Date();
                    const currentHour = now.getHours() + now.getMinutes() / 60;
                    return (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                        style={{ top: `${currentHour * HOUR_HEIGHT}px` }}
                      >
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// MonthView Component
const MonthView = ({ tasks, currentDate, onEditTask }) => {
  const monthDays = getMonthDays(currentDate.getMonth(), currentDate.getFullYear());
  const groupedTasks = groupTasksByDate(tasks);

  // Group days by weeks
  const weeks = [];
  let currentWeek = [];
  
  monthDays.forEach((day, index) => {
    if (index === 0) {
      const dayOfWeek = day.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(new Date(0)); // Empty days
      }
    }
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0)); // Fill empty days
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Month Header */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={dayName} className="p-4 text-center border-r border-gray-200 dark:border-gray-600 last:border-r-0">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {dayName}
            </div>
          </div>
        ))}
      </div>

      {/* Month Content */}
      <div className="h-[500px] overflow-y-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 min-h-[120px]">
            {week.map((day, dayIndex) => {
              const isEmptyDay = day.getTime() === 0;
              const dayKey = isEmptyDay ? '' : dayjs(day).format('YYYY-MM-DD');
              const dayTasks = isEmptyDay ? [] : (groupedTasks[dayKey] || []);
              const isCurrentMonth = !isEmptyDay && day.getMonth() === currentDate.getMonth();
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`} 
                  className={`border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 p-2 ${
                    isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-gray-800'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  {!isEmptyDay && (
                    <>
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday(day) ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {getDayOfMonth(day)}
                      </div>
                      
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="text-xs px-2 py-1 rounded cursor-pointer transition-colors hover:opacity-80 truncate"
                            style={{ backgroundColor: getPriorityColor(task.priority), color: 'white' }}
                            onClick={() => onEditTask?.(task)}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export function CalendarView({ tasks, viewType, currentDate, onEditTask, onDateRangeChange }) {
  // viewType and currentDate now come from parent

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    if (onDateRangeChange) {
      onDateRangeChange(viewType, newDate);
    }
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    if (onDateRangeChange) {
      onDateRangeChange(viewType, newDate);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    if (onDateRangeChange) {
      onDateRangeChange(viewType, today);
    }
  };

  const handleViewTypeChange = (newViewType) => {
    if (onDateRangeChange) {
      onDateRangeChange(newViewType, currentDate);
    }
  };

  const getDateRangeTitle = () => {
    if (viewType === 'week') {
      const { start, end } = getWeekRange(currentDate);
      return formatDateRange(start, end);
    } else {
      return formatMonthYear(currentDate.getMonth(), currentDate.getFullYear());
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar View</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getDateRangeTitle()} • {tasks.length} tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {CALENDAR_VIEWS.map((view) => (
                  <Button
                    key={view.type}
                    variant={viewType === view.type ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewTypeChange(view.type)}
                    className="h-8"
                  >
                    {view.type === 'week' ? 'Week' : 'Month'}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleTodayClick}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {viewType === 'week' ? (
          <WeekView tasks={tasks} currentDate={currentDate} onEditTask={onEditTask} />
        ) : (
          <MonthView tasks={tasks} currentDate={currentDate} onEditTask={onEditTask} />
        )}
      </CardContent>
    </Card>
  );
}
