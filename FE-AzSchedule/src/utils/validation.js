/**
 * Frontend validation utilities
 * Matches backend validation rules
 * 
 * Note: Pass the t() function from useTranslation to get localized error messages
 */

/**
 * Validate task form data
 * @param {Object} data - Task form data
 * @param {Function} t - Translation function from useTranslation
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateTask = (data, t) => {
  const errors = {};

  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.title = t ? t('validation.required') : 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = t ? t('tasks.taskTitle') + ' ' + t('validation.usernameMinLength') : 'Title must be at least 3 characters';
  } else if (data.title.length > 200) {
    errors.title = t ? t('validation.description.size', { max: 200 }) : 'Title must not exceed 200 characters';
  }

  // Description validation
  if (data.description && data.description.length > 2000) {
    errors.description = t ? t('validation.description.size', { max: 2000 }) : 'Description must not exceed 2000 characters';
  }

  // Date validation
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      errors.endTime = 'End time must be after start time'; // Add to translation files if needed
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
 * @param {Function} t - Translation function from useTranslation
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateCategory = (data, t) => {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = t ? t('validation.required') : 'Name is required';
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
 * @param {Function} t - Translation function from useTranslation
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateRegistration = (data, t) => {
  const errors = {};

  // Username validation
  if (!data.username || data.username.trim() === '') {
    errors.username = t ? t('validation.usernameRequired') : 'Username is required';
  } else if (data.username.length < 3) {
    errors.username = t ? t('validation.usernameMinLength') : 'Username must be at least 3 characters';
  } else if (data.username.length > 50) {
    errors.username = 'Username must not exceed 50 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, underscores and hyphens';
  }

  // Full name validation
  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = t ? t('validation.fullNameRequired') : 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (data.fullName.length > 100) {
    errors.fullName = 'Full name must not exceed 100 characters';
  }

  // Email validation
  if (!data.email || data.email.trim() === '') {
    errors.email = t ? t('validation.emailRequired') : 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = t ? t('validation.emailInvalid') : 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password || data.password === '') {
    errors.password = t ? t('validation.passwordRequired') : 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = t ? t('validation.passwordMinLength') : 'Password must be at least 6 characters';
  } else if (data.password.length > 100) {
    errors.password = 'Password must not exceed 100 characters';
  }

  // Phone number validation
  const phone = data.phoneNumber?.trim();
  if (phone != '' && !/^(03|05|07|08|09)\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
    errors.phoneNumber = t ? t('validation.phoneNumberInvalid') : 'Phone number must start with 03, 05, 07, 08, or 09 and contain 10 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login form data
 * @param {Object} data - Login form data
 * @param {Function} t - Translation function from useTranslation
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateLogin = (data, t) => {
  const errors = {};

  // Username validation
  if (!data.username || data.username.trim() === '') {
    errors.username = t ? t('validation.usernameRequired') : 'Username is required';
  }

  // Password validation
  if (!data.password || data.password === '') {
    errors.password = t ? t('validation.passwordRequired') : 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate account update form data
 * @param {Object} data - Account update form data
 * @param {Function} t - Translation function from useTranslation
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export const validateAccountUpdate = (data, t) => {
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
      errors.email = t ? t('validation.emailInvalid') : 'Please enter a valid email address';
    }
  }

  // Phone number validation (optional but if provided must be valid)
  if (data.phoneNumber !== undefined && data.phoneNumber !== null && data.phoneNumber !== '') {
    if (!/^[0-9]{10,15}$/.test(data.phoneNumber.replace(/[\s-]/g, ''))) {
      errors.phoneNumber = t ? t('validation.phoneNumberInvalid') : 'Phone number must be 10-15 digits';
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
 * @param {Function} t - Translation function from useTranslation
 * @returns {string|Object} - Formatted error message or field errors
 */
export const extractApiErrors = (error, t) => {
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

  return t ? t('error.somethingWentWrong') : 'An unexpected error occurred';
};
