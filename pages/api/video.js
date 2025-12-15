// video.js

/**
 * OPERATION-AWARE VIDEO SELECTION
 * 
 * Videos match:
 * 1. Topic/Operation (addition, subtraction, multiplication, etc)
 * 2. Math level (early/basic/normal/advanced)
 * 3. Language
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic = 'addition', math_level = 'basic', language = 'en' } = req.query;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎬 === VIDEO SELECTION (OPERATION + LEVEL AWARE) ===`);
  console.log(`📖 Topic: ${topic}`);
  console.log(`🎯 Math Level: ${math_level}`);
  console.log(`🌍 Language: ${language}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // ============================================
    // VIDEO WHITELIST BY OPERATION & LEVEL
    // ============================================

    const VIDEO_POOLS = {
      // ADDITION videos (ALL LEVELS)
      addition: {
        early: {
          en: ['A-ykhY_IoaU', '1ACa-NW8-TU'],
          es: ['gjpgSLXCdbc'],
          fr: ['LKXNGWZdmes'],
        },
        basic: {
          en: ['bgiqzAuGaLs'],
          es: ['NQYwfKUCz8E'],
          fr: ['XorFEWPieMk'],
        },
        normal: {
          en: ['vksy7e3hY8Q'],
        },
        advanced: {
          en: ['vksy7e3hY8Q'],
        },
      },

      // SUBTRACTION videos (ALL LEVELS)
      subtraction: {
        early: {
          en: ['A-ykhY_IoaU', '1ACa-NW8-TU'],
          es: ['gjpgSLXCdbc'],
          fr: ['LKXNGWZdmes'],
        },
        basic: {
          en: ['bgiqzAuGaLs'],
          es: ['NQYwfKUCz8E'],
          fr: ['XorFEWPieMk'],
        },
        normal: {
          en: ['vksy7e3hY8Q'],
        },
        advanced: {
          en: ['vksy7e3hY8Q'],
        },
      },

      // MULTIPLICATION videos (ONLY for normal/advanced)
      multiplication: {
        early: null,
        basic: null,
        normal: {
          en: ['vksy7e3hY8Q', 'bgiqzAuGaLs'],
        },
        advanced: {
          en: ['vksy7e3hY8Q'],
        },
      },

      // DIVISION videos (ONLY for normal/advanced)
      division: {
        early: null,
        basic: null,
        normal: {
          en: ['vksy7e3hY8Q'],
        },
        advanced: {
          en: ['vksy7e3hY8Q'],
        },
      },

      // FRACTIONS videos (ONLY for advanced)
      fractions: {
        early: null,
        basic: null,
        normal: null,
        advanced: {
          en: ['vksy7e3hY8Q'],
        },
      },

      // FALLBACK for non-math
      science: {
        en: ['dxcx35x5L9Y', 'OyTEfLaRn98', 'Td_A9H69eE8'],
      },
    };

    // ============================================
    // NORMALIZE TOPIC
    // ============================================

    const topicLower = topic.toLowerCase();
    const operationMap = {
      'addition': 'addition',
      'add': 'addition',
      'plus': 'addition',
      'subtraction': 'subtraction',
      'subtract': 'subtraction',
      'minus': 'subtraction',
      'multiplication': 'multiplication',
      'multiply': 'multiplication',
      'times': 'multiplication',
      'division': 'division',
      'divide': 'division',
      'fractions': 'fractions',
      'fraction': 'fractions',
    };

    const normalizedOperation = operationMap[topicLower] || topicLower;

    console.log(`\n🔍 OPERATION MAPPING`);
    console.log(`   Input topic: "${topic}"`);
    console.log(`   Mapped to: "${normalizedOperation}"`);

    // ============================================
    // CHECK RESTRICTIONS BY LEVEL
    // ============================================

    console.log(`\n⚠️ LEVEL RESTRICTIONS`);

    let selectedOperation = normalizedOperation;

    if ((math_level === 'early' || math_level === 'basic') && 
        (normalizedOperation === 'multiplication' || 
         normalizedOperation === 'division' || 
         normalizedOperation === 'fractions')) {
      console.log(`   ❌ ${math_level} level cannot access ${normalizedOperation}`);
      console.log(`   ⬇️ Downgrading to addition`);
      selectedOperation = 'addition';
    } else {
      console.log(`   ✅ ${math_level} level can access ${normalizedOperation}`);
    }

    // ============================================
    // GET VIDEO POOL FOR THIS OPERATION + LEVEL
    // ============================================

    console.log(`\n🎬 VIDEO SELECTION`);
    const operationPool = VIDEO_POOLS[selectedOperation];

    if (!operationPool) {
      console.log(`   ❌ Operation pool "${selectedOperation}" not found`);
      return respondWithFallback(res, 'A-ykhY_IoaU', topic, selectedOperation, math_level);
    }

    const levelPool = operationPool[math_level];

    if (!levelPool) {
      console.log(`   ❌ No videos for ${selectedOperation} at ${math_level} level`);
      console.log(`   ⬇️ Falling back to lower level...`);

      const fallbackLevels = {
        'advanced': ['normal', 'basic', 'early'],
        'normal': ['basic', 'early'],
        'basic': ['early'],
        'early': [],
      };

      const tryLevels = fallbackLevels[math_level] || [];
      let foundPool = null;
      let fallbackLevel = math_level;

      for (const level of tryLevels) {
        const tryPool = operationPool[level];
        if (tryPool) {
          foundPool = tryPool;
          fallbackLevel = level;
          console.log(`   ✅ Found videos at ${level} level`);
          break;
        }
      }

      if (!foundPool) {
        console.log(`   ❌ No videos in operation pool, using addition fallback`);
        return respondWithFallback(res, 'A-ykhY_IoaU', topic, selectedOperation, math_level);
      }

      return respondWithVideo(res, foundPool, language, topic, selectedOperation, fallbackLevel);
    }

    // ============================================
    // SELECT RANDOM VIDEO FROM POOL
    // ============================================

    const videosByLanguage = levelPool[language] || levelPool['en'];

    if (!videosByLanguage || videosByLanguage.length === 0) {
      console.log(`   ⚠️ No videos in ${language}, falling back to English`);
      const enVideos = levelPool['en'];
      if (!enVideos || enVideos.length === 0) {
        return respondWithFallback(res, 'A-ykhY_IoaU', topic, selectedOperation, math_level);
      }
      return respondWithVideo(res, levelPool, 'en', topic, selectedOperation, math_level);
    }

    return respondWithVideo(res, levelPool, language, topic, selectedOperation, math_level);

  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    console.log(`${'='.repeat(80)}\n`);
    return respondWithFallback(res, 'A-ykhY_IoaU', topic, 'addition', math_level);
  }
}

function respondWithVideo(res, levelPool, language, topic, operation, level) {
  const videosByLanguage = levelPool[language] || levelPool['en'];
  const videoId = videosByLanguage[Math.floor(Math.random() * videosByLanguage.length)];

  console.log(`\n✅ VIDEO SELECTED`);
  console.log(`   Operation: ${operation}`);
  console.log(`   Level: ${level}`);
  console.log(`   Language: ${language}`);
  console.log(`   ID: ${videoId}`);
  console.log(`${'='.repeat(80)}\n`);

  return res.status(200).json({
    success: true,
    videoId: videoId,
    topic: topic,
    operation: operation,
    math_level: level,
    language: language,
    verified: true,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
  });
}

function respondWithFallback(res, fallbackId, topic, operation, level) {
  console.log(`\n⚠️ FALLBACK USED`);
  console.log(`   Using universal safe video: ${fallbackId}`);
  console.log(`   Original topic: ${topic}`);
  console.log(`   Original operation: ${operation}`);
  console.log(`   Original level: ${level}`);
  console.log(`${'='.repeat(80)}\n`);

  return res.status(200).json({
    success: true,
    videoId: fallbackId,
    topic: topic,
    operation: operation,
    math_level: level,
    verified: true,
    isFallback: true,
    embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackId}?rel=0`,
  });
}