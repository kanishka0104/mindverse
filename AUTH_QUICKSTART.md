# 🚀 Quick Start - MindVerse with Authentication

## Step 1: Enable Firebase Authentication (5 minutes)

### Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on your project: **mindverse-9d08c**

### Enable Email/Password Authentication
1. Click **"Authentication"** in the left sidebar
2. Click **"Get Started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first option (Email/Password)
6. Click **"Save"**

✅ **Done!** Authentication is now enabled.

## Step 2: Open the App

### Option A: Open Locally
1. Open `auth.html` in your web browser
2. Create an account or log in
3. Start using MindVerse!

### Option B: Deploy to Firebase Hosting
```bash
# Install Firebase CLI (one-time setup)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting in your project folder
firebase init hosting

# Choose:
# - Use existing project: mindverse-9d08c
# - Public directory: . (current directory)
# - Single page app: No
# - Set up automatic builds: No

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://mindverse-9d08c.web.app`

## Step 3: Create Your First Account

1. Visit `auth.html` (or your deployed URL)
2. Click **"Create one"** to sign up
3. Enter:
   - Your name
   - Email address  
   - Password (min 6 characters)
   - Confirm password
4. Click **"Create Account"**
5. You'll be automatically logged in! 🎉

## Step 4: Explore MindVerse

Now you can use all features:
- 🏠 **Home**: Check in with your mood
- 🫁 **Breathe**: Guided breathing exercises
- 📔 **Journal**: Daily journaling and gratitude
- ✨ **Activities**: Pleasant activities to boost mood
- 🎯 **Skills**: Learn new skills
- 📚 **Learn**: Mental health education
- 👤 **Profile**: View progress and preferences

## Troubleshooting

### "Missing or insufficient permissions"
- Make sure you enabled Email/Password in Firebase Console
- Wait 1-2 minutes after enabling for changes to propagate

### "Network request failed"
- Check your internet connection
- Make sure Firebase project is active

### Can't see the login page
- Make sure you're opening `auth.html` or visiting your deployed URL
- Check browser console for errors (F12)

### Need to reset everything?
```javascript
// Run this in browser console to clear local data
localStorage.clear();
location.reload();
```

## What's Next?

### Update Security Rules (Recommended for Production)
In Firebase Console > Firestore Database > Rules, update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Optional Enhancements
- Enable email verification in Firebase Console
- Add password reset functionality
- Customize the auth page design
- Add profile pictures
- Enable Google Sign-In

## File Structure
```
mindverse/
├── auth.html              ← Login/Signup page (START HERE)
├── auth.js                ← Authentication logic
├── index.html             ← Home page (requires login)
├── firebase-config.js     ← Firebase setup + auth functions
├── common.js              ← Shared utilities
├── styles.css             ← All styles including auth
├── [other pages].html     ← All other app pages
└── [other scripts].js     ← Page-specific logic
```

## Support

Read the full documentation:
- **AUTHENTICATION.md** - Complete authentication system documentation
- **QUICK_START.md** - Firebase and Firestore setup (original)
- **INDEX_REFERENCE.md** - Firestore indexes

---

**Ready to support your mental health journey!** 🧠💙

Need help? Check the browser console (F12) for detailed error messages.
