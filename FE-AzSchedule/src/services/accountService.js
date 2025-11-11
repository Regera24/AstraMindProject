import axiosInstance from '../lib/axios';

/**
 * Get current account
 * @returns {Promise} Current user's account data
 */
export const getCurrentAccount = async () => {
  const response = await axiosInstance.get('/accounts/me');
  return response.data;
};

/**
 * Get account by ID
 * @param {number} id - Account ID
 * @returns {Promise} Account data
 */
export const getAccountById = async (id) => {
  const response = await axiosInstance.get(`/accounts/${id}`);
  return response.data;
};

/**
 * Update current account
 * @param {Object} data - { fullName?, email?, gender?, birthDate?, phoneNumber?, avatarUrl? }
 * @returns {Promise} Updated account data
 */
export const updateCurrentAccount = async (data) => {
  const response = await axiosInstance.put('/accounts/me', data);
  return response.data;
};

/**
 * Update account by ID (Admin only)
 * @param {number} id - Account ID
 * @param {Object} data - Update data
 * @returns {Promise} Updated account data
 */
export const updateAccountById = async (id, data) => {
  const response = await axiosInstance.put(`/accounts/${id}`, data);
  return response.data;
};
