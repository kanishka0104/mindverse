// ============================================
// Profile Page - MindVerse
// User preferences, progress stats, favorites
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

const userId = MindVerse.getOrCreateUserId();

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Profile page loaded for user:', userId);
  
  await loadUserInfo();
  setupEventListeners();
  await loadUserPreferences();
  await loadProgressStats();
  await calculateStreak();
  await loadFavoriteAffirmations();
  await loadSafetyPlan();
  await loadProgressCharts();
  await loadMemories();
  await loadProgressRewind(30); // Default to 1 month
  
  // Defer new features to avoid blocking main thread
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initNewFeatures(), { timeout: 2000 });
  } else {
    setTimeout(() => initNewFeatures(), 100);
  }
});

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  document.getElementById('savePreferencesBtn').addEventListener('click', savePreferences);
}

// ============================================
// Load User Preferences
// ============================================

async function loadUserPreferences() {
  try {
    const profile = await FirebaseDB.getDocument('userProfiles', userId);
    
    if (profile) {
      // Set select values
      if (profile.focusArea) {
        document.getElementById('focusArea').value = profile.focusArea;
      }
      if (profile.preferredTimeOfDay) {
        document.getElementById('preferredTime').value = profile.preferredTimeOfDay;
      }
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

// ============================================
// Save Preferences
// ============================================

async function savePreferences() {
  const focusArea = document.getElementById('focusArea').value;
  const preferredTimeOfDay = document.getElementById('preferredTime').value;
  
  if (!focusArea || !preferredTimeOfDay) {
    MindVerse.showToast('Please select both preferences', 'error');
    return;
  }
  
  const btn = document.getElementById('savePreferencesBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    const profileData = {
      focusArea: focusArea,
      preferredTimeOfDay: preferredTimeOfDay,
      updatedAt: Date.now()
    };
    
    await FirebaseDB.setDocument('userProfiles', userId, profileData, true);
    
    MindVerse.showToast('Preferences saved!', 'success');
    
  } catch (error) {
    console.error('Error saving preferences:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

// ============================================
// Load Progress Stats
// ============================================

async function loadProgressStats() {
  try {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Fetch all data types in parallel
    const [moodEntries, journalEntries, breathingSessions, activities] = await Promise.all([
      FirebaseDB.queryDocuments(
        'moodEntries',
        [['userId', '==', userId], ['timestamp', '>', oneWeekAgo]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'journalEntries',
        [['userId', '==', userId], ['timestamp', '>', oneWeekAgo]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'breathingSessions',
        [['userId', '==', userId], ['timestamp', '>', oneWeekAgo]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'activitiesCompleted',
        [['userId', '==', userId], ['timestamp', '>', oneWeekAgo]],
        'timestamp',
        'desc'
      )
    ]);
    
    // Update stat cards
    document.getElementById('statMoodEntries').textContent = moodEntries.length;
    document.getElementById('statJournalEntries').textContent = journalEntries.length;
    document.getElementById('statBreathingSessions').textContent = breathingSessions.length;
    document.getElementById('statActivities').textContent = activities.length;
    
    // Generate weekly activity view
    generateWeeklyActivityView([...moodEntries, ...journalEntries, ...breathingSessions, ...activities]);
    
  } catch (error) {
    console.error('Error loading progress stats:', error);
    document.getElementById('statMoodEntries').textContent = '0';
    document.getElementById('statJournalEntries').textContent = '0';
    document.getElementById('statBreathingSessions').textContent = '0';
    document.getElementById('statActivities').textContent = '0';
  }
}

// ============================================
// Generate Weekly Activity View
// ============================================

function generateWeeklyActivityView(allActivities) {
  const container = document.getElementById('weeklyActivity');
  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create a map of days with activity
  const activityDays = new Set();
  allActivities.forEach(activity => {
    const date = new Date(activity.timestamp);
    date.setHours(0, 0, 0, 0);
    activityDays.add(date.getTime());
  });
  
  // Generate last 7 days
  let html = '';
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayTimestamp = date.getTime();
    const hasActivity = activityDays.has(dayTimestamp);
    const dayName = weekDays[date.getDay()];
    
    html += `
      <div style="
        text-align: center;
        flex: 1;
        min-width: 50px;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${hasActivity ? 'var(--color-primary)' : 'var(--color-border)'};
          color: ${hasActivity ? 'white' : 'var(--color-text-light)'};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-xs);
          font-weight: 600;
        ">
          ${hasActivity ? '✓' : '·'}
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-light);">
          ${dayName}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// ============================================
// Calculate Streak
// ============================================

async function calculateStreak() {
  try {
    // Get all activities sorted by date
    const allActivities = [];
    
    const [moodEntries, journalEntries, breathingSessions, activities] = await Promise.all([
      FirebaseDB.queryDocuments(
        'moodEntries',
        [['userId', '==', userId]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'journalEntries',
        [['userId', '==', userId]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'breathingSessions',
        [['userId', '==', userId]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'activitiesCompleted',
        [['userId', '==', userId]],
        'timestamp',
        'desc'
      )
    ]);
    
    allActivities.push(...moodEntries, ...journalEntries, ...breathingSessions, ...activities);
    
    if (allActivities.length === 0) {
      document.getElementById('streakDays').textContent = '0';
      document.getElementById('streakMessage').textContent = 'Start using the app to build your streak!';
      return;
    }
    
    // Get unique days with activity
    const uniqueDays = new Set();
    allActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      date.setHours(0, 0, 0, 0);
      uniqueDays.add(date.getTime());
    });
    
    // Sort days in descending order
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const yesterdayTimestamp = todayTimestamp - (24 * 60 * 60 * 1000);
    
    // Check if there's activity today or yesterday
    if (sortedDays[0] === todayTimestamp || sortedDays[0] === yesterdayTimestamp) {
      streak = 1;
      let expectedDay = sortedDays[0] - (24 * 60 * 60 * 1000);
      
      // Count consecutive days
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i] === expectedDay) {
          streak++;
          expectedDay -= (24 * 60 * 60 * 1000);
        } else {
          break;
        }
      }
    }
    
    // Update UI
    document.getElementById('streakDays').textContent = streak;
    
    const messages = {
      0: "Start today to begin your streak!",
      1: "Great start! Come back tomorrow to keep it going.",
      2: "Two days in a row! You're building momentum.",
      3: "Three days strong! Keep up the good work.",
      7: "One week streak! You're doing amazing!",
      14: "Two weeks! Your commitment is inspiring.",
      30: "30 days! This is becoming a habit. Well done!",
      default: "You've been consistent! Keep taking care of yourself."
    };
    
    const message = messages[streak] || messages.default;
    document.getElementById('streakMessage').textContent = message;
    
  } catch (error) {
    console.error('Error calculating streak:', error);
    document.getElementById('streakDays').textContent = '0';
    document.getElementById('streakMessage').textContent = 'Unable to calculate streak';
  }
}

// ============================================
// Load Favorite Affirmations
// ============================================

async function loadFavoriteAffirmations() {
  try {
    const favorites = await FirebaseDB.queryDocuments(
      `favorites/${userId}/affirmations`,
      [],
      'timestamp',
      'desc',
      10
    );
    
    const container = document.getElementById('favoritesContainer');
    
    if (favorites.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          No favorite affirmations yet.<br>
          <small>Save affirmations from the home page by clicking the heart button.</small>
        </p>
      `;
      return;
    }
    
    const favoritesHTML = favorites.map(fav => {
      return `
        <div class="card profile-favorite-card" style="margin-bottom: var(--spacing-sm);">
          <p class="profile-favorite-text">
            "${fav.messageText}"
          </p>
          <small class="profile-favorite-date">
            Saved ${MindVerse.formatDate(fav.timestamp)}
          </small>
        </div>
      `;
    }).join('');
    
    container.innerHTML = favoritesHTML;
    
  } catch (error) {
    console.error('Error loading favorites:', error);
    document.getElementById('favoritesContainer').innerHTML = `
      <p class="text-center" style="color: var(--color-text-light);">
        Unable to load favorites. Please check your connection.
      </p>
    `;
  }
}

// ============================================
// Show Data Info Modal
// ============================================

window.showDataInfo = function() {
  document.getElementById('userIdDisplay').textContent = userId;
  const modal = document.getElementById('dataModal');
  MindVerse.openModal(modal);
};

// ============================================
// Load User Info (Name & Email)
// ============================================

async function loadUserInfo() {
  try {
    const user = await FirebaseAuth.getCurrentUser();
    if (user) {
      // Update user name in profile
      const nameElement = document.querySelector('.profile-header h2');
      if (nameElement && user.displayName) {
        nameElement.textContent = user.displayName;
      }
      
      // Display email if available
      const emailElement = document.querySelector('.profile-email');
      if (emailElement && user.email) {
        emailElement.textContent = user.email;
      }
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// ============================================
// Logout Function
// ============================================

window.handleLogout = async function() {
  if (confirm('Are you sure you want to log out?')) {
    await FirebaseAuth.logout();
  }
};

// ============================================
// Personal Safety Plan Functions
// ============================================

// Open Safety Plan Modal
window.openSafetyPlanModal = function() {
  const modal = document.getElementById('safetyPlanModal');
  MindVerse.openModal(modal);
};

// ============================================
// Safety Plan Data Management
// ============================================

// Load Safety Plan
async function loadSafetyPlan() {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    
    if (safetyPlan) {
      // Load Warning Signs
      if (safetyPlan.warningSigns) {
        renderList('warningSignsList', safetyPlan.warningSigns, 'deleteWarningSigns');
      }
      
      // Load Coping Strategies
      if (safetyPlan.copingStrategies) {
        renderList('copingStrategiesList', safetyPlan.copingStrategies, 'deleteCopingStrategy');
      }
      
      // Load Reasons for Living
      if (safetyPlan.reasonsForLiving) {
        renderList('reasonsForLivingList', safetyPlan.reasonsForLiving, 'deleteReasonForLiving');
      }
      
      // Load Support Contacts
      if (safetyPlan.supportContacts) {
        renderContacts('supportContactsList', safetyPlan.supportContacts, 'deleteSupportContact');
      }
      
      // Load Professional Contacts
      if (safetyPlan.professionalContacts) {
        renderContacts('professionalContactsList', safetyPlan.professionalContacts, 'deleteProfessionalContact');
      }
      
      // Load Safe Environment Steps
      if (safetyPlan.safeEnvironmentSteps) {
        renderList('safeEnvironmentList', safetyPlan.safeEnvironmentSteps, 'deleteSafeEnvironmentStep');
      }
    }
  } catch (error) {
    console.error('Error loading safety plan:', error);
  }
}

// Helper function to render list items
function renderList(containerId, items, deleteFunctionName) {
  const container = document.getElementById(containerId);
  if (!items || items.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-light); font-style: italic;">No items added yet</p>';
    return;
  }
  
  container.innerHTML = items.map((item, index) => `
    <div class="safety-item">
      <span>${item}</span>
      <button class="btn-icon-delete" onclick="${deleteFunctionName}(${index})" title="Delete">
        ✕
      </button>
    </div>
  `).join('');
}

// Helper function to render contact cards
function renderContacts(containerId, contacts, deleteFunctionName) {
  const container = document.getElementById(containerId);
  if (!contacts || contacts.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-light); font-style: italic;">No contacts added yet</p>';
    return;
  }
  
  container.innerHTML = contacts.map((contact, index) => `
    <div class="safety-contact-card">
      <div class="safety-contact-info">
        <strong>${contact.name}</strong>
        <a href="tel:${contact.phone}" class="safety-contact-phone">${contact.phone}</a>
      </div>
      <button class="btn-icon-delete" onclick="${deleteFunctionName}(${index})" title="Delete">
        ✕
      </button>
    </div>
  `).join('');
}

// Add Warning Signs
window.addWarningSigns = async function() {
  const input = document.getElementById('warningSignInput');
  const value = input.value.trim();
  
  if (!value) {
    MindVerse.showToast('Please enter a warning sign', 'error');
    return;
  }
  
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId) || {};
    const warningSigns = safetyPlan.warningSigns || [];
    warningSigns.push(value);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { warningSigns }, true);
    
    input.value = '';
    renderList('warningSignsList', warningSigns, 'deleteWarningSigns');
    MindVerse.showToast('Warning sign added', 'success');
  } catch (error) {
    console.error('Error adding warning sign:', error);
    MindVerse.showToast('Failed to add. Please try again.', 'error');
  }
};

// Delete Warning Signs
window.deleteWarningSigns = async function(index) {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    const warningSigns = safetyPlan.warningSigns || [];
    warningSigns.splice(index, 1);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { warningSigns }, true);
    
    renderList('warningSignsList', warningSigns, 'deleteWarningSigns');
    MindVerse.showToast('Warning sign removed', 'success');
  } catch (error) {
    console.error('Error deleting warning sign:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// Add Coping Strategy
window.addCopingStrategy = async function() {
  const input = document.getElementById('copingStrategyInput');
  const value = input.value.trim();
  
  if (!value) {
    MindVerse.showToast('Please enter a coping strategy', 'error');
    return;
  }
  
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId) || {};
    const copingStrategies = safetyPlan.copingStrategies || [];
    copingStrategies.push(value);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { copingStrategies }, true);
    
    input.value = '';
    renderList('copingStrategiesList', copingStrategies, 'deleteCopingStrategy');
    MindVerse.showToast('Coping strategy added', 'success');
  } catch (error) {
    console.error('Error adding coping strategy:', error);
    MindVerse.showToast('Failed to add. Please try again.', 'error');
  }
};

// Delete Coping Strategy
window.deleteCopingStrategy = async function(index) {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    const copingStrategies = safetyPlan.copingStrategies || [];
    copingStrategies.splice(index, 1);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { copingStrategies }, true);
    
    renderList('copingStrategiesList', copingStrategies, 'deleteCopingStrategy');
    MindVerse.showToast('Coping strategy removed', 'success');
  } catch (error) {
    console.error('Error deleting coping strategy:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// Add Reason for Living
window.addReasonForLiving = async function() {
  const input = document.getElementById('reasonForLivingInput');
  const value = input.value.trim();
  
  if (!value) {
    MindVerse.showToast('Please enter a reason', 'error');
    return;
  }
  
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId) || {};
    const reasonsForLiving = safetyPlan.reasonsForLiving || [];
    reasonsForLiving.push(value);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { reasonsForLiving }, true);
    
    input.value = '';
    renderList('reasonsForLivingList', reasonsForLiving, 'deleteReasonForLiving');
    MindVerse.showToast('Reason added', 'success');
  } catch (error) {
    console.error('Error adding reason:', error);
    MindVerse.showToast('Failed to add. Please try again.', 'error');
  }
};

// Delete Reason for Living
window.deleteReasonForLiving = async function(index) {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    const reasonsForLiving = safetyPlan.reasonsForLiving || [];
    reasonsForLiving.splice(index, 1);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { reasonsForLiving }, true);
    
    renderList('reasonsForLivingList', reasonsForLiving, 'deleteReasonForLiving');
    MindVerse.showToast('Reason removed', 'success');
  } catch (error) {
    console.error('Error deleting reason:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// Add Support Contact
window.addSupportContact = async function() {
  const nameInput = document.getElementById('contactNameInput');
  const phoneInput = document.getElementById('contactPhoneInput');
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  
  if (!name || !phone) {
    MindVerse.showToast('Please enter both name and phone number', 'error');
    return;
  }
  
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId) || {};
    const supportContacts = safetyPlan.supportContacts || [];
    supportContacts.push({ name, phone });
    
    await FirebaseDB.setDocument('safetyPlans', userId, { supportContacts }, true);
    
    nameInput.value = '';
    phoneInput.value = '';
    renderContacts('supportContactsList', supportContacts, 'deleteSupportContact');
    MindVerse.showToast('Contact added', 'success');
  } catch (error) {
    console.error('Error adding contact:', error);
    MindVerse.showToast('Failed to add. Please try again.', 'error');
  }
};

// Delete Support Contact
window.deleteSupportContact = async function(index) {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    const supportContacts = safetyPlan.supportContacts || [];
    supportContacts.splice(index, 1);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { supportContacts }, true);
    
    renderContacts('supportContactsList', supportContacts, 'deleteSupportContact');
    MindVerse.showToast('Contact removed', 'success');
  } catch (error) {
    console.error('Error deleting contact:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// Add Professional Contact
window.addProfessionalContact = async function() {
  const nameInput = document.getElementById('professionalNameInput');
  const phoneInput = document.getElementById('professionalPhoneInput');
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  
  if (!name || !phone) {
    MindVerse.showToast('Please enter both name and phone number', 'error');
    return;
  }
  
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId) || {};
    const professionalContacts = safetyPlan.professionalContacts || [];
    professionalContacts.push({ name, phone });
    
    await FirebaseDB.setDocument('safetyPlans', userId, { professionalContacts }, true);
    
    nameInput.value = '';
    phoneInput.value = '';
    renderContacts('professionalContactsList', professionalContacts, 'deleteProfessionalContact');
    MindVerse.showToast('Professional contact added', 'success');
  } catch (error) {
    console.error('Error adding professional contact:', error);
    MindVerse.showToast('Failed to add. Please try again.', 'error');
  }
};

// Delete Professional Contact
window.deleteProfessionalContact = async function(index) {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    const professionalContacts = safetyPlan.professionalContacts || [];
    professionalContacts.splice(index, 1);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { professionalContacts }, true);
    
    renderContacts('professionalContactsList', professionalContacts, 'deleteProfessionalContact');
    MindVerse.showToast('Professional contact removed', 'success');
  } catch (error) {
    console.error('Error deleting professional contact:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// Add Safe Environment Step
window.addSafeEnvironmentStep = async function() {
  const input = document.getElementById('safeEnvironmentInput');
  const value = input.value.trim();
  
  if (!value) {
    MindVerse.showToast('Please enter a safety step', 'error');
    return;
  }
  
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId) || {};
    const safeEnvironmentSteps = safetyPlan.safeEnvironmentSteps || [];
    safeEnvironmentSteps.push(value);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { safeEnvironmentSteps }, true);
    
    input.value = '';
    renderList('safeEnvironmentList', safeEnvironmentSteps, 'deleteSafeEnvironmentStep');
    MindVerse.showToast('Safety step added', 'success');
  } catch (error) {
    console.error('Error adding safety step:', error);
    MindVerse.showToast('Failed to add. Please try again.', 'error');
  }
};

// Delete Safe Environment Step
window.deleteSafeEnvironmentStep = async function(index) {
  try {
    const safetyPlan = await FirebaseDB.getDocument('safetyPlans', userId);
    const safeEnvironmentSteps = safetyPlan.safeEnvironmentSteps || [];
    safeEnvironmentSteps.splice(index, 1);
    
    await FirebaseDB.setDocument('safetyPlans', userId, { safeEnvironmentSteps }, true);
    
    renderList('safeEnvironmentList', safeEnvironmentSteps, 'deleteSafeEnvironmentStep');
    MindVerse.showToast('Safety step removed', 'success');
  } catch (error) {
    console.error('Error deleting safety step:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// ============================================
// Visual Progress Charts
// ============================================

let moodChart, activityChart, sleepChart;
let moodMiniChart = null;

async function loadProgressCharts() {
  try {
    // Wait a bit to ensure Chart.js is fully loaded
    if (typeof Chart === 'undefined') {
      console.log('Chart.js not loaded yet, waiting...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (typeof Chart === 'undefined') {
      console.error('Chart.js failed to load');
      return;
    }
    
    console.log('Chart.js loaded, rendering charts...');
    
    await Promise.all([
      renderMoodTrendChart(),
      renderActivityChart(),
      renderSleepChart()
    ]);
    
    console.log('All charts rendering initiated');
    
  } catch (error) {
    console.error('Error loading charts:', error);
  }
}

// Mood Trend Chart
async function renderMoodTrendChart() {
  try {
    console.log('Rendering mood trend chart...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      document.getElementById('moodTrendChart').parentElement.innerHTML = '<p style="color: var(--color-text-light); text-align: center; padding: var(--spacing-lg);">Chart library loading...</p>';
      return;
    }
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const moodEntries = await FirebaseDB.queryDocuments(
      'moodEntries',
      [['userId', '==', userId], ['timestamp', '>=', thirtyDaysAgo]],
      'timestamp',
      'asc',
      100
    );
    
    console.log('Mood entries found:', moodEntries?.length || 0);
    
    if (!moodEntries || moodEntries.length === 0) {
      const container = document.getElementById('moodTrendChart')?.parentElement;
      if (container) {
        container.innerHTML = '<p style="color: var(--color-text-light); text-align: center; padding: var(--spacing-lg);">No mood data yet. Start tracking your mood on the home page!</p>';
      }
      return;
    }
    
    // Map moods to numeric values
    const moodValues = {
      'awful': 1,
      'low': 2,
      'meh': 3,
      'okay': 4,
      'great': 5
    };
    
    const labels = moodEntries.map(entry => {
      const date = new Date(entry.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = moodEntries.map(entry => moodValues[entry.mood] || 3);
    
    console.log('Mood chart data:', { labels, data });
    
    const ctx = document.getElementById('moodTrendChart');
    if (!ctx) {
      console.error('Canvas element not found for mood chart');
      return;
    }
    
    if (moodChart) {
      moodChart.destroy();
      console.log('Previous mood chart destroyed');
    }
    
    moodChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mood Level',
          data: data,
          borderColor: '#7c9fb0',
          backgroundColor: 'rgba(124, 159, 176, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        animation: {
          duration: 300
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 0,
            max: 6,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                const labels = ['', '😞 Awful', '😔 Low', '😐 Meh', '🙂 Okay', '😊 Great'];
                return labels[value] || '';
              }
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error rendering mood chart:', error);
  }
}

// Activity Chart
async function renderActivityChart() {
  try {
    console.log('Rendering activity chart...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }
    
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const [moodEntries, journalEntries, breathingSessions] = await Promise.all([
      FirebaseDB.queryDocuments('moodEntries', [['userId', '==', userId], ['timestamp', '>=', sevenDaysAgo]]),
      FirebaseDB.queryDocuments('journalEntries', [['userId', '==', userId], ['timestamp', '>=', sevenDaysAgo]]),
      FirebaseDB.queryDocuments('breathingSessions', [['userId', '==', userId], ['timestamp', '>=', sevenDaysAgo]])
    ]);
    
    console.log('Activity counts:', {
      moods: moodEntries?.length || 0,
      journals: journalEntries?.length || 0,
      breathing: breathingSessions?.length || 0
    });
    
    const ctx = document.getElementById('activityChart');
    if (!ctx) {
      console.error('Canvas element not found for activity chart');
      return;
    }
    
    if (activityChart) {
      activityChart.destroy();
      console.log('Previous activity chart destroyed');
    }
    
    activityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mood Check-ins', 'Journal Entries', 'Breathing Sessions'],
        datasets: [{
          label: 'Count',
          data: [
            moodEntries?.length || 0,
            journalEntries?.length || 0,
            breathingSessions?.length || 0
          ],
          backgroundColor: [
            'rgba(124, 159, 176, 0.7)',
            'rgba(212, 165, 165, 0.7)',
            'rgba(159, 184, 155, 0.7)'
          ],
          borderColor: [
            '#7c9fb0',
            '#d4a5a5',
            '#9fb89b'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        animation: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
    
    console.log('Activity chart rendered successfully');
    
  } catch (error) {
    console.error('Error rendering activity chart:', error);
  }
}

// Sleep Chart
async function renderSleepChart() {
  try {
    console.log('Rendering sleep chart...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }
    
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const sleepLogs = await FirebaseDB.queryDocuments(
      'sleepLogs',
      [['userId', '==', userId], ['timestamp', '>=', sevenDaysAgo]],
      'timestamp',
      'asc',
      7
    );
    
    console.log('Sleep logs found:', sleepLogs?.length || 0);
    
    if (!sleepLogs || sleepLogs.length === 0) {
      const container = document.getElementById('sleepChart')?.parentElement;
      if (container) {
        container.innerHTML = '<p style="color: var(--color-text-light); text-align: center; padding: var(--spacing-lg);">No sleep data yet. Start logging your sleep on the home page!</p>';
      }
      return;
    }
    
    const labels = sleepLogs.map(log => {
      const date = new Date(log.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = sleepLogs.map(log => log.duration);
    
    console.log('Sleep chart data:', { labels, data });
    
    const ctx = document.getElementById('sleepChart');
    if (!ctx) {
      console.error('Canvas element not found for sleep chart');
      return;
    }
    
    if (sleepChart) {
      sleepChart.destroy();
      console.log('Previous sleep chart destroyed');
    }
    
    sleepChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Hours',
          data: data,
          backgroundColor: 'rgba(159, 184, 155, 0.7)',
          borderColor: '#9fb89b',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        animation: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              stepSize: 2,
              callback: function(value) {
                return value + 'h';
              }
            }
          }
        }
      }
    });
    
    console.log('Sleep chart rendered successfully');
    
  } catch (error) {
    console.error('Error rendering sleep chart:', error);
  }
}

// ============================================
// Positive Memory Bank
// ============================================

// Open Memory Modal
window.openMemoryModal = function() {
  document.getElementById('memoryTitle').value = '';
  document.getElementById('memoryDescription').value = '';
  document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('memoryImageUrl').value = '';
  
  const modal = document.getElementById('memoryModal');
  MindVerse.openModal(modal);
};

// Save Memory
window.saveMemory = async function() {
  const title = document.getElementById('memoryTitle').value.trim();
  const description = document.getElementById('memoryDescription').value.trim();
  const date = document.getElementById('memoryDate').value;
  const imageUrl = document.getElementById('memoryImageUrl').value.trim();
  
  if (!title || !description) {
    MindVerse.showToast('Please enter both title and description', 'error');
    return;
  }
  
  try {
    const memory = {
      userId: userId,
      title: title,
      description: description,
      date: date || new Date().toISOString().split('T')[0],
      imageUrl: imageUrl,
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('memories', memory);
    
    MindVerse.showToast('Memory saved!', 'success');
    MindVerse.closeModal(document.getElementById('memoryModal'));
    
    await loadMemories();
    
  } catch (error) {
    console.error('Error saving memory:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  }
};

// Load Memories
async function loadMemories() {
  try {
    const memories = await FirebaseDB.queryDocuments(
      'memories',
      [['userId', '==', userId]],
      'timestamp',
      'desc',
      20
    );
    
    const container = document.getElementById('memoriesContainer');
    
    if (!memories || memories.length === 0) {
      container.innerHTML = '<p class="text-center" style="color: var(--color-text-light);">No memories yet. Add your first positive moment!</p>';
      return;
    }
    
    const memoriesHTML = memories.map(memory => {
      return `
        <div class="memory-card">
          ${memory.imageUrl ? `<img src="${memory.imageUrl}" alt="${memory.title}" class="memory-image">` : ''}
          <div class="memory-content">
            <h3 class="memory-title">${memory.title}</h3>
            <p class="memory-date">📅 ${new Date(memory.date).toLocaleDateString()}</p>
            <p class="memory-description">${memory.description}</p>
          </div>
          <button class="btn-icon-delete" onclick="deleteMemory('${memory.id}')" title="Delete Memory">
            ✕
          </button>
        </div>
      `;
    }).join('');
    
    container.innerHTML = memoriesHTML;
    
  } catch (error) {
    console.error('Error loading memories:', error);
    document.getElementById('memoriesContainer').innerHTML = '<p class="text-center" style="color: var(--color-text-light);">Unable to load memories. Please refresh.</p>';
  }
}

// Delete Memory
window.deleteMemory = async function(memoryId) {
  if (!confirm('Are you sure you want to delete this memory?')) {
    return;
  }
  
  try {
    await FirebaseDB.deleteDocument('memories', memoryId);
    MindVerse.showToast('Memory deleted', 'success');
    await loadMemories();
  } catch (error) {
    console.error('Error deleting memory:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};

// ============================================
// Progress Rewind
// ============================================

window.loadProgressRewind = async function(days) {
  // Update button styles
  document.querySelectorAll('.rewind-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const selectedBtn = document.querySelector(`.rewind-btn[data-period="${days}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  }
  
  const container = document.getElementById('progressRewindContainer');
  container.innerHTML = '<p class=\"text-center\" style=\"color: var(--color-text-light);\">Analyzing your progress...</p>';
  
  try {
    const now = Date.now();
    const pastDate = now - (days * 24 * 60 * 60 * 1000);
    const midpoint = pastDate + ((now - pastDate) / 2);
    
    // Fetch data for past period and current period
    const [pastMoods, currentMoods, pastJournals, currentJournals, pastBreathing, currentBreathing, pastSleep, currentSleep] = await Promise.all([
      FirebaseDB.queryDocuments('moodEntries', [['userId', '==', userId], ['timestamp', '>=', pastDate], ['timestamp', '<', midpoint]]),
      FirebaseDB.queryDocuments('moodEntries', [['userId', '==', userId], ['timestamp', '>=', midpoint]]),
      FirebaseDB.queryDocuments('journalEntries', [['userId', '==', userId], ['timestamp', '>=', pastDate], ['timestamp', '<', midpoint]]),
      FirebaseDB.queryDocuments('journalEntries', [['userId', '==', userId], ['timestamp', '>=', midpoint]]),
      FirebaseDB.queryDocuments('breathingSessions', [['userId', '==', userId], ['timestamp', '>=', pastDate], ['timestamp', '<', midpoint]]),
      FirebaseDB.queryDocuments('breathingSessions', [['userId', '==', userId], ['timestamp', '>=', midpoint]]),
      FirebaseDB.queryDocuments('sleepLogs', [['userId', '==', userId], ['timestamp', '>=', pastDate], ['timestamp', '<', midpoint]]),
      FirebaseDB.queryDocuments('sleepLogs', [['userId', '==', userId], ['timestamp', '>=', midpoint]])
    ]);
    
    // Calculate mood averages
    const moodValues = { 'awful': 1, 'low': 2, 'meh': 3, 'okay': 4, 'great': 5 };
    
    const pastMoodAvg = pastMoods?.length > 0 
      ? pastMoods.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / pastMoods.length 
      : 0;
    
    const currentMoodAvg = currentMoods?.length > 0 
      ? currentMoods.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / currentMoods.length 
      : 0;
    
    // Calculate sleep averages
    const pastSleepAvg = pastSleep?.length > 0 
      ? pastSleep.reduce((sum, s) => sum + s.duration, 0) / pastSleep.length 
      : 0;
    
    const currentSleepAvg = currentSleep?.length > 0 
      ? currentSleep.reduce((sum, s) => sum + s.duration, 0) / currentSleep.length 
      : 0;
    
    // Generate insights
    const insights = [];
    
    // Mood insight
    if (currentMoodAvg > pastMoodAvg) {
      const improvement = ((currentMoodAvg - pastMoodAvg) / pastMoodAvg * 100).toFixed(0);
      insights.push({
        emoji: '😊',
        title: 'Mood Improvement',
        message: `Your average mood has improved by ${improvement}%! You're feeling better than before.`,
        type: 'positive'
      });
    } else if (pastMoodAvg > currentMoodAvg && pastMoodAvg > 0) {
      insights.push({
        emoji: '💙',
        title: 'Mood Awareness',
        message: "Your mood has been lower recently. Remember, it's okay to have difficult periods. Keep using your coping tools.",
        type: 'neutral'
      });
    }
    
    // Activity insight
    const pastActivity = (pastJournals?.length || 0) + (pastBreathing?.length || 0);
    const currentActivity = (currentJournals?.length || 0) + (currentBreathing?.length || 0);
    
    if (currentActivity > pastActivity) {
      const increase = currentActivity - pastActivity;
      insights.push({
        emoji: '🎯',
        title: 'More Active',
        message: `You've been ${increase} times more engaged with self-care activities. Keep it up!`,
        type: 'positive'
      });
    }
    
    // Sleep insight
    if (currentSleepAvg > pastSleepAvg && pastSleepAvg > 0) {
      const improvement = (currentSleepAvg - pastSleepAvg).toFixed(1);
      insights.push({
        emoji: '😴',
        title: 'Better Sleep',
        message: `You're sleeping ${improvement} more hours on average. Quality sleep is crucial for mental health!`,
        type: 'positive'
      });
    }
    
    // Consistency insight
    if ((currentJournals?.length || 0) > (pastJournals?.length || 0)) {
      insights.push({
        emoji: '📝',
        title: 'Journaling More',
        message: `You've written ${(currentJournals?.length || 0) - (pastJournals?.length || 0)} more journal entries. Writing helps process emotions!`,
        type: 'positive'
      });
    }
    
    // If no improvements, show encouragement
    if (insights.length === 0) {
      insights.push({
        emoji: '🌱',
        title: 'Keep Growing',
        message: "Progress isn't always linear. Every day you show up for yourself counts. Keep tracking and you'll see patterns emerge.",
        type: 'neutral'
      });
    }
    
    // Render results
    const periodLabel = days === 30 ? '1 month' : days === 90 ? '3 months' : days === 180 ? '6 months' : '1 year';
    
    let html = `
      <div class=\"rewind-header\">
        <h3>Comparing now to ${periodLabel} ago</h3>
      </div>
      
      <div class=\"rewind-stats-grid\">
        <div class=\"rewind-stat-card\">
          <div class=\"rewind-stat-label\">Average Mood</div>
          <div class=\"rewind-stat-comparison\">
            <span class=\"rewind-past\">${pastMoodAvg > 0 ? pastMoodAvg.toFixed(1) : 'N/A'}</span>
            <span class=\"rewind-arrow\">→</span>
            <span class=\"rewind-current ${currentMoodAvg > pastMoodAvg ? 'positive' : ''}\">${currentMoodAvg > 0 ? currentMoodAvg.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        
        <div class=\"rewind-stat-card\">
          <div class=\"rewind-stat-label\">Journal Entries</div>
          <div class=\"rewind-stat-comparison\">
            <span class=\"rewind-past\">${pastJournals?.length || 0}</span>
            <span class=\"rewind-arrow\">→</span>
            <span class=\"rewind-current ${(currentJournals?.length || 0) > (pastJournals?.length || 0) ? 'positive' : ''}\">${currentJournals?.length || 0}</span>
          </div>
        </div>
        
        <div class=\"rewind-stat-card\">
          <div class=\"rewind-stat-label\">Breathing Sessions</div>
          <div class=\"rewind-stat-comparison\">
            <span class=\"rewind-past\">${pastBreathing?.length || 0}</span>
            <span class=\"rewind-arrow\">→</span>
            <span class=\"rewind-current ${(currentBreathing?.length || 0) > (pastBreathing?.length || 0) ? 'positive' : ''}\">${currentBreathing?.length || 0}</span>
          </div>
        </div>
        
        <div class=\"rewind-stat-card\">
          <div class=\"rewind-stat-label\">Avg Sleep Hours</div>
          <div class=\"rewind-stat-comparison\">
            <span class=\"rewind-past\">${pastSleepAvg > 0 ? pastSleepAvg.toFixed(1) : 'N/A'}</span>
            <span class=\"rewind-arrow\">→</span>
            <span class=\"rewind-current ${currentSleepAvg > pastSleepAvg ? 'positive' : ''}\">${currentSleepAvg > 0 ? currentSleepAvg.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div class=\"rewind-insights\">
        <h3 style=\"margin-bottom: var(--spacing-md);\">✨ Key Insights</h3>
        ${insights.map(insight => `
          <div class=\"rewind-insight-card ${insight.type}\">
            <div class=\"rewind-insight-emoji\">${insight.emoji}</div>
            <div class=\"rewind-insight-content\">
              <h4>${insight.title}</h4>
              <p>${insight.message}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading progress rewind:', error);
    container.innerHTML = '<p class=\"text-center\" style=\"color: var(--color-text-light);\">Unable to load progress comparison. Please try again.</p>';
  }
};

// ============================================
// NEW FEATURES: Mood Tracker, Habits, Reminders
// ============================================

// Initialize new features
async function initNewFeatures() {
  try {
    // Load all features in parallel for better performance
    await Promise.all([
      loadDailyCheckIn(),
      loadMoodInsights(),
      loadHabits(),
      initializeReminders()
    ]);
  } catch (error) {
    console.error('Error initializing new features:', error);
  }
}

// ============================================
// Daily Check-In Functions
// ============================================

async function loadDailyCheckIn() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + (24 * 60 * 60 * 1000);

    // Get today's data
    const [moodToday, habitsToday, activitiesToday] = await Promise.all([
      FirebaseDB.queryDocuments(
        'moodEntries',
        [['userId', '==', userId], ['timestamp', '>', todayStart], ['timestamp', '<', todayEnd]],
        'timestamp',
        'desc',
        1
      ),
      FirebaseDB.queryDocuments(
        'habitCompletions',
        [['userId', '==', userId], ['date', '==', todayStart]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'activitiesCompleted',
        [['userId', '==', userId], ['timestamp', '>', todayStart], ['timestamp', '<', todayEnd]],
        'timestamp',
        'desc'
      )
    ]);

    // Get total habits count
    const allHabits = await FirebaseDB.queryDocuments(
      'habits',
      [['userId', '==', userId], ['isActive', '==', true]],
      'createdAt',
      'asc'
    );

    // Update today's summary
    if (moodToday && moodToday.length > 0) {
      const moodEmojis = { 1: '😢', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };
      const moodEl = document.getElementById('todayMood');
      if (moodEl) moodEl.textContent = moodEmojis[moodToday[0].mood] || 'Not logged';
    }

    const habitsEl = document.getElementById('todayHabits');
    const activitiesEl = document.getElementById('todayActivities');
    if (habitsEl) habitsEl.textContent = `${habitsToday.length}/${allHabits.length}`;
    if (activitiesEl) activitiesEl.textContent = activitiesToday.length;

    // Generate suggestions
    generateDailySuggestions(moodToday, habitsToday, activitiesToday, allHabits);
  } catch (error) {
    console.error('Error loading daily check-in:', error);
  }
}

function generateDailySuggestions(moodToday, habitsToday, activitiesToday, allHabits) {
  const suggestions = [];

  // If low mood
  if (moodToday.length > 0 && moodToday[0].mood <= 2) {
    suggestions.push({
      icon: '🫁',
      text: 'Your mood seems low. Try 5 minutes of breathing exercises to calm your mind'
    });
    suggestions.push({
      icon: '🚶',
      text: 'A short walk outside can help improve your mood'
    });
  }

  // If no mood logged
  if (moodToday.length === 0) {
    suggestions.push({
      icon: '😊',
      text: 'Log your mood to help track patterns and get personalized insights'
    });
  }

  // If habits incomplete
  if (habitsToday.length < allHabits.length) {
    const remaining = allHabits.length - habitsToday.length;
    suggestions.push({
      icon: '✅',
      text: `You have ${remaining} habit${remaining > 1 ? 's' : ''} left to complete today`
    });
  }

  // If no activities
  if (activitiesToday.length === 0) {
    suggestions.push({
      icon: '✨',
      text: 'Try doing one pleasant activity today to boost your wellbeing'
    });
  }

  // Always include a positive suggestion
  suggestions.push({
    icon: '🌟',
    text: 'Remember: small steps lead to big changes. You\'re doing great!'
  });

  // Display top 3 suggestions - batch DOM update
  const suggestionsEl = document.getElementById('suggestionsList');
  if (suggestionsEl) {
    const display = suggestions.slice(0, 3).map(s => `
      <div class="suggestion-item">
        <span class="suggestion-icon">${s.icon}</span>
        <span class="suggestion-text">${s.text}</span>
      </div>
    `).join('');
    requestAnimationFrame(() => {
      suggestionsEl.innerHTML = display;
    });
  }
}

// ============================================
// Mood Insights Functions
// ============================================

async function loadMoodInsights() {
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    const [recentMoods, allMoods, activities] = await Promise.all([
      FirebaseDB.queryDocuments(
        'moodEntries',
        [['userId', '==', userId], ['timestamp', '>', sevenDaysAgo]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'moodEntries',
        [['userId', '==', userId], ['timestamp', '>', thirtyDaysAgo]],
        'timestamp',
        'desc'
      ),
      FirebaseDB.queryDocuments(
        'activitiesCompleted',
        [['userId', '==', userId], ['timestamp', '>', sevenDaysAgo]],
        'timestamp',
        'desc'
      )
    ]);

    if (recentMoods.length === 0) {
      if (document.getElementById('avgMood')) document.getElementById('avgMood').textContent = '-';
      if (document.getElementById('moodTrend')) document.getElementById('moodTrend').textContent = '-';
      if (document.getElementById('bestMoodDay')) document.getElementById('bestMoodDay').textContent = '-';
      return;
    }

    // Calculate average mood
    const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
    if (document.getElementById('avgMood')) {
      document.getElementById('avgMood').textContent = avgMood.toFixed(1) + '/5';
    }

    // Calculate trend
    const firstHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
    const secondHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, m) => sum + m.mood, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, m) => sum + m.mood, 0) / secondHalf.length : 0;
    
    if (document.getElementById('moodTrend')) {
      if (secondAvg > firstAvg + 0.3) {
        document.getElementById('moodTrend').innerHTML = '📈 Improving';
      } else if (secondAvg < firstAvg - 0.3) {
        document.getElementById('moodTrend').innerHTML = '📉 Declining';
      } else {
        document.getElementById('moodTrend').textContent = '➡️ Stable';
      }
    }

    // Find best mood day
    const bestDay = recentMoods.reduce((best, current) => 
      current.mood > best.mood ? current : best
    );
    const date = new Date(bestDay.timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (document.getElementById('bestMoodDay')) {
      document.getElementById('bestMoodDay').textContent = days[date.getDay()];
    }

    // Generate patterns
    generateMoodPatterns(recentMoods, activities);

    // Draw mini chart
    if (typeof Chart !== 'undefined') {
      drawMoodMiniChart(allMoods);
    }
  } catch (error) {
    console.error('Error loading mood insights:', error);
  }
}

function generateMoodPatterns(moods, activities) {
  const patterns = [];

  // Activity correlation
  const daysWithActivities = new Set();
  activities.forEach(a => {
    const date = new Date(a.timestamp);
    date.setHours(0, 0, 0, 0);
    daysWithActivities.add(date.getTime());
  });

  const moodsWithActivity = moods.filter(m => {
    const date = new Date(m.timestamp);
    date.setHours(0, 0, 0, 0);
    return daysWithActivities.has(date.getTime());
  });

  if (moodsWithActivity.length > 2) {
    const avgWithActivity = moodsWithActivity.reduce((sum, m) => sum + m.mood, 0) / moodsWithActivity.length;
    const avgOverall = moods.reduce((sum, m) => sum + m.mood, 0) / moods.length;
    
    if (avgWithActivity > avgOverall + 0.3) {
      patterns.push('You tend to feel better on days when you complete activities 🎯');
    }
  }

  // Day of week pattern
  const dayAverages = {};
  moods.forEach(m => {
    const day = new Date(m.timestamp).getDay();
    if (!dayAverages[day]) dayAverages[day] = [];
    dayAverages[day].push(m.mood);
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = -1;
  let bestAvg = 0;
  Object.keys(dayAverages).forEach(day => {
    const avg = dayAverages[day].reduce((sum, m) => sum + m, 0) / dayAverages[day].length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = parseInt(day);
    }
  });

  if (bestDay >= 0) {
    patterns.push(`${days[bestDay]}s tend to be your best days 📅`);
  }

  // Display patterns
  const patternsDisplay = document.getElementById('patternsList');
  if (patternsDisplay) {
    if (patterns.length > 0) {
      patternsDisplay.innerHTML = patterns.map(p => `<p style="margin: 0.5rem 0;">• ${p}</p>`).join('');
    } else {
      patternsDisplay.innerHTML = '<p>Keep tracking to discover your patterns!</p>';
    }
  }
}

function drawMoodMiniChart(moods) {
  const canvas = document.getElementById('moodMiniChart');
  if (!canvas) return;
  
  if (typeof Chart === 'undefined') {
    canvas.insertAdjacentHTML('beforebegin', '<p style="text-align: center; color: var(--color-text-light);">Loading chart...</p>');
    return;
  }
  
  // Destroy existing chart to prevent memory leaks and performance issues
  if (moodMiniChart) {
    moodMiniChart.destroy();
    moodMiniChart = null;
  }
  
  const ctx = canvas.getContext('2d');

  // Prepare data for last 30 days
  const labels = [];
  const data = [];
  const today = new Date();
  let hasData = false;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    const dayMoods = moods.filter(m => {
      const moodDate = new Date(m.timestamp);
      moodDate.setHours(0, 0, 0, 0);
      return moodDate.getTime() === date.getTime();
    });
    
    if (dayMoods.length > 0) {
      const avg = dayMoods.reduce((sum, m) => sum + m.mood, 0) / dayMoods.length;
      data.push(avg);
      hasData = true;
    } else {
      data.push(null);
    }
  }

  // Show message if no data
  if (!hasData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px var(--font-primary)';
    ctx.fillStyle = 'var(--color-text-light)';
    ctx.textAlign = 'center';
    ctx.fillText('No mood data yet. Start logging your mood to see trends!', canvas.width / 2, canvas.height / 2);
    return;
  }

  moodMiniChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood',
        data: data,
        borderColor: 'rgb(108, 92, 231)',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        tension: 0.4,
        spanGaps: true,
        pointRadius: 2,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: { 
            stepSize: 1,
            maxTicksLimit: 6
          }
        },
        x: {
          display: true,
          ticks: { 
            maxTicksLimit: 6,
            maxRotation: 0,
            autoSkip: true
          }
        }
      },
      elements: {
        line: {
          borderWidth: 2
        }
      }
    }
  });
}

window.quickLogMood = async function(moodValue) {
  try {
    const moodData = {
      userId: userId,
      mood: moodValue,
      timestamp: Date.now()
    };

    await FirebaseDB.addDocument('moodEntries', moodData);
    MindVerse.showToast('Mood logged! 😊', 'success');
    
    // Reload insights
    await loadMoodInsights();
    await loadDailyCheckIn();
  } catch (error) {
    console.error('Error logging mood:', error);
    MindVerse.showToast('Failed to log mood', 'error');
  }
};

// ============================================
// Habit Tracker Functions
// ============================================

async function loadHabits() {
  try {
    const habits = await FirebaseDB.queryDocuments(
      'habits',
      [['userId', '==', userId], ['isActive', '==', true]],
      'createdAt',
      'asc'
    );

    const habitsList = document.getElementById('todayHabitsList');
    if (!habitsList) return;

    if (habits.length === 0) {
      habitsList.innerHTML = '<p style="color: var(--color-text-light); text-align: center;">No habits added yet. Create your first habit above!</p>';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Get today's completions
    const completions = await FirebaseDB.queryDocuments(
      'habitCompletions',
      [['userId', '==', userId], ['date', '==', todayTimestamp]],
      'timestamp',
      'desc'
    );

    const completedHabitIds = new Set(completions.map(c => c.habitId));

    // Render habits
    const habitsHTML = habits.map(habit => {
      const isCompleted = completedHabitIds.has(habit.id);
      return `
        <div class="habit-item ${isCompleted ? 'completed' : ''}">
          <div class="habit-checkbox" onclick="toggleHabit('${habit.id}', ${!isCompleted})">
            ${isCompleted ? '✓' : ''}
          </div>
          <div class="habit-info">
            <span class="habit-name">${habit.name}</span>
            <span class="habit-streak">🔥 ${habit.currentStreak || 0} days</span>
          </div>
          <button class="btn-icon-delete" onclick="deleteHabit('${habit.id}')" title="Delete habit">✕</button>
        </div>
      `;
    }).join('');

    // Batch DOM update
    requestAnimationFrame(() => {
      habitsList.innerHTML = habitsHTML;
    });

    // Load habit streaks
    loadHabitStreaks(habits);
  } catch (error) {
    console.error('Error loading habits:', error);
  }
}

window.addNewHabit = async function() {
  const input = document.getElementById('newHabitInput');
  const habitName = input.value.trim();

  if (!habitName) {
    MindVerse.showToast('Please enter a habit name', 'error');
    return;
  }

  try {
    const habitData = {
      userId: userId,
      name: habitName,
      isActive: true,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: Date.now()
    };

    await FirebaseDB.addDocument('habits', habitData);
    input.value = '';
    MindVerse.showToast('Habit added! ✅', 'success');
    await loadHabits();
    await loadDailyCheckIn();
  } catch (error) {
    console.error('Error adding habit:', error);
    MindVerse.showToast('Failed to add habit', 'error');
  }
};

window.toggleHabit = async function(habitId, complete) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    if (complete) {
      // Mark as complete
      await FirebaseDB.addDocument('habitCompletions', {
        userId: userId,
        habitId: habitId,
        date: todayTimestamp,
        timestamp: Date.now()
      });

      // Update streak
      await updateHabitStreak(habitId);
      MindVerse.showToast('Great job! 🎉', 'success');
    } else {
      // Remove completion
      const completions = await FirebaseDB.queryDocuments(
        'habitCompletions',
        [['userId', '==', userId], ['habitId', '==', habitId], ['date', '==', todayTimestamp]],
        'timestamp',
        'desc'
      );

      if (completions.length > 0) {
        await FirebaseDB.deleteDocument('habitCompletions', completions[0].id);
        await updateHabitStreak(habitId);
      }
    }

    await loadHabits();
    await loadDailyCheckIn();
  } catch (error) {
    console.error('Error toggling habit:', error);
    MindVerse.showToast('Failed to update habit', 'error');
  }
};

async function updateHabitStreak(habitId) {
  try {
    // Get all completions for this habit
    const completions = await FirebaseDB.queryDocuments(
      'habitCompletions',
      [['userId', '==', userId], ['habitId', '==', habitId]],
      'date',
      'desc'
    );

    if (completions.length === 0) {
      await FirebaseDB.updateDocument('habits', habitId, { currentStreak: 0 });
      return;
    }

    // Calculate current streak
    const uniqueDates = [...new Set(completions.map(c => c.date))].sort((a, b) => b - a);
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expectedDate = today.getTime();

    for (const date of uniqueDates) {
      if (date === expectedDate || date === expectedDate - (24 * 60 * 60 * 1000)) {
        streak++;
        expectedDate = date - (24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Get current habit data
    const habit = await FirebaseDB.getDocument('habits', habitId);
    const longestStreak = Math.max(habit.longestStreak || 0, streak);

    await FirebaseDB.updateDocument('habits', habitId, {
      currentStreak: streak,
      longestStreak: longestStreak
    });
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

window.deleteHabit = async function(habitId) {
  if (!confirm('Are you sure you want to delete this habit?')) return;

  try {
    await FirebaseDB.updateDocument('habits', habitId, { isActive: false });
    MindVerse.showToast('Habit deleted', 'success');
    await loadHabits();
    await loadDailyCheckIn();
  } catch (error) {
    console.error('Error deleting habit:', error);
    MindVerse.showToast('Failed to delete habit', 'error');
  }
};

async function loadHabitStreaks(habits) {
  const streaksDisplay = document.getElementById('habitStreaksDisplay');
  if (!streaksDisplay) return;

  const display = habits.filter(h => h.currentStreak > 0).map(h => `
    <div class="streak-card">
      <div class="streak-emoji">🔥</div>
      <div class="streak-info">
        <span class="streak-name">${h.name}</span>
        <span class="streak-count">${h.currentStreak} day streak</span>
      </div>
    </div>
  `).join('');

  streaksDisplay.innerHTML = display || '<p style="color: var(--color-text-light); text-align: center;">Complete habits to start building streaks!</p>';
  
  // Load weekly habit grid
  await loadWeeklyHabitGrid(habits);
}

async function loadWeeklyHabitGrid(habits) {
  const gridContainer = document.getElementById('weeklyHabitGrid');
  if (!gridContainer) return;

  if (habits.length === 0) {
    gridContainer.innerHTML = '<p style="color: var(--color-text-light); text-align: center;">Add habits to see your weekly progress!</p>';
    return;
  }

  // Get the current week (Sunday to Saturday)
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDay);
  weekStart.setHours(0, 0, 0, 0);

  // Create array of 7 days
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    days.push({
      date: date,
      dayName: dayNames[i],
      dayNumber: date.getDate(),
      timestamp: date.getTime(),
      isToday: date.toDateString() === today.toDateString()
    });
  }

  // Get all completions for this week
  const weekStartTimestamp = weekStart.getTime();
  const weekEndTimestamp = weekStartTimestamp + (7 * 24 * 60 * 60 * 1000);

  const completions = await FirebaseDB.queryDocuments(
    'habitCompletions',
    [
      ['userId', '==', userId],
      ['date', '>=', weekStartTimestamp],
      ['date', '<', weekEndTimestamp]
    ],
    'date',
    'asc'
  );

  // Create a map of completions by habitId and date
  const completionMap = {};
  completions.forEach(c => {
    const key = `${c.habitId}_${c.date}`;
    completionMap[key] = true;
  });

  // Build the grid HTML
  let html = '<div class="weekly-grid-header">';
  days.forEach(day => {
    html += `
      <div class="week-day-header ${day.isToday ? 'today' : ''}">
        <div class="day-name">${day.dayName}</div>
        <div class="day-number">${day.dayNumber}</div>
      </div>
    `;
  });
  html += '</div>';

  // Add rows for each habit
  habits.forEach(habit => {
    html += `
      <div class="habit-week-row">
        <div class="habit-week-name">${habit.name}</div>
        <div class="habit-week-cells">
    `;
    
    days.forEach(day => {
      const key = `${habit.id}_${day.timestamp}`;
      const isCompleted = completionMap[key] || false;
      const isPast = day.date < today && !day.isToday;
      const isFuture = day.date > today;
      
      html += `
        <div class="habit-week-cell ${isCompleted ? 'completed' : ''} ${day.isToday ? 'today' : ''} ${isPast && !isCompleted ? 'missed' : ''} ${isFuture ? 'future' : ''}">
          ${isCompleted ? '✓' : ''}
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });

  gridContainer.innerHTML = html;
}

// ============================================
// Smart Reminders & Notifications
// ============================================

async function initializeReminders() {
  // Check notification permission
  if ('Notification' in window) {
    const permission = Notification.permission;
    
    const statusEl = document.getElementById('notificationStatus');
    const permEl = document.getElementById('notificationPermission');
    
    if (!statusEl || !permEl) return;

    if (permission === 'granted') {
      statusEl.innerHTML = '<span id="statusIcon">✅</span><span id="statusText">Notifications enabled</span>';
      permEl.style.display = 'none';
    } else if (permission === 'denied') {
      statusEl.innerHTML = '<span id="statusIcon">🔕</span><span id="statusText">Notifications blocked. Enable in browser settings.</span>';
      permEl.style.display = 'none';
    } else {
      statusEl.innerHTML = '<span id="statusIcon">🔔</span><span id="statusText">Notifications not enabled</span>';
      permEl.style.display = 'block';
    }
  } else {
    const statusEl = document.getElementById('notificationStatus');
    if (statusEl) {
      statusEl.innerHTML = '<span id="statusIcon">❌</span><span id="statusText">Notifications not supported in this browser</span>';
    }
  }

  // Load reminder preferences
  await loadReminderPreferences();
}

async function loadReminderPreferences() {
  try {
    const prefs = await FirebaseDB.getDocument('reminderPreferences', userId);
    
    if (prefs) {
      const moodToggle = document.getElementById('moodReminderToggle');
      const journalToggle = document.getElementById('journalReminderToggle');
      const breathingToggle = document.getElementById('breathingReminderToggle');
      const habitToggle = document.getElementById('habitReminderToggle');
      const timeInput = document.getElementById('reminderTime');

      if (moodToggle) moodToggle.checked = prefs.moodReminder || false;
      if (journalToggle) journalToggle.checked = prefs.journalReminder || false;
      if (breathingToggle) breathingToggle.checked = prefs.breathingReminder || false;
      if (habitToggle) habitToggle.checked = prefs.habitReminder || false;
      if (timeInput) timeInput.value = prefs.reminderTime || '20:00';
    }
  } catch (error) {
    console.error('Error loading reminder preferences:', error);
  }
}

window.requestNotificationPermission = async function() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      MindVerse.showToast('Notifications enabled! 🔔', 'success');
      await initializeReminders();
    } else {
      MindVerse.showToast('Notification permission denied', 'error');
    }
  }
};

window.toggleReminder = async function(type, enabled) {
  try {
    const prefs = await FirebaseDB.getDocument('reminderPreferences', userId) || {};
    prefs[`${type}Reminder`] = enabled;
    prefs.userId = userId;

    await FirebaseDB.setDocument('reminderPreferences', userId, prefs, true);
    
    if (enabled) {
      MindVerse.showToast(`${type} reminders enabled`, 'success');
    }
  } catch (error) {
    console.error('Error toggling reminder:', error);
  }
};

window.saveReminderTime = async function() {
  const timeInput = document.getElementById('reminderTime');
  if (!timeInput) return;

  const time = timeInput.value;
  
  try {
    const prefs = await FirebaseDB.getDocument('reminderPreferences', userId) || {};
    prefs.reminderTime = time;
    prefs.userId = userId;

    await FirebaseDB.setDocument('reminderPreferences', userId, prefs, true);
    MindVerse.showToast('Reminder time saved', 'success');
  } catch (error) {
    console.error('Error saving reminder time:', error);
  }
};

window.sendTestNotification = function() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('MindVerse', {
      body: 'This is a test notification! 🔔',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🧠</text></svg>'
    });
    MindVerse.showToast('Test notification sent!', 'success');
  } else {
    MindVerse.showToast('Please enable notifications first', 'error');
  }
};
