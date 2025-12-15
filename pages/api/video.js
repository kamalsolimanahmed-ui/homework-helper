export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic = 'addition', math_level = 'basic', language = 'en', digits = '2', skill = '' } = req.query;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎬 === VIDEO SEARCH (OPERATION + SKILL AWARE) ===`);
  console.log(`📖 Topic: ${topic}`);
  console.log(`🎯 Math Level: ${math_level}`);
  console.log(`📊 Digits: ${digits}`);
  console.log(`🔧 Skill: ${skill}`);
  console.log(`🌍 Language: ${language}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // ============================================
    // APPROVED CHANNELS ONLY
    // ============================================

    const APPROVED_CHANNELS = {
      math: {
        en: [
          'UC4a-Gbdw7vOaccHmFo40b9g',  // Khan Academy Kids
          'UCyP_9P-sc6nCThfKjZg5V2g',  // Scratch Garden
          'UCcp9uUuCKxq_fQF1pg6gY4w',  // Happy Learning English
          'UCtl-lJl5mLglH12RdKuZVBA',  // Smile and Learn
        ],
        es: [
          'UCtl-lJl5mLglH12RdKuZVBA',
          'UC4a-Gbdw7vOaccHmFo40b9g',
        ],
        fr: [
          'UCxXZbR5WmF8Izy4D2R_Fe8w',  // FrenchFoRKidz
          'UCkjoE10wU8rrEoXlxqvtQLg',  // Monsieur Steve
        ],
      },
      grammar: {
        en: [
          'UCNBFiZk0HOPL3yZ66Fq8rPQ',  // LucyMax English
          'UC3b4QtzZomJtL_8YVAyO4uA',  // Pebbles Kids Learning
        ],
      },
    };

    // ============================================
    // BUILD SEARCH QUERY FROM METADATA
    // ============================================

    const topicLower = topic.toLowerCase();
    const searchQuery = buildSearchQuery(topicLower, digits, skill, language);

    console.log(`\n🔍 SEARCH QUERY BUILDER`);
    console.log(`   Generated query: "${searchQuery}"`);

    // Determine subject
    let subject = 'math';
    if (topicLower === 'grammar' || topicLower === 'reading') {
      subject = 'grammar';
    }

    const approvedChannels = APPROVED_CHANNELS[subject]?.[language] || APPROVED_CHANNELS[subject]?.['en'] || [];

    if (!approvedChannels || approvedChannels.length === 0) {
      console.log(`   ❌ No approved channels for ${subject}`);
      return res.status(500).json({ error: 'No approved channels available' });
    }

    console.log(`\n📺 APPROVED CHANNELS`);
    approvedChannels.forEach(ch => console.log(`   - ${ch}`));

    // ============================================
    // SEARCH YOUTUBE API
    // ============================================

    console.log(`\n🔎 SEARCHING YOUTUBE...`);

    for (const channelId of approvedChannels) {
      try {
        const channelUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        channelUrl.searchParams.append('part', 'snippet');
        channelUrl.searchParams.append('q', searchQuery);
        channelUrl.searchParams.append('channelId', channelId);
        channelUrl.searchParams.append('type', 'video');
        channelUrl.searchParams.append('maxResults', '5');
        channelUrl.searchParams.append('order', 'relevance');
        channelUrl.searchParams.append('videoEmbeddable', 'true');
        channelUrl.searchParams.append('key', process.env.YOUTUBE_API_KEY);

        const response = await fetch(channelUrl.toString());
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const video = data.items[0];
          console.log(`\n✅ VIDEO FOUND`);
          console.log(`   Title: ${video.snippet.title}`);
          console.log(`   ID: ${video.id.videoId}`);
          console.log(`   Channel: ${channelId}`);
          console.log(`${'='.repeat(80)}\n`);

          return res.status(200).json({
            success: true,
            videoId: video.id.videoId,
            title: video.snippet.title,
            topic: topic,
            digits: digits,
            skill: skill,
            math_level: math_level,
            language: language,
            verified: true,
            source: 'approved_channel',
          });
        }
      } catch (err) {
        console.error(`   ⚠️ Error searching ${channelId}: ${err.message}`);
      }
    }

    console.log(`\n❌ NO VIDEOS FOUND IN APPROVED CHANNELS`);
    console.log(`   Query used: "${searchQuery}"`);
    console.log(`   Channels: ${approvedChannels.length}`);
    console.log(`${'='.repeat(80)}\n`);

    return res.status(404).json({
      success: false,
      error: 'No videos found in approved channels',
      topic: topic,
      query: searchQuery,
      channels_searched: approvedChannels.length
    });

  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    console.log(`${'='.repeat(80)}\n`);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// BUILD SEARCH QUERY FROM METADATA
// ============================================

function buildSearchQuery(operation, digits, skill, language) {
  const digitMap = {
    '1': 'one digit',
    '2': 'two digit',
    '3': 'three digit',
  };

  const digitLabel = digitMap[String(digits)] || 'basic';

  // Build operation-specific queries
  const queryTemplates = {
    'addition': {
      en: skill === 'regrouping'
        ? `${digitLabel} addition with regrouping for kids`
        : `${digitLabel} addition for kids`,
      es: skill === 'regrouping'
        ? `suma de ${digitLabel} cifras con reagrupación para niños`
        : `suma de ${digitLabel} cifras para niños`,
      fr: skill === 'regrouping'
        ? `addition à ${digitLabel} chiffres avec retenue pour enfants`
        : `addition à ${digitLabel} chiffres pour enfants`,
    },
    'subtraction': {
      en: skill === 'borrowing'
        ? `${digitLabel} subtraction with borrowing for kids`
        : `${digitLabel} subtraction for kids`,
      es: skill === 'borrowing'
        ? `resta de ${digitLabel} cifras con préstamo para niños`
        : `resta de ${digitLabel} cifras para niños`,
      fr: skill === 'borrowing'
        ? `soustraction à ${digitLabel} chiffres avec emprunt pour enfants`
        : `soustraction à ${digitLabel} chiffres pour enfants`,
    },
    'multiplication': {
      en: `${digitLabel} multiplication for kids`,
      es: `multiplicación de ${digitLabel} cifras para niños`,
      fr: `multiplication à ${digitLabel} chiffres pour enfants`,
    },
    'division': {
      en: `${digitLabel} division for kids`,
      es: `división de ${digitLabel} cifras para niños`,
      fr: `division à ${digitLabel} chiffres pour enfants`,
    },
    'grammar': {
      en: 'english grammar for kids',
      es: 'gramática inglesa para niños',
      fr: 'grammaire anglaise pour enfants',
    },
    'reading': {
      en: 'reading for kids',
      es: 'lectura para niños',
      fr: 'lecture pour enfants',
    },
  };

  const queries = queryTemplates[operation] || queryTemplates['addition'];
  return queries[language] || queries['en'];
}