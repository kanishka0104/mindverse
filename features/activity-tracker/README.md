# 📚 Study & Productivity Tracker

A professional, resume-grade personal study and productivity tracking application built with pure HTML, CSS, and vanilla JavaScript. This application helps students and learners maintain consistency, track progress, and improve their study habits through comprehensive analytics and goal-setting features.

## ✨ Features

### 🎯 Core Functionality

#### 1. **Dashboard (index.html)**
- Real-time study statistics and quick overview
- Current day streak counter with maintenance indicators
- Today's tasks summary with progress visualization
- Weekly overview with completion rates
- Quick action buttons for common tasks
- Motivational messages based on progress

#### 2. **Task Manager (tasks.html)**
- Create, edit, and delete study tasks
- Task properties:
  - Subject/Category
  - Description
  - Estimated time (in minutes)
  - Priority levels (High, Medium, Low)
  - Status tracking (Not Started, In Progress, Completed)
  - Date assignment
- Advanced filtering:
  - View by date (Today, This Week, All, Backlog)
  - Filter by status, priority, and subject
  - Sort by date or priority
- Visual progress indicators for each task
- Task summary statistics

#### 3. **Focus Timer (timer.html)**
- Per-task timer with start, pause, reset functionality
- Persistent timer state (survives page refresh)
- Automatic progress saving every 30 seconds
- Smart break reminders (Pomodoro-style, every 25 minutes)
- Real-time session tracking
- Timer state restoration for interrupted sessions
- Today's active tasks quick-select
- Study time statistics

#### 4. **Analytics Dashboard (analytics.html)**
- Time range selection (This Week, Last 2 Weeks, Last 30 Days)
- Key metrics:
  - Total study time
  - Completion rate
  - Average daily time
  - Productivity score
- Visual charts:
  - Daily progress bar chart
  - Subject-wise time distribution
  - Daily study scores
- Productivity quality analysis (actual vs estimated time)
- Backlog detection and analysis
- Streak information and consistency metrics
- Weekly comparison with percentage improvement
- Personalized insights and recommendations

#### 5. **Goals Manager (goals.html)**
- Weekly goal setting with target study time
- Real-time progress tracking
- Daily breakdown visualization
- Task carry-forward from previous week
- Weekly planning mode
- Priority subject tracking
- Motivational progress indicators
- Achievement notifications

#### 6. **Reflection System (reflection.html)**
- End-of-day reflection logging
- Mood tracking with emoji selection (5 levels)
- Structured reflection prompts:
  - What went well
  - Challenges faced
  - Key learnings
  - Tomorrow's plan
- Focus and energy level tracking (1-10 scale)
- Custom tags for categorization
- Past reflections browsing
- Weekly reflection insights and averages

#### 7. **Export System (export.html)**
- Data export in multiple formats:
  - **CSV**: Task data for spreadsheet analysis
  - **JSON**: Complete backup with all data
- Customizable date ranges:
  - This Week
  - Last 30 Days
  - All Time
  - Custom date range
- Data preview with statistics
- Storage usage information
- Raw data viewer
- Data clearing functionality

### 📊 Advanced Analytics

- **Daily Study Scoring**: 0-100 score based on task completion and time spent
- **Weekly/Bi-weekly Analytics**: Comparative analysis with percentage improvements
- **Subject-wise Distribution**: Visual breakdown of time spent per subject
- **Backlog Detection**: Automatic identification of overdue tasks
- **Productivity Quality**: Ratio analysis of actual vs planned time
- **Streak System**: Maintains streak with minimum 10 minutes daily study
- **Study Pattern Analysis**: Consistency tracking and recommendations

### 🎨 UI/UX Features

- **Minimal & Distraction-free Design**: Clean interface focusing on content
- **Mobile Responsive**: Fully functional on phones, tablets, and desktops
- **Light/Dark Mode**: Toggle between themes with persistent preference
- **Smooth Animations**: CSS transitions for enhanced user experience
- **Soft Color Themes**: Easy-on-the-eyes color palette
- **Accessibility**: Semantic HTML and ARIA labels
- **Professional Typography**: System font stack for optimal readability

### 💾 Data Management

- **100% Offline**: Works completely offline using localStorage
- **Persistent Storage**: All data stored locally in browser
- **Date-based Keys**: Organized storage with YYYY-MM-DD format
- **Auto-save**: Timer progress saved automatically
- **Export/Backup**: Regular backup recommendations
- **Edge Case Handling**: Graceful handling of missing data and errors

## 📁 Project Structure

```
activity-tracker/
│
├── index.html           # Main dashboard
├── tasks.html          # Task management page
├── timer.html          # Focus timer page
├── analytics.html      # Analytics and insights
├── goals.html          # Weekly goals manager
├── reflection.html     # Daily reflection system
├── export.html         # Data export page
│
├── style.css           # Comprehensive styling with themes
└── shared-utils.js     # Shared utilities and functions
```

## 🚀 Getting Started

### Installation

1. **Download or Clone** all files to a local directory
2. **Open** `index.html` in your web browser
3. **Start Using** - No installation, server, or dependencies required!

### First Steps

1. **Add Your First Task**: Click "Add Task" and fill in the details
2. **Start a Study Session**: Go to Timer page and select a task
3. **Set a Weekly Goal**: Visit Goals page to set your weekly target
4. **Track Progress**: Check Analytics for insights
5. **Reflect Daily**: End each day with a reflection entry

## 💡 Usage Tips

### Maintaining Your Streak

- Study at least **10 minutes daily** to maintain streak
- Use the timer to track your sessions accurately
- Check dashboard daily to see your current streak

### Effective Task Planning

- Break large tasks into smaller, manageable chunks
- Set realistic time estimates based on past performance
- Use priority levels to focus on important tasks first
- Review backlog weekly and reschedule or remove tasks

### Using the Timer

- Start timer before beginning study session
- Don't worry about page refresh - timer state is saved
- Take breaks when prompted (every 25 minutes)
- Save progress regularly or let auto-save handle it

### Analytics Insights

- Review weekly analytics every Sunday
- Compare with previous weeks to track improvement
- Identify your most productive subjects
- Adjust study plans based on productivity quality

### Goal Setting

- Set realistic weekly goals (600 minutes = 10 hours recommended)
- Break down weekly goal into daily targets
- Use carry-forward feature to reschedule incomplete tasks
- Celebrate when you achieve your goals!

### Daily Reflections

- Complete reflections at end of each study day
- Be honest about challenges and learnings
- Use insights to improve tomorrow's session
- Review past reflections for motivation

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript**: ES6+ features, localStorage API

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6 and localStorage support

### Data Storage

All data is stored in browser's localStorage with these keys:

- `spt_tasks`: All tasks data
- `spt_timers`: Active timer states
- `spt_goals`: Weekly goals
- `spt_reflections`: Daily reflections
- `spt_streak`: Streak information
- `spt_theme`: Theme preference
- `spt_settings`: User settings

### Performance

- Lightweight: ~100KB total size
- Fast: No framework overhead
- Instant: No server requests
- Reliable: Offline-first approach

## 📈 Key Metrics Explained

### Daily Score (0-100)

Calculated based on:
- **70%** - Task completion rate
- **30%** - Study time (max points at 2+ hours)

### Productivity Score

Calculated based on:
- **50%** - Average daily study time vs target
- **50%** - Task completion rate

### Productivity Quality

Ratio of actual time to estimated time:
- **< 0.8**: Very Fast (efficient)
- **0.8-1.0**: Efficient
- **1.0-1.2**: Good
- **1.2-1.5**: Acceptable
- **> 1.5**: Needs Improvement

### Streak System

- Requires minimum 10 minutes daily study
- Consecutive days count maintained
- Longest streak tracked separately
- Visual indicators on dashboard

## 🎓 Best Practices

### For Students

1. **Plan Weekly**: Set goals and plan tasks every Monday
2. **Daily Review**: Check dashboard each morning
3. **Time Block**: Use timer for focused 25-minute sessions
4. **Reflect Daily**: Complete reflection every evening
5. **Export Monthly**: Backup your data regularly

### For Productivity

1. **Priority First**: Complete high-priority tasks early
2. **Small Chunks**: Break large topics into 30-60 min tasks
3. **Realistic Estimates**: Base estimates on past performance
4. **Track Everything**: Use timer for accurate data
5. **Review Analytics**: Adjust strategies based on insights

### For Motivation

1. **Maintain Streak**: Study every day, even just 10 minutes
2. **Celebrate Wins**: Acknowledge completed tasks
3. **Set Achievable Goals**: Don't overcommit
4. **Track Progress**: Review improvements weekly
5. **Stay Consistent**: Small daily efforts compound over time

## 🔒 Privacy & Security

- **100% Local**: All data stays on your device
- **No Tracking**: No analytics or external requests
- **No Account**: No login or personal information required
- **Full Control**: Export and delete your data anytime
- **Offline First**: Works without internet connection

## 📱 Mobile Usage

The application is fully responsive and works great on mobile:

- Touch-friendly buttons and controls
- Optimized layouts for small screens
- Swipe-friendly navigation
- Mobile-first design approach
- Works in mobile browsers (Chrome, Safari, Firefox)

## 🤝 Contributing Ideas

While this is a client-side only application, here are enhancement ideas:

- Multi-language support
- Customizable themes
- Study group features
- Integration with calendar apps
- PDF export for reports
- Charts and visualizations
- Reminder notifications
- Study technique recommendations

## 📝 License

This project is free to use for personal and educational purposes. Feel free to modify and customize for your needs.

## 👨‍💻 Developer Notes

### Code Structure

- **Modular Functions**: Each function has a single responsibility
- **Clean Code**: Well-commented and documented
- **Error Handling**: Graceful degradation on errors
- **Consistent Naming**: camelCase for functions, UPPER_CASE for constants
- **No Dependencies**: Pure vanilla JavaScript
- **Resume-Ready**: Professional-grade code suitable for portfolio

### Customization

The application is easy to customize:

1. **Colors**: Modify CSS custom properties in `:root`
2. **Scoring**: Adjust algorithms in `shared-utils.js`
3. **Time Intervals**: Change break reminder intervals
4. **Streak Rules**: Modify `MIN_DAILY_MINUTES` constant
5. **Storage Keys**: Update `STORAGE_KEYS` object

## 🎯 Use Cases

Perfect for:

- **Students**: Track study sessions across subjects
- **Self-learners**: Monitor online course progress
- **Exam Preparation**: Focused study tracking
- **Skill Development**: Learning new programming languages, etc.
- **Research**: Track research time and productivity
- **Anyone**: Wanting to improve study consistency

## 🏆 Project Highlights

**Resume-Grade Features:**
- Clean, professional architecture
- Comprehensive feature set
- Mobile-responsive design
- Accessibility considerations
- Error handling and edge cases
- Data persistence and backup
- Analytics and insights
- User-friendly interface
- Well-documented code
- No external dependencies

**Technologies Demonstrated:**
- Advanced JavaScript (ES6+)
- localStorage API
- Date manipulation
- DOM manipulation
- Event handling
- CSS Grid & Flexbox
- CSS Custom Properties
- Responsive design
- Progressive enhancement

## 📞 Support

For issues or questions:
- Review the code comments in files
- Check browser console for errors
- Ensure localStorage is enabled
- Try clearing browser cache
- Use a modern browser

## 🙏 Acknowledgments

Built with focus on:
- Clean code principles
- User experience
- Educational value
- Practical utility
- Professional quality

---

**Built with ❤️ for students and lifelong learners**

*Study smart, track progress, achieve goals!* 🚀
