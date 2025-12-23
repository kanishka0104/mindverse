// ============================================
// Skills Page - MindVerse
// Learn new skills and track progress
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

const userId = MindVerse.getOrCreateUserId();

// Comprehensive skill data with learning resources
const SKILLS_DATA = {
  // Music & Sound
  guitar: {
    name: 'Guitar',
    icon: '🎸',
    category: 'Music',
    description: 'Learn to play guitar from beginner to advanced. Master chords, strumming patterns, and your favorite songs.',
    benefits: [
      'Improves memory and concentration',
      'Reduces stress and anxiety',
      'Boosts creativity',
      'Great social activity'
    ],
    gettingStarted: [
      'Get an acoustic or electric guitar',
      'Learn basic chord shapes (C, G, D, Em, Am)',
      'Practice chord transitions 10 minutes daily',
      'Start with simple 3-chord songs'
    ],
    resources: [
      { name: 'JustinGuitar', url: 'https://www.justinguitar.com', type: 'Free Lessons' },
      { name: 'Fender Play', url: 'https://www.fender.com/play', type: 'Paid Course' },
      { name: 'YouTube - Marty Music', url: 'https://www.youtube.com/@MartyMusic', type: 'Free Videos' },
      { name: 'Ultimate Guitar', url: 'https://www.ultimate-guitar.com', type: 'Tabs & Chords' }
    ],
    timeCommitment: '15-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },
  
  singing: {
    name: 'Singing',
    icon: '🎤',
    category: 'Music',
    description: 'Develop your voice, improve pitch, and learn proper breathing techniques for singing.',
    benefits: [
      'Boosts confidence',
      'Improves breathing and posture',
      'Great emotional outlet',
      'Enhances communication skills'
    ],
    gettingStarted: [
      'Practice breathing exercises daily',
      'Do vocal warm-ups before singing',
      'Start with songs in your comfortable range',
      'Record yourself to track progress'
    ],
    resources: [
      { name: '30 Day Singer', url: 'https://www.30daysinger.com', type: 'Online Course' },
      { name: 'YouTube - Healthy Vocal Technique', url: 'https://www.youtube.com/@HealthyVocalTechnique', type: 'Free Lessons' },
      { name: 'Singing Success', url: 'https://singingsuccess.com', type: 'Program' },
      { name: 'Local vocal coach', url: '#', type: 'In-Person' }
    ],
    timeCommitment: '20-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  piano: {
    name: 'Piano',
    icon: '🎹',
    category: 'Music',
    description: 'Master the piano with proper technique, music theory, and beautiful pieces.',
    benefits: [
      'Enhances coordination',
      'Improves memory',
      'Relieves stress',
      'Teaches patience and discipline'
    ],
    gettingStarted: [
      'Get a keyboard or piano',
      'Learn hand positions and finger numbers',
      'Practice scales and basic chords',
      'Start with simple songs like "Twinkle Twinkle"'
    ],
    resources: [
      { name: 'Simply Piano', url: 'https://www.simplypiano.com', type: 'App' },
      { name: 'Piano Marvel', url: 'https://www.pianomarvel.com', type: 'Software' },
      { name: 'YouTube - PianoTV', url: 'https://www.youtube.com/@PianoTV', type: 'Free Lessons' },
      { name: 'Flowkey', url: 'https://www.flowkey.com', type: 'App' }
    ],
    timeCommitment: '30 minutes daily',
    difficulty: 'Beginner to Advanced'
  },

  // Art & Craft
  drawing: {
    name: 'Drawing',
    icon: '✏️',
    category: 'Art',
    description: 'Learn to draw from basic shapes to detailed illustrations. Develop your artistic eye.',
    benefits: [
      'Enhances creativity',
      'Improves focus and patience',
      'Therapeutic and relaxing',
      'Develops observational skills'
    ],
    gettingStarted: [
      'Get pencils, eraser, and sketch paper',
      'Practice basic shapes (circles, squares, triangles)',
      'Learn shading techniques',
      'Draw simple objects daily'
    ],
    resources: [
      { name: 'Drawabox', url: 'https://drawabox.com', type: 'Free Course' },
      { name: 'Proko', url: 'https://www.proko.com', type: 'Premium Lessons' },
      { name: 'Skillshare', url: 'https://www.skillshare.com', type: 'Classes' },
      { name: 'YouTube - Draw with Jazza', url: 'https://www.youtube.com/@Jazza', type: 'Free Videos' }
    ],
    timeCommitment: '20-45 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  painting: {
    name: 'Painting',
    icon: '🖌️',
    category: 'Art',
    description: 'Explore watercolor, acrylic, or oil painting. Create beautiful artwork.',
    benefits: [
      'Stress relief and relaxation',
      'Boosts self-esteem',
      'Enhances problem-solving',
      'Emotional expression'
    ],
    gettingStarted: [
      'Choose your medium (watercolor, acrylic, or oil)',
      'Get basic supplies (brushes, paints, canvas/paper)',
      'Learn color mixing',
      'Start with simple subjects'
    ],
    resources: [
      { name: 'The Virtual Instructor', url: 'https://thevirtualinstructor.com', type: 'Tutorials' },
      { name: 'Skillshare Painting', url: 'https://www.skillshare.com/browse/painting', type: 'Classes' },
      { name: 'YouTube - Bob Ross', url: 'https://www.youtube.com/@BobRossOfficial', type: 'Free Videos' },
      { name: 'Udemy Painting Courses', url: 'https://www.udemy.com/topic/painting/', type: 'Paid Courses' }
    ],
    timeCommitment: '1-2 hours per session',
    difficulty: 'Beginner to Advanced'
  },

  // Movement & Dance
  dancing: {
    name: 'Dancing',
    icon: '💃',
    category: 'Movement',
    description: 'Learn various dance styles from hip-hop to salsa. Express yourself through movement.',
    benefits: [
      'Great cardio workout',
      'Boosts confidence',
      'Improves coordination',
      'Fun social activity'
    ],
    gettingStarted: [
      'Choose a dance style you like',
      'Find online tutorials or local classes',
      'Practice basic steps daily',
      'Dance to music you enjoy'
    ],
    resources: [
      { name: 'STEEZY Studio', url: 'https://www.steezy.co', type: 'Online Classes' },
      { name: 'YouTube - 1MILLION Dance Studio', url: 'https://www.youtube.com/@1MILLION', type: 'Free Videos' },
      { name: 'DancePlug', url: 'https://www.danceplug.com', type: 'Tutorials' },
      { name: 'Local dance studio', url: '#', type: 'In-Person' }
    ],
    timeCommitment: '30-60 minutes, 3x per week',
    difficulty: 'Beginner Friendly'
  },

  yoga: {
    name: 'Yoga',
    icon: '🧘',
    category: 'Movement',
    description: 'Practice yoga for physical and mental wellness. Improve flexibility and find inner peace.',
    benefits: [
      'Reduces stress and anxiety',
      'Improves flexibility',
      'Builds strength',
      'Enhances mindfulness'
    ],
    gettingStarted: [
      'Get a yoga mat',
      'Start with beginner poses',
      'Focus on breathing',
      'Practice 10-15 minutes daily'
    ],
    resources: [
      { name: 'Yoga with Adriene', url: 'https://www.youtube.com/@yogawithadriene', type: 'Free YouTube' },
      { name: 'Down Dog App', url: 'https://www.downdogapp.com', type: 'App' },
      { name: 'Glo', url: 'https://www.glo.com', type: 'Online Classes' },
      { name: 'Local yoga studio', url: '#', type: 'In-Person' }
    ],
    timeCommitment: '15-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  // Languages
  spanish: {
    name: 'Spanish',
    icon: '🇪🇸',
    category: 'Language',
    description: 'Learn Spanish, one of the most widely spoken languages in the world.',
    benefits: [
      'Connect with millions of speakers',
      'Boosts cognitive abilities',
      'Great for travel',
      'Career opportunities'
    ],
    gettingStarted: [
      'Learn basic greetings and phrases',
      'Practice pronunciation',
      'Study 10-15 minutes daily',
      'Watch Spanish shows with subtitles'
    ],
    resources: [
      { name: 'Duolingo', url: 'https://www.duolingo.com', type: 'Free App' },
      { name: 'Babbel', url: 'https://www.babbel.com', type: 'Paid App' },
      { name: 'SpanishDict', url: 'https://www.spanishdict.com', type: 'Dictionary & Lessons' },
      { name: 'iTalki', url: 'https://www.italki.com', type: 'Tutors' }
    ],
    timeCommitment: '15-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  // Culinary
  cooking: {
    name: 'Cooking',
    icon: '🍳',
    category: 'Culinary',
    description: 'Master cooking techniques and create delicious meals from around the world.',
    benefits: [
      'Healthier eating',
      'Saves money',
      'Creative outlet',
      'Impresses others'
    ],
    gettingStarted: [
      'Learn knife skills',
      'Master basic recipes (pasta, stir-fry, etc.)',
      'Understand cooking methods',
      'Cook 2-3 times per week'
    ],
    resources: [
      { name: 'Basics with Babish', url: 'https://www.youtube.com/@babishculinaryuniverse', type: 'YouTube' },
      { name: 'America\'s Test Kitchen', url: 'https://www.americastestkitchen.com', type: 'Website' },
      { name: 'Serious Eats', url: 'https://www.seriouseats.com', type: 'Recipes & Techniques' },
      { name: 'MasterClass', url: 'https://www.masterclass.com', type: 'Celebrity Chefs' }
    ],
    timeCommitment: '1-2 hours per recipe',
    difficulty: 'Beginner to Advanced'
  },

  // Digital
  photography: {
    name: 'Photography',
    icon: '📷',
    category: 'Digital',
    description: 'Capture stunning photos and learn composition, lighting, and editing.',
    benefits: [
      'Preserves memories',
      'Creative expression',
      'Can become a side income',
      'Teaches observation'
    ],
    gettingStarted: [
      'Use your smartphone or camera',
      'Learn composition rules (rule of thirds)',
      'Practice in different lighting',
      'Take photos daily'
    ],
    resources: [
      { name: 'YouTube - Peter McKinnon', url: 'https://www.youtube.com/@PeterMcKinnon', type: 'Free Videos' },
      { name: 'Udemy Photography', url: 'https://www.udemy.com/topic/photography/', type: 'Courses' },
      { name: 'r/photography', url: 'https://www.reddit.com/r/photography/', type: 'Community' },
      { name: 'Adobe Lightroom Tutorials', url: 'https://helpx.adobe.com/lightroom', type: 'Editing' }
    ],
    timeCommitment: '30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  // Add more skills as needed...
  ukulele: {
    name: 'Ukulele',
    icon: '🎸',
    category: 'Music',
    description: 'Learn this fun, portable instrument that\'s perfect for beginners.',
    benefits: ['Easy to learn', 'Portable', 'Great for singing along', 'Affordable'],
    gettingStarted: ['Get a soprano or concert ukulele', 'Learn 4 basic chords (C, G, Am, F)', 'Practice strumming patterns', 'Play simple songs'],
    resources: [
      { name: 'Ukulele Underground', url: 'https://www.ukuleleunderground.com', type: 'Lessons' },
      { name: 'YouTube - The Ukulele Teacher', url: 'https://www.youtube.com/@TheUkuleleTeacher', type: 'Free' }
    ],
    timeCommitment: '15-20 minutes daily',
    difficulty: 'Very Beginner Friendly'
  },

  crafts: {
    name: 'Arts & Crafts',
    icon: '✂️',
    category: 'Art',
    description: 'Create handmade items from paper crafts to knitting and more.',
    benefits: ['Relaxing', 'Unique gifts', 'Budget-friendly', 'Endless variety'],
    gettingStarted: ['Choose a craft (origami, knitting, etc.)', 'Get basic supplies', 'Follow tutorials', 'Start with simple projects'],
    resources: [
      { name: 'YouTube - 5-Minute Crafts', url: 'https://www.youtube.com/@5MinuteCraftsYouTube', type: 'Tutorials' },
      { name: 'Pinterest', url: 'https://www.pinterest.com', type: 'Ideas' },
      { name: 'Craftsy', url: 'https://www.craftsy.com', type: 'Classes' }
    ],
    timeCommitment: 'Flexible',
    difficulty: 'Beginner Friendly'
  },

  // Additional Skills
  calligraphy: {
    name: 'Calligraphy',
    icon: '🖋️',
    category: 'Art',
    description: 'Master the art of beautiful handwriting and decorative lettering.',
    benefits: ['Meditative practice', 'Unique gift making', 'Improves focus', 'Personal style'],
    gettingStarted: ['Get calligraphy pens or brush pens', 'Practice basic strokes', 'Learn letter forms', 'Start with simple alphabets'],
    resources: [
      { name: 'YouTube - The Happy Ever Crafter', url: 'https://www.youtube.com/@TheHappyEverCrafter', type: 'Free Videos' },
      { name: 'Skillshare Calligraphy', url: 'https://www.skillshare.com/browse/calligraphy', type: 'Classes' },
      { name: 'IAMPETH', url: 'https://www.iampeth.com', type: 'Resources' }
    ],
    timeCommitment: '20-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  'martial-arts': {
    name: 'Martial Arts',
    icon: '🥋',
    category: 'Movement',
    description: 'Learn self-defense, discipline, and physical fitness through martial arts.',
    benefits: ['Self-defense skills', 'Builds confidence', 'Great exercise', 'Mental discipline'],
    gettingStarted: ['Choose a style (karate, taekwondo, jiu-jitsu)', 'Find a local dojo', 'Start with basics', 'Practice regularly'],
    resources: [
      { name: 'YouTube - Karate Culture', url: 'https://www.youtube.com/@KarateCulture', type: 'Free Videos' },
      { name: 'Local martial arts schools', url: '#', type: 'In-Person' },
      { name: 'FightTips', url: 'https://www.youtube.com/@FightTips', type: 'Tutorials' }
    ],
    timeCommitment: '2-3 times per week',
    difficulty: 'Beginner to Advanced'
  },

  fitness: {
    name: 'Fitness & Exercise',
    icon: '💪',
    category: 'Movement',
    description: 'Build strength, endurance, and overall health through fitness training.',
    benefits: ['Improves health', 'Boosts energy', 'Better mood', 'Increased confidence'],
    gettingStarted: ['Start with bodyweight exercises', 'Create a workout schedule', 'Focus on form', 'Progress gradually'],
    resources: [
      { name: 'YouTube - FitnessBlender', url: 'https://www.youtube.com/@FitnessBlender', type: 'Free Workouts' },
      { name: 'Nike Training Club App', url: 'https://www.nike.com/ntc-app', type: 'Free App' },
      { name: 'Fitness subreddit', url: 'https://www.reddit.com/r/Fitness/', type: 'Community' }
    ],
    timeCommitment: '30-60 minutes, 3-5x/week',
    difficulty: 'Beginner Friendly'
  },

  french: {
    name: 'French',
    icon: '🇫🇷',
    category: 'Language',
    description: 'Learn the romantic French language for travel, culture, and career opportunities.',
    benefits: ['Beautiful language', 'Travel opportunities', 'Career advantage', 'Cultural appreciation'],
    gettingStarted: ['Learn pronunciation', 'Master basic greetings', 'Study 15 minutes daily', 'Watch French media'],
    resources: [
      { name: 'Duolingo French', url: 'https://www.duolingo.com/course/fr/en/Learn-French', type: 'Free App' },
      { name: 'YouTube - Learn French with Alexa', url: 'https://www.youtube.com/@learnfrenchwithalexa', type: 'Free Videos' },
      { name: 'FrenchPod101', url: 'https://www.frenchpod101.com', type: 'Podcast' }
    ],
    timeCommitment: '15-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  japanese: {
    name: 'Japanese',
    icon: '🇯🇵',
    category: 'Language',
    description: 'Explore Japanese language and culture, from hiragana to conversation.',
    benefits: ['Access anime/manga', 'Travel to Japan', 'Unique writing system', 'Career opportunities'],
    gettingStarted: ['Learn hiragana and katakana', 'Practice basic phrases', 'Study kanji gradually', 'Use spaced repetition'],
    resources: [
      { name: 'WaniKani', url: 'https://www.wanikani.com', type: 'Kanji Learning' },
      { name: 'YouTube - JapanesePod101', url: 'https://www.youtube.com/@JapanesePod101', type: 'Free Videos' },
      { name: 'Duolingo Japanese', url: 'https://www.duolingo.com/course/ja/en/Learn-Japanese', type: 'Free App' }
    ],
    timeCommitment: '20-30 minutes daily',
    difficulty: 'Moderate'
  },

  'sign-language': {
    name: 'Sign Language',
    icon: '🤟',
    category: 'Language',
    description: 'Learn to communicate using American Sign Language (ASL) or BSL.',
    benefits: ['Inclusive communication', 'Career opportunities', 'Cognitive benefits', 'Connect with Deaf community'],
    gettingStarted: ['Learn the alphabet', 'Practice common phrases', 'Watch sign language videos', 'Practice facial expressions'],
    resources: [
      { name: 'SignSchool', url: 'https://www.signschool.com', type: 'Online Course' },
      { name: 'YouTube - Sign Language 101', url: 'https://www.youtube.com/results?search_query=asl+basics', type: 'Free Videos' },
      { name: 'Lifeprint ASL', url: 'https://www.lifeprint.com', type: 'Free Lessons' }
    ],
    timeCommitment: '15-30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  baking: {
    name: 'Baking',
    icon: '🥐',
    category: 'Culinary',
    description: 'Create delicious breads, pastries, cakes, and more from your kitchen.',
    benefits: ['Therapeutic activity', 'Delicious results', 'Impressive skill', 'Science meets art'],
    gettingStarted: ['Learn basic measurements', 'Start with simple recipes', 'Understand oven temps', 'Practice techniques'],
    resources: [
      { name: 'King Arthur Baking', url: 'https://www.kingarthurbaking.com/learn', type: 'Tutorials' },
      { name: 'YouTube - Preppy Kitchen', url: 'https://www.youtube.com/@PreppyKitchen', type: 'Free Videos' },
      { name: 'The Great British Bake Off', url: '#', type: 'Inspiration' }
    ],
    timeCommitment: '2-3 hours per recipe',
    difficulty: 'Beginner to Advanced'
  },

  cocktails: {
    name: 'Mixology',
    icon: '🍹',
    category: 'Culinary',
    description: 'Master the art of crafting cocktails and mocktails for any occasion.',
    benefits: ['Impress guests', 'Creative expression', 'Social skill', 'Fun hobby'],
    gettingStarted: ['Learn classic cocktails', 'Get basic tools', 'Understand flavor profiles', 'Practice techniques'],
    resources: [
      { name: 'YouTube - How to Drink', url: 'https://www.youtube.com/@howtodrink', type: 'Free Videos' },
      { name: 'Difford\'s Guide', url: 'https://www.diffordsguide.com', type: 'Recipes' },
      { name: 'The Educated Barfly', url: 'https://www.youtube.com/@TheEducatedBarfly', type: 'Tutorials' }
    ],
    timeCommitment: 'Practice as desired',
    difficulty: 'Beginner Friendly'
  },

  plating: {
    name: 'Food Plating',
    icon: '🍽️',
    category: 'Culinary',
    description: 'Learn to present food beautifully like a professional chef.',
    benefits: ['Elevates dining experience', 'Instagram-worthy', 'Attention to detail', 'Artistic expression'],
    gettingStarted: ['Study professional plates', 'Learn color theory', 'Practice garnishing', 'Use odd numbers'],
    resources: [
      { name: 'YouTube - Chef Plating Techniques', url: 'https://www.youtube.com/results?search_query=food+plating+techniques', type: 'Free Videos' },
      { name: 'Instagram food accounts', url: 'https://www.instagram.com', type: 'Inspiration' },
      { name: 'The Art of Plating', url: 'https://theartofplating.com', type: 'Gallery' }
    ],
    timeCommitment: 'Apply when cooking',
    difficulty: 'Intermediate'
  },

  'video-editing': {
    name: 'Video Editing',
    icon: '🎬',
    category: 'Digital',
    description: 'Create professional videos for YouTube, social media, or personal projects.',
    benefits: ['Creative career path', 'Content creation', 'Storytelling skill', 'In-demand skill'],
    gettingStarted: ['Choose editing software', 'Learn basic cuts and transitions', 'Understand pacing', 'Practice with projects'],
    resources: [
      { name: 'YouTube - Premiere Gal', url: 'https://www.youtube.com/@PremiereGal', type: 'Free Tutorials' },
      { name: 'DaVinci Resolve Tutorials', url: 'https://www.blackmagicdesign.com/products/davinciresolve/training', type: 'Free Software' },
      { name: 'Film Editing Pro', url: 'https://www.filmeditingpro.com', type: 'Courses' }
    ],
    timeCommitment: '1-2 hours per project',
    difficulty: 'Beginner to Advanced'
  },

  'graphic-design': {
    name: 'Graphic Design',
    icon: '🎨',
    category: 'Digital',
    description: 'Create stunning visual designs for web, print, and branding.',
    benefits: ['Creative career', 'Freelance opportunities', 'Personal branding', 'Problem solving'],
    gettingStarted: ['Learn design principles', 'Use Canva or Adobe', 'Study color theory', 'Practice daily'],
    resources: [
      { name: 'Canva Design School', url: 'https://www.canva.com/learn/', type: 'Free Tutorials' },
      { name: 'YouTube - The Futur', url: 'https://www.youtube.com/@thefutur', type: 'Free Videos' },
      { name: 'Coursera Graphic Design', url: 'https://www.coursera.org', type: 'Courses' }
    ],
    timeCommitment: '30-60 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  coding: {
    name: 'Coding & Programming',
    icon: '👨‍💻',
    category: 'Digital',
    description: 'Build websites, apps, and software. Learn languages like Python, JavaScript, and more.',
    benefits: ['High-paying career', 'Problem-solving', 'Create anything', 'Remote work'],
    gettingStarted: ['Choose a language (Python recommended)', 'Use free platforms', 'Build small projects', 'Code daily'],
    resources: [
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'Free Platform' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com', type: 'Free Curriculum' },
      { name: 'Codecademy', url: 'https://www.codecademy.com', type: 'Interactive' },
      { name: 'YouTube - Programming with Mosh', url: 'https://www.youtube.com/@programmingwithmosh', type: 'Tutorials' }
    ],
    timeCommitment: '1-2 hours daily',
    difficulty: 'Beginner to Advanced'
  },

  'creative-writing': {
    name: 'Creative Writing',
    icon: '📝',
    category: 'Writing',
    description: 'Write stories, novels, poetry, and express your imagination through words.',
    benefits: ['Self-expression', 'Emotional outlet', 'Cognitive benefits', 'Potential income'],
    gettingStarted: ['Write every day', 'Read widely', 'Join writing communities', 'Start with short stories'],
    resources: [
      { name: 'r/writing', url: 'https://www.reddit.com/r/writing/', type: 'Community' },
      { name: 'NaNoWriMo', url: 'https://nanowrimo.org', type: 'Challenge' },
      { name: 'YouTube - Abbie Emmons', url: 'https://www.youtube.com/@AbbieEmmons', type: 'Writing Tips' }
    ],
    timeCommitment: '30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  'public-speaking': {
    name: 'Public Speaking',
    icon: '🎤',
    category: 'Communication',
    description: 'Develop confidence and skill in presenting and speaking to audiences.',
    benefits: ['Career advancement', 'Confidence boost', 'Leadership skill', 'Overcome fear'],
    gettingStarted: ['Join Toastmasters', 'Practice in front of mirror', 'Record yourself', 'Start small'],
    resources: [
      { name: 'Toastmasters', url: 'https://www.toastmasters.org', type: 'Organization' },
      { name: 'YouTube - Charisma on Command', url: 'https://www.youtube.com/@Charismaoncommand', type: 'Tips' },
      { name: 'TED Talks', url: 'https://www.ted.com', type: 'Examples' }
    ],
    timeCommitment: 'Practice regularly',
    difficulty: 'Intermediate'
  },

  blogging: {
    name: 'Blogging',
    icon: '📰',
    category: 'Writing',
    description: 'Share your thoughts, expertise, and stories through online writing.',
    benefits: ['Build audience', 'Passive income potential', 'Personal brand', 'Creative outlet'],
    gettingStarted: ['Choose a niche', 'Set up a blog (WordPress)', 'Write consistently', 'Learn SEO basics'],
    resources: [
      { name: 'WordPress.com', url: 'https://wordpress.com', type: 'Platform' },
      { name: 'YouTube - Income School', url: 'https://www.youtube.com/@incomeschoolvideos', type: 'Blogging Tips' },
      { name: 'ProBlogger', url: 'https://problogger.com', type: 'Resources' }
    ],
    timeCommitment: '2-3 hours per post',
    difficulty: 'Beginner Friendly'
  },

  journaling: {
    name: 'Journaling',
    icon: '📔',
    category: 'Writing',
    description: 'Reflective writing for personal growth, gratitude, and self-awareness.',
    benefits: ['Mental clarity', 'Stress relief', 'Track growth', 'Self-discovery'],
    gettingStarted: ['Get a notebook', 'Write daily', 'Try different styles', 'Be honest'],
    resources: [
      { name: 'YouTube - Pick Up Limes', url: 'https://www.youtube.com/@PickUpLimes', type: 'Journaling Ideas' },
      { name: 'Day One App', url: 'https://dayoneapp.com', type: 'Digital Journal' },
      { name: 'r/Journaling', url: 'https://www.reddit.com/r/Journaling/', type: 'Community' }
    ],
    timeCommitment: '10-20 minutes daily',
    difficulty: 'Very Easy'
  },

  // Additional new skills
  meditation: {
    name: 'Meditation',
    icon: '🧘‍♂️',
    category: 'Wellness',
    description: 'Practice mindfulness and meditation for mental peace and clarity.',
    benefits: ['Reduces stress', 'Improves focus', 'Emotional balance', 'Better sleep'],
    gettingStarted: ['Start with 5 minutes', 'Find a quiet space', 'Focus on breath', 'Use guided apps'],
    resources: [
      { name: 'Headspace', url: 'https://www.headspace.com', type: 'App' },
      { name: 'YouTube - Goodful', url: 'https://www.youtube.com/@Goodful', type: 'Guided Meditations' },
      { name: 'Insight Timer', url: 'https://insighttimer.com', type: 'Free App' }
    ],
    timeCommitment: '5-20 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  gardening: {
    name: 'Gardening',
    icon: '🌱',
    category: 'Lifestyle',
    description: 'Grow plants, flowers, vegetables, and connect with nature.',
    benefits: ['Fresh produce', 'Physical activity', 'Mental wellness', 'Beautiful space'],
    gettingStarted: ['Start with easy plants', 'Learn basic care', 'Get proper tools', 'Start small'],
    resources: [
      { name: 'YouTube - Epic Gardening', url: 'https://www.youtube.com/@epicgardening', type: 'Free Videos' },
      { name: 'r/gardening', url: 'https://www.reddit.com/r/gardening/', type: 'Community' },
      { name: 'Gardening Know How', url: 'https://www.gardeningknowhow.com', type: 'Articles' }
    ],
    timeCommitment: '30 minutes daily',
    difficulty: 'Beginner Friendly'
  },

  chess: {
    name: 'Chess',
    icon: '♟️',
    category: 'Games & Strategy',
    description: 'Master the ancient game of strategy, critical thinking, and tactics.',
    benefits: ['Improves critical thinking', 'Patience', 'Problem-solving', 'Competitive fun'],
    gettingStarted: ['Learn piece movements', 'Understand basic tactics', 'Play online', 'Study games'],
    resources: [
      { name: 'Chess.com', url: 'https://www.chess.com', type: 'Free Platform' },
      { name: 'YouTube - GothamChess', url: 'https://www.youtube.com/@GothamChess', type: 'Lessons' },
      { name: 'Lichess', url: 'https://lichess.org', type: 'Free Platform' }
    ],
    timeCommitment: '20-60 minutes daily',
    difficulty: 'Beginner to Advanced'
  },

  origami: {
    name: 'Origami',
    icon: '🦢',
    category: 'Art',
    description: 'The Japanese art of paper folding to create beautiful sculptures.',
    benefits: ['Meditative', 'Improves dexterity', 'Affordable hobby', 'Beautiful results'],
    gettingStarted: ['Get origami paper', 'Start with simple models', 'Follow diagrams', 'Practice patience'],
    resources: [
      { name: 'Origami-Instructions.com', url: 'http://www.origami-instructions.com', type: 'Free Diagrams' },
      { name: 'YouTube - Jo Nakashima', url: 'https://www.youtube.com/@jonakashima', type: 'Tutorials' },
      { name: 'Happy Folding', url: 'https://www.happyfolding.com', type: 'Resources' }
    ],
    timeCommitment: '30 minutes per session',
    difficulty: 'Beginner Friendly'
  },

  podcasting: {
    name: 'Podcasting',
    icon: '🎙️',
    category: 'Digital',
    description: 'Create and produce your own podcast to share stories and ideas.',
    benefits: ['Build audience', 'Share expertise', 'Networking', 'Creative outlet'],
    gettingStarted: ['Choose your topic', 'Get basic microphone', 'Plan episodes', 'Record and edit'],
    resources: [
      { name: 'YouTube - Podcast Insights', url: 'https://www.youtube.com/results?search_query=how+to+start+a+podcast', type: 'Tutorials' },
      { name: 'Anchor', url: 'https://anchor.fm', type: 'Free Platform' },
      { name: 'Audacity', url: 'https://www.audacityteam.org', type: 'Free Software' }
    ],
    timeCommitment: '2-4 hours per episode',
    difficulty: 'Beginner Friendly'
  },

  magic: {
    name: 'Magic Tricks',
    icon: '🎩',
    category: 'Entertainment',
    description: 'Learn sleight of hand and illusions to amaze and entertain.',
    benefits: ['Confidence builder', 'Social icebreaker', 'Dexterity', 'Entertainment skill'],
    gettingStarted: ['Learn basic card tricks', 'Practice sleight of hand', 'Perform for friends', 'Study presentation'],
    resources: [
      { name: 'YouTube - 52Kards', url: 'https://www.youtube.com/@52Kards', type: 'Free Tutorials' },
      { name: 'Penguin Magic', url: 'https://www.penguinmagic.com', type: 'Shop & Learn' },
      { name: 'Scam School', url: 'https://www.youtube.com/results?search_query=scam+school', type: 'Bar Tricks' }
    ],
    timeCommitment: '30 minutes practice daily',
    difficulty: 'Beginner to Advanced'
  },

  woodworking: {
    name: 'Woodworking',
    icon: '🪵',
    category: 'Crafts',
    description: 'Build furniture and wooden items with your hands and tools.',
    benefits: ['Practical skill', 'Satisfying results', 'Save money', 'Creative projects'],
    gettingStarted: ['Learn safety first', 'Start with simple projects', 'Get basic tools', 'Follow plans'],
    resources: [
      { name: 'YouTube - Steve Ramsey', url: 'https://www.youtube.com/@stevinmarin', type: 'Beginner Projects' },
      { name: 'Ana White Plans', url: 'https://www.ana-white.com', type: 'Free Plans' },
      { name: 'r/woodworking', url: 'https://www.reddit.com/r/woodworking/', type: 'Community' }
    ],
    timeCommitment: 'Project-based',
    difficulty: 'Beginner to Advanced'
  },

  astronomy: {
    name: 'Astronomy',
    icon: '🔭',
    category: 'Science',
    description: 'Explore the cosmos, identify stars, and learn about our universe.',
    benefits: ['Perspective', 'Scientific knowledge', 'Peaceful hobby', 'Connect with nature'],
    gettingStarted: ['Get a star chart', 'Learn constellations', 'Use astronomy apps', 'Join astronomy club'],
    resources: [
      { name: 'Stellarium', url: 'https://stellarium.org', type: 'Free Software' },
      { name: 'YouTube - NASA', url: 'https://www.youtube.com/@NASA', type: 'Free Content' },
      { name: 'Sky & Telescope', url: 'https://skyandtelescope.org', type: 'Magazine' }
    ],
    timeCommitment: 'Evening sessions',
    difficulty: 'Beginner Friendly'
  }
};

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Skills page loaded for user:', userId);
  await loadMySkills();
  initializeSearch();
});

// ============================================
// Search Functionality
// ============================================

function initializeSearch() {
  const searchInput = document.getElementById('skillSearchInput');
  const searchResults = document.getElementById('searchResults');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length === 0) {
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
      return;
    }

    // Search through all skills
    const results = [];
    for (const [skillId, skillData] of Object.entries(SKILLS_DATA)) {
      const skillName = skillData.name.toLowerCase();
      const category = skillData.category.toLowerCase();
      const description = skillData.description.toLowerCase();
      
      if (skillName.includes(query) || category.includes(query) || description.includes(query)) {
        results.push({ skillId, ...skillData });
      }
    }

    if (results.length > 0) {
      displaySearchResults(results, query);
    } else {
      displayNoResults(query);
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchResults.classList.add('hidden');
    }
  });
}

function displaySearchResults(results, query) {
  const searchResults = document.getElementById('searchResults');
  
  searchResults.innerHTML = `
    <div class="search-results-header">
      Found ${results.length} skill${results.length === 1 ? '' : 's'}:
    </div>
    ${results.map(skill => `
      <div class="search-result-item" onclick="openSkillModal('${skill.skillId}')">
        <span class="search-result-icon">${skill.icon}</span>
        <div class="search-result-info">
          <h4 class="search-result-name">${skill.name}</h4>
          <p class="search-result-category">${skill.category}</p>
        </div>
      </div>
    `).join('')}
  `;
  
  searchResults.classList.remove('hidden');
}

function displayNoResults(query) {
  const searchResults = document.getElementById('searchResults');
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`;
  
  searchResults.innerHTML = `
    <div class="search-no-results">
      <p style="margin-bottom: var(--spacing-sm);">
        <strong>No skills found for "${query}"</strong>
      </p>
      <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md); font-size: 0.9rem;">
        Don't worry! We can help you find learning resources.
      </p>
      <a href="${youtubeSearchUrl}" target="_blank" class="btn btn-primary btn-sm" style="text-decoration: none;">
        🎥 Search on YouTube
      </a>
    </div>
  `;
  
  searchResults.classList.remove('hidden');
}

// ============================================
// Open Skill Modal
// ============================================

window.openSkillModal = function(skillId) {
  const skill = SKILLS_DATA[skillId];
  if (!skill) return;

  const modalContent = document.getElementById('skillModalContent');
  
  modalContent.innerHTML = `
    <div class="skill-detail">
      <div class="skill-detail-header">
        <div class="skill-detail-icon">${skill.icon}</div>
        <h2>${skill.name}</h2>
        <p class="skill-category-tag">${skill.category}</p>
      </div>

      <p class="skill-detail-description">${skill.description}</p>

      <div class="skill-info-grid">
        <div class="skill-info-item">
          <strong>⏱️ Time Commitment:</strong>
          <p>${skill.timeCommitment}</p>
        </div>
        <div class="skill-info-item">
          <strong>📊 Difficulty:</strong>
          <p>${skill.difficulty}</p>
        </div>
      </div>

      <div class="skill-section">
        <h3>💪 Benefits</h3>
        <ul class="skill-benefits-list">
          ${skill.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
      </div>

      <div class="skill-section">
        <h3>🚀 Getting Started</h3>
        <ol class="skill-steps-list">
          ${skill.gettingStarted.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>

      <div class="skill-section">
        <h3>📚 Learning Resources</h3>
        <div class="resources-list">
          ${skill.resources.map(resource => `
            <a href="${resource.url}" target="_blank" class="resource-link">
              <span class="resource-name">${resource.name}</span>
              <span class="resource-type">${resource.type}</span>
            </a>
          `).join('')}
        </div>
      </div>

      <div class="skill-actions">
        <button class="btn btn-primary btn-block" onclick="addToMySkills('${skillId}')">
          ⭐ Add to My Learning Path
        </button>
      </div>
    </div>
  `;

  MindVerse.openModal(document.getElementById('skillModal'));
};

// ============================================
// Add Skill to Learning Path
// ============================================

window.addToMySkills = async function(skillId) {
  try {
    const skill = SKILLS_DATA[skillId];
    
    const skillData = {
      userId: userId,
      skillId: skillId,
      skillName: skill.name,
      category: skill.category,
      addedAt: Date.now()
    };

    await FirebaseDB.addDocument(`userSkills/${userId}/skills`, skillData);
    
    MindVerse.showToast(`${skill.name} added to your learning path! 🎉`, 'success');
    MindVerse.closeModal(document.getElementById('skillModal'));
    
    await loadMySkills();
  } catch (error) {
    console.error('Error adding skill:', error);
    MindVerse.showToast('Failed to add skill. Please try again.', 'error');
  }
};

// ============================================
// Load User's Skills
// ============================================

async function loadMySkills() {
  try {
    const skills = await FirebaseDB.queryDocuments(
      `userSkills/${userId}/skills`,
      [],
      'addedAt',
      'desc'
    );

    const container = document.getElementById('mySkillsContainer');
    
    if (skills.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="color: var(--color-text-light);">
          Click on any skill above to explore and add it to your learning path!
        </p>
      `;
      return;
    }

    container.innerHTML = `
      <div class="my-skills-grid">
        ${skills.map(skill => {
          const skillData = SKILLS_DATA[skill.skillId];
          return `
            <div class="my-skill-card">
              <span class="my-skill-icon">${skillData?.icon || '✨'}</span>
              <div class="my-skill-info">
                <h4 class="my-skill-name">${skill.skillName}</h4>
                <p class="my-skill-category">${skill.category}</p>
              </div>
              <button class="btn btn-sm btn-outline" onclick="openSkillModal('${skill.skillId}')">
                View
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error loading skills:', error);
  }
}

console.log('Skills page script loaded');
