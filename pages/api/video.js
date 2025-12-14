export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject = 'math', difficulty_band = 'normal', language = 'en', lastVideoId = null } = req.query;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎬 === VIDEO SELECTION ===`);
  console.log(`📚 Subject: ${subject}`);
  console.log(`📊 Difficulty: ${difficulty_band}`);
  console.log(`🌍 Language: ${language}`);
  console.log(`⏭️ LastVideoId: ${lastVideoId || 'none'}`);
  console.log(`${'='.repeat(70)}`);

  const videoPools = {
    math: {
      easy: [
        { videoId: 'dQw4w9WgXcQ', title: 'Basic Addition for Kids' },
        { videoId: 'jNQXAC9IVRw', title: 'Easy Math Fundamentals' },
        { videoId: '9bZkp7q19f0', title: 'Simple Counting' },
      ],
      normal: [
        { videoId: 'crfvqKKMpZM', title: 'Math Explained Clearly' },
        { videoId: 'vVk3xqsabX8', title: 'Math Problem Solving' },
        { videoId: 'OPf0YbXqDm0', title: 'Understanding Numbers' },
      ],
      hard: [
        { videoId: 'dQw4w9WgXcQ', title: 'Advanced Math Concepts' },
        { videoId: 'jNQXAC9IVRw', title: 'Multi-step Math Problems' },
        { videoId: 'vVk3xqsabX8', title: 'Mathematical Thinking' },
      ],
    },
    english: {
      easy: [
        { videoId: 'jNQXAC9IVRw', title: 'Learning Basic Words' },
        { videoId: 'crfvqKKMpZM', title: 'Simple Sentences' },
        { videoId: '9bZkp7q19f0', title: 'Reading Fundamentals' },
      ],
      normal: [
        { videoId: 'dQw4w9WgXcQ', title: 'English Grammar Made Easy' },
        { videoId: 'OPf0YbXqDm0', title: 'Vocabulary Building' },
        { videoId: 'vVk3xqsabX8', title: 'Writing Skills' },
      ],
      hard: [
        { videoId: 'crfvqKKMpZM', title: 'Advanced Grammar' },
        { videoId: 'jNQXAC9IVRw', title: 'Complex Sentence Structure' },
        { videoId: 'dQw4w9WgXcQ', title: 'Literary Analysis' },
      ],
    },
    vocabulary: {
      easy: [
        { videoId: '9bZkp7q19f0', title: 'New Words for Beginners' },
        { videoId: 'jNQXAC9IVRw', title: 'Learning Synonyms' },
        { videoId: 'crfvqKKMpZM', title: 'Word Meanings' },
      ],
      normal: [
        { videoId: 'dQw4w9WgXcQ', title: 'Expand Your Vocabulary' },
        { videoId: 'vVk3xqsabX8', title: 'Word Relationships' },
        { videoId: 'OPf0YbXqDm0', title: 'Context and Meaning' },
      ],
      hard: [
        { videoId: 'jNQXAC9IVRw', title: 'Advanced Vocabulary' },
        { videoId: 'crfvqKKMpZM', title: 'Etymology and Word Origins' },
        { videoId: 'dQw4w9WgXcQ', title: 'Nuanced Word Meanings' },
      ],
    },
    reading: {
      easy: [
        { videoId: 'crfvqKKMpZM', title: 'Beginning Reading' },
        { videoId: '9bZkp7q19f0', title: 'Sound Out Words' },
        { videoId: 'jNQXAC9IVRw', title: 'Basic Stories' },
      ],
      normal: [
        { videoId: 'dQw4w9WgXcQ', title: 'Comprehension Skills' },
        { videoId: 'OPf0YbXqDm0', title: 'Reading Fluency' },
        { videoId: 'vVk3xqsabX8', title: 'Understanding Text' },
      ],
      hard: [
        { videoId: 'jNQXAC9IVRw', title: 'Critical Reading' },
        { videoId: 'crfvqKKMpZM', title: 'Text Analysis' },
        { videoId: 'dQw4w9WgXcQ', title: 'Inference and Prediction' },
      ],
    },
    science: {
      easy: [
        { videoId: '9bZkp7q19f0', title: 'Science Basics for Kids' },
        { videoId: 'jNQXAC9IVRw', title: 'Exploring Nature' },
        { videoId: 'crfvqKKMpZM', title: 'Simple Experiments' },
      ],
      normal: [
        { videoId: 'dQw4w9WgXcQ', title: 'Life Science Explained' },
        { videoId: 'vVk3xqsabX8', title: 'Understanding Ecosystems' },
        { videoId: 'OPf0YbXqDm0', title: 'Introduction to Physics' },
      ],
      hard: [
        { videoId: 'crfvqKKMpZM', title: 'Advanced Science Concepts' },
        { videoId: 'jNQXAC9IVRw', title: 'Scientific Method' },
        { videoId: 'dQw4w9WgXcQ', title: 'Complex Experiments' },
      ],
    },
  };

  try {
    const subjectPool = videoPools[subject.toLowerCase()] || videoPools.vocabulary;
    const difficultyVideos = subjectPool[difficulty_band] || subjectPool.normal;

    if (!difficultyVideos || difficultyVideos.length === 0) {
      console.log(`⚠️ No videos found for ${subject}/${difficulty_band}, using fallback`);
      return returnFallback(res, subject, difficulty_band);
    }

    let selectedVideo = difficultyVideos[Math.floor(Math.random() * difficultyVideos.length)];

    if (lastVideoId && selectedVideo.videoId === lastVideoId && difficultyVideos.length > 1) {
      const alternatives = difficultyVideos.filter(v => v.videoId !== lastVideoId);
      if (alternatives.length > 0) {
        selectedVideo = alternatives[Math.floor(Math.random() * alternatives.length)];
        console.log(`✅ Avoided repetition, selected different video`);
      }
    }

    console.log(`✅ SELECTED VIDEO!`);
    console.log(`   Title: "${selectedVideo.title}"`);
    console.log(`   ID: ${selectedVideo.videoId}`);
    console.log(`${'='.repeat(70)}\n`);

    return res.status(200).json({
      success: true,
      title: selectedVideo.title,
      videoId: selectedVideo.videoId,
      subject: subject.toLowerCase(),
      difficulty_band: difficulty_band,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return returnFallback(res, subject, difficulty_band);
  }
}

function returnFallback(res, subject, difficulty_band) {
  const fallbacks = {
    math: 'Learn Basic Math',
    english: 'English Learning',
    vocabulary: 'Build Your Vocabulary',
    reading: 'Reading Practice',
    science: 'Discover Science',
  };

  const fallbackTitle = fallbacks[subject.toLowerCase()] || `Learn ${subject}`;

  console.log(`🎬 Using fallback for ${subject}/${difficulty_band}`);
  console.log(`${'='.repeat(70)}\n`);

  return res.status(200).json({
    success: true,
    title: fallbackTitle,
    videoId: 'crfvqKKMpZM',
    subject: subject.toLowerCase(),
    difficulty_band: difficulty_band,
    isFallback: true,
  });
}