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
        <div class="card" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); margin-bottom: var(--spacing-sm);">
          <p style="font-size: var(--font-size-base); line-height: 1.6; margin: 0; color: var(--color-text);">
            "${fav.messageText}"
          </p>
          <small style="color: var(--color-text-light); margin-top: var(--spacing-xs); display: block;">
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

console.log('Profile page script loaded');
