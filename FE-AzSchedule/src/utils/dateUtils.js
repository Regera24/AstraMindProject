import dayjs from 'dayjs';

/**
 * Format date to display string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * Format datetime to display string
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Format time to display string
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';
  return dayjs(time).format('HH:mm');
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Check if date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
};

/**
 * Parse ISO datetime string to Date object
 * @param {string} isoString - ISO datetime string
 * @returns {Date} Date object
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;
  return dayjs(isoString).toDate();
};

/**
 * Convert date to ISO string for API
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO string
 */
export const toISOString = (date) => {
  if (!date) return null;
  return dayjs(date).toISOString();
};

/**
 * Check if a date is overdue (past current time)
 * @param {string} dateTime - Date time string
 * @returns {boolean} True if overdue
 */
export const isOverdue = (dateTime) => {
  if (!dateTime) return false;
  return dayjs(dateTime).isBefore(dayjs());
};

/**
 * Get days until/overdue for a date
 * @param {string} dateTime - Date time string
 * @returns {number} Positive if future, negative if past
 */
export const getDaysUntil = (dateTime) => {
  if (!dateTime) return 0;
  return dayjs(dateTime).diff(dayjs(), 'day');
};

/**
 * Get overdue message
 * @param {string} dateTime - Date time string
 * @returns {string} Overdue message
 */
export const getOverdueMessage = (dateTime) => {
  if (!dateTime) return '';
  const days = Math.abs(getDaysUntil(dateTime));
  if (days === 0) return 'Overdue today';
  if (days === 1) return 'Overdue 1 day';
  return `Overdue ${days} days`;
};
