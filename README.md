# MindVerse - Mental Health Support Web App

A complete mental health support web application built with vanilla HTML, CSS, JavaScript, and Firebase. Designed to provide simple, calming micro-activities for emotional stability.

## 🌟 Features

### Home Page (index.html)
- **Mood Check-in**: Track your emotional state with 5 mood options
- **Mood History**: View your recent mood entries
- **Today's Plan**: Personalized suggestions based on your focus area and current mood
- **Daily Affirmations**: Supportive messages with favorites system

### Breathe Page (breathe.html)
- **Animated Breathing Circle**: Visual guide for breathing exercises
- **Multiple Durations**: 1, 3, or 5-minute sessions
- **Progress Tracking**: Track your breathing sessions over time
- **Post-Session Feedback**: Record how you feel after each session

### Journal Page (journal.html)
- **Journal Entries**: Free-form writing space for your thoughts
- **Gratitude Tracking**: Record three good things each day
- **Entry History**: Browse and expand previous entries
- **Beautiful Card Layout**: Gratitude entries displayed as visual cards

### Activities Page (activities.html)
- **16 Pleasant Activities**: Small actions to boost mood
- **Activity Cards**: Clear descriptions with estimated time
- **Progress Tracking**: Daily and weekly activity completion stats
- **Celebration Feedback**: Positive reinforcement on completion

### Learn Page (learn.html)
- **6 Educational Topics**: Mental health psychoeducation
- **5-4-3-2-1 Grounding**: Anxiety management technique
- **Sleep Tips**: Evidence-based sleep hygiene
- **Self-Compassion**: Learning to be kind to yourself
- **Crisis Resources**: Important disclaimer and helpline information

### Profile Page (profile.html)
- **User Preferences**: Customize focus area and preferred usage time
- **Progress Stats**: View your activity over the past 7 days
- **Streak Tracking**: Motivation through consecutive days of use
- **Favorite Affirmations**: Collection of saved messages
- **Weekly Activity Calendar**: Visual representation of daily engagement

## 🎨 Design Features

- **Mobile-First**: Responsive design that works on all screen sizes
- **Calming Color Palette**: Soft teal, muted rose, and sage green
- **Smooth Animations**: Gentle transitions and effects
- **Accessible**: High contrast, large touch targets, keyboard navigation
- **Bottom Navigation**: Easy thumb-reach navigation on mobile

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, flexbox, grid, animations
- **Vanilla JavaScript (ES6+)**: No frameworks
- **Firebase**: Backend as a service
  - Firestore: NoSQL database
  - (Optional) Anonymous Auth

## 📦 File Structure

```
mindverse/
├── index.html              # Home page with mood check-in
├── breathe.html            # Breathing exercises
├── journal.html            # Journal and gratitude
├── activities.html         # Pleasant activities
├── learn.html              # Educational content
├── profile.html            # User profile and stats
├── styles.css              # Global styles
├── common.js               # Shared utilities and functions
├── firebase-config.js      # Firebase initialization
├── home.js                 # Home page logic
├── breathe.js              # Breathing page logic
├── journal.js              # Journal page logic
├── activities.js           # Activities page logic
├── learn.js                # Learn page logic
├── profile.js              # Profile page logic
└── README.md               # This file
```

## 🚀 Setup Instructions

### 1. Firebase Configuration

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Firestore**:
   - In your Firebase project, go to "Firestore Database"
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select a location

3. **Get Your Config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the Firebase configuration object

4. **Update firebase-config.js**:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

5. **Set Up Firestore Rules** (for development):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // WARNING: For development only!
       }
     }
   }
   ```

   For production, implement proper security rules based on your authentication method.

### 2. Local Development

**Option A: Using Python's HTTP Server**
```bash
cd mindverse
python -m http.server 8000
```
Then open http://localhost:8000

**Option B: Using Node.js http-server**
```bash
npm install -g http-server
cd mindverse
http-server
```

**Option C: Using VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click on index.html
- Select "Open with Live Server"

### 3. Production Deployment

**Firebase Hosting** (Recommended):
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**Alternative Hosting Options**:
- Netlify: Drag and drop the folder
- Vercel: Connect your Git repository
- GitHub Pages: Push to a repository and enable Pages
- Any static hosting service

## 📊 Firebase Data Structure

```
Firestore Collections:

userProfiles/{userId}
  - focusArea: string
  - preferredTimeOfDay: string
  - createdAt: timestamp
  - updatedAt: timestamp

moodEntries/{entryId}
  - userId: string
  - mood: string (awful|low|meh|okay|great)
  - note: string
  - timestamp: number

journalEntries/{entryId}
  - userId: string
  - type: string (journal|gratitude)
  - content: string (for journal)
  - item1, item2, item3: string (for gratitude)
  - timestamp: number

breathingSessions/{sessionId}
  - userId: string
  - duration: number (seconds)
  - afterFeeling: string (worse|same|better)
  - timestamp: number

activitiesCompleted/{entryId}
  - userId: string
  - activityId: string
  - activityName: string
  - timestamp: number

favorites/{userId}/affirmations/{affirmationId}
  - userId: string
  - messageText: string
  - timestamp: number
```

## 🔒 Security Considerations

1. **Production Firestore Rules**: Update rules to secure data by user
   ```
   match /moodEntries/{entry} {
     allow read, write: if request.auth.uid == resource.data.userId;
   }
   ```

2. **User Authentication**: Consider implementing Firebase Auth for better security

3. **Data Validation**: Add validation rules in Firestore

4. **API Key**: While the Firebase API key can be public, configure app restrictions in Google Cloud Console

## 🎯 User Flow

1. **First Visit**:
   - User lands on home page
   - Random affirmation displayed
   - Prompted to check in with mood
   - Personalized plan shown (or default suggestions)

2. **Regular Use**:
   - Check in with mood daily
   - Complete suggested activities
   - Use breathing exercises when stressed
   - Journal thoughts and gratitude
   - Track progress and build streak

3. **Profile Setup**:
   - Set focus area (e.g., "reduce anxiety")
   - Choose preferred time of day
   - Plan recommendations adapt accordingly

## 🧪 Testing

**Manual Testing Checklist**:
- [ ] Mood check-in saves and displays in history
- [ ] Breathing timer works correctly
- [ ] Journal entries save and can be expanded
- [ ] Gratitude cards display properly
- [ ] Activities mark as complete
- [ ] Profile preferences save
- [ ] Streak calculates correctly
- [ ] Navigation works on all pages
- [ ] Responsive on mobile and desktop
- [ ] Affirmations can be favorited

## 🤝 Contributing

This is a complete implementation based on specifications. To modify:

1. **Add New Activities**: Edit the `ACTIVITIES` array in `activities.js`
2. **Add New Topics**: Edit the `TOPICS` array in `learn.js`
3. **Add Affirmations**: Edit the `AFFIRMATIONS` array in `common.js`
4. **Customize Styles**: Modify CSS variables in `styles.css`
5. **Add Features**: Create new HTML pages and corresponding JS files

## ⚠️ Important Notes

1. **Not a Medical Device**: This app is for general wellness support only
2. **Professional Help**: Always includes crisis resources and disclaimers
3. **Data Privacy**: Users should be informed about data storage
4. **Browser Support**: Modern browsers required (ES6+ support)
5. **Offline**: Requires internet connection for Firebase operations

## 📱 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

## 🎓 Educational Purpose

This app demonstrates:
- Vanilla JavaScript patterns
- Firebase integration without frameworks
- Mobile-first responsive design
- Multi-page navigation without routing libraries
- Local storage management
- Async/await patterns
- CSS animations and transitions
- Accessibility best practices

## 📄 License

This is a demonstration project. Modify and use as needed for educational or personal projects.

## 💙 Mental Health Resources

If you're struggling:
- **988 Suicide & Crisis Lifeline** (US): Call or text 988
- **Crisis Text Line**: Text HOME to 741741
- **International**: Visit [findahelpline.com](https://findahelpline.com)

Remember: Seeking help is a sign of strength, not weakness.

---

**Built with care for those who need support** 💚
