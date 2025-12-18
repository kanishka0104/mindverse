// ============================================
// Breathe Page - MindVerse
// Guided breathing exercises with timer
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

const userId = MindVerse.getOrCreateUserId();

// State
let selectedDuration = 180; // Default 3 minutes
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
  console.log('Breathe page loaded for user:', userId);
  
  setupEventListeners();
  await loadSessionSummary();
});

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Duration buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.addEventListener('click', () => selectDuration(btn));
  });
  
  // Start/Stop buttons
  document.getElementById('startBtn').addEventListener('click', startBreathing);
  document.getElementById('stopBtn').addEventListener('click', stopBreathing);
  
  // Feedback options
  document.querySelectorAll('#feedbackCard .mood-option').forEach(option => {
    option.addEventListener('click', () => selectFeeling(option));
  });
  
  // Save feedback button
  document.getElementById('saveFeedbackBtn').addEventListener('click', saveFeedback);
}

// ============================================
// Duration Selection
// ============================================

function selectDuration(btn) {
  // Remove selection from all buttons
  document.querySelectorAll('.duration-btn').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-secondary');
  });
  
  // Select clicked button
  btn.classList.remove('btn-secondary');
  btn.classList.add('btn-primary');
  
  selectedDuration = parseInt(btn.dataset.duration);
  console.log('Selected duration:', selectedDuration, 'seconds');
}

// ============================================
// Start Breathing Session
// ============================================

function startBreathing() {
  if (isBreathing) return;
  
  isBreathing = true;
  timeRemaining = selectedDuration;
  sessionStartTime = Date.now();
  
  // Update UI
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('stopBtn').classList.remove('hidden');
  document.getElementById('sessionSummary').classList.add('hidden');
  document.getElementById('feedbackCard').classList.add('hidden');
  
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
  
  circle.classList.remove('inhale', 'exhale');
  text.textContent = 'Ready';
  
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('stopBtn').classList.add('hidden');
  document.getElementById('sessionSummary').classList.remove('hidden');
  
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
  
  circle.classList.remove('inhale', 'exhale');
  text.textContent = 'Complete!';
  
  document.getElementById('startBtn').classList.remove('hidden');
  document.getElementById('stopBtn').classList.add('hidden');
  document.getElementById('timeRemaining').textContent = '✓ Done';
  
  // Enable duration buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.disabled = false;
  });
  
  // Show feedback card
  document.getElementById('feedbackCard').classList.remove('hidden');
  document.getElementById('feedbackCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Store duration for later save
  window.completedSessionDuration = actualDuration;
  
  console.log('Breathing session completed:', actualDuration, 'seconds');
}

// ============================================
// Timer Display
// ============================================

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timeRemaining').textContent = display;
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
    document.getElementById('summaryText').textContent = 
      'Regular breathing practice helps calm your mind and reduce stress.';
  }
}

console.log('Breathe page script loaded');
