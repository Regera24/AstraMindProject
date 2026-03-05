/**
 * Notification utilities for i18n support
 */

/**
 * Get translated notification title based on type
 * @param {string} type - Notification type (e.g., 'TASK_CREATED')
 * @param {string} fallbackTitle - Fallback title if translation not found
 * @param {function} t - Translation function from i18next
 * @returns {string} Translated title
 */
export function getNotificationTitle(type, fallbackTitle, t) {
  if (!type) return fallbackTitle || t('notifications.newNotification');
  
  const translationKey = `notifications.types.${type}`;
  const translated = t(translationKey);
  
  // If translation key is returned as-is, use fallback
  if (translated === translationKey) {
    return fallbackTitle || t('notifications.newNotification');
  }
  
  return translated;
}

/**
 * Get translated notification message based on type
 * @param {string} type - Notification type (e.g., 'TASK_CREATED')
 * @param {string} fallbackMessage - Fallback message if translation not found
 * @param {function} t - Translation function from i18next
 * @returns {string} Translated message
 */
export function getNotificationMessage(type, fallbackMessage, t) {
  if (!type) return fallbackMessage || '';
  
  const translationKey = `notifications.messages.${type}`;
  const translated = t(translationKey);
  
  // If translation key is returned as-is, use fallback
  if (translated === translationKey) {
    return fallbackMessage || '';
  }
  
  return translated;
}

/**
 * Get notification icon based on type
 * @param {string} type - Notification type
 * @returns {string} Emoji icon
 */
export function getNotificationIcon(type) {
  const iconMap = {
    TASK_CREATED: '📝',
    TASK_UPDATED: '✏️',
    TASK_DELETED: '🗑️',
    TASK_COMPLETED: '✅',
    TASK_REMINDER: '⏰',
    SYSTEM_ANNOUNCEMENT: '📢',
    PAYMENT_SUCCESS: '💰',
    PAYMENT_FAILED: '💳',
    ACCOUNT_WARNING: '⚠️',
    FEATURE_UPDATE: '🚀',
    AI_SUGGESTION: '🤖',
    DAILY_SUMMARY: '📊',
    WEEKLY_REPORT: '📈'
  };
  
  return iconMap[type] || '🔔';
}

/**
 * Get notification color based on type
 * @param {string} type - Notification type
 * @returns {string} Tailwind color class
 */
export function getNotificationColor(type) {
  const colorMap = {
    TASK_CREATED: 'blue',
    TASK_UPDATED: 'yellow',
    TASK_DELETED: 'red',
    TASK_COMPLETED: 'green',
    TASK_REMINDER: 'purple',
    SYSTEM_ANNOUNCEMENT: 'gray',
    PAYMENT_SUCCESS: 'green',
    PAYMENT_FAILED: 'red',
    ACCOUNT_WARNING: 'orange',
    FEATURE_UPDATE: 'purple',
    AI_SUGGESTION: 'cyan',
    DAILY_SUMMARY: 'purple',
    WEEKLY_REPORT: 'blue'
  };
  
  return colorMap[type] || 'gray';
}

/**
 * Format notification for display with i18n
 * @param {object} notification - Notification object from API
 * @param {function} t - Translation function from i18next
 * @returns {object} Formatted notification with translated content
 */
export function formatNotification(notification, t) {
  return {
    ...notification,
    displayTitle: getNotificationTitle(notification.type, notification.title, t),
    displayMessage: getNotificationMessage(notification.type, notification.message, t),
    icon: getNotificationIcon(notification.type),
    color: getNotificationColor(notification.type)
  };
}
