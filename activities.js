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
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Activities page loaded for user:', userId);
  
  renderActivities();
  await loadDailySummary();
});

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
            onclick="completeActivity('${activity.id}', '${activity.title}')"
          >
            ✓ Do This Now
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = activitiesHTML;
}

// ============================================
// Complete Activity
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
