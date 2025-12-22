// Settings Page - MindVerse
// Theme management and user settings

(async function() {
  'use strict';

  // Authentication check
  await FirebaseAuth.requireAuth();
  const user = firebase.auth().currentUser;

  // Load user account information
  if (user) {
    document.getElementById('userEmail').textContent = user.email || 'Not available';
    
    if (user.metadata && user.metadata.creationTime) {
      const createdDate = new Date(user.metadata.creationTime);
      document.getElementById('accountCreated').textContent = MindVerse.formatDate(createdDate);
    }
  }

  // Theme Management
  const lightThemeBtn = document.getElementById('lightThemeBtn');
  const darkThemeBtn = document.getElementById('darkThemeBtn');
  const currentThemeDescription = document.getElementById('currentThemeDescription');

  // Load saved theme or default to light
  const savedTheme = localStorage.getItem('mindverse-theme') || 'light';
  applyTheme(savedTheme);

  // Theme button event listeners
  lightThemeBtn.addEventListener('click', () => {
    applyTheme('light');
    localStorage.setItem('mindverse-theme', 'light');
  });

  darkThemeBtn.addEventListener('click', () => {
    applyTheme('dark');
    localStorage.setItem('mindverse-theme', 'dark');
  });

  function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      lightThemeBtn.classList.remove('active');
      darkThemeBtn.classList.add('active');
      currentThemeDescription.textContent = "You're using dark mode - easier on the eyes at night";
    } else {
      body.classList.remove('dark-theme');
      lightThemeBtn.classList.add('active');
      darkThemeBtn.classList.remove('active');
      currentThemeDescription.textContent = "You're using light mode - bright and clear";
    }
  }

  // Export Data functionality
  document.getElementById('exportDataBtn').addEventListener('click', async () => {
    try {
      const userId = await MindVerse.getOrCreateUserId();
      const exportData = {
        exported: new Date().toISOString(),
        userId: userId,
        email: user.email,
        data: {}
      };

      // Fetch mood entries
      try {
        const moodSnapshot = await firebase.firestore()
          .collection('moodEntries')
          .doc(userId)
          .collection('entries')
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get();
        
        exportData.data.moodEntries = moodSnapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString()
        }));
      } catch (error) {
        console.log('No mood entries found');
      }

      // Fetch journal entries
      try {
        const journalSnapshot = await firebase.firestore()
          .collection('journalEntries')
          .doc(userId)
          .collection('entries')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();
        
        exportData.data.journalEntries = journalSnapshot.docs.map(doc => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString()
        }));
      } catch (error) {
        console.log('No journal entries found');
      }

      // Fetch activities
      try {
        const activitiesSnapshot = await firebase.firestore()
          .collection('activitiesCompleted')
          .doc(userId)
          .collection('activities')
          .orderBy('completedAt', 'desc')
          .limit(100)
          .get();
        
        exportData.data.activities = activitiesSnapshot.docs.map(doc => ({
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate().toISOString()
        }));
      } catch (error) {
        console.log('No activities found');
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindverse-data-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✓ Your data has been exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  });

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const confirm = window.confirm('Are you sure you want to log out?');
    if (confirm) {
      await FirebaseAuth.logout();
    }
  });

})();
