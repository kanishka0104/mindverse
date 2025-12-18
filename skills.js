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
  }
};

// Add generic data for skills not fully detailed
const GENERIC_SKILLS = ['calligraphy', 'martial-arts', 'fitness', 'french', 'japanese', 'sign-language', 
  'baking', 'cocktails', 'plating', 'video-editing', 'graphic-design', 'coding', 'creative-writing', 
  'public-speaking', 'blogging', 'journaling'];

GENERIC_SKILLS.forEach(skillId => {
  if (!SKILLS_DATA[skillId]) {
    const skillName = skillId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    SKILLS_DATA[skillId] = {
      name: skillName,
      icon: '✨',
      category: 'General',
      description: `Learn ${skillName} and develop new abilities.`,
      benefits: ['Personal growth', 'New experiences', 'Skill development', 'Self-improvement'],
      gettingStarted: ['Research basics online', 'Find quality tutorials', 'Practice regularly', 'Join communities'],
      resources: [
        { name: 'YouTube Tutorials', url: `https://www.youtube.com/results?search_query=${skillName.replace(/ /g, '+')}+tutorial`, type: 'Free Videos' },
        { name: 'Skillshare', url: 'https://www.skillshare.com', type: 'Classes' },
        { name: 'Udemy', url: 'https://www.udemy.com', type: 'Courses' }
      ],
      timeCommitment: 'Varies',
      difficulty: 'Beginner Friendly'
    };
  }
});

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Skills page loaded for user:', userId);
  await loadMySkills();
});

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
