// ============================================
// Common Utilities - MindVerse
// Shared functions, user management, affirmations
// ============================================

// ============================================
// Theme Management (Load on Every Page)
// ============================================

// Load and apply saved theme immediately
(function initializeTheme() {
  const savedTheme = localStorage.getItem('mindverse-theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
})();

// ============================================
// User ID Management
// ============================================

/**
 * Get or create a user ID
 * Uses localStorage to persist user identity across sessions
 * @returns {string} User ID
 */
function getOrCreateUserId() {
  const STORAGE_KEY = 'mindverse_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);
  
  if (!userId) {
    // Generate a random user ID
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(STORAGE_KEY, userId);
    console.log('Created new user ID:', userId);
  }
  
  return userId;
}

// ============================================
// Date & Time Utilities
// ============================================

/**
 * Format a timestamp to a readable date
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a timestamp to just the date (no time)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
function formatDateOnly(timestamp) {
  const date = new Date(timestamp);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get today's date as a string (YYYY-MM-DD format)
 * @returns {string} Today's date
 */
function getTodayDateString() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

/**
 * Get time of day (morning, afternoon, evening)
 * @returns {string} Time of day
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ============================================
// Affirmations & Supportive Messages
// ============================================

const AFFIRMATIONS = [
  "You are doing your best, and that's enough.",
  "Your feelings are valid, and it's okay to not be okay sometimes.",
  "Small steps forward are still progress.",
  "You deserve kindness, especially from yourself.",
  "This moment is temporary. You will get through this.",
  "You are stronger than you think.",
  "It's okay to ask for help when you need it.",
  "Your mental health matters. Taking time for yourself is important.",
  "You've overcome challenges before, and you can do it again.",
  "Be gentle with yourself. Healing takes time.",
  "You are worthy of love and care.",
  "Every breath you take is a step toward calm.",
  "You don't have to be perfect. You just have to be you.",
  "It's okay to take a break and rest.",
  "Your journey is your own. There's no rush.",
  "You're making progress, even when it doesn't feel like it.",
  "Asking for support is a sign of strength, not weakness.",
  "You are not alone in how you feel.",
  "Today is a new opportunity to be kind to yourself.",
  "Your emotions don't define you. They're just passing through.",
  "You have the power to choose how you respond to challenges.",
  "It's okay to have bad days. They don't erase your progress.",
  "You are capable of getting through this.",
  "Your mental wellbeing deserves attention and care.",
  "Small acts of self-care add up to big changes.",
  "You're allowed to prioritize your peace of mind.",
  "Every day you show up for yourself is a victory.",
  "You are more resilient than you realize.",
  "It's brave to keep going even when things are hard.",
  "You deserve to feel calm and at peace."
];

/**
 * Get a random affirmation
 * @returns {string} Random affirmation message
 */
function getRandomAffirmation() {
  const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
  return AFFIRMATIONS[randomIndex];
}

// ============================================
// Navigation Helpers
// ============================================

/**
 * Set active navigation item based on current page
 */
function setActiveNavItem() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      item.classList.add('active');
    }
  });
}

// ============================================
// DOM Helpers
// ============================================

/**
 * Show an element
 * @param {HTMLElement} element - Element to show
 */
function showElement(element) {
  if (element) {
    element.classList.remove('hidden');
    element.classList.add('visible');
  }
}

/**
 * Hide an element
 * @param {HTMLElement} element - Element to hide
 */
function hideElement(element) {
  if (element) {
    element.classList.remove('visible');
    element.classList.add('hidden');
  }
}

/**
 * Create an element with classes and content
 * @param {string} tag - HTML tag name
 * @param {string|string[]} classes - Class name(s) to add
 * @param {string} content - Inner HTML content
 * @returns {HTMLElement} Created element
 */
function createElement(tag, classes = '', content = '') {
  const element = document.createElement(tag);
  if (classes) {
    if (Array.isArray(classes)) {
      element.classList.add(...classes);
    } else {
      element.className = classes;
    }
  }
  if (content) {
    element.innerHTML = content;
  }
  return element;
}

// ============================================
// Toast Notifications
// ============================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove any existing toasts
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = createElement('div', ['toast', `toast-${type}`], message);
  
  // Add toast styles if not already in CSS
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(toast);
  
  // Remove toast after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// Loading State
// ============================================

/**
 * Show loading state on a button
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Whether to show loading state
 */
function setButtonLoading(button, isLoading) {
  if (!button) return;
  
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

// ============================================
// Modal Helpers
// ============================================

/**
 * Open a modal
 * @param {HTMLElement} modal - Modal element
 */
function openModal(modal) {
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close a modal
 * @param {HTMLElement} modal - Modal element
 */
function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ============================================
// Initialization
// ============================================

// Set active nav item when page loads
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavItem();
  
  // Add modal close functionality to all modals
  document.querySelectorAll('.modal').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
});

// ============================================
// Export for use in other scripts
// ============================================

// Make functions available globally
window.MindVerse = {
  getOrCreateUserId,
  formatDate,
  formatDateOnly,
  getTodayDateString,
  getTimeOfDay,
  getRandomAffirmation,
  showElement,
  hideElement,
  createElement,
  showToast,
  setButtonLoading,
  openModal,
  closeModal,
  AFFIRMATIONS
};

console.log('MindVerse common utilities loaded');
