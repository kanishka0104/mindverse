/**
 * Study & Productivity Tracker - Shared Utilities
 * Core functions for localStorage management, date handling, and common calculations
 */

// ==================== CONSTANTS ====================
// Storage keys prefixed to prevent conflicts with MindVerse
const STORAGE_KEYS = {
    TASKS: 'mindverse_activity_tracker_tasks',
    TIMERS: 'mindverse_activity_tracker_timers',
    GOALS: 'mindverse_activity_tracker_goals',
    REFLECTIONS: 'mindverse_activity_tracker_reflections',
    STREAK: 'mindverse_activity_tracker_streak',
    THEME: 'mindverse_activity_tracker_theme',
    SETTINGS: 'mindverse_activity_tracker_settings'
};

const TASK_STATUS = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed'
};

const PRIORITY = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low'
};

// Minimum minutes required per day to maintain streak
const MIN_DAILY_MINUTES = 10;

// Break reminder interval (in minutes)
const BREAK_REMINDER_INTERVAL = 25; // Pomodoro-style

// ==================== STORAGE UTILITIES ====================

/**
 * Get data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Data to store
 * @returns {boolean} Success status
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
        return false;
    }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
    }
}

// ==================== DATE UTILITIES ====================

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function getTodayDate() {
    const today = new Date();
    return formatDate(today);
}

/**
 * Format Date object to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date object
 * @param {string} dateStr - Date string
 * @returns {Date} Date object
 */
function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Get date N days ago from today
 * @param {number} days - Number of days to go back
 * @returns {string} Formatted date
 */
function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDate(date);
}

/**
 * Get start of current week (Monday)
 * @returns {string} Formatted date
 */
function getWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return formatDate(monday);
}

/**
 * Get end of current week (Sunday)
 * @returns {string} Formatted date
 */
function getWeekEnd() {
    const weekStart = parseDate(getWeekStart());
    weekStart.setDate(weekStart.getDate() + 6);
    return formatDate(weekStart);
}

/**
 * Get array of dates for current week
 * @returns {Array<string>} Array of date strings
 */
function getCurrentWeekDates() {
    const dates = [];
    const start = parseDate(getWeekStart());
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(formatDate(date));
    }
    return dates;
}

/**
 * Get day name from date string
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Day name
 */
function getDayName(dateStr) {
    const date = parseDate(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Check if two dates are the same
 * @param {string} date1 - First date
 * @param {string} date2 - Second date
 * @returns {boolean} True if dates match
 */
function isSameDate(date1, date2) {
    return date1 === date2;
}

/**
 * Get number of days between two dates
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {number} Number of days
 */
function getDaysBetween(startDate, endDate) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ==================== TASK MANAGEMENT ====================

/**
 * Get all tasks from storage
 * @returns {Array<Object>} Array of task objects
 */
function getAllTasks() {
    return getFromStorage(STORAGE_KEYS.TASKS, []);
}

/**
 * Save tasks to storage
 * @param {Array<Object>} tasks - Array of task objects
 */
function saveTasks(tasks) {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
}

/**
 * Get tasks for a specific date
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Array<Object>} Filtered tasks
 */
function getTasksByDate(date) {
    const tasks = getAllTasks();
    return tasks.filter(task => task.date === date);
}

/**
 * Get tasks for current week
 * @returns {Array<Object>} Filtered tasks
 */
function getWeekTasks() {
    const tasks = getAllTasks();
    const weekDates = getCurrentWeekDates();
    return tasks.filter(task => weekDates.includes(task.date));
}

/**
 * Add new task
 * @param {Object} task - Task object
 * @returns {Object} Created task with ID
 */
function addTask(task) {
    const tasks = getAllTasks();
    const newTask = {
        id: generateId(),
        subject: task.subject || '',
        description: task.description || '',
        estimatedTime: parseInt(task.estimatedTime) || 0,
        actualTime: 0,
        priority: task.priority || PRIORITY.MEDIUM,
        status: task.status || TASK_STATUS.NOT_STARTED,
        date: task.date || getTodayDate(),
        createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

/**
 * Update existing task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Properties to update
 * @returns {Object|null} Updated task or null
 */
function updateTask(taskId, updates) {
    const tasks = getAllTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        saveTasks(tasks);
        return tasks[index];
    }
    return null;
}

/**
 * Delete task
 * @param {string} taskId - Task ID
 * @returns {boolean} Success status
 */
function deleteTask(taskId) {
    const tasks = getAllTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    if (filtered.length < tasks.length) {
        saveTasks(filtered);
        return true;
    }
    return false;
}

/**
 * Get task by ID
 * @param {string} taskId - Task ID
 * @returns {Object|null} Task object or null
 */
function getTaskById(taskId) {
    const tasks = getAllTasks();
    return tasks.find(t => t.id === taskId) || null;
}

// ==================== TIMER MANAGEMENT ====================

/**
 * Get timer state for a task
 * @param {string} taskId - Task ID
 * @returns {Object|null} Timer state
 */
function getTimerState(taskId) {
    const timers = getFromStorage(STORAGE_KEYS.TIMERS, {});
    return timers[taskId] || null;
}

/**
 * Save timer state
 * @param {string} taskId - Task ID
 * @param {Object} timerState - Timer state object
 */
function saveTimerState(taskId, timerState) {
    const timers = getFromStorage(STORAGE_KEYS.TIMERS, {});
    timers[taskId] = timerState;
    saveToStorage(STORAGE_KEYS.TIMERS, timers);
}

/**
 * Delete timer state
 * @param {string} taskId - Task ID
 */
function deleteTimerState(taskId) {
    const timers = getFromStorage(STORAGE_KEYS.TIMERS, {});
    delete timers[taskId];
    saveToStorage(STORAGE_KEYS.TIMERS, timers);
}

// ==================== ANALYTICS & CALCULATIONS ====================

/**
 * Calculate total study time for a date
 * @param {string} date - Date string
 * @returns {number} Total minutes
 */
function getTotalTimeByDate(date) {
    const tasks = getTasksByDate(date);
    return tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
}

/**
 * Calculate daily study score (0-100)
 * @param {string} date - Date string
 * @returns {number} Score
 */
function getDailyScore(date) {
    const tasks = getTasksByDate(date);
    if (tasks.length === 0) return 0;
    
    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const totalTime = getTotalTimeByDate(date);
    
    // Score based on completion rate and time spent
    const completionScore = (completed / tasks.length) * 70;
    const timeScore = Math.min(totalTime / 120, 1) * 30; // Max 30 points for 2+ hours
    
    return Math.round(completionScore + timeScore);
}

/**
 * Get subject-wise time distribution
 * @param {Array<Object>} tasks - Array of tasks
 * @returns {Object} Subject to time mapping
 */
function getSubjectTimeDistribution(tasks) {
    const distribution = {};
    tasks.forEach(task => {
        const subject = task.subject || 'Uncategorized';
        distribution[subject] = (distribution[subject] || 0) + (task.actualTime || 0);
    });
    return distribution;
}

/**
 * Calculate productivity quality (actual vs estimated time ratio)
 * @param {Array<Object>} tasks - Array of tasks
 * @returns {Object} Quality metrics
 */
function getProductivityQuality(tasks) {
    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    if (completedTasks.length === 0) {
        return { ratio: 0, quality: 'No Data' };
    }
    
    let totalEstimated = 0;
    let totalActual = 0;
    
    completedTasks.forEach(task => {
        totalEstimated += task.estimatedTime || 0;
        totalActual += task.actualTime || 0;
    });
    
    if (totalEstimated === 0) {
        return { ratio: 0, quality: 'No Estimates' };
    }
    
    const ratio = totalActual / totalEstimated;
    let quality = 'Good';
    
    if (ratio < 0.8) quality = 'Very Fast';
    else if (ratio < 1) quality = 'Efficient';
    else if (ratio <= 1.2) quality = 'Good';
    else if (ratio <= 1.5) quality = 'Acceptable';
    else quality = 'Needs Improvement';
    
    return { ratio: ratio.toFixed(2), quality };
}

/**
 * Get backlog tasks (incomplete tasks from past dates)
 * @returns {Array<Object>} Backlog tasks
 */
function getBacklogTasks() {
    const tasks = getAllTasks();
    const today = getTodayDate();
    return tasks.filter(task => 
        task.date < today && 
        task.status !== TASK_STATUS.COMPLETED
    );
}

/**
 * Calculate weekly statistics
 * @returns {Object} Weekly stats
 */
function getWeeklyStats() {
    const weekTasks = getWeekTasks();
    const weekDates = getCurrentWeekDates();
    
    const dailyTimes = weekDates.map(date => getTotalTimeByDate(date));
    const totalTime = dailyTimes.reduce((sum, time) => sum + time, 0);
    const avgTime = weekTasks.length > 0 ? totalTime / 7 : 0;
    
    const completed = weekTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const completionRate = weekTasks.length > 0 ? (completed / weekTasks.length) * 100 : 0;
    
    return {
        totalTime: Math.round(totalTime),
        avgTime: Math.round(avgTime),
        completionRate: Math.round(completionRate),
        tasksCompleted: completed,
        totalTasks: weekTasks.length,
        dailyTimes
    };
}

// ==================== STREAK MANAGEMENT ====================

/**
 * Get current streak data
 * @returns {Object} Streak info
 */
function getStreakData() {
    return getFromStorage(STORAGE_KEYS.STREAK, {
        current: 0,
        longest: 0,
        lastStudyDate: null
    });
}

/**
 * Update streak based on today's study time
 */
function updateStreak() {
    const today = getTodayDate();
    const todayTime = getTotalTimeByDate(today);
    const streakData = getStreakData();
    
    if (todayTime >= MIN_DAILY_MINUTES) {
        const yesterday = getDaysAgo(1);
        
        if (streakData.lastStudyDate === yesterday || streakData.lastStudyDate === today) {
            // Continue streak
            if (streakData.lastStudyDate !== today) {
                streakData.current++;
            }
        } else if (streakData.lastStudyDate === null) {
            // First time
            streakData.current = 1;
        } else {
            // Streak broken, restart
            streakData.current = 1;
        }
        
        streakData.lastStudyDate = today;
        
        // Update longest streak
        if (streakData.current > streakData.longest) {
            streakData.longest = streakData.current;
        }
        
        saveToStorage(STORAGE_KEYS.STREAK, streakData);
    }
    
    return streakData;
}

// ==================== GOALS MANAGEMENT ====================

/**
 * Get weekly goals
 * @returns {Object} Goals data
 */
function getWeeklyGoals() {
    const goals = getFromStorage(STORAGE_KEYS.GOALS, {});
    const weekStart = getWeekStart();
    return goals[weekStart] || null;
}

/**
 * Save weekly goals
 * @param {Object} goals - Goals object
 */
function saveWeeklyGoals(goals) {
    const allGoals = getFromStorage(STORAGE_KEYS.GOALS, {});
    const weekStart = getWeekStart();
    allGoals[weekStart] = {
        ...goals,
        weekStart,
        createdAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.GOALS, allGoals);
}

// ==================== REFLECTIONS ====================

/**
 * Get reflection for a date
 * @param {string} date - Date string
 * @returns {Object|null} Reflection data
 */
function getReflection(date) {
    const reflections = getFromStorage(STORAGE_KEYS.REFLECTIONS, {});
    return reflections[date] || null;
}

/**
 * Save daily reflection
 * @param {string} date - Date string
 * @param {Object} reflection - Reflection data
 */
function saveReflection(date, reflection) {
    const reflections = getFromStorage(STORAGE_KEYS.REFLECTIONS, {});
    reflections[date] = {
        ...reflection,
        date,
        createdAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.REFLECTIONS, reflections);
}

// ==================== THEME MANAGEMENT ====================

/**
 * Get current theme
 * @returns {string} Theme name ('light' or 'dark')
 */
function getTheme() {
    return getFromStorage(STORAGE_KEYS.THEME, 'light');
}

/**
 * Save theme preference
 * @param {string} theme - Theme name
 */
function saveTheme(theme) {
    saveToStorage(STORAGE_KEYS.THEME, theme);
    applyTheme(theme);
}

/**
 * Apply theme to document
 * @param {string} theme - Theme name
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Toggle between light and dark theme
 * @returns {string} New theme
 */
function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    saveTheme(newTheme);
    return newTheme;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format minutes to hours and minutes
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time
 */
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format time for timer display (HH:MM:SS)
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time
 */
function formatTimerDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [hours, minutes, secs]
        .map(v => String(v).padStart(2, '0'))
        .join(':');
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.minWidth = '250px';
    toast.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== EXPORT DATA ====================

/**
 * Export data as JSON
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Export data
 */
function exportDataAsJSON(startDate, endDate) {
    const tasks = getAllTasks().filter(task => 
        task.date >= startDate && task.date <= endDate
    );
    
    const reflections = getFromStorage(STORAGE_KEYS.REFLECTIONS, {});
    const filteredReflections = Object.keys(reflections)
        .filter(date => date >= startDate && date <= endDate)
        .reduce((obj, date) => {
            obj[date] = reflections[date];
            return obj;
        }, {});
    
    return {
        exportDate: new Date().toISOString(),
        dateRange: { startDate, endDate },
        tasks,
        reflections: filteredReflections,
        streak: getStreakData(),
        summary: {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
            totalStudyTime: tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0)
        }
    };
}

/**
 * Export data as CSV
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} CSV string
 */
function exportDataAsCSV(startDate, endDate) {
    const tasks = getAllTasks().filter(task => 
        task.date >= startDate && task.date <= endDate
    );
    
    const headers = ['Date', 'Subject', 'Description', 'Status', 'Priority', 'Estimated Time', 'Actual Time'];
    const rows = tasks.map(task => [
        task.date,
        task.subject,
        task.description,
        task.status,
        task.priority,
        task.estimatedTime,
        task.actualTime
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

/**
 * Download file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ==================== INITIALIZATION ====================

/**
 * Initialize theme on page load
 */
function initTheme() {
    const theme = getTheme();
    applyTheme(theme);
}

/**
 * Initialize navigation (set active link)
 */
function initNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Run initialization on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNavigation();
    });
} else {
    initTheme();
    initNavigation();
}
