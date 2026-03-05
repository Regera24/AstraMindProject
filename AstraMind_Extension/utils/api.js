import CONFIG from '../config.js';

class APIClient {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
  }

  async getToken() {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.ACCESS_TOKEN]);
    return result[CONFIG.STORAGE_KEYS.ACCESS_TOKEN];
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add token if not a public endpoint
    const publicEndpoints = [CONFIG.ENDPOINTS.LOGIN, CONFIG.ENDPOINTS.REFRESH_TOKEN, CONFIG.ENDPOINTS.OAUTH_AUTHENTICATE];
    if (token && !publicEndpoints.some(ep => endpoint.includes(ep))) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('[API Request]', {
      method: options.method || 'GET',
      url: url,
      hasToken: !!token,
      isPublicEndpoint: publicEndpoints.some(ep => endpoint.includes(ep)),
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined }
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      console.log('[API Response]', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Don't try to refresh token for OAuth endpoint
      if (response.status === 401 && !endpoint.includes('/auth/refresh-token') && !endpoint.includes('/auth/outbound/authentication')) {
        console.log('[API] 401 Unauthorized, attempting token refresh...');
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          console.log('[API] Token refreshed, retrying original request...');
          // Retry original request
          return this.request(endpoint, options);
        } else {
          console.error('[API] Token refresh failed');
          throw new Error('Authentication failed');
        }
      }

      const data = await response.json();
      console.log('[API Response Data]', data);

      if (!response.ok) {
        console.error('[API] Request failed:', data);
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('[API] Request error:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}${CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.data.token;
        await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: newToken });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Auth
  async login(username, password) {
    const data = await this.request(CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: data.data.token,
    });
    
    return data;
  }

  async logout() {
    try {
      await this.request(CONFIG.ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await chrome.storage.local.remove([
        CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
        CONFIG.STORAGE_KEYS.USER,
      ]);
    }
  }

  /**
   * OAuth2 authentication with Google
   * @param {string} code - Authorization code from Google
   * @returns {Promise<Object>} Authentication response with token
   */
  async oauthAuthenticate(code) {
    console.log('[API] OAuth authenticate - code length:', code ? code.length : 0);
    
    // Encode the code properly for URL
    const encodedCode = encodeURIComponent(code);
    const endpoint = `${CONFIG.ENDPOINTS.OAUTH_AUTHENTICATE}?code=${encodedCode}`;
    
    console.log('[API] OAuth authenticate - endpoint:', endpoint.substring(0, 100) + '...');
    console.log('[API] OAuth authenticate - code preview:', code.substring(0, 30) + '...');
    
    try {
      const data = await this.request(endpoint, {
        method: 'POST'
      });
      
      console.log('[API] OAuth authenticate - response received:', data);
      
      if (data.data && data.data.token) {
        console.log('[API] OAuth authenticate - token received, saving to storage');
        await chrome.storage.local.set({
          [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: data.data.token
        });
        console.log('[API] OAuth authenticate - token saved successfully');
      } else {
        console.warn('[API] OAuth authenticate - no token in response:', data);
      }
      
      return data;
    } catch (error) {
      console.error('[API] OAuth authenticate - error:', error);
      console.error('[API] OAuth authenticate - error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getCurrentUser() {
    return this.request(CONFIG.ENDPOINTS.CURRENT_USER);
  }

  // Tasks
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${CONFIG.ENDPOINTS.TASKS}?${queryString}`);
  }

  async createTask(taskData) {
    return this.request(CONFIG.ENDPOINTS.TASKS, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(CONFIG.ENDPOINTS.TASK_BY_ID(taskId), {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return this.request(CONFIG.ENDPOINTS.TASK_BY_ID(taskId), {
      method: 'DELETE',
    });
  }

  // Notifications
  async getUnreadNotifications() {
    return this.request(CONFIG.ENDPOINTS.UNREAD_NOTIFICATIONS);
  }

  async markNotificationRead(notificationId) {
    return this.request(CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {
      method: 'PUT',
    });
  }

  // Focus Mode
  async getFocusModeSettings() {
    return this.request(CONFIG.ENDPOINTS.FOCUS_MODE_SETTINGS);
  }

  async updateFocusModeSettings(settings) {
    return this.request(CONFIG.ENDPOINTS.FOCUS_MODE_SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Streak
  async getStreak() {
    return this.request(CONFIG.ENDPOINTS.STREAK);
  }
}

export default new APIClient();
