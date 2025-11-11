import axiosInstance from '../lib/axios';

/**
 * Get user's streak information
 * @returns {Promise} Streak data including current streak, longest streak, and activity
 */
export const getUserStreak = async () => {
  const response = await axiosInstance.get('/streak');
  return response.data;
};
