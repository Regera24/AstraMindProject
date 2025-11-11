import axiosInstance from '../lib/axios';

/**
 * Parse natural language prompt into structured task data
 * @param {string} prompt - Natural language input from user
 * @returns {Promise} Parsed task data
 */
export const parseTaskFromNaturalLanguage = async (prompt) => {
  const response = await axiosInstance.post('/tasks/ai/parse', { prompt });
  return response.data;
};

/**
 * Create a task directly from natural language input
 * @param {string} prompt - Natural language input from user
 * @returns {Promise} Created task
 */
export const createTaskFromNaturalLanguage = async (prompt) => {
  const response = await axiosInstance.post('/tasks/ai/create', { prompt });
  return response.data;
};

/**
 * Parse tasks from an uploaded image
 * @param {File} imageFile - Image file (calendar, schedule, email, etc.)
 * @param {string} context - Optional additional context
 * @returns {Promise} Parsed task information from image
 */
export const parseTasksFromImage = async (imageFile, context = '') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (context && context.trim()) {
    formData.append('context', context);
  }
  
  const response = await axiosInstance.post('/tasks/ai/parse-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Create tasks directly from an uploaded image
 * @param {File} imageFile - Image file
 * @param {string} context - Optional additional context
 * @returns {Promise} Created tasks
 */
export const createTasksFromImage = async (imageFile, context = '') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (context && context.trim()) {
    formData.append('context', context);
  }
  
  const response = await axiosInstance.post('/tasks/ai/create-from-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get AI-powered schedule suggestions for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise} Schedule suggestions with analysis
 */
export const getScheduleSuggestions = async (year, month) => {
  const response = await axiosInstance.get('/tasks/ai/schedule-suggestions', {
    params: { year, month }
  });
  return response.data;
};
