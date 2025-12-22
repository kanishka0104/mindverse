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
    
    console.log('Mood trend chart rendered successfully');
    
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

