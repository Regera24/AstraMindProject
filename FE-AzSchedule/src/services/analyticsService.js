import axiosInstance from '../lib/axios';

/**
 * Get task analytics (fast - stats, charts, heatmap)
 * @returns {Promise} Analytics data without AI insights
 */
export const getTaskAnalytics = async () => {
  const response = await axiosInstance.get('/analytics');
  return response.data;
};

/**
 * Get AI-powered insights (slower - loaded separately)
 * @returns {Promise} AI insights and suggestions
 */
export const getAIInsights = async () => {
  const response = await axiosInstance.get('/analytics/ai-insights');
  return response.data;
};
