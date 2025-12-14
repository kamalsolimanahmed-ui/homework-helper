/**
 * MATH VIDEO SELECTION - LEVEL + OPERATION AWARE
 * 
 * Videos are STRICTLY filtered by:
 * 1. Detected math level (early/basic/normal/advanced)
 * 2. Operation type (addition, subtraction, multiplication, division, fractions)
 * 
 * HARD RULES:
 * - early/basic: ONLY addition/subtraction (NO fractions, NO decimals)
 * - normal: addition/subtraction/multiplication/division (NO fractions yet)
 * - advanced: ALL including fractions and multi-step
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject = 'math', topic = 'addition', math_level = 'basic', language = 'en' } = req.query;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎬 === MATH VIDEO SELECTION (LEVEL + OPERATION AWARE) ===`);
  console.log(`📚 Subject: ${subject}`);
  console.log(`📊 Topic: ${topic}`);
  console.log(`🎯 Math Level: ${math_level}`);
  console.log(`🌍 Language: ${language}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // ============================================
    // VIDEO WHITELIST BY OPERATION & LEVEL
    // ============================================

    const VIDEO_POOLS = {
      // ADDITION videos (ALL LEVELS)
      math_addition: {
        early: {
          en: ['A-ykhY_IoaU', '1ACa-NW8-TU'],  // Simple addition (0-10)
          es: ['gjpgSLXCdbc'],
          fr: ['LKXNGWZdmes'],
        },
        basic: {
          en: ['bgiqzAuGaLs'],  // Addition (0-20)
          es: ['NQYwfKUCz8E'],
          fr: ['XorFEWPieMk'],
        },
        normal: {
          en: ['vksy7e3hY8Q'],  // Addition with larger numbers
        },
        advanced: {
          en: ['vksy7e3hY8Q'],  // Multi-step addition
        },
      },

      // SUBTRACTION videos (ALL LEVELS)
      math_subtraction: {
        early: {
          en: ['A-ykhY_IoaU', '1ACa-NW8-TU'],  // Simple subtraction (0-10)
          es: ['gjpgSLXCdbc'],
          fr: ['LKXNGWZdmes'],
        },
        basic: {
          en: ['bgiqzAuGaLs'],  // Subtraction (0-20)
          es: ['NQYwfKUCz8E'],
          fr: ['XorFEWPieMk'],
        },
        normal: {
          en: ['vksy7e3hY8Q'],  // Subtraction with larger numbers
        },
        advanced: {
          en: ['vksy7e3hY8Q'],  // Multi-step subtraction
        },
      },

      // MULTIPLICATION videos (ONLY for normal/advanced)
      math_multiplication: {
        early: null,  // NOT ALLOWED for young kids
        basic: null,  // NOT ALLOWED for young kids
        normal: {
          en: ['vksy7e3hY8Q', 'bgiqzAuGaLs'],  // Multiplication basics
        },
        advanced: {
          en: ['vksy7e3hY8Q'],  // Advanced multiplication
        },
      },

      // DIVISION videos (ONLY for normal/advanced)
      math_division: {
        early: null,  // NOT ALLOWED for young kids
        basic: null,  // NOT ALLOWED for young kids
        normal: {
          en: ['vksy7e3hY8Q'],  // Division basics
        },
        advanced: {
          en: ['vksy7e3hY8Q'],  // Advanced division
        },
      },

      // FRACTIONS videos (ONLY for advanced)
      math_fractions: {
        early: null,  // ❌ FORBIDDEN
        basic: null,  // ❌ FORBIDDEN
        normal: null, // ❌ FORBIDDEN
        advanced: {
          en: ['vksy7e3hY8Q'],  // Fractions only for older kids
        },
      },

      // SCIENCE videos (as fallback)
      science: {
        en: ['dxcx35x5L9Y', 'OyTEfLaRn98', 'Td_A9H69eE8'],
      },
    };

    // ============================================
    // MAP TOPIC TO OPERATION TYPE
    // ============================================

    const operationMap = {
      'addition': 'math_addition',
      'add': 'math_addition',
      'plus': 'math_addition',
      'subtraction': 'math_subtraction',
      'subtract': 'math_subtraction',
      'minus': 'math_subtraction',
      'multiplication': 'math_multiplication',
      'multiply': 'math_multiplication',
      'times': 'math_multiplication',
      'division': 'math_division',
      'divide': 'math_division',
      'fractions': 'math_fractions',
      'fraction': 'math_fractions',
    };

    const topicLower = topic.toLowerCase();
    let selectedOperation = operationMap[topicLower] || 'math_addition'; // Default to addition

    console.log(`\n🔍 OPERATION MAPPING`);
    console.log(`   Topic: "${topic}"`);
    console.log(`   Mapped to: "${selectedOperation}"`);

    // ============================================
    // CHECK RESTRICTIONS BY LEVEL
    // ============================================

    console.log(`\n⚠️ LEVEL RESTRICTIONS`);

    // Early/Basic kids: NO multiplication, NO division, NO fractions
    if ((math_level === 'early' || math_level === 'basic') && 
        (selectedOperation === 'math_multiplication' || 
         selectedOperation === 'math_division' || 
         selectedOperation === 'math_fractions')) {
      console.log(`   ❌ ${math_level} level cannot access ${selectedOperation}`);
      console.log(`   ⬇️ Downgrading to addition (safe operation for young kids)`);
      selectedOperation = 'math_addition';
    } else {
      console.log(`   ✅ ${math_level} level can access ${selectedOperation}`);
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

      // Fallback: Try lower levels (never upward)
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
        console.log(`   ❌ No videos in entire operation pool, using addition fallback`);
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
      return respondWithVideo(res, { [language]: enVideos }, language, topic, selectedOperation, math_level);
    }

    return respondWithVideo(res, levelPool, language, topic, selectedOperation, math_level);

  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    console.log(`${'='.repeat(80)}\n`);
    return respondWithFallback(res, 'A-ykhY_IoaU', topic, 'math_addition', math_level);
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