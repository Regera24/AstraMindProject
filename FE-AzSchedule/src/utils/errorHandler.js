/**
 * Centralized error handler for API calls
 * Handles network errors, validation errors, and server errors
 */

/**
 * Extract error message from error object
 * @param {Error} error - Error object from API call
 * @param {string} defaultMessage - Default message if no specific message found
 * @returns {string} Error message to display
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  // Network error (no response)
  if (!error.response) {
    if (error.message === 'Network Error') {
      return 'Network error. Please check your internet connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    return 'Cannot connect to server. Please try again later.';
  }

  // Server responded with error
  const { status, data } = error.response;

  // Use backend error message if available
  if (data?.message) {
    return data.message;
  }

  // Fallback messages based on status code
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'Access denied. You do not have permission.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. The resource already exists.';
    case 422:
      return 'Validation error. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return defaultMessage;
  }
};

/**
 * Check if error is network-related
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response || error.message === 'Network Error';
};

/**
 * Check if error is authentication-related
 * @param {Error} error - Error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error is validation-related
 * @param {Error} error - Error object
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 400 || error.response?.status === 422;
};
