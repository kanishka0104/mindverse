// ============================================
// Activities Page - MindVerse
// Pleasant activities to boost mood
// ============================================
// Require authentication
FirebaseAuth.requireAuth();
const userId = MindVerse.getOrCreateUserId();

// Activity definitions
const ACTIVITIES = [
  {
    id: 'walk',
    icon: '🚶',
    title: 'Take a Walk',
    description: 'Get outside for a 5-10 minute walk. Fresh air and movement help.',
    duration: 5
  },
  {
    id: 'water',
    icon: '💧',
    title: 'Drink Water',
    description: 'Hydration is important. Have a glass of water right now.',
    duration: 1
  },
  {
    id: 'stretch',
    icon: '🧘',
    title: 'Stretch',
    description: 'Do some gentle stretches for 2-3 minutes. Your body will thank you.',
    duration: 2
  },
  {
    id: 'music',
    icon: '🎵',
    title: 'Listen to Music',
    description: 'Put on a song you love. Let yourself enjoy it fully.',
    duration: 5
  },
  {
    id: 'friend',
    icon: '💬',
    title: 'Text a Friend',
    description: 'Send a quick message to someone you care about.',
    duration: 2
  },
  {
    id: 'sun',
    icon: '☀️',
    title: 'Get Sunlight',
    description: 'Step outside or sit by a window for a few minutes of natural light.',
    duration: 3
  },
  {
    id: 'tidy',
    icon: '🧹',
    title: 'Tidy Something',
    description: 'Organize one small area. A clean space can help clear your mind.',
    duration: 5
  },
  {
    id: 'tea',
    icon: '☕',
    title: 'Make Tea or Coffee',
    description: 'Brew yourself a warm drink and take a mindful moment to enjoy it.',
    duration: 5
  },
  {
    id: 'photo',
    icon: '📸',
    title: 'Look at Photos',
    description: 'Browse through happy memories or beautiful pictures.',
    duration: 3
  },
  {
    id: 'plant',
    icon: '🌱',
    title: 'Water a Plant',
    description: 'Take care of something living. Nurturing helps us feel purposeful.',
    duration: 2
  },
  {
    id: 'pet',
    icon: '🐕',
    title: 'Spend Time with a Pet',
    description: 'If you have a pet, give them some love and attention.',
    duration: 5
  },
  {
    id: 'read',
    icon: '📖',
    title: 'Read Something',
    description: 'Read a few pages of a book, article, or anything that interests you.',
    duration: 10
  },
  {
    id: 'laugh',
    icon: '😄',
    title: 'Watch Something Funny',
    description: 'Watch a funny video or read jokes. Laughter is good medicine.',
    duration: 5
  },
  {
    id: 'creative',
    icon: '🎨',
    title: 'Do Something Creative',
    description: 'Draw, write, craft, or create anything. Expression is healing.',
    duration: 10
  },
  {
    id: 'shower',
    icon: '🚿',
    title: 'Take a Shower',
    description: 'A warm shower can be refreshing and help you reset.',
    duration: 10
  },
  {
    id: 'snack',
    icon: '🍎',
    title: 'Eat a Healthy Snack',
    description: 'Nourish your body with something nutritious.',
    duration: 3
  }
];

// ============================================
// Timer State
// ============================================
let timerState = {
  interval: null,
  remainingSeconds: 0,
  totalSeconds: 0,
  isPaused: false,
  currentActivity: null,
  webcamStream: null,
  capturedPhotoData: null
};

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Activities page loaded for user:', userId);
  
  renderActivities();
  await loadDailySummary();
  initializeTabs();
  initializeGroundingTechnique();
  initializeTimerModal();
});

// ============================================
// Tab Switching
// ============================================

function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// ============================================
// Grounding Technique
// ============================================

function initializeGroundingTechnique() {
  const checkboxes = document.querySelectorAll('.grounding-checkbox');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', checkGroundingCompletion);
  });
  
  // Reset button
  const resetBtn = document.getElementById('resetGroundingBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetGroundingTechnique);
  }
}

function checkGroundingCompletion() {
  const checkboxes = document.querySelectorAll('.grounding-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  const completeSection = document.getElementById('groundingComplete');
  if (allChecked) {
    completeSection.classList.remove('hidden');
    completeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    completeSection.classList.add('hidden');
  }
}

function resetGroundingTechnique() {
  // Uncheck all checkboxes
  const checkboxes = document.querySelectorAll('.grounding-checkbox');
  checkboxes.forEach(cb => cb.checked = false);
  
  // Clear all text inputs
  const textInputs = document.querySelectorAll('.grounding-text-input');
  textInputs.forEach(input => input.value = '');
  
  // Hide completion message
  document.getElementById('groundingComplete').classList.add('hidden');
  
  // Scroll to top of grounding tab
  document.getElementById('grounding-tab').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Render Activities
// ============================================

function renderActivities() {
  const grid = document.getElementById('activitiesGrid');
  
  const activitiesHTML = ACTIVITIES.map(activity => {
    return `
      <div class="activity-card">
        <div class="activity-icon">${activity.icon}</div>
        <h3 class="activity-title">${activity.title}</h3>
        <p class="activity-description">${activity.description}</p>
        <div style="margin-top: auto; padding-top: var(--spacing-sm);">
          <small style="color: var(--color-text-light); display: block; margin-bottom: var(--spacing-xs);">
            ~${activity.duration} min
          </small>
          <button 
            class="btn btn-primary btn-block btn-sm"
            onclick="startActivity('${activity.id}')"
          >
            Start Activity
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = activitiesHTML;
}

// ============================================
// Start Activity with Timer
// ============================================

window.startActivity = function(activityId) {
  const activity = ACTIVITIES.find(a => a.id === activityId);
  if (!activity) return;
  
  // Reset timer state
  timerState.currentActivity = activity;
  timerState.totalSeconds = activity.duration * 60;
  timerState.remainingSeconds = timerState.totalSeconds;
  timerState.isPaused = false;
  timerState.capturedPhotoData = null;
  
  // Update modal content
  document.getElementById('activityModalTitle').textContent = activity.title;
  document.getElementById('activityModalDescription').textContent = activity.description;
  
  // Reset and show webcam section
  resetWebcamSection();
  document.getElementById('webcamSection').classList.remove('hidden');
  
  // Open modal and start timer
  const modal = document.getElementById('activityTimerModal');
  MindVerse.openModal(modal);
  startTimer();
};

// ============================================
// Timer Functions
// ============================================

function startTimer() {
  updateTimerDisplay();
  
  timerState.interval = setInterval(() => {
    if (!timerState.isPaused) {
      timerState.remainingSeconds--;
      updateTimerDisplay();
      
      if (timerState.remainingSeconds <= 0) {
        completeTimedActivity();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerState.remainingSeconds / 60);
  const seconds = timerState.remainingSeconds % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  document.getElementById('activityTimeRemaining').textContent = timeString;
  
  // Update circle progress
  const progress = (timerState.remainingSeconds / timerState.totalSeconds) * 100;
  const circle = document.getElementById('activityTimerCircle');
  circle.style.background = `conic-gradient(var(--color-primary) ${progress}%, var(--color-bg-light) ${progress}%)`;
}

function pauseTimer() {
  timerState.isPaused = !timerState.isPaused;
  const pauseBtn = document.getElementById('pauseTimerBtn');
  pauseBtn.textContent = timerState.isPaused ? 'Resume' : 'Pause';
}

function stopTimer() {
  clearInterval(timerState.interval);
  timerState.interval = null;
  stopWebcam();
}

function completeTimedActivity() {
  stopTimer();
  
  // Save activity with optional photo
  saveCompletedActivity();
  
  // Close timer modal
  MindVerse.closeModal(document.getElementById('activityTimerModal'));
  
  // Show completion modal
  showCompletionModal(timerState.currentActivity.title);
  
  // Reload daily summary
  loadDailySummary();
}

// ============================================
// Initialize Timer Modal Controls
// ============================================

function initializeTimerModal() {
  // Pause button
  document.getElementById('pauseTimerBtn').addEventListener('click', pauseTimer);
  
  // Stop button
  document.getElementById('stopActivityBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to stop this activity?')) {
      stopTimer();
      MindVerse.closeModal(document.getElementById('activityTimerModal'));
    }
  });
  
  // Close modal button
  document.getElementById('closeTimerModal').addEventListener('click', () => {
    if (confirm('Are you sure you want to close? Your progress will be lost.')) {
      stopTimer();
      MindVerse.closeModal(document.getElementById('activityTimerModal'));
    }
  });
  
  // Webcam controls
  document.getElementById('toggleWebcamBtn').addEventListener('click', toggleWebcam);
  document.getElementById('capturePhotoBtn').addEventListener('click', capturePhoto);
  document.getElementById('closeWebcamBtn').addEventListener('click', closeWebcam);
}

// ============================================
// Webcam Functions
// ============================================

async function toggleWebcam() {
  const webcamContainer = document.getElementById('webcamContainer');
  const isHidden = webcamContainer.classList.contains('hidden');
  
  if (isHidden) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      timerState.webcamStream = stream;
      const video = document.getElementById('webcamVideo');
      video.srcObject = stream;
      
      webcamContainer.classList.remove('hidden');
      document.getElementById('toggleWebcamBtn').textContent = '✕ Close Camera';
    } catch (error) {
      console.error('Error accessing webcam:', error);
      
      let errorMessage = 'Could not access camera.';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on your device.';
      }
      
      MindVerse.showToast(errorMessage, 'error');
    }
  } else {
    closeWebcam();
  }
}

function closeWebcam() {
  stopWebcam();
  document.getElementById('webcamContainer').classList.add('hidden');
  document.getElementById('toggleWebcamBtn').textContent = '📸 Take Photo (Optional)';
}

function stopWebcam() {
  if (timerState.webcamStream) {
    timerState.webcamStream.getTracks().forEach(track => track.stop());
    timerState.webcamStream = null;
  }
}

function capturePhoto() {
  const video = document.getElementById('webcamVideo');
  const canvas = document.getElementById('webcamCanvas');
  const context = canvas.getContext('2d');
  
  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Draw video frame to canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Convert to base64
  timerState.capturedPhotoData = canvas.toDataURL('image/jpeg', 0.8);
  
  // Show captured photo
  const capturedPhoto = document.getElementById('capturedPhoto');
  capturedPhoto.src = timerState.capturedPhotoData;
  document.getElementById('capturedPhotoContainer').classList.remove('hidden');
  
  // Close webcam
  closeWebcam();
  
  MindVerse.showToast('Photo captured successfully!', 'success');
}

function resetWebcamSection() {
  closeWebcam();
  document.getElementById('capturedPhotoContainer').classList.add('hidden');
  document.getElementById('capturedPhoto').src = '';
}

// ============================================
// Save Activity
// ============================================

async function saveCompletedActivity() {
  try {
    const activityData = {
      userId: userId,
      activityId: timerState.currentActivity.id,
      activityName: timerState.currentActivity.title,
      timestamp: Date.now(),
      duration: timerState.currentActivity.duration
    };
    
    // Add photo if captured
    if (timerState.capturedPhotoData) {
      activityData.photoData = timerState.capturedPhotoData;
      activityData.hasPhoto = true;
    }
    
    await FirebaseDB.addDocument('activitiesCompleted', activityData);
    
  } catch (error) {
    console.error('Error saving activity:', error);
    MindVerse.showToast('Activity completed but failed to save. Please check your connection.', 'error');
  }
}

// ============================================
// Complete Activity (Legacy - Quick Complete)
// ============================================

window.completeActivity = async function(activityId, activityName) {
  try {
    // Save to Firestore
    const activityData = {
      userId: userId,
      activityId: activityId,
      activityName: activityName,
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('activitiesCompleted', activityData);
    
    // Show completion modal
    showCompletionModal(activityName);
    
    // Reload daily summary
    await loadDailySummary();
    
  } catch (error) {
    console.error('Error completing activity:', error);
    MindVerse.showToast('Failed to save activity. Please try again.', 'error');
  }
};

// ============================================
// Show Completion Modal
// ============================================

function showCompletionModal(activityName) {
  const modal = document.getElementById('completionModal');
  const messages = [
    `Great job completing "${activityName}"!`,
    `You're taking care of yourself! Well done on "${activityName}".`,
    `Awesome! "${activityName}" is done. Keep it up!`,
    `Nice work! You completed "${activityName}".`,
    `Way to go! "${activityName}" checked off the list.`
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  document.getElementById('modalTitle').textContent = 'Great Job!';
  document.getElementById('modalMessage').textContent = randomMessage;
  
  MindVerse.openModal(modal);
}

// ============================================
// Load Daily Summary
// ============================================

async function loadDailySummary() {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
    
    // Query today's activities
    const todayActivities = await FirebaseDB.queryDocuments(
      'activitiesCompleted',
      [
        ['userId', '==', userId],
        ['timestamp', '>', startOfDay],
        ['timestamp', '<', endOfDay]
      ],
      'timestamp',
      'desc'
    );
    
    const summaryEl = document.getElementById('dailySummary');
    const count = todayActivities.length;
    
    if (count === 0) {
      summaryEl.innerHTML = `
        You haven't completed any activities today yet.<br>
        <small style="color: var(--color-text-light);">
          Start with something small! Every positive action counts.
        </small>
      `;
    } else {
      // Get unique activity names
      const uniqueActivities = [...new Set(todayActivities.map(a => a.activityName))];
      const activityList = uniqueActivities.slice(0, 3).join(', ');
      const moreCount = uniqueActivities.length > 3 ? ` and ${uniqueActivities.length - 3} more` : '';
      
      summaryEl.innerHTML = `
        <strong style="color: var(--color-primary); font-size: var(--font-size-xl);">
          ${count}
        </strong> 
        ${count === 1 ? 'activity' : 'activities'} completed today! 🎉<br>
        <small style="color: var(--color-text-light);">
          ${activityList}${moreCount}
        </small>
      `;
    }
    
    // Also get weekly stats
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = await FirebaseDB.queryDocuments(
      'activitiesCompleted',
      [
        ['userId', '==', userId],
        ['timestamp', '>', oneWeekAgo]
      ],
      'timestamp',
      'desc'
    );
    
    if (weeklyActivities.length > 0) {
      // Calculate days with at least one activity
      const daysWithActivities = new Set();
      weeklyActivities.forEach(activity => {
        const date = new Date(activity.timestamp);
        date.setHours(0, 0, 0, 0);
        daysWithActivities.add(date.getTime());
      });
      
      summaryEl.innerHTML += `<br><small style="color: var(--color-accent);">
        Active ${daysWithActivities.size} out of 7 days this week
      </small>`;
    }
    
  } catch (error) {
    console.error('Error loading daily summary:', error);
    document.getElementById('dailySummary').innerHTML = `
      Choose an activity below to get started!
    `;
  }
}

console.log('Activities page script loaded');

// ============================================
// DISTRACTION ZONE GAMES
// ============================================

// Game state
const gameState = {
  puzzle: { moves: 0, board: [] },
  memory: { flippedCards: [], matchedPairs: 0, canFlip: true },
  color: { score: 0, currentColor: null },
  number: { target: 0, attempts: 0 },
  word: { score: 0, currentWord: '', scrambled: '', hint: '' }
};

// ===== PUZZLE GAME =====
function initPuzzle() {
  const board = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 represents empty
  shufflePuzzle(board);
  gameState.puzzle.board = board;
  gameState.puzzle.moves = 0;
  renderPuzzle();
}

function shufflePuzzle(board) {
  // Shuffle with 100 random valid moves to ensure solvable puzzle
  for (let i = 0; i < 100; i++) {
    const emptyIndex = board.indexOf(0);
    const validMoves = getValidPuzzleMoves(emptyIndex);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    [board[emptyIndex], board[randomMove]] = [board[randomMove], board[emptyIndex]];
  }
}

function getValidPuzzleMoves(emptyIndex) {
  const moves = [];
  const row = Math.floor(emptyIndex / 3);
  const col = emptyIndex % 3;
  
  if (row > 0) moves.push(emptyIndex - 3); // up
  if (row < 2) moves.push(emptyIndex + 3); // down
  if (col > 0) moves.push(emptyIndex - 1); // left
  if (col < 2) moves.push(emptyIndex + 1); // right
  
  return moves;
}

function renderPuzzle() {
  const boardEl = document.getElementById('puzzleBoard');
  boardEl.innerHTML = '';
  
  gameState.puzzle.board.forEach((num, index) => {
    const tile = document.createElement('div');
    tile.className = num === 0 ? 'puzzle-tile empty' : 'puzzle-tile';
    tile.textContent = num || '';
    if (num !== 0) {
      tile.onclick = () => movePuzzleTile(index);
    }
    boardEl.appendChild(tile);
  });
  
  document.getElementById('puzzleMoves').textContent = `Moves: ${gameState.puzzle.moves}`;
  
  if (isPuzzleSolved()) {
    setTimeout(() => {
      alert(`🎉 Puzzle solved in ${gameState.puzzle.moves} moves!`);
    }, 100);
  }
}

function movePuzzleTile(index) {
  const emptyIndex = gameState.puzzle.board.indexOf(0);
  const validMoves = getValidPuzzleMoves(emptyIndex);
  
  if (validMoves.includes(index)) {
    [gameState.puzzle.board[emptyIndex], gameState.puzzle.board[index]] = 
    [gameState.puzzle.board[index], gameState.puzzle.board[emptyIndex]];
    gameState.puzzle.moves++;
    renderPuzzle();
  }
}

function isPuzzleSolved() {
  return gameState.puzzle.board.every((num, index) => 
    index === 8 ? num === 0 : num === index + 1
  );
}

// ===== MEMORY CARD GAME =====
const memoryEmojis = ['🌟', '🎨', '🎵', '🌸', '🦋', '🍕', '🎮', '⚡'];

function initMemory() {
  const cards = [...memoryEmojis, ...memoryEmojis]
    .sort(() => Math.random() - 0.5);
  
  gameState.memory = { flippedCards: [], matchedPairs: 0, canFlip: true, cards };
  renderMemory();
}

function renderMemory() {
  const boardEl = document.getElementById('memoryBoard');
  boardEl.innerHTML = '';
  
  gameState.memory.cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    
    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '❓';
    
    const front = document.createElement('div');
    front.className = 'card-front';
    front.textContent = emoji;
    
    card.appendChild(back);
    card.appendChild(front);
    
    if (gameState.memory.flippedCards.includes(index)) {
      card.classList.add('flipped');
    }
    
    card.onclick = () => flipMemoryCard(index);
    boardEl.appendChild(card);
  });
  
  document.getElementById('memoryScore').textContent = 
    `Matches: ${gameState.memory.matchedPairs}/8`;
    
  if (gameState.memory.matchedPairs === 8) {
    setTimeout(() => {
      alert('🎉 You found all pairs! Great memory!');
    }, 500);
  }
}

function flipMemoryCard(index) {
  if (!gameState.memory.canFlip || gameState.memory.flippedCards.includes(index)) return;
  
  gameState.memory.flippedCards.push(index);
  renderMemory();
  
  if (gameState.memory.flippedCards.length === 2) {
    gameState.memory.canFlip = false;
    const [first, second] = gameState.memory.flippedCards;
    
    if (gameState.memory.cards[first] === gameState.memory.cards[second]) {
      // Match found
      gameState.memory.matchedPairs++;
      setTimeout(() => {
        const cards = document.querySelectorAll('.memory-card');
        cards[first].classList.add('matched');
        cards[second].classList.add('matched');
        gameState.memory.flippedCards = [];
        gameState.memory.canFlip = true;
        renderMemory();
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        gameState.memory.flippedCards = [];
        gameState.memory.canFlip = true;
        renderMemory();
      }, 1000);
    }
  }
}

// ===== COLOR MATCH GAME =====
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

function initColorMatch() {
  gameState.color.score = 0;
  newColorRound();
}

function newColorRound() {
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  gameState.color.currentColor = targetColor;
  
  document.getElementById('colorDisplay').style.backgroundColor = targetColor;
  
  // Generate options (target + 2 random)
  const options = [targetColor];
  while (options.length < 3) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (!options.includes(randomColor)) {
      options.push(randomColor);
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  const optionsEl = document.getElementById('colorOptions');
  optionsEl.innerHTML = '';
  
  options.forEach(color => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.style.backgroundColor = color;
    option.onclick = () => checkColorMatch(color, option);
    optionsEl.appendChild(option);
  });
  
  document.getElementById('colorScore').textContent = `Score: ${gameState.color.score}`;
}

function checkColorMatch(selectedColor, element) {
  if (selectedColor === gameState.color.currentColor) {
    element.classList.add('correct');
    gameState.color.score++;
    setTimeout(newColorRound, 500);
  } else {
    element.classList.add('wrong');
    setTimeout(() => {
      element.classList.remove('wrong');
    }, 500);
  }
}

// ===== NUMBER GUESS GAME =====
function initNumberGame() {
  gameState.number.target = Math.floor(Math.random() * 100) + 1;
  gameState.number.attempts = 0;
  document.getElementById('numberInput').value = '';
  document.getElementById('numberHint').textContent = '';
  document.getElementById('numberAttempts').textContent = 'Attempts: 0';
}

function guessNumber() {
  const input = document.getElementById('numberInput');
  const guess = parseInt(input.value);
  
  if (!guess || guess < 1 || guess > 100) {
    document.getElementById('numberHint').textContent = 'Enter a valid number (1-100)';
    return;
  }
  
  gameState.number.attempts++;
  document.getElementById('numberAttempts').textContent = 
    `Attempts: ${gameState.number.attempts}`;
  
  const diff = Math.abs(guess - gameState.number.target);
  
  if (guess === gameState.number.target) {
    document.getElementById('numberHint').textContent = 
      `🎉 Correct! You got it in ${gameState.number.attempts} attempts!`;
    document.getElementById('numberHint').style.color = 'var(--color-success)';
    setTimeout(initNumberGame, 2000);
  } else if (diff <= 5) {
    document.getElementById('numberHint').textContent = '🔥 Very hot!';
    document.getElementById('numberHint').style.color = 'var(--color-danger)';
  } else if (diff <= 10) {
    document.getElementById('numberHint').textContent = '🌡️ Hot!';
    document.getElementById('numberHint').style.color = 'var(--color-accent)';
  } else if (diff <= 20) {
    document.getElementById('numberHint').textContent = guess > gameState.number.target ? '↓ Lower' : '↑ Higher';
    document.getElementById('numberHint').style.color = 'var(--color-secondary)';
  } else {
    document.getElementById('numberHint').textContent = guess > gameState.number.target ? '❄️ Too high' : '❄️ Too low';
    document.getElementById('numberHint').style.color = 'var(--color-text-light)';
  }
  
  input.value = '';
  input.focus();
}

// ===== WORD SCRAMBLE GAME =====
const wordList = [
  { word: 'HAPPINESS', hint: 'A feeling of joy' },
  { word: 'MINDFUL', hint: 'Being present and aware' },
  { word: 'PEACEFUL', hint: 'Calm and tranquil' },
  { word: 'GRATITUDE', hint: 'Feeling thankful' },
  { word: 'WELLNESS', hint: 'State of good health' },
  { word: 'POSITIVE', hint: 'Optimistic attitude' },
  { word: 'COURAGE', hint: 'Bravery in face of fear' },
  { word: 'KINDNESS', hint: 'Being gentle and caring' },
  { word: 'BALANCE', hint: 'State of equilibrium' },
  { word: 'SERENITY', hint: 'Perfect peace' }
];

function initWordScramble() {
  gameState.word.score = 0;
  newWordRound();
}

function newWordRound() {
  const wordData = wordList[Math.floor(Math.random() * wordList.length)];
  gameState.word.currentWord = wordData.word;
  gameState.word.hint = wordData.hint;
  
  // Scramble the word
  const letters = wordData.word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  gameState.word.scrambled = letters.join('');
  
  // Make sure it's actually scrambled
  if (gameState.word.scrambled === gameState.word.currentWord) {
    newWordRound();
    return;
  }
  
  document.getElementById('scrambledWord').textContent = gameState.word.scrambled;
  document.getElementById('wordHint').textContent = `Hint: ${gameState.word.hint}`;
  document.getElementById('wordInput').value = '';
  document.getElementById('wordScore').textContent = `Score: ${gameState.word.score}`;
}

function checkWord() {
  const input = document.getElementById('wordInput');
  const guess = input.value.toUpperCase().trim();
  
  if (guess === gameState.word.currentWord) {
    gameState.word.score++;
    document.getElementById('wordHint').textContent = '🎉 Correct!';
    document.getElementById('wordHint').style.color = 'var(--color-success)';
    setTimeout(newWordRound, 1000);
  } else {
    document.getElementById('wordHint').textContent = `Try again! Hint: ${gameState.word.hint}`;
    document.getElementById('wordHint').style.color = 'var(--color-danger)';
    input.value = '';
  }
}

// Initialize games when tab is opened
document.addEventListener('DOMContentLoaded', () => {
  // Game selector buttons
  const gameBtns = document.querySelectorAll('.game-btn');
  gameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const gameType = btn.dataset.game;
      openGame(gameType);
    });
  });
  
  // Puzzle Game
  if (document.getElementById('shufflePuzzleBtn')) {
    document.getElementById('shufflePuzzleBtn').addEventListener('click', initPuzzle);
    initPuzzle();
  }
  
  // Memory Game
  if (document.getElementById('startMemoryBtn')) {
    document.getElementById('startMemoryBtn').addEventListener('click', initMemory);
    initMemory();
  }
  
  // Color Game - initialize when opened
  
  // Number Game
  if (document.getElementById('guessBtn')) {
    document.getElementById('guessBtn').addEventListener('click', guessNumber);
    document.getElementById('newNumberBtn').addEventListener('click', initNumberGame);
    document.getElementById('numberInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') guessNumber();
    });
    initNumberGame();
  }
  
  // Word Game
  if (document.getElementById('wordSubmitBtn')) {
    document.getElementById('wordSubmitBtn').addEventListener('click', checkWord);
    document.getElementById('wordSkipBtn').addEventListener('click', newWordRound);
    document.getElementById('wordInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkWord();
    });
    initWordScramble();
  }
});

// Open specific game
function openGame(gameType) {
  // Hide selector
  const selector = document.querySelector('.game-selector');
  if (selector) selector.classList.add('hidden');
  
  // Hide all game cards
  document.querySelectorAll('[id$="GameCard"]').forEach(card => {
    card.classList.add('hidden');
  });
  
  // Show selected game
  const gameCard = document.getElementById(`${gameType}GameCard`);
  if (gameCard) {
    gameCard.classList.remove('hidden');
    
    // Initialize game if needed
    if (gameType === 'puzzle') {
      initPuzzle();
    } else if (gameType === 'memory') {
      initMemory();
    } else if (gameType === 'color') {
      initColorMatch();
    } else if (gameType === 'number') {
      initNumberGame();
    } else if (gameType === 'word') {
      initWordScramble();
    }
  }
}

// Close game and return to selector
function closeGame() {
  // Show selector
  const selector = document.querySelector('.game-selector');
  if (selector) selector.classList.remove('hidden');
  
  // Hide all game cards
  document.querySelectorAll('[id$="GameCard"]').forEach(card => {
    card.classList.add('hidden');
  });
}

