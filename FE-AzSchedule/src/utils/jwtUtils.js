/**
 * JWT Utilities for decoding and extracting user information
 * Based on backend JWT structure from JwtService.java
 */

/**
 * Decode JWT token (base64url decode)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    
    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract role from JWT token
 * JWT structure: { sub, iss, scope, accountId, jti, exp }
 * @param {string} token - JWT token
 * @returns {string|null} Role (USER, ADMIN, or null)
 */
export const getRoleFromToken = (token) => {
  const decoded = decodeJWT(token);
  return decoded?.scope || null;
};

/**
 * Extract username from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} Username
 */
export const getUsernameFromToken = (token) => {
  const decoded = decodeJWT(token);
  return decoded?.sub || null;
};

/**
 * Extract account ID from JWT token
 * @param {string} token - JWT token
 * @returns {number|null} Account ID
 */
export const getAccountIdFromToken = (token) => {
  const decoded = decodeJWT(token);
  return decoded?.accountId || null;
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000; // Convert to seconds
  return decoded.exp < currentTime;
};

/**
 * Get full decoded token info
 * @param {string} token - JWT token
 * @returns {Object|null} Full token payload
 */
export const getTokenInfo = (token) => {
  return decodeJWT(token);
};

/**
 * Check if user has specific role
 * @param {string} token - JWT token
 * @param {string} requiredRole - Required role (USER, ADMIN)
 * @returns {boolean} True if user has the role
 */
export const hasRole = (token, requiredRole) => {
  const role = getRoleFromToken(token);
  return role === requiredRole;
};

/**
 * Check if user is admin
 * @param {string} token - JWT token
 * @returns {boolean} True if admin
 */
export const isAdmin = (token) => {
  return hasRole(token, 'ADMIN');
};

/**
 * Check if user is regular user
 * @param {string} token - JWT token
 * @returns {boolean} True if user
 */
export const isUser = (token) => {
  return hasRole(token, 'USER');
};
