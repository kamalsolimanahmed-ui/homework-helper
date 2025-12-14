// THIS IS AN UPDATE TO exercise.js
// ONLY CHANGE: Update fetchVideo() call to pass topic

// FIND THIS SECTION (around line 50):

async function fetchVideo(subject, difficultyBand, lastId) {
  try {
    const res = await fetch(
      `/api/video?subject=${subject}&difficulty_band=${difficultyBand}&lastVideoId=${lastId || ''}`
    );
    const data = await res.json();
    if (data.success) {
      setVideoData(data);
      setLastVideoId(data.videoId);
    }
  } catch (err) {
    console.error('Video fetch error:', err);
  }
}

// REPLACE IT WITH THIS:

async function fetchVideo(subject, difficultyBand, lastId, topic, mathLevel) {
  try {
    // Use topic (operation type) instead of subject
    // For math, topic is the operation: addition, subtraction, multiplication, division
    const videoTopic = topic || subject;
    const videoLevel = mathLevel || 'basic';

    console.log(`🎬 Fetching video: topic=${videoTopic}, math_level=${videoLevel}`);

    const res = await fetch(
      `/api/video?topic=${encodeURIComponent(videoTopic)}&math_level=${videoLevel}&language=en`
    );
    const data = await res.json();
    if (data.success) {
      setVideoData(data);
      setLastVideoId(data.videoId);
      console.log(`✅ Video loaded: ${data.videoId}`);
    }
  } catch (err) {
    console.error('Video fetch error:', err);
  }
}

// THEN FIND THIS LINE (around line 110):

const subject = getSubjectFromTopic(topic);
const diffBand = getDifficultyBand(currentLevel);
await fetchVideo(subject, diffBand, lastVideoId);

// REPLACE IT WITH:

const saved = localStorage.getItem('homeworkResult');
const detectedMathLevel = saved ? JSON.parse(saved).detected_math_level : 'basic';

const subject = getSubjectFromTopic(topic);
const diffBand = getDifficultyBand(currentLevel);
await fetchVideo(subject, diffBand, lastVideoId, topic, detectedMathLevel);

// That's it! The video endpoint will now:
// 1. Receive topic (operation type): addition, subtraction, etc.
// 2. Receive math_level (detected level): early, basic, normal, advanced
// 3. Filter videos by BOTH parameters
// 4. Block age-inappropriate operations (no fractions for kids)