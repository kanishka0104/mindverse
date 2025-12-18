// ============================================
// Authentication - MindVerse
// Handle user login, signup, and authentication
// ============================================

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, redirect to home
      console.log('User already logged in:', user.email);
      window.location.href = 'index.html';
    }
  });
});

// ============================================
// Show/Hide Forms
// ============================================

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  hideError();
  resetPhoneLogin();
}

function showSignupForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  hideError();
}

function showForgotPasswordForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
  hideError();
}

function showLoading() {
  document.getElementById('authLoading').style.display = 'flex';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function hideLoading() {
  document.getElementById('authLoading').style.display = 'none';
}

function showError(message) {
  const errorDiv = document.getElementById('authError');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  document.getElementById('authError').style.display = 'none';
}

// ============================================
// Handle Login (Email/Password)
// ============================================

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Validation
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  try {
    showLoading();
    
    // Sign in with Firebase Auth
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('✅ User logged in successfully:', user.email);
    
    // Store user ID in localStorage for compatibility with existing code
    localStorage.setItem('mindverse_user_id', user.uid);
    
    // Redirect to home page
    window.location.href = 'index.html';
    
  } catch (error) {
    hideLoading();
    console.error('❌ Login error:', error);
    
    // User-friendly error messages
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please sign up.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    
    // Show the login form again
    document.getElementById('loginForm').style.display = 'block';
  }
}

// Allow Enter key to submit login
document.addEventListener('DOMContentLoaded', () => {
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  
  if (loginEmail) {
    [loginEmail, loginPassword].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleLogin();
        }
      });
    });
  }
});

// ============================================
// Handle Signup
// ============================================

async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupPasswordConfirm').value;
  
  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showError('Please fill in all required fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  try {
    showLoading();
    
    // Create user with Firebase Auth
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('✅ User account created:', user.email);
    
    // Update user profile with name
    await user.updateProfile({
      displayName: name
    });
    
    // Store user ID in localStorage for compatibility
    localStorage.setItem('mindverse_user_id', user.uid);
    
    // Create user profile in Firestore
    await firebase.firestore().collection('userProfiles').doc(user.uid).set({
      userId: user.uid,
      name: name,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      focusArea: 'general',
      preferredTimeOfDay: 'morning'
    });
    
    console.log('✅ User profile created in Firestore');
    
    // Redirect to home page
    window.location.href = 'index.html';
    
  } catch (error) {
    hideLoading();
    console.error('❌ Signup error:', error);
    
    // User-friendly error messages
    let errorMessage = 'Signup failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists. Please sign in.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use a stronger password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    
    // Show the signup form again
    document.getElementById('signupForm').style.display = 'block';
  }
}

// Allow Enter key to submit signup
document.addEventListener('DOMContentLoaded', () => {
  const signupConfirm = document.getElementById('signupPasswordConfirm');
  
  if (signupConfirm) {
    signupConfirm.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSignup();
      }
    });
  }
});

// ============================================
// Validation Helpers
// ============================================

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// Password Reset
// ============================================

window.handlePasswordReset = async function() {
  const email = document.getElementById('resetEmail').value.trim();
  
  if (!email) {
    showError('Please enter your email address');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  try {
    showLoading();
    
    // Send password reset email
    await firebase.auth().sendPasswordResetEmail(email);
    
    hideLoading();
    console.log('✅ Password reset email sent to:', email);
    
    // Show success message
    document.getElementById('forgotPasswordForm').style.display = 'none';
    document.getElementById('authError').style.display = 'block';
    document.getElementById('authError').style.background = '#d4edda';
    document.getElementById('authError').style.color = '#155724';
    document.getElementById('authError').style.border = '1px solid #c3e6cb';
    document.getElementById('authError').textContent = 
      '✅ Password reset link sent! Check your email inbox and spam folder.';
    
    // Switch back to login form after 3 seconds
    setTimeout(() => {
      showLoginForm();
    }, 3000);
    
  } catch (error) {
    hideLoading();
    console.error('❌ Password reset error:', error);
    
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    document.getElementById('forgotPasswordForm').style.display = 'block';
  }
};

console.log('Authentication script loaded');
