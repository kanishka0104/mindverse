// ============================================
// Learn Page - MindVerse
// Self-help educational content
// ============================================

// Require authentication
FirebaseAuth.requireAuth();

const userId = MindVerse.getOrCreateUserId();

// Topic definitions with educational content
const TOPICS = [
  {
    id: 'grounding',
    icon: '🌍',
    title: 'Grounding: The 5-4-3-2-1 Technique',
    summary: 'A simple method to calm anxiety and bring you back to the present moment.',
    content: `
      <h2>The 5-4-3-2-1 Grounding Technique</h2>
      <p>This technique helps you focus on the present moment and calm anxiety by engaging your five senses.</p>
      
      <h3>How to do it:</h3>
      <ol style="line-height: 2;">
        <li><strong>5 things you can SEE:</strong> Look around and name 5 things you can see right now. 
        Be specific: "a blue pen," "the corner of my laptop," etc.</li>
        
        <li><strong>4 things you can TOUCH:</strong> Notice 4 things you can physically feel. 
        The texture of your clothes, the temperature of the air, your feet on the floor, etc.</li>
        
        <li><strong>3 things you can HEAR:</strong> Identify 3 sounds around you. 
        Birds chirping, traffic outside, the hum of electronics, your own breathing.</li>
        
        <li><strong>2 things you can SMELL:</strong> Notice 2 scents. 
        Fresh air, coffee, soap, or even "clean air" counts.</li>
        
        <li><strong>1 thing you can TASTE:</strong> Focus on one taste you can detect right now. 
        Even if it's just the taste of your mouth.</li>
      </ol>
      
      <h3>Why it works:</h3>
      <p>When you're anxious, your mind is often focused on worries about the future or past. 
      This exercise forces your brain to focus on immediate sensory experiences, pulling you 
      back to the present moment where you are safe.</p>
      
      <div class="alert alert-info">
        <strong>Tip:</strong> You can do this anywhere, anytime. It takes just a few minutes and 
        requires no special equipment. Practice it regularly so it becomes easier to use when you need it most.
      </div>
    `
  },
  {
    id: 'anxiety_spikes',
    icon: '⚡',
    title: 'What to Do When Anxiety Spikes',
    summary: 'Practical strategies for managing sudden increases in anxiety.',
    content: `
      <h2>Managing Anxiety Spikes</h2>
      <p>Sudden anxiety can feel overwhelming, but there are concrete steps you can take to manage it.</p>
      
      <h3>Immediate strategies:</h3>
      
      <h4>1. Breathe Slowly</h4>
      <p>Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. 
      This activates your body's calming response. <a href="breathe.html">Try our breathing exercise →</a></p>
      
      <h4>2. Name What You're Feeling</h4>
      <p>Say to yourself: "I'm feeling anxious right now." Naming the emotion helps create 
      distance from it and reminds you that it's a temporary state.</p>
      
      <h4>3. Ground Yourself</h4>
      <p>Use the 5-4-3-2-1 technique to bring your focus to the present moment.</p>
      
      <h4>4. Move Your Body</h4>
      <p>Walk, stretch, or do jumping jacks. Physical movement helps burn off stress hormones.</p>
      
      <h4>5. Cold Water</h4>
      <p>Splash cold water on your face or hold an ice cube. Cold sensations can interrupt 
      the anxiety response.</p>
      
      <h3>Remember:</h3>
      <ul style="line-height: 1.8;">
        <li>Anxiety is temporary. It will pass.</li>
        <li>You've felt anxious before and survived it.</li>
        <li>Your feelings are valid, even if the situation doesn't seem "big enough" to warrant them.</li>
        <li>It's okay to remove yourself from a situation if you need to.</li>
      </ul>
      
      <div class="alert alert-warning">
        <strong>When to seek help:</strong> If anxiety is interfering with your daily life, 
        lasting for extended periods, or causing significant distress, please reach out to 
        a mental health professional.
      </div>
    `
  },
  {
    id: 'sleep',
    icon: '😴',
    title: 'Small Habits for Better Sleep',
    summary: 'Simple changes that can improve your sleep quality.',
    content: `
      <h2>Improving Your Sleep</h2>
      <p>Quality sleep is essential for mental health. Here are evidence-based tips to help you sleep better.</p>
      
      <h3>Before Bed:</h3>
      <ul style="line-height: 2;">
        <li><strong>Consistent schedule:</strong> Go to bed and wake up at the same time each day, 
        even on weekends.</li>
        
        <li><strong>Wind-down routine:</strong> Create a 30-60 minute relaxing routine before bed. 
        Read, journal, stretch, or do breathing exercises.</li>
        
        <li><strong>Limit screens:</strong> Avoid phones, computers, and TV for at least 30 minutes 
        before bed. Blue light disrupts your sleep hormone (melatonin).</li>
        
        <li><strong>Keep it cool:</strong> A slightly cool room (around 65-68°F or 18-20°C) 
        promotes better sleep.</li>
        
        <li><strong>Write it down:</strong> If worries keep you awake, write them in a journal 
        to "download" them from your mind. <a href="journal.html">Use our journal →</a></li>
      </ul>
      
      <h3>During the Day:</h3>
      <ul style="line-height: 2;">
        <li><strong>Get sunlight:</strong> Expose yourself to bright light in the morning. 
        This regulates your sleep-wake cycle.</li>
        
        <li><strong>Exercise:</strong> Regular physical activity promotes better sleep, 
        but avoid intense exercise close to bedtime.</li>
        
        <li><strong>Limit caffeine:</strong> Avoid caffeine after 2 PM. It stays in your system 
        for 6-8 hours.</li>
        
        <li><strong>Short naps only:</strong> If you nap, keep it under 30 minutes and before 3 PM.</li>
      </ul>
      
      <h3>If You Can't Sleep:</h3>
      <p>If you're lying awake for more than 20 minutes, get up and do a quiet, relaxing activity 
      until you feel sleepy. Don't force it. This helps prevent your brain from associating 
      your bed with frustration and wakefulness.</p>
      
      <div class="alert alert-info">
        <strong>Be patient:</strong> Sleep improvements take time. Stick with these habits 
        for at least 2-3 weeks before expecting major changes.
      </div>
    `
  },
  {
    id: 'talk_to_someone',
    icon: '💭',
    title: 'How to Talk to Someone You Trust',
    summary: 'Tips for opening up about your mental health with others.',
    content: `
      <h2>Opening Up About Mental Health</h2>
      <p>Talking about how you're feeling can be intimidating, but it's often an important step 
      toward feeling better. Here's how to start.</p>
      
      <h3>Choosing Who to Talk To:</h3>
      <ul style="line-height: 2;">
        <li>A friend or family member you feel comfortable with</li>
        <li>A school counselor or trusted teacher</li>
        <li>A coworker or manager you trust</li>
        <li>A mental health professional (therapist, counselor, doctor)</li>
        <li>A helpline or support group</li>
      </ul>
      
      <h3>How to Start the Conversation:</h3>
      <p>You might say:</p>
      <ul style="line-height: 2;">
        <li>"I've been going through a tough time and could use someone to talk to."</li>
        <li>"I haven't been feeling like myself lately and want to share what's been going on."</li>
        <li>"I'm dealing with some difficult feelings and would appreciate your support."</li>
        <li>"Can we talk? I need to get some things off my chest."</li>
      </ul>
      
      <h3>What to Share:</h3>
      <p>You don't have to share everything at once. Start with:</p>
      <ul style="line-height: 2;">
        <li>How you've been feeling lately</li>
        <li>What you think might be contributing to these feelings</li>
        <li>What kind of support would be helpful (listening, advice, help finding resources)</li>
      </ul>
      
      <h3>Remember:</h3>
      <ul style="line-height: 2;">
        <li>It's okay if you get emotional. That's natural.</li>
        <li>You're not burdening anyone. People who care about you want to help.</li>
        <li>You can start small and share more over time.</li>
        <li>If the first person doesn't respond well, try someone else. Not everyone knows how to support mental health, and that's not your fault.</li>
      </ul>
      
      <div class="alert alert-info">
        <strong>Professional help:</strong> If you need more support than friends or family can provide, 
        that's completely normal. Mental health professionals are trained specifically to help, and 
        seeking therapy is a sign of strength, not weakness.
      </div>
    `
  },
  {
    id: 'negative_thoughts',
    icon: '🔄',
    title: 'Challenging Negative Thoughts',
    summary: 'Learn to recognize and reframe unhelpful thinking patterns.',
    content: `
      <h2>Understanding Negative Thought Patterns</h2>
      <p>Our thoughts aren't always accurate, especially when we're feeling down or anxious. 
      Learning to recognize and challenge negative thoughts is a key skill in managing mental health.</p>
      
      <h3>Common Negative Thought Patterns:</h3>
      
      <h4>1. All-or-Nothing Thinking</h4>
      <p><em>"If I'm not perfect, I'm a failure."</em><br>
      Reality: Most things exist on a spectrum. There's a lot of middle ground between perfect and terrible.</p>
      
      <h4>2. Catastrophizing</h4>
      <p><em>"This bad thing will lead to disaster."</em><br>
      Reality: We often overestimate how bad things will be. Most feared outcomes don't happen.</p>
      
      <h4>3. Mind Reading</h4>
      <p><em>"They definitely think I'm weird."</em><br>
      Reality: You can't know what others think. People are usually more focused on themselves than on judging you.</p>
      
      <h4>4. Should Statements</h4>
      <p><em>"I should be better at this."</em><br>
      Reality: "Should" creates unrealistic pressure. Replace with "I'm learning" or "I'm doing my best."</p>
      
      <h4>5. Emotional Reasoning</h4>
      <p><em>"I feel like a failure, so I must be one."</em><br>
      Reality: Feelings are valid, but they're not facts. You can feel something without it being true.</p>
      
      <h3>How to Challenge These Thoughts:</h3>
      <ol style="line-height: 2;">
        <li><strong>Notice the thought:</strong> Become aware when negative thoughts appear.</li>
        <li><strong>Ask yourself:</strong> "Is this thought based on facts or feelings?"</li>
        <li><strong>Look for evidence:</strong> What evidence supports or contradicts this thought?</li>
        <li><strong>Consider alternatives:</strong> What's another way to look at this situation?</li>
        <li><strong>Be compassionate:</strong> What would you tell a friend having this thought?</li>
      </ol>
      
      <div class="alert alert-info">
        <strong>Practice:</strong> Challenging thoughts gets easier with practice. Try writing down 
        negative thoughts and working through them in your journal. <a href="journal.html">Open journal →</a>
      </div>
    `
  },
  {
    id: 'self_compassion',
    icon: '💚',
    title: 'Practicing Self-Compassion',
    summary: 'Learn to treat yourself with the same kindness you\'d offer a good friend.',
    content: `
      <h2>What is Self-Compassion?</h2>
      <p>Self-compassion means treating yourself with the same kindness, care, and understanding 
      that you would offer to a good friend who's struggling.</p>
      
      <h3>The Three Components:</h3>
      
      <h4>1. Self-Kindness vs. Self-Judgment</h4>
      <p>Be warm and understanding toward yourself when you suffer, fail, or feel inadequate, 
      rather than harshly criticizing yourself.</p>
      
      <h4>2. Common Humanity vs. Isolation</h4>
      <p>Recognize that suffering and imperfection are part of the shared human experience. 
      You're not alone in your struggles.</p>
      
      <h4>3. Mindfulness vs. Over-Identification</h4>
      <p>Observe your negative thoughts and feelings with openness, without suppressing them 
      or getting carried away by them.</p>
      
      <h3>How to Practice Self-Compassion:</h3>
      
      <h4>Self-Compassion Break</h4>
      <p>When you're struggling, try this exercise:</p>
      <ol style="line-height: 2;">
        <li><strong>Acknowledge:</strong> "This is a moment of suffering" or "This is really hard right now."</li>
        <li><strong>Recognize common humanity:</strong> "Suffering is part of life. I'm not alone in this."</li>
        <li><strong>Be kind to yourself:</strong> "May I be kind to myself in this moment. May I give myself the compassion I need."</li>
      </ol>
      
      <h4>Talk to Yourself Like a Friend</h4>
      <p>When you notice self-criticism, pause and ask: "What would I say to a close friend 
      in this situation?" Then, direct that same compassion toward yourself.</p>
      
      <h4>Self-Compassionate Language</h4>
      <p>Replace harsh self-talk:</p>
      <ul style="line-height: 2;">
        <li>Instead of "I'm so stupid," try "I made a mistake, and that's okay. Everyone does."</li>
        <li>Instead of "I'm a failure," try "I'm struggling right now, and that's human."</li>
        <li>Instead of "I should be over this by now," try "I'm healing at my own pace."</li>
      </ul>
      
      <div class="alert alert-info">
        <strong>Remember:</strong> Self-compassion isn't self-pity or self-indulgence. It's about 
        acknowledging your pain and responding with care, just as you would for someone you love.
      </div>
    `
  }
];

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Learn page loaded');
  renderTopics();
});

// ============================================
// Render Topics
// ============================================

function renderTopics() {
  const grid = document.getElementById('topicsGrid');
  
  const topicsHTML = TOPICS.map(topic => {
    return `
      <div class="topic-card" onclick="showTopic('${topic.id}')">
        <div class="topic-icon">${topic.icon}</div>
        <h3 class="topic-title">${topic.title}</h3>
        <p style="color: var(--color-text-light); line-height: 1.6;">
          ${topic.summary}
        </p>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = topicsHTML;
}

// ============================================
// Show Topic Details
// ============================================

window.showTopic = function(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return;
  
  const content = document.getElementById('topicContent');
  content.innerHTML = topic.content;
  
  const modal = document.getElementById('topicModal');
  MindVerse.openModal(modal);
};

console.log('Learn page script loaded');
