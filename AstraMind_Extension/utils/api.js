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
    const publicEndpoints = [CONFIG.ENDPOINTS.LOGIN, CONFIG.ENDPOINTS.REFRESH_TOKEN];
    if (token && !publicEndpoints.some(ep => endpoint.includes(ep))) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401 && !endpoint.includes('/auth/refresh-token')) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request
          return this.request(endpoint, options);
        } else {
          throw new Error('Authentication failed');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
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
