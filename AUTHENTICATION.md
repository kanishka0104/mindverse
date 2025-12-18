# MindVerse Authentication System

## Overview
MindVerse now supports user accounts with Firebase Authentication! Users can create accounts, log in, and have their data securely associated with their account.

## Features

### ✅ User Account Creation
- **Email & Password Authentication**: Users can sign up with email and password
- **Name Display**: User's name is displayed in their profile
- **Secure Passwords**: Minimum 6 characters required
- **Email Validation**: Proper email format validation

### ✅ Login System
- **Persistent Sessions**: Users stay logged in across browser sessions
- **Secure Authentication**: All authentication handled by Firebase Auth
- **Error Handling**: User-friendly error messages for common issues

### ✅ Protected Pages
All pages (Home, Breathe, Journal, Activities, Skills, Learn, Profile) now require authentication:
- Unauthenticated users are redirected to the login page
- User data is private and isolated per account

### ✅ Logout Functionality
- **Logout Button**: Available on the Profile page
- **Confirmation Dialog**: Prevents accidental logouts
- **Clean Session**: Removes all local data on logout

## How It Works

### For Users

#### Creating an Account
1. Open `auth.html` (or visit the app URL - you'll be redirected)
2. Click "Create one" to switch to signup
3. Enter your name, email, and password
4. Click "Create Account"
5. You'll be automatically logged in and redirected to the home page

#### Logging In
1. Visit `auth.html`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your personalized home page

#### Logging Out
1. Go to your Profile page
2. Click the "Logout" button in the top right
3. Confirm the logout
4. You'll be redirected to the login page

### For Developers

#### Authentication Flow
1. **Page Load**: Every protected page calls `FirebaseAuth.requireAuth()`
2. **Auth Check**: Firebase verifies if user is logged in
3. **Redirect**: If not logged in, user is sent to `auth.html`
4. **User ID**: Authenticated user's Firebase UID is stored in localStorage as `mindverse_user_id`

#### Key Files
- **auth.html**: Login/signup page
- **auth.js**: Authentication logic (login, signup, form handling)
- **firebase-config.js**: Contains `requireAuth()`, `logout()`, and `getCurrentUser()` functions
- All page scripts (home.js, breathe.js, etc.): Call `FirebaseAuth.requireAuth()` at the top

#### Firebase Auth Functions

```javascript
// Require authentication on a page
FirebaseAuth.requireAuth();

// Logout current user
await FirebaseAuth.logout();

// Get current user info
const user = await FirebaseAuth.getCurrentUser();
// user.uid, user.email, user.displayName
```

## Firebase Console Setup

### Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (mindverse-9d08c)
3. Click "Authentication" in the left menu
4. Click "Get Started"
5. Click "Email/Password" under Sign-in method
6. Enable "Email/Password" (leave "Email link" disabled)
7. Click "Save"

### Security Rules (Already Configured)
The Firestore security rules allow all read/write for development. For production, update them to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own data
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /moodEntries/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /journalEntries/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /breathingSessions/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /activitiesCompleted/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /favorites/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /userSkills/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Migration from Old System

### Existing Users
- The old system used randomly generated user IDs stored in localStorage
- These IDs are not linked to any account
- When users create an account, they start fresh with a new Firebase UID
- Old data remains in localStorage but is not accessible after account creation

### Data Migration (Optional)
If you want to migrate existing localStorage data to authenticated accounts, you would need to:
1. Export data from localStorage before creating account
2. Create account
3. Import data to Firestore with new user ID

This was not implemented to keep the system simple and avoid complexity.

## Error Messages

### Login Errors
- **"No account found with this email"**: Email not registered
- **"Incorrect password"**: Wrong password entered
- **"Too many failed attempts"**: Account temporarily locked after multiple failed logins
- **"Network error"**: No internet connection

### Signup Errors
- **"An account with this email already exists"**: Email already registered
- **"Password is too weak"**: Use stronger password (min 6 characters)
- **"Invalid email address"**: Incorrect email format

## Testing

### Test Account
You can create test accounts with any email format:
- test@example.com / password123
- user@mindverse.app / mypassword

### Development Testing
For testing without internet:
1. Use Firebase Local Emulator Suite
2. Update firebase-config.js to point to emulators
3. See [Firebase Emulators documentation](https://firebase.google.com/docs/emulator-suite)

## Security Notes

### ✅ What's Secure
- Passwords are never stored in plain text
- Firebase handles all encryption and security
- User sessions are secure and expire properly
- Each user's data is isolated by Firebase UID

### ⚠️ Current Setup (Development)
- Firestore rules allow all read/write (see security rules above)
- Should be updated before production deployment
- No email verification required (can be enabled in Firebase Console)

### 🔒 Production Recommendations
1. Update Firestore security rules (see above)
2. Enable email verification in Firebase Console
3. Add password reset functionality
4. Implement rate limiting for login attempts
5. Add CAPTCHA for signup (reCAPTCHA)
6. Enable Firebase App Check for additional security

## Backwards Compatibility

### ✅ All Existing Features Work
- Mood tracking
- Breathing exercises
- Journal entries
- Gratitude logging
- Pleasant activities
- Educational content
- Skills learning
- Progress tracking
- Favorites

### User ID Compatibility
- `MindVerse.getOrCreateUserId()` still works
- Now returns Firebase Auth UID instead of random ID
- All existing code functions without modification

## Future Enhancements

### Possible Additions
- 📧 Email verification
- 🔑 Password reset via email
- 👤 Profile picture upload
- 🔗 Social login (Google, Facebook)
- 📱 Phone authentication
- 👥 Account linking (link multiple providers)
- 🔐 Two-factor authentication
- 📊 Admin dashboard for user management

## Support

### Common Issues

**Q: I can't log in after creating an account**
A: Check Firebase Console > Authentication to verify account was created

**Q: Authentication not working locally**
A: Make sure Firebase Auth is enabled in Firebase Console

**Q: Getting "Missing permissions" errors**
A: Check Firestore security rules allow authentication

**Q: Want to reset password**
A: Currently not implemented - delete account and create new one, or add password reset feature

### Need Help?
- Check browser console for detailed error messages
- Verify Firebase configuration in firebase-config.js
- Ensure internet connection is stable
- Check Firebase Console for account status

---

**MindVerse Authentication System** - Secure, simple, and user-friendly! 🔒✨
