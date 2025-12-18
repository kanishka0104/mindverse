// ============================================
// Journal Page - MindVerse
// Journal entries and gratitude tracking
// ============================================
// Require authentication
FirebaseAuth.requireAuth();
const userId = MindVerse.getOrCreateUserId();

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Journal page loaded for user:', userId);
  
  // Set date headers
  setDateHeaders();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load entries
  await loadJournalEntries();
  await loadGratitudeEntries();
});

// ============================================
// Date Headers
// ============================================

function setDateHeaders() {
  const today = MindVerse.formatDateOnly(Date.now());
  document.getElementById('journalDateHeader').textContent = today;
  document.getElementById('gratitudeDateHeader').textContent = today;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });
  
  // Save buttons
  document.getElementById('saveJournalBtn').addEventListener('click', saveJournalEntry);
  document.getElementById('saveGratitudeBtn').addEventListener('click', saveGratitudeEntry);
}

// ============================================
// Tab Switching
// ============================================

function switchTab(clickedTab) {
  const tabName = clickedTab.dataset.tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  clickedTab.classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  if (tabName === 'journal') {
    document.getElementById('journalTab').classList.add('active');
  } else if (tabName === 'gratitude') {
    document.getElementById('gratitudeTab').classList.add('active');
  }
}

// ============================================
// Save Journal Entry
// ============================================

async function saveJournalEntry() {
  const content = document.getElementById('journalContent').value.trim();
  
  if (!content) {
    MindVerse.showToast('Please write something first', 'error');
    return;
  }
  
  const btn = document.getElementById('saveJournalBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    const entryData = {
      userId: userId,
      type: 'journal',
      content: content,
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('journalEntries', entryData);
    
    MindVerse.showToast('Journal entry saved!', 'success');
    
    // Clear textarea
    document.getElementById('journalContent').value = '';
    
    // Reload entries
    await loadJournalEntries();
    
  } catch (error) {
    console.error('Error saving journal entry:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

// ============================================
// Save Gratitude Entry
// ============================================

async function saveGratitudeEntry() {
  const item1 = document.getElementById('gratitude1').value.trim();
  const item2 = document.getElementById('gratitude2').value.trim();
  const item3 = document.getElementById('gratitude3').value.trim();
  
  if (!item1 || !item2 || !item3) {
    MindVerse.showToast('Please fill in all three items', 'error');
    return;
  }
  
  const btn = document.getElementById('saveGratitudeBtn');
  MindVerse.setButtonLoading(btn, true);
  
  try {
    const entryData = {
      userId: userId,
      type: 'gratitude',
      item1: item1,
      item2: item2,
      item3: item3,
      timestamp: Date.now()
    };
    
    await FirebaseDB.addDocument('journalEntries', entryData);
    
    MindVerse.showToast('Gratitude saved! ✨', 'success');
    
    // Clear inputs
    document.getElementById('gratitude1').value = '';
    document.getElementById('gratitude2').value = '';
    document.getElementById('gratitude3').value = '';
    
    // Reload entries
    await loadGratitudeEntries();
    
  } catch (error) {
    console.error('Error saving gratitude entry:', error);
    MindVerse.showToast('Failed to save. Please try again.', 'error');
  } finally {
    MindVerse.setButtonLoading(btn, false);
  }
}

// ============================================
// Load Journal Entries
// ============================================

async function loadJournalEntries() {
  const container = document.getElementById('journalEntriesContainer');
  
  try {
    // Query journal entries (type = 'journal')
    const entries = await FirebaseDB.queryDocuments(
      'journalEntries',
      [
        ['userId', '==', userId],
        ['type', '==', 'journal']
      ],
      'timestamp',
      'desc',
      20 // Last 20 entries
    );
    
    if (entries.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          No journal entries yet. Start writing above!
        </p>
      `;
      return;
    }
    
    // Display entries
    const entriesHTML = entries.map(entry => {
      const preview = entry.content.length > 150 
        ? entry.content.substring(0, 150) + '...' 
        : entry.content;
      
      return `
        <div class="journal-entry" data-entry-id="${entry.id}" onclick="toggleJournalEntry('${entry.id}')">
          <div class="journal-entry-header">
            <span class="journal-date">${MindVerse.formatDate(entry.timestamp)}</span>
            <span class="journal-type">Journal</span>
          </div>
          <div class="journal-content" id="content-${entry.id}">
            ${preview}
          </div>
          <div class="journal-content hidden" id="full-${entry.id}">
            ${entry.content}
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = entriesHTML;
    
  } catch (error) {
    console.error('Error loading journal entries:', error);
    container.innerHTML = `
      <p class="text-center" style="color: var(--color-text-light);">
        Unable to load entries. Please check your connection.
      </p>
    `;
  }
}

// ============================================
// Toggle Journal Entry Expansion
// ============================================

window.toggleJournalEntry = function(entryId) {
  const preview = document.getElementById(`content-${entryId}`);
  const full = document.getElementById(`full-${entryId}`);
  
  if (preview && full) {
    if (full.classList.contains('hidden')) {
      // Expand
      preview.classList.add('hidden');
      full.classList.remove('hidden');
    } else {
      // Collapse
      preview.classList.remove('hidden');
      full.classList.add('hidden');
    }
  }
};

// ============================================
// Load Gratitude Entries
// ============================================

async function loadGratitudeEntries() {
  const container = document.getElementById('gratitudeEntriesContainer');
  
  try {
    // Query gratitude entries (type = 'gratitude')
    const entries = await FirebaseDB.queryDocuments(
      'journalEntries',
      [
        ['userId', '==', userId],
        ['type', '==', 'gratitude']
      ],
      'timestamp',
      'desc',
      15 // Last 15 entries
    );
    
    if (entries.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light); grid-column: 1 / -1;">
          No gratitude entries yet. Start writing above!
        </p>
      `;
      return;
    }
    
    // Display entries as sticky note cards
    const entriesHTML = entries.map(entry => {
      return `
        <div class="gratitude-card fade-in">
          <div class="gratitude-date">${MindVerse.formatDateOnly(entry.timestamp)}</div>
          <div class="gratitude-item">${entry.item1}</div>
          <div class="gratitude-item">${entry.item2}</div>
          <div class="gratitude-item">${entry.item3}</div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = entriesHTML;
    
  } catch (error) {
    console.error('Error loading gratitude entries:', error);
    container.innerHTML = `
      <p class="text-center" style="color: var(--color-text-light); grid-column: 1 / -1;">
        Unable to load entries. Please check your connection.
      </p>
    `;
  }
}

console.log('Journal page script loaded');
