import dayjs from 'dayjs';

export const CALENDAR_VIEWS = [
  { type: 'week', label: 'Week View' },
  { type: 'month', label: 'Month View' },
];

/**
 * Get week range for a given date
 * @param {Date} date - Date to get week range for
 * @returns {Object} { start: Date, end: Date }
 */
export const getWeekRange = (date) => {
  const start = dayjs(date).startOf('week');
  const end = dayjs(date).endOf('week');
  return { start: start.toDate(), end: end.toDate() };
};

/**
 * Get array of dates for the current week
 * @param {Date} date - Date in the week
 * @returns {Date[]} Array of 7 dates
 */
export const getWeekDays = (date) => {
  const startOfWeek = dayjs(date).startOf('week');
  return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day').toDate());
};

/**
 * Get array of dates for the current month
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {Date[]} Array of dates in the month
 */
export const getMonthDays = (month, year) => {
  const startOfMonth = dayjs().year(year).month(month).startOf('month');
  const endOfMonth = dayjs().year(year).month(month).endOf('month');
  const days = [];
  
  let current = startOfMonth;
  while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'day')) {
    days.push(current.toDate());
    current = current.add(1, 'day');
  }
  
  return days;
};

/**
 * Group tasks by date
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Tasks grouped by date key (YYYY-MM-DD)
 */
export const groupTasksByDate = (tasks) => {
  const grouped = {};
  
  tasks.forEach(task => {
    let date;
    
    // Use startTime if available, otherwise use createdAt
    if (task.startTime) {
      date = dayjs(task.startTime).format('YYYY-MM-DD');
    } else if (task.createdAt) {
      date = dayjs(task.createdAt).format('YYYY-MM-DD');
    } else {
      return; // Skip if no date available
    }
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(task);
  });
  
  return grouped;
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Get day of month
 * @param {Date} date - Date
 * @returns {number} Day of month (1-31)
 */
export const getDayOfMonth = (date) => {
  return dayjs(date).date();
};

/**
 * Format date range for display
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (start, end) => {
  const startDay = dayjs(start);
  const endDay = dayjs(end);
  
  if (startDay.month() === endDay.month()) {
    return `${startDay.format('MMM DD')} - ${endDay.format('DD, YYYY')}`;
  } else {
    return `${startDay.format('MMM DD')} - ${endDay.format('MMM DD, YYYY')}`;
  }
};

/**
 * Format month and year for display
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {string} Formatted month and year
 */
export const formatMonthYear = (month, year) => {
  return dayjs().year(year).month(month).format('MMMM YYYY');
};

/**
 * Get day name from day index
 * @param {number} dayIndex - Day index (0-6)
 * @returns {string} Day name
 */
export const getDayName = (dayIndex) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Sunday';
};

/**
 * Get short day name from day index
 * @param {number} dayIndex - Day index (0-6)
 * @returns {string} Short day name
 */
export const getDayShort = (dayIndex) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex] || 'Sun';
};

/**
 * Get priority color for tasks
 * @param {string} priority - Priority level (LOW, MEDIUM, HIGH)
 * @returns {string} Color hex code
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH': return '#ef4444'; // Red
    case 'MEDIUM': return '#f59e0b'; // Orange
    case 'LOW': return '#22c55e'; // Green
    default: return '#6b7280'; // Gray
  }
};

/**
 * Get status color for tasks
 * @param {string} status - Task status
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'DONE': return '#22c55e'; // Green
    case 'IN_PROGRESS': return '#3b82f6'; // Blue
    case 'TODO': return '#6b7280'; // Gray
    case 'PAUSED': return '#f59e0b'; // Orange
    default: return '#6b7280'; // Gray
  }
};

/**
 * Time conversion utilities
 * @param {string} timeStr - Time string (HH:mm)
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time string (HH:mm)
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Format time for display (12-hour format)
 * @param {number} hour - Hour (0-23)
 * @returns {string} Formatted time
 */
export const formatTime = (hour) => {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
};

/**
 * Extract time from datetime string
 * @param {string} datetime - ISO datetime string
 * @returns {string} Time string (HH:mm)
 */
export const extractTime = (datetime) => {
  if (!datetime) return '';
  return dayjs(datetime).format('HH:mm');
};

/**
 * Get current week start and end
 * @returns {Object} { start: Date, end: Date }
 */
export const getCurrentWeek = () => {
  const now = dayjs();
  return {
    start: now.startOf('week').toDate(),
    end: now.endOf('week').toDate(),
  };
};

/**
 * Get current month start and end
 * @returns {Object} { start: Date, end: Date }
 */
export const getCurrentMonth = () => {
  const now = dayjs();
  return {
    start: now.startOf('month').toDate(),
    end: now.endOf('month').toDate(),
  };
};
