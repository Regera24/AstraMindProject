const CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api/v1',
  
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    
    // Account
    CURRENT_USER: '/accounts/me',
    UPDATE_ACCOUNT: '/accounts/update',
    
    // Tasks
    TASKS: '/tasks',
    TASK_BY_ID: (id) => `/tasks/${id}`,
    TASKS_BY_STATUS: (status) => `/tasks/status/${status}`,
    MARK_TASK_DONE: (id) => `/tasks/${id}`,
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    UNREAD_NOTIFICATIONS: '/notifications/unread',
    MARK_NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
    
    // Focus Mode
    FOCUS_MODE_SETTINGS: '/focus-mode/settings',
    
    // Analytics & Streak
    STREAK: '/streak',
    ANALYTICS: '/analytics'
  },
  
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    USER: 'currentUser',
    FOCUS_MODE_ENABLED: 'focusModeEnabled',
    BLOCKED_WEBSITES: 'blockedWebsites',
    POMODORO_STATE: 'pomodoroState',
    DAILY_TIME_LIMITS: 'dailyTimeLimits',
    URL_TRACKING: 'urlTracking'
  },
  
  POMODORO_DEFAULTS: {
    WORK_MINUTES: 25,
    BREAK_MINUTES: 5,
    LONG_BREAK_MINUTES: 15,
    SESSIONS_BEFORE_LONG_BREAK: 4
  },
  
  COLORS: {
    // Following FE-AzSchedule design system
    PRIMARY: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    SECONDARY: {
      500: '#10b981',
      600: '#059669'
    },
    GRAY: {
      50: '#f8fafc',
      500: '#64748b',
      900: '#0f172a'
    }
  }
};

export default CONFIG;
