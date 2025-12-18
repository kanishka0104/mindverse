// ============================================
// Firebase Configuration - MindVerse
// Initialize Firebase and Firestore
// ============================================

// Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
// Get these from Firebase Console > Project Settings > Your apps > Firebase SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSyDHWGQpH5iOvY-ygavDBR3yA04FeQcuQxk",
  authDomain: "mindverse-9d08c.firebaseapp.com",
  projectId: "mindverse-9d08c",
  storageBucket: "mindverse-9d08c.firebasestorage.app",
  messagingSenderId: "267010609486",
  appId: "1:267010609486:web:695c8054a8a6e9c86a8e1f"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
  // Initialize Firebase App
  app = firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  
  // Initialize Firestore
  db = firebase.firestore();
  console.log('Firestore initialized successfully');
  
  // Initialize Firebase Authentication
  auth = firebase.auth();
  console.log('Firebase Auth initialized successfully');
  //   .catch((error) => {
  
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.log('Please update firebase-config.js with your Firebase credentials');
}

// ============================================
// Authentication Check (for protected pages)
// ============================================

/**
 * Check if user is authenticated
 * Redirects to auth.html if not logged in
 * Call this function on every protected page
 */
function requireAuth() {
  // Skip auth check on auth page itself
  if (window.location.pathname.includes('auth.html')) {
    return;
  }
  
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      // User is not logged in, redirect to auth page
      console.log('User not authenticated, redirecting to login...');
      window.location.href = 'auth.html';
    } else {
      // User is logged in, update localStorage for compatibility
      localStorage.setItem('mindverse_user_id', user.uid);
      console.log('User authenticated:', user.email);
    }
  });
}

// ============================================
// Logout Function
// ============================================

/**
 * Sign out the current user
 */
async function logout() {
  try {
    await firebase.auth().signOut();
    localStorage.removeItem('mindverse_user_id');
    console.log('User logged out successfully');
    window.location.href = 'auth.html';
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// ============================================
// Get Current User Info
// ============================================

/**
 * Get current authenticated user
 * @returns {Promise<object>} User object with uid, email, displayName
 */
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}

// ============================================
// Firestore Helper Functions
// ============================================

/**
 * Add a document to a collection
 * @param {string} collectionPath - Path to collection
 * @param {object} data - Data to add
 * @returns {Promise} Promise that resolves with document reference
 */
async function addDocument(collectionPath, data) {
  try {
    const docRef = await db.collection(collectionPath).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Document added with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

/**
 * Set a document (overwrites if exists)
 * @param {string} collectionPath - Path to collection
 * @param {string} docId - Document ID
 * @param {object} data - Data to set
 * @param {boolean} merge - Whether to merge with existing data
 * @returns {Promise} Promise that resolves when complete
 */
async function setDocument(collectionPath, docId, data, merge = true) {
  try {
    await db.collection(collectionPath).doc(docId).set(data, { merge });
    console.log('Document set:', docId);
    return true;
  } catch (error) {
    console.error('Error setting document:', error);
    throw error;
  }
}

/**
 * Get a document from a collection
 * @param {string} collectionPath - Path to collection
 * @param {string} docId - Document ID
 * @returns {Promise<object|null>} Document data or null
 */
async function getDocument(collectionPath, docId) {
  try {
    const doc = await db.collection(collectionPath).doc(docId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

/**
 * Query documents from a collection
 * @param {string} collectionPath - Path to collection
 * @param {Array} filters - Array of filter arrays [field, operator, value]
 * @param {string} orderByField - Field to order by
 * @param {string} orderDirection - 'asc' or 'desc'
 * @param {number} limit - Maximum number of documents
 * @returns {Promise<Array>} Array of documents
 */
async function queryDocuments(collectionPath, filters = [], orderByField = null, orderDirection = 'desc', limit = null) {
  try {
    let query = db.collection(collectionPath);
    
    // Apply filters
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    // Apply ordering
    if (orderByField) {
      query = query.orderBy(orderByField, orderDirection);
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
}

/**
 * Update a document
 * @param {string} collectionPath - Path to collection
 * @param {string} docId - Document ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Promise that resolves when complete
 */
async function updateDocument(collectionPath, docId, updates) {
  try {
    await db.collection(collectionPath).doc(docId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Document updated:', docId);
    return true;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document
 * @param {string} collectionPath - Path to collection
 * @param {string} docId - Document ID
 * @returns {Promise} Promise that resolves when complete
 */
async function deleteDocument(collectionPath, docId) {
  try {
    await db.collection(collectionPath).doc(docId).delete();
    console.log('Document deleted:', docId);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// ============================================
// Export for use in other scripts
// ============================================

window.FirebaseDB = {
  db,
  auth,
  addDocument,
  setDocument,
  getDocument,
  queryDocuments,
  updateDocument,
  deleteDocument
};

window.FirebaseAuth = {
  requireAuth,
  logout,
  getCurrentUser
};

console.log('Firebase configuration loaded');
