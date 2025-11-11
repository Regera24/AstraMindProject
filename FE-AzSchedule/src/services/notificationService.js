import axiosInstance from '../lib/axios';

/**
 * Create a notification
 * @param {Object} notificationData - { title, content, targetAccountId }
 * @returns {Promise} Created notification
 */
export const createNotification = async (notificationData) => {
  const response = await axiosInstance.post('/notifications', notificationData);
  return response.data;
};

/**
 * Mark notification as read
 * @param {number} id - Notification ID
 * @returns {Promise} Update response
 */
export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.put(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Delete a notification
 * @param {number} id - Notification ID
 * @returns {Promise} Delete response
 */
export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Get all notifications with pagination
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated notifications
 */
export const getNotifications = async (params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.get('/notifications', {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get unread notifications
 * @returns {Promise} Unread notifications
 */
export const getUnreadNotifications = async () => {
  const response = await axiosInstance.get('/notifications/unread');
  return response.data;
};

/**
 * Count unread notifications
 * @returns {Promise} Unread count
 */
export const countUnreadNotifications = async () => {
  const response = await axiosInstance.get('/notifications/unread/count');
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise} Response
 */
export const markAllAsRead = async () => {
  const response = await axiosInstance.put('/notifications/mark-all-read');
  return response.data;
};
