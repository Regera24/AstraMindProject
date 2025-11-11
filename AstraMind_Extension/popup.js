import CONFIG from './config.js';
import api from './utils/api.js';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userNameEl = document.getElementById('user-name');
const streakCount = document.getElementById('streak-count');

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Tasks
const tasksList = document.getElementById('tasks-list');
const refreshTasksBtn = document.getElementById('refresh-tasks-btn');

// Focus Mode
const focusToggle = document.getElementById('focus-toggle');
const blockedWebsitesList = document.getElementById('blocked-websites-list');
const websiteInput = document.getElementById('website-input');
const addWebsiteBtn = document.getElementById('add-website-btn');
const saveFocusSettingsBtn = document.getElementById('save-focus-settings-btn');

// Pomodoro
const timerTime = document.getElementById('timer-time');
const timerLabel = document.getElementById('timer-label');
const timerProgressCircle = document.getElementById('timer-progress-circle');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerPauseBtn = document.getElementById('timer-pause-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const sessionCount = document.getElementById('session-count');

// State
let currentUser = null;
let tasks = [];
let focusSettings = null;
let blockedWebsites = [];

// Initialize
async function init() {
  const token = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.ACCESS_TOKEN]);
  if (token[CONFIG.STORAGE_KEYS.ACCESS_TOKEN]) {
    try {
      const userData = await api.getCurrentUser();
      currentUser = userData.data;
      showMainScreen();
    } catch (error) {
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  loginScreen.classList.remove('hidden');
  mainScreen.classList.add('hidden');
}

function showMainScreen() {
  loginScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  userNameEl.textContent = currentUser?.fullName || currentUser?.username || 'User';
  loadTasks();
  loadFocusSettings();
  loadStreak();
  loadPomodoroState();
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  loginBtn.querySelector('.btn-text').classList.add('hidden');
  loginBtn.querySelector('.spinner').classList.remove('hidden');
  loginError.classList.add('hidden');
  
  try {
    await api.login(username, password);
    const userData = await api.getCurrentUser();
    currentUser = userData.data;
    showMainScreen();
  } catch (error) {
    loginError.textContent = error.message || 'Login failed';
    loginError.classList.remove('hidden');
  } finally {
    loginBtn.querySelector('.btn-text').classList.remove('hidden');
    loginBtn.querySelector('.spinner').classList.add('hidden');
  }
});

logoutBtn.addEventListener('click', async () => {
  await api.logout();
  currentUser = null;
  showLoginScreen();
});

// Tabs
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
  });
});

// Tasks
async function loadTasks() {
  tasksList.innerHTML = '<div class="loading">Loading...</div>';
  try {
    const response = await api.getTasks({ pageNo: 0, pageSize: 20, sortBy: 'id', sortDir: 'desc' });
    tasks = response.data.data || [];
    renderTasks();
  } catch (error) {
    tasksList.innerHTML = '<div class="loading">Failed to load tasks</div>';
  }
}

function renderTasks() {
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="loading">No tasks found</div>';
    return;
  }
  
  tasksList.innerHTML = tasks.map(task => {
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    const formatTime = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };
    
    return `
    <div class="task-item">
      <div class="task-header">
        <div class="task-title">${task.title}</div>
        <div class="task-actions">
          ${task.status !== 'DONE' ? `<button class="mark-done-btn" data-id="${task.id}" title="Mark as Done"><i class="fas fa-check"></i></button>` : ''}
          <button class="delete-task-btn" data-id="${task.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
      
      ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
      
      <div class="task-info">
        ${task.startTime ? `
          <div class="task-info-item">
            <i class="fas fa-clock"></i>
            <span>${formatTime(task.startTime)}</span>
          </div>
        ` : ''}
        
        ${task.endTime ? `
          <div class="task-info-item">
            <i class="fas fa-flag-checkered"></i>
            <span>${formatDate(task.endTime)}</span>
          </div>
        ` : ''}
        
        ${task.categoryName ? `
          <div class="task-info-item">
            <i class="fas fa-folder"></i>
            <span>${task.categoryName}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="task-meta">
        <span class="badge badge-${task.status === 'DONE' ? 'done' : task.status === 'IN_PROGRESS' ? 'progress' : 'todo'}">
          <i class="fas fa-${task.status === 'DONE' ? 'check-circle' : task.status === 'IN_PROGRESS' ? 'spinner' : 'circle'}"></i>
          ${task.status}
        </span>
        ${task.priority ? `<span class="badge badge-priority-${task.priority.toLowerCase()}"><i class="fas fa-flag"></i> ${task.priority}</span>` : ''}
      </div>
    </div>
  `;
  }).join('');
  
  document.querySelectorAll('.mark-done-btn').forEach(btn => {
    btn.addEventListener('click', () => markTaskAsDone(btn.dataset.id));
  });
  
  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteTask(btn.dataset.id));
  });
}

async function markTaskAsDone(taskId) {
  const task = tasks.find(t => t.id == taskId);
  if (!task) return;
  
  try {
    const updateData = {
      title: task.title,
      description: task.description || '',
      status: 'DONE',
      priority: task.priority,
      startTime: task.startTime,
      endTime: task.endTime,
      categoryId: task.categoryId
    };
    await api.updateTask(taskId, updateData);
    await loadTasks();
  } catch (error) {
    alert('Failed to mark task as done');
  }
}

async function deleteTask(taskId) {
  if (!confirm('Delete this task?')) return;
  
  try {
    await api.deleteTask(taskId);
    await loadTasks();
  } catch (error) {
    alert('Failed to delete task');
  }
}

refreshTasksBtn.addEventListener('click', loadTasks);

// Focus Mode
function updateFocusStatusCard() {
  const statusCard = document.getElementById('focus-status-card');
  const statusTitle = document.getElementById('focus-status-title');
  const statusDescription = document.getElementById('focus-status-description');
  
  if (focusToggle.checked) {
    statusCard.classList.add('active');
    statusTitle.textContent = 'Focus Mode Active';
    statusDescription.textContent = `Blocking ${blockedWebsites.length} website${blockedWebsites.length !== 1 ? 's' : ''}`;
  } else {
    statusCard.classList.remove('active');
    statusTitle.textContent = 'Focus Mode Inactive';
    statusDescription.textContent = 'Enable to block distracting websites';
  }
}

focusToggle.addEventListener('change', () => {
  updateFocusStatusCard();
});

async function loadFocusSettings() {
  try {
    const response = await api.getFocusModeSettings();
    focusSettings = response.data || {
      isEnabled: false,
      blockedWebsites: [],
      pomodoroWorkMinutes: 25,
      pomodoroBreakMinutes: 5,
      pomodoroLongBreakMinutes: 15,
      pomodoroSessionsBeforeLongBreak: 4
    };
    
    focusToggle.checked = focusSettings.isEnabled || false;
    blockedWebsites = focusSettings.blockedWebsites || [];
    
    // Update pomodoro settings inputs
    if (document.getElementById('work-minutes')) {
      document.getElementById('work-minutes').value = focusSettings.pomodoroWorkMinutes || 25;
      document.getElementById('break-minutes').value = focusSettings.pomodoroBreakMinutes || 5;
      document.getElementById('long-break-minutes').value = focusSettings.pomodoroLongBreakMinutes || 15;
      document.getElementById('sessions-count').value = focusSettings.pomodoroSessionsBeforeLongBreak || 4;
    }
    
    renderBlockedWebsites();
    updateFocusStatusCard();
    
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.FOCUS_MODE_ENABLED]: focusSettings.isEnabled || false,
      [CONFIG.STORAGE_KEYS.BLOCKED_WEBSITES]: blockedWebsites
    });
  } catch (error) {
    console.error('Failed to load focus settings:', error);
    // Set default values on error
    focusSettings = {
      isEnabled: false,
      blockedWebsites: [],
      pomodoroWorkMinutes: 25,
      pomodoroBreakMinutes: 5,
      pomodoroLongBreakMinutes: 15,
      pomodoroSessionsBeforeLongBreak: 4
    };
    focusToggle.checked = false;
    blockedWebsites = [];
    renderBlockedWebsites();
  }
}

function renderBlockedWebsites() {
  if (blockedWebsites.length === 0) {
    blockedWebsitesList.innerHTML = '';
    updateFocusStatusCard();
    return;
  }
  
  blockedWebsitesList.innerHTML = blockedWebsites.map(site => `
    <div class="tag">
      <span>${site}</span>
      <button class="tag-remove" data-site="${site}">×</button>
    </div>
  `).join('');
  
  document.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      blockedWebsites = blockedWebsites.filter(s => s !== btn.dataset.site);
      renderBlockedWebsites();
      updateFocusStatusCard();
    });
  });
  
  updateFocusStatusCard();
}

function addWebsite() {
  const website = websiteInput.value.trim();
  if (website && !blockedWebsites.includes(website)) {
    blockedWebsites.push(website);
    renderBlockedWebsites();
    websiteInput.value = '';
    websiteInput.focus();
  }
}

addWebsiteBtn.addEventListener('click', addWebsite);

// Allow Enter key to add website
websiteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addWebsite();
  }
});

saveFocusSettingsBtn.addEventListener('click', async () => {
  const saveBtn = saveFocusSettingsBtn;
  const originalText = saveBtn.innerHTML;
  
  try {
    // Show loading
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    const workMinutes = parseInt(document.getElementById('work-minutes')?.value) || 25;
    const breakMinutes = parseInt(document.getElementById('break-minutes')?.value) || 5;
    const longBreakMinutes = parseInt(document.getElementById('long-break-minutes')?.value) || 15;
    const sessionsCount = parseInt(document.getElementById('sessions-count')?.value) || 4;
    
    const settings = {
      isEnabled: focusToggle.checked,
      blockedWebsites: blockedWebsites,
      pomodoroWorkMinutes: workMinutes,
      pomodoroBreakMinutes: breakMinutes,
      pomodoroLongBreakMinutes: longBreakMinutes,
      pomodoroSessionsBeforeLongBreak: sessionsCount
    };
    
    console.log('Saving focus settings:', settings);
    
    await api.updateFocusModeSettings(settings);
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.FOCUS_MODE_ENABLED]: settings.isEnabled,
      [CONFIG.STORAGE_KEYS.BLOCKED_WEBSITES]: blockedWebsites
    });
    
    // Show success
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to save focus settings:', error);
    saveBtn.innerHTML = '<i class="fas fa-times"></i> Failed!';
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }, 2000);
    
    // Show detailed error
    alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
  }
});

// Streak
async function loadStreak() {
  try {
    const response = await api.getStreak();
    streakCount.textContent = response.data?.currentStreak || 0;
  } catch (error) {
    console.error('Failed to load streak:', error);
  }
}

// Pomodoro
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay(state) {
  timerTime.textContent = formatTime(state.timeRemaining);
  timerLabel.textContent = state.isWorkSession ? 'Work Session' : 'Break Time';
  sessionCount.textContent = state.sessionCount;
  
  const totalSeconds = state.isWorkSession 
    ? state.settings.WORK_MINUTES * 60 
    : (state.sessionCount % state.settings.SESSIONS_BEFORE_LONG_BREAK === 0 
        ? state.settings.LONG_BREAK_MINUTES * 60 
        : state.settings.BREAK_MINUTES * 60);
  
  const progress = (state.timeRemaining / totalSeconds) * 565;
  timerProgressCircle.style.strokeDashoffset = 565 - progress;
  
  if (state.isRunning) {
    timerStartBtn.classList.add('hidden');
    timerPauseBtn.classList.remove('hidden');
  } else {
    timerStartBtn.classList.remove('hidden');
    timerPauseBtn.classList.add('hidden');
  }
}

async function loadPomodoroState() {
  chrome.runtime.sendMessage({ type: 'GET_POMODORO_STATE' }, (response) => {
    if (response && response.state) {
      updateTimerDisplay(response.state);
    }
  });
}

timerStartBtn.addEventListener('click', () => {
  const settings = {
    WORK_MINUTES: parseInt(document.getElementById('work-minutes').value),
    BREAK_MINUTES: parseInt(document.getElementById('break-minutes').value),
    LONG_BREAK_MINUTES: parseInt(document.getElementById('long-break-minutes').value),
    SESSIONS_BEFORE_LONG_BREAK: parseInt(document.getElementById('sessions-count').value)
  };
  
  chrome.runtime.sendMessage({ type: 'START_POMODORO', settings }, (response) => {
    if (response && response.state) {
      updateTimerDisplay(response.state);
    }
  });
});

timerPauseBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'PAUSE_POMODORO' }, (response) => {
    if (response && response.state) {
      updateTimerDisplay(response.state);
    }
  });
});

timerResetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET_POMODORO' }, (response) => {
    if (response && response.state) {
      updateTimerDisplay(response.state);
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'POMODORO_UPDATE') {
    updateTimerDisplay(message.state);
  }
});

init();
