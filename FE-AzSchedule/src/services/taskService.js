import axiosInstance from '../lib/axios';
import dayjs from 'dayjs';

/**
 * Create a new task
 * @param {Object} taskData - { title, description?, startTime?, endTime?, priority?, status, categoryId? }
 * @returns {Promise} Created task
 */
export const createTask = async (taskData) => {
  const response = await axiosInstance.post('/tasks', taskData);
  return response.data;
};

/**
 * Update a task
 * @param {number} id - Task ID
 * @param {Object} taskData - Update data
 * @returns {Promise} Updated task
 */
export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.put(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task
 * @param {number} id - Task ID
 * @returns {Promise} Delete response
 */
export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Get task by ID
 * @param {number} id - Task ID
 * @returns {Promise} Task data
 */
export const getTaskById = async (id) => {
  const response = await axiosInstance.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Get all tasks with pagination
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated tasks
 */
export const getTasks = async (params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.get('/tasks', {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get tasks by status
 * @param {string} status - Task status (TODO, IN_PROGRESS, DONE, PAUSED)
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated tasks
 */
export const getTasksByStatus = async (status, params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.get(`/tasks/status/${status}`, {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get tasks by category
 * @param {number} categoryId - Category ID
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated tasks
 */
export const getTasksByCategory = async (categoryId, params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.get(`/tasks/category/${categoryId}`, {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Search tasks
 * @param {string} keyword - Search keyword
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated search results
 */
export const searchTasks = async (keyword, params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.get('/tasks/search', {
    params: { keyword, pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get tasks by date range
 * @param {string} start - Start date time (ISO format)
 * @param {string} end - End date time (ISO format)
 * @returns {Promise} Tasks in date range
 */
export const getTasksByDateRange = async (start, end) => {
  const response = await axiosInstance.get('/tasks/date-range', {
    params: { start, end }
  });
  return response.data;
};

/**
 * Get task statistics for current user
 * @returns {Promise} Task statistics
 */
export const getTaskStatistics = async () => {
  const response = await axiosInstance.get('/tasks/statistics');
  return response.data;
};

/**
 * Get task statistics for a category
 * @param {number} categoryId - Category ID
 * @returns {Promise} Category task statistics
 */
export const getCategoryTaskStatistics = async (categoryId) => {
  const response = await axiosInstance.get(`/tasks/statistics/category/${categoryId}`);
  return response.data;
};

/**
 * Bulk delete tasks
 * @param {number[]} taskIds - Array of task IDs to delete
 * @returns {Promise} Bulk operation response
 */
export const bulkDeleteTasks = async (taskIds) => {
  const response = await axiosInstance.delete('/tasks/bulk', { data: taskIds });
  return response.data;
};

/**
 * Bulk update task status
 * @param {Object} data - { taskIds: number[], status: string }
 * @returns {Promise} Bulk operation response
 */
export const bulkUpdateTaskStatus = async (data) => {
  const response = await axiosInstance.post('/tasks/bulk/status', data);
  return response.data;
};

/**
 * Get tasks by priority
 * @param {string} priority - Priority level (LOW, MEDIUM, HIGH)
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated tasks
 */
export const getTasksByPriority = async (priority, params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.get(`/tasks/priority/${priority}`, {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get overdue tasks
 * @returns {Promise} List of overdue tasks
 */
export const getOverdueTasks = async () => {
  const response = await axiosInstance.get('/tasks/overdue');
  return response.data;
};

/**
 * Advanced filter tasks
 * @param {Object} filterData - { statuses?, priorities?, categoryIds?, startDateFrom?, startDateTo?, endDateFrom?, endDateTo?, keyword? }
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Filtered paginated tasks
 */
export const advancedFilterTasks = async (filterData, params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const response = await axiosInstance.post('/tasks/filter', filterData, {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get tasks by week
 * @param {Date} weekStart - Week start date
 * @returns {Promise} List of tasks in the week
 */
export const getTasksByWeek = async (weekStart) => {
  // Format date as ISO string for backend
  const weekStartISO = dayjs(weekStart).format('YYYY-MM-DDTHH:mm:ss');
  const response = await axiosInstance.get('/tasks/week', {
    params: { weekStart: weekStartISO }
  });
  return response.data;
};

/**
 * Get tasks by month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise} List of tasks in the month
 */
export const getTasksByMonth = async (year, month) => {
  const response = await axiosInstance.get('/tasks/month', {
    params: { year, month }
  });
  return response.data;
};
