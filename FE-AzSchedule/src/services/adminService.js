import axiosInstance from '../lib/axios';

/**
 * Get system statistics
 * @returns {Promise} System statistics data
 */
export const getSystemStatistics = async () => {
  const response = await axiosInstance.get('/admin/statistics');
  return response.data;
};

/**
 * Get all users with pagination
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @param {string} sortBy - Field to sort by
 * @param {string} sortDirection - Sort direction (ASC/DESC)
 * @returns {Promise} Paginated users data
 */
export const getAllUsers = async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
  const response = await axiosInstance.get('/admin/users', {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};

/**
 * Search users by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise} Search results
 */
export const searchUsers = async (keyword, page = 0, size = 10) => {
  const response = await axiosInstance.get('/admin/users/search', {
    params: { keyword, page, size }
  });
  return response.data;
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise} User data
 */
export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Update user role
 * @param {number} userId - User ID
 * @param {number} roleId - New role ID
 * @returns {Promise} Updated user data
 */
export const updateUserRole = async (userId, roleId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/role`, { roleId });
  return response.data;
};

/**
 * Update user status (active/inactive)
 * @param {number} userId - User ID
 * @param {boolean} isActive - Active status
 * @returns {Promise} Updated user data
 */
export const updateUserStatus = async (userId, isActive) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};

/**
 * Get users with multi-field filtering
 * @param {number} pageNo - Page number (1-based)
 * @param {number} pageSize - Page size
 * @param {string} sortBy - Field to sort by with direction (e.g., "createdAt:desc")
 * @param {Array<string>} searchCriteria - Array of search criteria (e.g., ["username:john", "isActive:true"])
 * @returns {Promise} Filtered users data
 */
export const getUsersWithFilter = async (pageNo = 1, pageSize = 10, sortBy = 'createdAt:desc', searchCriteria = []) => {
  const params = {
    pageNo,
    pageSize,
    sortBy
  };
  
  // Add search criteria as query parameters - Spring Boot expects them as 'searchs' array
  if (searchCriteria.length > 0) {
    searchCriteria.forEach((criteria) => {
      if (!params.searchs) {
        params.searchs = [];
      }
      params.searchs.push(criteria);
    });
  }
  
  const response = await axiosInstance.get('/admin/users-filtered', { 
    params,
    paramsSerializer: {
      indexes: null // This ensures array parameters are sent as searchs=value1&searchs=value2
    }
  });
  return response.data;
};

/**
 * Delete user
 * @param {number} userId - User ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};