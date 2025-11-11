import axiosInstance from '../lib/axios';

/**
 * Login user
 * @param {Object} credentials - { username, password }
 * @returns {Promise} AuthenticationResponse with token
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  if (response.data.data.token) {
    localStorage.setItem('accessToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

/**
 * Register new account
 * @param {Object} accountData - { username, fullName, password, email, phoneNumber, role, avatar?, birthDate?, gender? }
 * @returns {Promise} AccountCreationResponse
 */
export const register = async (accountData) => {
  const response = await axiosInstance.post('/auth/register', accountData);
  return response.data;
};

/**
 * Refresh access token
 * @returns {Promise} New access token
 */
export const refreshToken = async () => {
  const response = await axiosInstance.post('/auth/refresh-token');
  if (response.data.data.token) {
    localStorage.setItem('accessToken', response.data.data.token);
  }
  return response.data;
};

/**
 * Introspect token
 * @param {string} token - JWT token to introspect
 * @returns {Promise} Token validation response
 */
export const introspectToken = async (token) => {
  const response = await axiosInstance.post('/auth/introspect', { token });
  return response.data;
};

/**
 * Check unique information (username, email, phoneNumber)
 * @param {Object} data - { username?, email?, phoneNumber? }
 * @returns {Promise} Unique check response
 */
export const checkUnique = async (data) => {
  const response = await axiosInstance.post('/auth/check-unique', data);
  return response.data;
};

/**
 * Send OTP for password reset
 * @param {string} key - Email or phone number
 * @returns {Promise} OTP send response
 */
export const sendOTP = async (key) => {
  const response = await axiosInstance.post(`/auth/send-otp?key=${key}`);
  return response.data;
};

/**
 * Check OTP code
 * @param {Object} data - { key, otp }
 * @returns {Promise<boolean>} OTP validity
 */
export const checkOTP = async (data) => {
  const response = await axiosInstance.post('/auth/check-otp', data);
  return response.data;
};

/**
 * Change password
 * @param {Object} data - { key, otp, newPassword }
 * @returns {Promise} Change password response
 */
export const changePassword = async (data) => {
  const response = await axiosInstance.post('/auth/change-password', data);
  return response.data;
};

/**
 * OAuth2 authentication
 * @param {string} code - Authorization code
 * @returns {Promise} OAuth2 authentication response
 */
export const oauthAuthenticate = async (code) => {
  const response = await axiosInstance.post(`/auth/outbound/authentication?code=${code}`);
  if (response.data.data.token) {
    localStorage.setItem('accessToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};
