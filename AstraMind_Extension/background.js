import CONFIG from './config.js';
import api from './utils/api.js';

// Pomodoro timer state
let pomodoroTimer = null;
let pomodoroState = {
  isRunning: false,
  isWorkSession: true,
  sessionCount: 0,
  timeRemaining: CONFIG.POMODORO_DEFAULTS.WORK_MINUTES * 60,
  settings: CONFIG.POMODORO_DEFAULTS
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AstraMind Extension installed');
  
  // Create alarm for checking notifications
  chrome.alarms.create('checkNotifications', { periodInMinutes: 5 });
});

// Intercept navigation to blocked sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only check main frame navigations
  if (details.frameId !== 0) return;
  
  const url = details.url;
  
  // Skip chrome:// and extension pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Check if URL should be blocked
  const result = await chrome.storage.local.get([
    CONFIG.STORAGE_KEYS.FOCUS_MODE_ENABLED,
    CONFIG.STORAGE_KEYS.BLOCKED_WEBSITES
  ]);
  
  const isEnabled = result[CONFIG.STORAGE_KEYS.FOCUS_MODE_ENABLED] || false;
  const blockedSites = result[CONFIG.STORAGE_KEYS.BLOCKED_WEBSITES] || [];
  
  if (isEnabled && blockedSites.length > 0) {
    const isBlocked = blockedSites.some(site => url.includes(site));
    
    if (isBlocked) {
      // Redirect to block page with blocked URL as parameter
      const blockPageUrl = chrome.runtime.getURL('block.html') + '?url=' + encodeURIComponent(url);
      chrome.tabs.update(details.tabId, { url: blockPageUrl });
    }
  }
});

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkNotifications') {
    await checkNotifications();
  } else if (alarm.name === 'pomodoroTick') {
    await handlePomodoroTick();
  }
});

// Check for new notifications
async function checkNotifications() {
  try {
    const response = await api.getUnreadNotifications();
    const notifications = response.data || [];
    
    notifications.forEach(notification => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: notification.title,
        message: notification.message || notification.content,
        priority: 2
      });
    });
  } catch (error) {
    console.error('Failed to check notifications:', error);
  }
}

// Pomodoro timer functions
function startPomodoro(settings) {
  pomodoroState.isRunning = true;
  pomodoroState.settings = settings;
  
  if (pomodoroTimer) {
    chrome.alarms.clear('pomodoroTick');
  }
  
  // Create alarm that fires every second
  chrome.alarms.create('pomodoroTick', { periodInMinutes: 1/60 });
  
  savePomodoroState();
}

function pausePomodoro() {
  pomodoroState.isRunning = false;
  chrome.alarms.clear('pomodoroTick');
  savePomodoroState();
}

function resetPomodoro() {
  pomodoroState.isRunning = false;
  pomodoroState.isWorkSession = true;
  pomodoroState.sessionCount = 0;
  pomodoroState.timeRemaining = pomodoroState.settings.WORK_MINUTES * 60;
  chrome.alarms.clear('pomodoroTick');
  savePomodoroState();
}

async function handlePomodoroTick() {
  if (!pomodoroState.isRunning) return;
  
  pomodoroState.timeRemaining--;
  
  if (pomodoroState.timeRemaining <= 0) {
    // Session finished
    if (pomodoroState.isWorkSession) {
      pomodoroState.sessionCount++;
      
      // Check if it's time for long break
      const isLongBreak = pomodoroState.sessionCount % pomodoroState.settings.SESSIONS_BEFORE_LONG_BREAK === 0;
      
      pomodoroState.isWorkSession = false;
      pomodoroState.timeRemaining = isLongBreak 
        ? pomodoroState.settings.LONG_BREAK_MINUTES * 60
        : pomodoroState.settings.BREAK_MINUTES * 60;
      
      // Notify user
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Work Session Complete!',
        message: isLongBreak 
          ? `Great work! Time for a ${pomodoroState.settings.LONG_BREAK_MINUTES} minute break.`
          : `Time for a ${pomodoroState.settings.BREAK_MINUTES} minute break.`,
        priority: 2
      });
    } else {
      // Break finished
      pomodoroState.isWorkSession = true;
      pomodoroState.timeRemaining = pomodoroState.settings.WORK_MINUTES * 60;
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Break Time Over!',
        message: `Time to get back to work! Starting ${pomodoroState.settings.WORK_MINUTES} minute work session.`,
        priority: 2
      });
    }
  }
  
  savePomodoroState();
  
  // Notify popup to update UI
  try {
    chrome.runtime.sendMessage({
      type: 'POMODORO_UPDATE',
      state: pomodoroState
    });
  } catch (error) {
    // Popup might be closed
  }
}

function savePomodoroState() {
  chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.POMODORO_STATE]: pomodoroState });
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CLOSE_CURRENT_TAB') {
    // Close the tab that sent the message
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
    return true;
  }

  switch (request.type) {
    case 'START_POMODORO':
      startPomodoro(request.settings);
      sendResponse({ success: true, state: pomodoroState });
      break;
      
    case 'PAUSE_POMODORO':
      pausePomodoro();
      sendResponse({ success: true, state: pomodoroState });
      break;
      
    case 'RESET_POMODORO':
      resetPomodoro();
      sendResponse({ success: true, state: pomodoroState });
      break;
      
    case 'GET_POMODORO_STATE':
      sendResponse({ success: true, state: pomodoroState });
      break;
      
    case 'CHECK_BLOCKED_WEBSITE':
      checkBlockedWebsite(message.url, sendResponse);
      return true; // Keep channel open for async response
  }
});

async function checkBlockedWebsite(url, sendResponse) {
  try {
    const result = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.FOCUS_MODE_ENABLED,
      CONFIG.STORAGE_KEYS.BLOCKED_WEBSITES
    ]);
    
    const isEnabled = result[CONFIG.STORAGE_KEYS.FOCUS_MODE_ENABLED] || false;
    const blockedSites = result[CONFIG.STORAGE_KEYS.BLOCKED_WEBSITES] || [];
    
    const isBlocked = isEnabled && blockedSites.some(site => url.includes(site));
    
    sendResponse({ isBlocked });
  } catch (error) {
    sendResponse({ isBlocked: false });
  }
}

// Load pomodoro state on startup
chrome.storage.local.get([CONFIG.STORAGE_KEYS.POMODORO_STATE], (result) => {
  if (result[CONFIG.STORAGE_KEYS.POMODORO_STATE]) {
    pomodoroState = result[CONFIG.STORAGE_KEYS.POMODORO_STATE];
  }
});
