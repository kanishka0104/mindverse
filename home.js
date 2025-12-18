// ============================================
// Home Page - MindVerse
// Mood check-in, mood history, today's plan
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

let selectedMood = null;
let currentAffirmation = '';
const userId = MindVerse.getOrCreateUserId();

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Home page loaded for user:', userId);
  
  // Set welcome message with time of day
  setWelcomeMessage();
  
  // Load and display affirmation
  loadAffirmation();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load mood history
  await loadMoodHistory();
  
  // Generate today's plan
  await generateTodaysPlan();
});

// ============================================
// Welcome Message
// ============================================

function setWelcomeMessage() {
  const timeOfDay = MindVerse.getTimeOfDay();
  const welcomeEl = document.getElementById('welcomeMessage');
  
  const messages = {
    morning: 'Good morning! How are you feeling today?',
    afternoon: 'Good afternoon! How are you doing?',
    evening: 'Good evening! How has your day been?'
  };
  
  welcomeEl.textContent = messages[timeOfDay] || 'How are you feeling today?';
}

// ============================================
// Affirmations
// ============================================

function loadAffirmation() {
  currentAffirmation = MindVerse.getRandomAffirmation();
  document.getElementById('affirmationText').textContent = currentAffirmation;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Mood selection
  document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', () => selectMood(option));
  });
  
  // Save mood button
  document.getElementById('saveMoodBtn').addEventListener('click', saveMood);
  
  // Affirmation buttons
  document.getElementById('newAffirmationBtn').addEventListener('click', loadAffirmation);
  document.getElementById('favoriteAffirmationBtn').addEventListener('click', saveAffirmationToFavorites);
}

// ============================================
// Mood Selection
// ============================================

function selectMood(option) {
  // Remove selection from all options
  document.querySelectorAll('.mood-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Select clicked option
  option.classList.add('selected');
  selectedMood = option.dataset.mood;
  
  // Show note section
  const noteSection = document.getElementById('moodNoteSection');
  MindVerse.showElement(noteSection);
  noteSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// Save Mood
// ============================================

async function saveMood() {
  if (!selectedMood) {
    MindVerse.showToast('Please select a mood first', 'error');
    return;
  }
  
  const note = document.getElementById('moodNote').value.trim();
  const saveBtn = document.getElementById('saveMoodBtn');
  
  MindVerse.setButtonLoading(saveBtn, true);
  
  try {
    // Save to Firestore
    const moodData = {
      userId: userId,
      mood: selectedMood,
      note: note || '',
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('moodEntries', moodData);
    
    MindVerse.showToast('Mood saved successfully!', 'success');
    
    // Reset form
    document.querySelectorAll('.mood-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    document.getElementById('moodNote').value = '';
    MindVerse.hideElement(document.getElementById('moodNoteSection'));
    selectedMood = null;
    
    // Reload mood history and update plan
    await loadMoodHistory();
    await generateTodaysPlan();
    
  } catch (error) {
    console.error('Error saving mood:', error);
    MindVerse.showToast('Failed to save mood. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(saveBtn, false);
  }
}

// ============================================
// Load Mood History
// ============================================

async function loadMoodHistory() {
  try {
    // Query last 5 mood entries for this user
    const moodEntries = await FirebaseDB.queryDocuments(
      'moodEntries',
      [['userId', '==', userId]],
      'timestamp',
      'desc',
      5
    );
    
    const container = document.getElementById('moodHistoryContainer');
    
    if (moodEntries.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          No mood entries yet. Select your mood above to get started!
        </p>
      `;
      return;
    }
    
    // Display mood history
    const historyHTML = moodEntries.map(entry => {
      const moodEmojis = {
        awful: '😢',
        low: '😔',
        meh: '😐',
        okay: '🙂',
        great: '😊'
      };
      
      return `
        <div class="journal-entry">
          <div class="journal-entry-header">
            <span class="journal-date">${MindVerse.formatDate(entry.timestamp)}</span>
            <span class="mood-dot ${entry.mood}">${moodEmojis[entry.mood]}</span>
          </div>
          ${entry.note ? `<p class="journal-content">${entry.note}</p>` : ''}
        </div>
      `;
    }).join('');
    
    container.innerHTML = historyHTML;
    
  } catch (error) {
    console.error('Error loading mood history:', error);
    document.getElementById('moodHistoryContainer').innerHTML = `
      <p class="text-center" style="color: var(--color-text-light);">
        Unable to load mood history. Please check your connection.
      </p>
    `;
  }
}

// ============================================
// Generate Today's Plan
// ============================================

async function generateTodaysPlan() {
  const container = document.getElementById('todaysPlanContainer');
  
  try {
    // Get user profile to know focus area
    const profile = await FirebaseDB.getDocument('userProfiles', userId);
    const focusArea = profile?.focusArea || 'general';
    
    // Get latest mood entry
    const recentMoods = await FirebaseDB.queryDocuments(
      'moodEntries',
      [['userId', '==', userId]],
      'timestamp',
      'desc',
      1
    );
    
    const latestMood = recentMoods[0]?.mood || 'meh';
    const timeOfDay = MindVerse.getTimeOfDay();
    
    // Generate plan based on focus area, mood, and time of day
    const plan = createPersonalizedPlan(focusArea, latestMood, timeOfDay);
    
    // Display plan
    const planHTML = `
      <p class="mb-md" style="color: var(--color-text-light);">
        Based on your focus on <strong>${getFocusAreaLabel(focusArea)}</strong> 
        and current mood, here's what we suggest:
      </p>
      <div class="activities-grid">
        ${plan.map(item => `
          <div class="activity-card">
            <div class="activity-icon">${item.icon}</div>
            <h4 class="activity-title">${item.title}</h4>
            <p class="activity-description">${item.description}</p>
            <a href="${item.link}" class="btn btn-primary btn-sm">
              ${item.buttonText}
            </a>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = planHTML;
    
  } catch (error) {
    console.error('Error generating plan:', error);
    container.innerHTML = `
      <p class="text-center" style="color: var(--color-text-light);">
        Here are some helpful activities to try today:
      </p>
      <div class="activities-grid">
        <div class="activity-card">
          <div class="activity-icon">🫁</div>
          <h4 class="activity-title">Breathing Exercise</h4>
          <p class="activity-description">Take a few minutes to calm your mind</p>
          <a href="breathe.html" class="btn btn-primary btn-sm">Start Breathing</a>
        </div>
        <div class="activity-card">
          <div class="activity-icon">📔</div>
          <h4 class="activity-title">Journal Entry</h4>
          <p class="activity-description">Write about your thoughts and feelings</p>
          <a href="journal.html" class="btn btn-primary btn-sm">Write Journal</a>
        </div>
        <div class="activity-card">
          <div class="activity-icon">✨</div>
          <h4 class="activity-title">Pleasant Activity</h4>
          <p class="activity-description">Do something that brings you joy</p>
          <a href="activities.html" class="btn btn-primary btn-sm">Try Activity</a>
        </div>
      </div>
    `;
  }
}

// ============================================
// Plan Generation Logic
// ============================================

function createPersonalizedPlan(focusArea, mood, timeOfDay) {
  const plans = [];
  
  // Always suggest breathing if mood is low
  if (['awful', 'low'].includes(mood)) {
    plans.push({
      icon: '🫁',
      title: 'Calming Breathing',
      description: 'Take 3 minutes to center yourself with guided breathing',
      link: 'breathe.html',
      buttonText: 'Start Breathing'
    });
  }
  
  // Focus area specific suggestions
  if (focusArea === 'reduce_anxiety' || ['awful', 'low'].includes(mood)) {
    plans.push({
      icon: '📚',
      title: 'Grounding Technique',
      description: 'Learn the 5-4-3-2-1 method to calm anxiety',
      link: 'learn.html',
      buttonText: 'Learn More'
    });
  }
  
  if (focusArea === 'feel_less_sad' || mood === 'awful') {
    plans.push({
      icon: '✨',
      title: 'Pleasant Activity',
      description: 'Small positive actions can help lift your mood',
      link: 'activities.html',
      buttonText: 'Browse Activities'
    });
  }
  
  if (focusArea === 'sleep_better' && timeOfDay === 'evening') {
    plans.push({
      icon: '📔',
      title: 'Evening Reflection',
      description: 'Write about 3 good things from today before bed',
      link: 'journal.html',
      buttonText: 'Write Gratitude'
    });
  }
  
  // Always suggest journal for processing emotions
  if (plans.length < 3) {
    plans.push({
      icon: '📔',
      title: 'Journal Your Thoughts',
      description: 'Writing can help you process and understand your feelings',
      link: 'journal.html',
      buttonText: 'Start Writing'
    });
  }
  
  // Add an activity if still under 3
  if (plans.length < 3) {
    plans.push({
      icon: '✨',
      title: 'Try an Activity',
      description: 'Small steps toward self-care make a difference',
      link: 'activities.html',
      buttonText: 'View Activities'
    });
  }
  
  return plans.slice(0, 3); // Return max 3 items
}

function getFocusAreaLabel(focusArea) {
  const labels = {
    'reduce_anxiety': 'reducing anxiety',
    'feel_less_sad': 'feeling less sad',
    'sleep_better': 'sleeping better',
    'build_confidence': 'building confidence',
    'general': 'overall wellbeing'
  };
  return labels[focusArea] || 'your wellbeing';
}

// ============================================
// Save Affirmation to Favorites
// ============================================

async function saveAffirmationToFavorites() {
  const btn = document.getElementById('favoriteAffirmationBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    await FirebaseDB.addDocument(`favorites/${userId}/affirmations`, {
      userId: userId,
      messageText: currentAffirmation,
      timestamp: Date.now()
    });
    
    MindVerse.showToast('Added to favorites! ❤️', 'success');
  } catch (error) {
    console.error('Error saving affirmation:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

console.log('Home page script loaded');
