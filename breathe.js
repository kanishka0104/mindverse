// ============================================
// Breathe Page - MindVerse
// Guided breathing exercises with timer
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

// Use userId from global scope (declared in home.js which loads first)
// const userId is already declared in home.js, so we can reference it directly

// State
let selectedDuration = null; // No default - user must select
let isBreathing = false;
let breathingTimer = null;
let breathingInterval = null;
let timeRemaining = 0;
let sessionStartTime = 0;
let breathPhase = 'ready'; // ready, inhale, hold, exhale
let selectedFeeling = null;

// Breathing cycle timings (in seconds)
const BREATHING_CYCLE = {
  inhale: 4,
  hold: 4,
  exhale: 6
};

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Breathe page loaded');
  
  setupEventListeners();
  
  // Show placeholder timer until duration is selected
  const timeRemainingEl = document.getElementById('timeRemaining');
  if (timeRemainingEl) {
    timeRemainingEl.textContent = '--:--';
  }
  
  // Only load session summary if we're on standalone breathe page
  const summaryText = document.getElementById('summaryText');
  if (summaryText) {
    await loadSessionSummary();
  }
});

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Duration buttons
  const durationBtns = document.querySelectorAll('.duration-btn');
  console.log('Found duration buttons:', durationBtns.length);
  
  durationBtns.forEach(btn => {
    console.log('Adding listener to button:', btn.dataset.duration);
    btn.addEventListener('click', (e) => {
      console.log('Duration button clicked:', btn.dataset.duration);
      e.preventDefault();
      e.stopPropagation();
      selectDuration(btn);
    });
  });
  
  // Start/Stop buttons
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (startBtn) {
    startBtn.addEventListener('click', startBreathing);
  }
  
  if (stopBtn) {
    stopBtn.addEventListener('click', stopBreathing);
  }
  
  // Feedback options (only on standalone breathe page)
  const feedbackOptions = document.querySelectorAll('#feedbackCard .mood-option');
  if (feedbackOptions.length > 0) {
    feedbackOptions.forEach(option => {
      option.addEventListener('click', () => selectFeeling(option));
    });
  }
  
  // Save feedback button (only on standalone breathe page)
  const saveFeedbackBtn = document.getElementById('saveFeedbackBtn');
  if (saveFeedbackBtn) {
    saveFeedbackBtn.addEventListener('click', saveFeedback);
  }
}

// ============================================
// Duration Selection
// ============================================

function selectDuration(btn) {
  console.log('selectDuration called with:', btn);
  
  // Remove selection from all buttons
  document.querySelectorAll('.duration-btn').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-secondary');
  });
  
  // Select clicked button
  btn.classList.remove('btn-secondary');
  btn.classList.add('btn-primary');
  
  selectedDuration = parseInt(btn.dataset.duration);
  console.log('Set selectedDuration to:', selectedDuration);
  
  // Update timer display immediately
  const timeRemainingEl = document.getElementById('timeRemaining');
  console.log('timeRemaining element:', timeRemainingEl);
  
  if (timeRemainingEl) {
    const minutes = Math.floor(selectedDuration / 60);
    const seconds = selectedDuration % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timeRemainingEl.textContent = display;
    console.log('Updated timer to:', display);
  }
  
  console.log('Selected duration:', selectedDuration, 'seconds');
}

// Make function globally accessible
window.selectDuration = selectDuration;
window.startBreathing = startBreathing;
window.stopBreathing = stopBreathing;

// ============================================
// Start Breathing Session
// ============================================

function startBreathing() {
  if (isBreathing) return;
  
  // Check if duration is selected
  if (!selectedDuration) {
    alert('Please select a duration first (1, 3, or 5 minutes)');
    return;
  }
  
  isBreathing = true;
  timeRemaining = selectedDuration;
  sessionStartTime = Date.now();
  
  // Update UI
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (startBtn) startBtn.classList.add('hidden');
  if (stopBtn) stopBtn.classList.remove('hidden');
  
  // Hide elements if they exist (only on standalone page)
  const sessionSummary = document.getElementById('sessionSummary');
  if (sessionSummary) sessionSummary.classList.add('hidden');
  
  const feedbackCard = document.getElementById('feedbackCard');
  if (feedbackCard) feedbackCard.classList.add('hidden');
  
  // Disable duration buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.disabled = true;
  });
  
  // Start breathing cycle
  startBreathingCycle();
  
  // Start countdown timer
  breathingTimer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      completeSession();
    }
  }, 1000);
  
  console.log('Breathing session started');
}

// ============================================
// Breathing Cycle Animation
// ============================================

function startBreathingCycle() {
  const circle = document.getElementById('breathingCircle');
  const text = document.getElementById('breathingText');
  let cycleStep = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
  
  function doCycle() {
    if (!isBreathing) return;
    
    switch(cycleStep) {
      case 0: // Inhale
        breathPhase = 'inhale';
        text.textContent = 'Inhale';
        circle.classList.add('inhale');
        circle.classList.remove('exhale');
        setTimeout(() => {
          if (isBreathing) {
            cycleStep = 1;
            doCycle();
          }
        }, BREATHING_CYCLE.inhale * 1000);
        break;
        
      case 1: // Hold
        breathPhase = 'hold';
        text.textContent = 'Hold';
        setTimeout(() => {
          if (isBreathing) {
            cycleStep = 2;
            doCycle();
          }
        }, BREATHING_CYCLE.hold * 1000);
        break;
        
      case 2: // Exhale
        breathPhase = 'exhale';
        text.textContent = 'Exhale';
        circle.classList.add('exhale');
        circle.classList.remove('inhale');
        setTimeout(() => {
          if (isBreathing) {
            cycleStep = 3;
            doCycle();
          }
        }, BREATHING_CYCLE.exhale * 1000);
        break;
        
      case 3: // Hold before next cycle
        breathPhase = 'hold';
        text.textContent = 'Hold';
        setTimeout(() => {
          if (isBreathing) {
            cycleStep = 0; // Reset to inhale
            doCycle();
          }
        }, 2000); // 2 seconds hold
        break;
    }
  }
  
  doCycle();
}

// ============================================
// Stop Breathing Session
// ============================================

function stopBreathing() {
  if (!isBreathing) return;
  
  isBreathing = false;
  clearInterval(breathingTimer);
  
  // Reset UI
  const circle = document.getElementById('breathingCircle');
  const text = document.getElementById('breathingText');
  
  if (circle) circle.classList.remove('inhale', 'exhale');
  if (text) text.textContent = 'Ready';
  
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
  
  // Show session summary if it exists (only on standalone page)
  const sessionSummary = document.getElementById('sessionSummary');
  if (sessionSummary) sessionSummary.classList.remove('hidden');
  
  // Enable duration buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.disabled = false;
  });
  
  updateTimerDisplay();
  
  console.log('Breathing session stopped');
}

// ============================================
// Complete Session
// ============================================

function completeSession() {
  isBreathing = false;
  clearInterval(breathingTimer);
  
  // Calculate actual duration
  const actualDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
  
  // Reset UI
  const circle = document.getElementById('breathingCircle');
  const text = document.getElementById('breathingText');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const timeRemainingEl = document.getElementById('timeRemaining');
  
  if (circle) circle.classList.remove('inhale', 'exhale');
  if (text) text.textContent = 'Complete!';
  if (startBtn) startBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
  if (timeRemainingEl) timeRemainingEl.textContent = '✓ Done';
  
  // Enable duration buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.disabled = false;
  });
  
  // Show feedback card if it exists (only on standalone page)
  const feedbackCard = document.getElementById('feedbackCard');
  if (feedbackCard) {
    feedbackCard.classList.remove('hidden');
    feedbackCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    // On home page, auto-save session without feedback
    saveSessionWithoutFeedback(actualDuration);
  }
  
  // Store duration for later save
  window.completedSessionDuration = actualDuration;
  
  console.log('Breathing session completed:', actualDuration, 'seconds');
}

// ============================================
// Timer Display
// ============================================

function updateTimerDisplay() {
  const timeRemainingEl = document.getElementById('timeRemaining');
  if (!timeRemainingEl) return; // Element doesn't exist, skip
  
  if (timeRemaining === 0) {
    const minutes = Math.floor(selectedDuration / 60);
    const seconds = selectedDuration % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timeRemainingEl.textContent = display;
  } else {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timeRemainingEl.textContent = display;
  }
}

// ============================================
// Feedback Selection
// ============================================

function selectFeeling(option) {
  // Remove selection from all options
  document.querySelectorAll('#feedbackCard .mood-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Select clicked option
  option.classList.add('selected');
  selectedFeeling = option.dataset.feeling;
  
  // Show save button
  document.getElementById('saveFeedbackBtn').classList.remove('hidden');
}

// ============================================
// Save Feedback
// ============================================

async function saveSessionWithoutFeedback(duration) {
  try {
    // Save session to Firestore without feedback (for home page)
    const sessionData = {
      userId: userId,
      duration: duration,
      afterFeeling: 'completed', // Default value when no feedback provided
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('breathingSessions', sessionData);
    
    console.log('Breathing session auto-saved');
  } catch (error) {
    console.error('Error auto-saving breathing session:', error);
  }
}

async function saveFeedback() {
  if (!selectedFeeling) {
    MindVerse.showToast('Please select how you feel', 'error');
    return;
  }
  
  const btn = document.getElementById('saveFeedbackBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    // Save session to Firestore
    const sessionData = {
      userId: userId,
      duration: window.completedSessionDuration || selectedDuration,
      afterFeeling: selectedFeeling,
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('breathingSessions', sessionData);
    
    MindVerse.showToast('Great job! Session saved.', 'success');
    
    // Reset feedback form
    document.querySelectorAll('#feedbackCard .mood-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    selectedFeeling = null;
    document.getElementById('feedbackCard').classList.add('hidden');
    document.getElementById('saveFeedbackBtn').classList.add('hidden');
    
    // Reload summary
    await loadSessionSummary();
    document.getElementById('sessionSummary').classList.remove('hidden');
    
  } catch (error) {
    console.error('Error saving session:', error);
    MindVerse.showToast('Failed to save session. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

// ============================================
// Load Session Summary
// ============================================

async function loadSessionSummary() {
  try {
    // Get sessions from this week
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const sessions = await FirebaseDB.queryDocuments(
      'breathingSessions',
      [
        ['userId', '==', userId],
        ['timestamp', '>', oneWeekAgo]
      ],
      'timestamp',
      'desc'
    );
    
    const totalSessions = sessions.length;
    const totalMinutes = Math.floor(
      sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    );
    
    const summaryText = document.getElementById('summaryText');
    
    // Only update summary if the element exists (it's on the standalone breathe page, not home)
    if (!summaryText) {
      return; // Element doesn't exist on home page, skip summary update
    }
    
    if (totalSessions === 0) {
      summaryText.innerHTML = `
        Welcome to breathing exercises! Regular practice can help reduce stress and anxiety.<br>
        <small style="color: var(--color-text-light);">Start your first session below.</small>
      `;
    } else {
      const betterCount = sessions.filter(s => s.afterFeeling === 'better').length;
      const improvementRate = Math.round((betterCount / totalSessions) * 100);
      
      summaryText.innerHTML = `
        <strong style="color: var(--color-primary);">${totalSessions}</strong> sessions this week
        • <strong style="color: var(--color-accent);">${totalMinutes}</strong> minutes practiced<br>
        <small style="color: var(--color-text-light);">
          ${improvementRate}% of sessions helped you feel better 💚
        </small>
      `;
    }
    
  } catch (error) {
    console.error('Error loading session summary:', error);
    const summaryText = document.getElementById('summaryText');
    if (summaryText) {
      summaryText.textContent = 
        'Regular breathing practice helps calm your mind and reduce stress.';
    }
  }
}

console.log('Breathe page script loaded');
