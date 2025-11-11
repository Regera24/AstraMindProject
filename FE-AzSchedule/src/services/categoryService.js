import axiosInstance from '../lib/axios';

/**
 * Create a new category
 * @param {Object} categoryData - { name, description?, color? }
 * @returns {Promise} Created category
 */
export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post('/categories', categoryData);
  return response.data;
};

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Update data
 * @returns {Promise} Updated category
 */
export const updateCategory = async (id, categoryData) => {
  const response = await axiosInstance.put(`/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise} Delete response
 */
export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise} Category data
 */
export const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`/categories/${id}`);
  return response.data;
};

/**
 * Get all categories with pagination
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated categories
 */
export const getCategories = async (params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'asc' } = params;
  const response = await axiosInstance.get('/categories', {
    params: { pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};

/**
 * Get all categories without pagination
 * @returns {Promise} All categories
 */
export const getAllCategories = async () => {
  const response = await axiosInstance.get('/categories/all');
  return response.data;
};

/**
 * Search categories
 * @param {string} keyword - Search keyword
 * @param {Object} params - { pageNo?, pageSize?, sortBy?, sortDir? }
 * @returns {Promise} Paginated search results
 */
export const searchCategories = async (keyword, params = {}) => {
  const { pageNo = 0, pageSize = 10, sortBy = 'id', sortDir = 'asc' } = params;
  const response = await axiosInstance.get('/categories/search', {
    params: { keyword, pageNo, pageSize, sortBy, sortDir }
  });
  return response.data;
};
