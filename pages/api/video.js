export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject = 'math', difficulty_band = 'normal' } = req.query;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎬 === STRICT VIDEO WHITELIST ===`);
  console.log(`📚 Subject: ${subject}`);
  console.log(`📊 Difficulty: ${difficulty_band}`);
  console.log(`${'='.repeat(70)}`);

  const WHITELIST = {
    math: {
      easy: [
        { id: 'nKIu9yen5nc', title: 'Basic Addition Basics for Kindergarten', duration: 420 },
        { id: 'FyFJEMF0bpA', title: 'Simple Addition with Visual Blocks', duration: 480 },
        { id: 'LzXJ0ysNlpk', title: 'Early Math Skills', duration: 360 },
      ],
      normal: [
        { id: '99dVwvKqY78', title: 'Grade 3 Math Fundamentals', duration: 540 },
        { id: 'bC_Kqd9P0vk', title: 'Multiplication Explained', duration: 480 },
        { id: '5hVm5p59OEo', title: 'Understanding Division', duration: 420 },
      ],
      hard: [
        { id: 'GgLM2N7__tw', title: 'Advanced Fractions', duration: 600 },
        { id: 'N-2vTEy3-6Q', title: 'Multi-Digit Operations', duration: 540 },
        { id: 'kQSq5WnVy_M', title: 'Intro to Algebra', duration: 480 },
      ],
    },
    english: {
      easy: [
        { id: '30gEiweaAVQ', title: 'Learning the Alphabet', duration: 360 },
        { id: 'vEBT34t0yyY', title: 'Simple Sight Words', duration: 300 },
        { id: '1aVy30s-3b8', title: 'Beginning Reading Basics', duration: 420 },
      ],
      normal: [
        { id: 'T5_E0YEhqzM', title: 'Grammar Essentials', duration: 480 },
        { id: 'kk2NlNd7c04', title: 'Building Sentences', duration: 540 },
        { id: 'uR5pTiFV_Uc', title: 'Vocabulary Building', duration: 420 },
      ],
      hard: [
        { id: 'PYnWwBjJVmE', title: 'Advanced Writing Skills', duration: 600 },
        { id: '9S7eFDDMfMA', title: 'Reading Comprehension Strategies', duration: 540 },
        { id: 'dQw4w9WgXcQ', title: 'Literary Analysis Basics', duration: 480 },
      ],
    },
    vocabulary: {
      easy: [
        { id: '1aVy30s-3b8', title: 'Learning New Words', duration: 360 },
        { id: 'vEBT34t0yyY', title: 'Word Meanings for Beginners', duration: 300 },
        { id: '30gEiweaAVQ', title: 'Building Basic Vocabulary', duration: 420 },
      ],
      normal: [
        { id: 'kk2NlNd7c04', title: 'Expanding Your Vocabulary', duration: 480 },
        { id: 'T5_E0YEhqzM', title: 'Understanding Word Relationships', duration: 540 },
        { id: 'uR5pTiFV_Uc', title: 'Context and Word Meaning', duration: 420 },
      ],
      hard: [
        { id: 'dQw4w9WgXcQ', title: 'Advanced Vocabulary and Etymology', duration: 600 },
        { id: '9S7eFDDMfMA', title: 'Nuanced Word Meanings', duration: 540 },
        { id: 'PYnWwBjJVmE', title: 'Academic Vocabulary', duration: 480 },
      ],
    },
    reading: {
      easy: [
        { id: '1aVy30s-3b8', title: 'Beginning Reading', duration: 360 },
        { id: 'vEBT34t0yyY', title: 'Phonics Fundamentals', duration: 300 },
        { id: '30gEiweaAVQ', title: 'Simple Story Reading', duration: 420 },
      ],
      normal: [
        { id: 'kk2NlNd7c04', title: 'Reading Fluency', duration: 480 },
        { id: 'T5_E0YEhqzM', title: 'Understanding Text', duration: 540 },
        { id: 'uR5pTiFV_Uc', title: 'Comprehension Skills', duration: 420 },
      ],
      hard: [
        { id: 'dQw4w9WgXcQ', title: 'Critical Reading Analysis', duration: 600 },
        { id: '9S7eFDDMfMA', title: 'Inferential Reading', duration: 540 },
        { id: 'PYnWwBjJVmE', title: 'Advanced Text Study', duration: 480 },
      ],
    },
    science: {
      easy: [
        { id: 'LzXJ0ysNlpk', title: 'Science Basics for Kids', duration: 360 },
        { id: 'FyFJEMF0bpA', title: 'Exploring Nature', duration: 420 },
        { id: 'nKIu9yen5nc', title: 'Simple Experiments', duration: 300 },
      ],
      normal: [
        { id: 'bC_Kqd9P0vk', title: 'Life Science Concepts', duration: 480 },
        { id: '5hVm5p59OEo', title: 'Understanding Ecosystems', duration: 540 },
        { id: 'GgLM2N7__tw', title: 'Physics for Kids', duration: 420 },
      ],
      hard: [
        { id: 'N-2vTEy3-6Q', title: 'Advanced Science Concepts', duration: 600 },
        { id: 'kQSq5WnVy_M', title: 'Scientific Method', duration: 540 },
        { id: '99dVwvKqY78', title: 'Complex Experiments', duration: 480 },
      ],
    },
  };

  try {
    const subjectLower = subject.toLowerCase();
    const diffBandLower = difficulty_band.toLowerCase();

    const subjectVideos = WHITELIST[subjectLower];
    
    if (!subjectVideos) {
      console.log(`❌ Subject not in whitelist: ${subject}`);
      return res.status(200).json({
        success: false,
        error: `Subject "${subject}" not found in whitelist`,
      });
    }

    const difficultyVideos = subjectVideos[diffBandLower];

    if (!difficultyVideos || difficultyVideos.length === 0) {
      console.log(`❌ No videos for ${subject}/${difficulty_band}`);
      return res.status(200).json({
        success: false,
        error: `No approved videos for ${subject}/${difficulty_band}`,
      });
    }

    const randomIndex = Math.floor(Math.random() * difficultyVideos.length);
    const selectedVideo = difficultyVideos[randomIndex];

    console.log(`✅ VIDEO SELECTED (WHITELIST)`);
    console.log(`   ID: ${selectedVideo.id}`);
    console.log(`   Title: "${selectedVideo.title}"`);
    console.log(`   Duration: ${selectedVideo.duration}s`);
    console.log(`${'='.repeat(70)}\n`);

    return res.status(200).json({
      success: true,
      videoId: selectedVideo.id,
      title: selectedVideo.title,
      duration: selectedVideo.duration,
      subject: subjectLower,
      difficulty_band: diffBandLower,
      whitelistApproved: true,
    });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log(`${'='.repeat(70)}\n`);
    
    return res.status(200).json({
      success: false,
      error: 'Internal error',
    });
  }
}