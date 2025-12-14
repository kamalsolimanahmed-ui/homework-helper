export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject = 'math', language = 'en', difficulty_band = 'normal' } = req.query;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎬 === VERIFIED VIDEO IDS ONLY ===`);
  console.log(`📚 Subject: ${subject} | 🌍 Language: ${language} | 📊 Difficulty: ${difficulty_band}`);
  console.log(`${'='.repeat(80)}`);

  // ============================================
  // VERIFIED VIDEO IDS ONLY - HARDCODED
  // Do NOT add, search, replace, or infer any others
  // ============================================
  
  const VERIFIED_WHITELIST = {
    math: {
      en: {
        easy: [
          'A-ykhY_IoaU',
          '1ACa-NW8-TU',
          'bgiqzAuGaLs',
        ],
        normal: [
          'vksy7e3hY8Q',
        ],
        hard: [],
      },
      fr: {
        easy: [
          'LKXNGWZdmes',
          'XorFEWPieMk',
        ],
        normal: [],
        hard: [],
      },
      es: {
        easy: [
          'gjpgSLXCdbc',
          'NQYwfKUCz8E',
        ],
        normal: [],
        hard: [],
      },
      de: {
        easy: [
          '3w2NsS04EmE',
        ],
        normal: [],
        hard: [],
      },
      ar: {
        easy: [
          'KGhWfzjcdRM',
        ],
        normal: [],
        hard: [],
      },
    },
    english: {
      en: {
        easy: [
          'TBLQx8uCic8',
        ],
        normal: [],
        hard: [],
      },
    },
    science: {
      en: {
        easy: [],
        normal: [
          'dxcx35x5L9Y',
          'OyTEfLaRn98',
          'Td_A9H69eE8',
        ],
        hard: [],
      },
    },
  };

  try {
    const subjectLower = subject.toLowerCase();
    const languageLower = language.toLowerCase();
    const diffBandLower = difficulty_band.toLowerCase();

    console.log(`🔍 Looking up: ${subjectLower}/${languageLower}/${diffBandLower}`);

    // Get subject pool
    const subjectPool = VERIFIED_WHITELIST[subjectLower];
    
    if (!subjectPool) {
      console.log(`⚠️ Subject "${subjectLower}" not found in whitelist.`);
      return respondWithFallback(res, 'A-ykhY_IoaU', subjectLower, languageLower, diffBandLower);
    }

    // Get language pool
    const languagePool = subjectPool[languageLower];
    
    if (!languagePool) {
      console.log(`⚠️ Language "${languageLower}" not available for subject "${subjectLower}". Using fallback.`);
      return respondWithFallback(res, 'A-ykhY_IoaU', subjectLower, languageLower, diffBandLower);
    }

    // Get difficulty videos
    let videos = languagePool[diffBandLower];

    // Fallback: if difficulty empty, try other difficulties for same subject+language
    if (!videos || videos.length === 0) {
      console.log(`⚠️ Difficulty "${diffBandLower}" not found for ${subjectLower}/${languageLower}. Trying other difficulties...`);
      
      for (const fallbackDiff of ['normal', 'easy', 'hard']) {
        if (fallbackDiff !== diffBandLower && languagePool[fallbackDiff]?.length > 0) {
          videos = languagePool[fallbackDiff];
          console.log(`✅ Found videos in ${subjectLower}/${languageLower}/${fallbackDiff}`);
          break;
        }
      }
    }

    // If still no videos, use absolute fallback
    if (!videos || videos.length === 0) {
      console.log(`⚠️ No videos found for ${subjectLower}/${languageLower}. Using universal fallback.`);
      return respondWithFallback(res, 'A-ykhY_IoaU', subjectLower, languageLower, diffBandLower);
    }

    // Select random video
    const videoId = videos[Math.floor(Math.random() * videos.length)];

    console.log(`✅ VIDEO SELECTED`);
    console.log(`   ID: ${videoId}`);
    console.log(`   Subject: ${subjectLower} | Language: ${languageLower} | Difficulty: ${diffBandLower}`);
    console.log(`${'='.repeat(80)}\n`);

    return respondWithVideo(res, videoId, subjectLower, languageLower, diffBandLower);

  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Never return error - always return a video
    return respondWithFallback(res, 'A-ykhY_IoaU', subject, language, difficulty_band);
  }
}

function respondWithVideo(res, videoId, subject, language, difficulty) {
  return res.status(200).json({
    success: true,
    videoId: videoId,
    subject: subject,
    language: language,
    difficulty_band: difficulty,
    whitelistApproved: true,
    verified: true,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
  });
}

function respondWithFallback(res, fallbackId, subject, language, difficulty) {
  return res.status(200).json({
    success: true,
    videoId: fallbackId,
    subject: subject,
    language: language,
    difficulty_band: difficulty,
    whitelistApproved: true,
    verified: true,
    isFallback: true,
    embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackId}?rel=0`,
  });
}