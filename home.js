// ============================================
// Home Page - MindVerse
// Mood check-in, mood history, today's plan
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

let selectedMood = null;
let currentAffirmation = '';
// Declare userId globally so breathe.js and journal.js can access it
var userId = MindVerse.getOrCreateUserId();

// Make userId available immediately
window.userId = userId;

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
  
  // Load journal entries on home page
  await loadJournalEntriesHome();
  
  // Load recent sleep logs
  await loadRecentSleepLogs();
  
  // Check for delivered future self letters
  await checkDeliveredLetters();
  
  // Load pending future self letters
  await loadPendingLetters();
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
  console.log('New affirmation loaded:', currentAffirmation);
}

// Make loadAffirmation globally accessible
window.loadAffirmation = loadAffirmation;

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Mood selection
  document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', () => selectMood(option));
  });
  
  // Save mood button
  const saveMoodBtn = document.getElementById('saveMoodBtn');
  if (saveMoodBtn) {
    saveMoodBtn.addEventListener('click', saveMood);
  }
  
  // Affirmation buttons
  const newAffirmationBtn = document.getElementById('newAffirmationBtn');
  const favoriteAffirmationBtn = document.getElementById('favoriteAffirmationBtn');
  
  if (newAffirmationBtn) {
    newAffirmationBtn.addEventListener('click', loadAffirmation);
  }
  
  if (favoriteAffirmationBtn) {
    favoriteAffirmationBtn.addEventListener('click', saveAffirmationToFavorites);
  }
  
  // Journal tab switching on home page
  document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => switchJournalTab(tab));
  });
  
  // Journal save buttons on home page
  const saveJournalBtn = document.getElementById('saveJournalBtn');
  const saveGratitudeBtn = document.getElementById('saveGratitudeBtn');
  
  if (saveJournalBtn) {
    saveJournalBtn.addEventListener('click', saveJournalEntry);
  }
  
  if (saveGratitudeBtn) {
    saveGratitudeBtn.addEventListener('click', saveGratitudeEntry);
  }
}

// ============================================
// Mood Selection
// ============================================

function selectMood(option) {
  console.log('Mood selected:', option.dataset.mood);
  
  // Remove selection from all options
  document.querySelectorAll('.mood-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Select clicked option
  option.classList.add('selected');
  selectedMood = option.dataset.mood;
  
  console.log('selectedMood is now:', selectedMood);
  
  // Show note section (optional)
  const noteSection = document.getElementById('moodNoteSection');
  MindVerse.showElement(noteSection);
  
  // Highlight the save button
  const saveBtn = document.getElementById('saveMoodBtn');
  if (saveBtn) {
    saveBtn.style.animation = 'pulse 0.5s';
    setTimeout(() => {
      if (saveBtn) saveBtn.style.animation = '';
    }, 500);
  }
}

// Make selectMood globally accessible
window.selectMood = selectMood;

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
    
    // Load and display the saved mood
    await loadMoodHistory();
    
  } catch (error) {
    console.error('Error saving mood:', error);
    MindVerse.showToast('Failed to save mood. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(saveBtn, false);
  }
}

// Make saveMood globally accessible
window.saveMood = saveMood;

// ============================================
// Load Mood History
// ============================================

async function loadMoodHistory() {
  try {
    // Query only the last mood entry for this user
    const moodEntries = await FirebaseDB.queryDocuments(
      'moodEntries',
      [['userId', '==', userId]],
      'timestamp',
      'desc',
      1  // Only get 1 entry
    );
    
    const container = document.getElementById('moodHistoryContainer');
    
    if (moodEntries.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          No mood saved yet. Select your mood above!
        </p>
      `;
      return;
    }
    
    // Display only the current mood entry
    const entry = moodEntries[0];
    const moodEmojis = {
      terrible: '😢',
      bad: '😟',
      meh: '😐',
      okay: '🙂',
      great: '😊',
      awful: '😢',
      low: '😔'
    };
      
    const historyHTML = `
      <div class="journal-entry">
        <div class="journal-entry-header">
          <span class="journal-date">${MindVerse.formatDate(entry.timestamp)}</span>
          <span class="mood-dot ${entry.mood}">${moodEmojis[entry.mood] || '😐'}</span>
        </div>
        ${entry.note ? `<p class="journal-content">${entry.note}</p>` : '<p class="text-center" style="color: var(--color-text-light);">No note added</p>'}
      </div>
    `;
    
    container.innerHTML = historyHTML;
    
  } catch (error) {
    console.error('Error loading mood history:', error);
    document.getElementById('moodHistoryContainer').innerHTML = `
      <p class="text-center" style="color: var(--color-text-light);">
        Unable to load mood entry.
      </p>
    `;
  }
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

// Make saveAffirmationToFavorites globally accessible
window.saveAffirmationToFavorites = saveAffirmationToFavorites;

// ============================================
// Journal Tab Switching
// ============================================

function switchJournalTab(clickedTab) {
  // Handle both string and element arguments
  const tabName = typeof clickedTab === 'string' ? clickedTab : clickedTab.dataset.tab;
  
  // Update tab buttons
  document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
  
  // Update tab content
  const journalTab = document.getElementById('journalTab');
  const gratitudeTab = document.getElementById('gratitudeTab');
  const futureselfTab = document.getElementById('futureselfTab');
  
  // Hide all tabs
  if (journalTab) {
    journalTab.classList.remove('active');
    journalTab.style.display = 'none';
  }
  if (gratitudeTab) {
    gratitudeTab.classList.remove('active');
    gratitudeTab.style.display = 'none';
  }
  if (futureselfTab) {
    futureselfTab.classList.remove('active');
    futureselfTab.style.display = 'none';
  }
  
  // Show selected tab
  if (tabName === 'journal' && journalTab) {
    journalTab.classList.add('active');
    journalTab.style.display = 'block';
  } else if (tabName === 'gratitude' && gratitudeTab) {
    gratitudeTab.classList.add('active');
    gratitudeTab.style.display = 'block';
  } else if (tabName === 'futureself' && futureselfTab) {
    futureselfTab.classList.add('active');
    futureselfTab.style.display = 'block';
  }
}

// ============================================
// Save Journal Entry
// ============================================

async function saveJournalEntry() {
  const content = document.getElementById('journalContent');
  if (!content || !content.value.trim()) {
    MindVerse.showToast('Please write something first', 'error');
    return;
  }
  
  const btn = document.getElementById('saveJournalBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    await FirebaseDB.addDocument('journalEntries', {
      userId: userId,
      content: content.value.trim(),
      timestamp: Date.now()
    });
    
    MindVerse.showToast('Journal entry saved!', 'success');
    content.value = '';
    
    // Reload entries
    await loadJournalEntriesHome();
  } catch (error) {
    console.error('Error saving journal:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

// ============================================
// Save Gratitude Entry
// ============================================

async function saveGratitudeEntry() {
  const g1 = document.getElementById('gratitude1');
  const g2 = document.getElementById('gratitude2');
  const g3 = document.getElementById('gratitude3');
  
  if (!g1 || !g2 || !g3) return;
  
  const items = [
    g1.value.trim(),
    g2.value.trim(),
    g3.value.trim()
  ].filter(item => item !== '');
  
  if (items.length === 0) {
    MindVerse.showToast('Please enter at least one thing', 'error');
    return;
  }
  
  const btn = document.getElementById('saveGratitudeBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    await FirebaseDB.addDocument('journalEntries', {
      userId: userId,
      gratitudeItems: items,
      type: 'gratitude',
      timestamp: Date.now()
    });
    
    MindVerse.showToast('Gratitude saved!', 'success');
    g1.value = '';
    g2.value = '';
    g3.value = '';
    
  } catch (error) {
    console.error('Error saving gratitude:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

// ============================================
// Load Journal Entries for Home Page
// ============================================

async function loadJournalEntriesHome() {
  try {
    const entries = await FirebaseDB.queryDocuments(
      'journalEntries',
      [['userId', '==', userId]],
      'timestamp',
      'desc',
      5
    );
    
    const container = document.getElementById('journalEntriesContainer');
    if (!container) return;
    
    if (entries.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          No journal entries yet. Start writing!
        </p>
      `;
      return;
    }
    
    const entriesHTML = entries.map(entry => {
      const date = MindVerse.formatDate(entry.timestamp);
      
      if (entry.type === 'gratitude' && entry.gratitudeItems) {
        return `
          <div class="journal-entry">
            <div class="journal-entry-header">
              <span class="journal-date">${date}</span>
              <span style="color: var(--color-accent);">✨ Gratitude</span>
            </div>
            <ul style="margin: var(--spacing-sm) 0; padding-left: var(--spacing-lg); color: var(--color-text);">
              ${entry.gratitudeItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      } else {
        return `
          <div class="journal-entry">
            <div class="journal-entry-header">
              <span class="journal-date">${date}</span>
            </div>
            <p class="journal-content">${entry.content}</p>
          </div>
        `;
      }
    }).join('');
    
    container.innerHTML = entriesHTML;
    
  } catch (error) {
    console.error('Error loading journal entries:', error);
    const container = document.getElementById('journalEntriesContainer');
    if (container) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          Unable to load entries. Please refresh.
        </p>
      `;
    }
  }
}

// ============================================
// Sleep Tracker Functions
// ============================================

let selectedSleepQuality = null;

// Select sleep quality
window.selectSleepQuality = function(quality) {
  selectedSleepQuality = quality;
  
  // Update button styles
  document.querySelectorAll('.sleep-quality-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  const selectedBtn = document.querySelector(`.sleep-quality-btn[data-quality="${quality}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }
  
  console.log('Sleep quality selected:', quality);
};

// Save sleep log
window.saveSleepLog = async function() {
  const bedTime = document.getElementById('bedTime').value;
  const wakeTime = document.getElementById('wakeTime').value;
  const notes = document.getElementById('sleepNotes').value.trim();
  
  if (!bedTime || !wakeTime) {
    MindVerse.showToast('Please enter both bed time and wake time', 'error');
    return;
  }
  
  if (!selectedSleepQuality) {
    MindVerse.showToast('Please select sleep quality', 'error');
    return;
  }
  
  try {
    // Calculate sleep duration
    const bedDateTime = new Date(`2000-01-01T${bedTime}`);
    let wakeDateTime = new Date(`2000-01-01T${wakeTime}`);
    
    // If wake time is before bed time, assume it's the next day
    if (wakeDateTime < bedDateTime) {
      wakeDateTime = new Date(`2000-01-02T${wakeTime}`);
    }
    
    const durationMs = wakeDateTime - bedDateTime;
    const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(1);
    
    const sleepLog = {
      userId: userId,
      bedTime: bedTime,
      wakeTime: wakeTime,
      duration: parseFloat(durationHours),
      quality: selectedSleepQuality,
      notes: notes,
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('sleepLogs', sleepLog);
    
    // Clear form
    document.getElementById('bedTime').value = '';
    document.getElementById('wakeTime').value = '';
    document.getElementById('sleepNotes').value = '';
    selectedSleepQuality = null;
    document.querySelectorAll('.sleep-quality-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    MindVerse.showToast(`Sleep logged: ${durationHours} hours`, 'success');
    
    // Reload recent logs
    await loadRecentSleepLogs();
    
  } catch (error) {
    console.error('Error saving sleep log:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  }
};

// Load recent sleep logs
async function loadRecentSleepLogs() {
  try {
    const logs = await FirebaseDB.queryDocuments(
      'sleepLogs',
      [['userId', '==', userId]],
      'timestamp',
      'desc',
      3
    );
    
    const container = document.getElementById('recentSleepContainer');
    const section = document.getElementById('recentSleepSection');
    
    if (!logs || logs.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    
    const qualityEmojis = {
      1: '😞 Poor',
      2: '😐 Fair',
      3: '🙂 Good',
      4: '😊 Great'
    };
    
    const logsHTML = logs.map(log => {
      return `
        <div class="sleep-log-card">
          <div class="sleep-log-header">
            <span class="sleep-log-date">${MindVerse.formatDate(log.timestamp)}</span>
            <span class="sleep-log-quality">${qualityEmojis[log.quality]}</span>
          </div>
          <div class="sleep-log-details">
            <span>🛏️ ${log.bedTime} → 🌅 ${log.wakeTime}</span>
            <span class="sleep-log-duration">${log.duration}h</span>
          </div>
          ${log.notes ? `<p class="sleep-log-notes">${log.notes}</p>` : ''}
        </div>
      `;
    }).join('');
    
    container.innerHTML = logsHTML;
    
  } catch (error) {
    console.error('Error loading sleep logs:', error);
  }
}

// ============================================
// Future Self Letters Functions
// ============================================

// Save future self letter
window.saveFutureLetter = async function() {
  const content = document.getElementById('futureLetterContent').value.trim();
  const daysUntilDelivery = parseInt(document.getElementById('deliveryDate').value);
  
  if (!content) {
    MindVerse.showToast('Please write a letter to your future self', 'error');
    return;
  }
  
  try {
    const deliveryTimestamp = Date.now() + (daysUntilDelivery * 24 * 60 * 60 * 1000);
    
    const letter = {
      userId: userId,
      content: content,
      createdAt: Date.now(),
      deliveryDate: deliveryTimestamp,
      delivered: false
    };
    
    await FirebaseDB.addDocument('futureLetters', letter);
    
    // Clear form
    document.getElementById('futureLetterContent').value = '';
    
    const deliveryDate = new Date(deliveryTimestamp).toLocaleDateString();
    MindVerse.showToast(`Letter scheduled for delivery on ${deliveryDate}!`, 'success');
    
    // Reload pending letters
    await loadPendingLetters();
    
  } catch (error) {
    console.error('Error saving future letter:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  }
};

// Check for delivered letters
async function checkDeliveredLetters() {
  try {
    const today = Date.now();
    
    // Get undelivered letters that should be delivered by now
    const letters = await FirebaseDB.queryDocuments(
      'futureLetters',
      [['userId', '==', userId], ['delivered', '==', false], ['deliveryDate', '<=', today]],
      'deliveryDate',
      'asc',
      10
    );
    
    if (!letters || letters.length === 0) {
      return;
    }
    
    // Mark letters as delivered
    for (const letter of letters) {
      await FirebaseDB.updateDocument('futureLetters', letter.id, { delivered: true, deliveredAt: Date.now() });
    }
    
    // Display delivered letters
    const section = document.getElementById('deliveredLettersSection');
    const container = document.getElementById('deliveredLettersContainer');
    
    section.style.display = 'block';
    
    const lettersHTML = letters.map(letter => {
      const daysAgo = Math.floor((Date.now() - letter.createdAt) / (1000 * 60 * 60 * 24));
      return `
        <div class="delivered-letter">
          <p class="letter-meta">Written ${daysAgo} days ago on ${MindVerse.formatDate(letter.createdAt)}</p>
          <div class="letter-content">${letter.content.replace(/\\n/g, '<br>')}</div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = lettersHTML;
    
  } catch (error) {
    console.error('Error checking delivered letters:', error);
  }
}

// Load pending letters
async function loadPendingLetters() {
  try {
    const letters = await FirebaseDB.queryDocuments(
      'futureLetters',
      [['userId', '==', userId], ['delivered', '==', false]],
      'deliveryDate',
      'asc',
      10
    );
    
    const container = document.getElementById('pendingLettersContainer');
    
    if (!letters || letters.length === 0) {
      container.innerHTML = '<p class=\"text-center\" style=\"color: var(--color-text-light);\">No letters scheduled yet</p>';
      return;
    }
    
    const lettersHTML = letters.map(letter => {
      const deliveryDate = new Date(letter.deliveryDate);
      const daysUntil = Math.ceil((letter.deliveryDate - Date.now()) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="pending-letter-card">
          <div class="pending-letter-header">
            <span class="pending-letter-date">📅 Delivers in ${daysUntil} days (${deliveryDate.toLocaleDateString()})</span>
            <button class="btn-icon-delete" onclick="deleteFutureLetter('${letter.id}')" title="Delete">
              ✕
            </button>
          </div>
          <p class="pending-letter-preview">${letter.content.substring(0, 100)}${letter.content.length > 100 ? '...' : ''}</p>
        </div>
      `;
    }).join('');
    
    container.innerHTML = lettersHTML;
    
  } catch (error) {
    console.error('Error loading pending letters:', error);
  }
}

// Delete future letter
window.deleteFutureLetter = async function(letterId) {
  if (!confirm('Are you sure you want to delete this letter?')) {
    return;
  }
  
  try {
    await FirebaseDB.deleteDocument('futureLetters', letterId);
    MindVerse.showToast('Letter deleted', 'success');
    await loadPendingLetters();
  } catch (error) {
    console.error('Error deleting letter:', error);
    MindVerse.showToast('Failed to delete. Please try again.', 'error');
  }
};



console.log('Home page script loaded');
