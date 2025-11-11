/**
 * Frontend validation utilities
 * Matches backend validation rules
 */

/**
 * Validate task form data
 * @param {Object} data - Task form data
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateTask = (data) => {
  const errors = {};

  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.length > 200) {
    errors.title = 'Title must not exceed 200 characters';
  }

  // Description validation
  if (data.description && data.description.length > 2000) {
    errors.description = 'Description must not exceed 2000 characters';
  }

  // Date validation
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      errors.endTime = 'End time must be after start time';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate category form data
 * @param {Object} data - Category form data
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateCategory = (data) => {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  // Color validation (hex format)
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.color = 'Color must be a valid hex code (e.g., #FF5733)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate registration form data
 * @param {Object} data - Registration form data
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateRegistration = (data) => {
  const errors = {};

  // Username validation
  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (data.username.length > 50) {
    errors.username = 'Username must not exceed 50 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, underscores and hyphens';
  }

  // Full name validation
  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (data.fullName.length > 100) {
    errors.fullName = 'Full name must not exceed 100 characters';
  }

  // Email validation
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password || data.password === '') {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (data.password.length > 100) {
    errors.password = 'Password must not exceed 100 characters';
  }

  // Phone number validation
  if (!data.phoneNumber || data.phoneNumber.trim() === '') {
    errors.phoneNumber = 'Phone number is required';
  } else if (!/^[0-9]{10,15}$/.test(data.phoneNumber.replace(/[\s-]/g, ''))) {
    errors.phoneNumber = 'Phone number must be 10-15 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login form data
 * @param {Object} data - Login form data
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateLogin = (data) => {
  const errors = {};

  // Username validation
  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username is required';
  }

  // Password validation
  if (!data.password || data.password === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate account update form data
 * @param {Object} data - Account update form data
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateAccountUpdate = (data) => {
  const errors = {};

  // Full name validation (optional but if provided must be valid)
  if (data.fullName !== undefined && data.fullName !== null && data.fullName !== '') {
    if (data.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (data.fullName.length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters';
    }
  }

  // Email validation (optional but if provided must be valid)
  if (data.email !== undefined && data.email !== null && data.email !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  // Phone number validation (optional but if provided must be valid)
  if (data.phoneNumber !== undefined && data.phoneNumber !== null && data.phoneNumber !== '') {
    if (!/^[0-9]{10,15}$/.test(data.phoneNumber.replace(/[\s-]/g, ''))) {
      errors.phoneNumber = 'Phone number must be 10-15 digits';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Extract and format error message from API response
 * @param {Error} error - Error object from API
 * @returns {string|Object} - Formatted error message or field errors
 */
export const extractApiErrors = (error) => {
  if (error.response?.data?.message) {
    // Single error message
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    // Field-specific validation errors from backend
    const fieldErrors = {};
    error.response.data.errors.forEach(err => {
      fieldErrors[err.field] = err.message;
    });
    return fieldErrors;
  }

  return 'An unexpected error occurred';
};
