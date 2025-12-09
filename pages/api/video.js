export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.query;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎬 === ADVANCED VIDEO RECOMMENDATION SYSTEM ===`);
  console.log(`📌 Topic: ${topic}`);
  console.log(`${'='.repeat(70)}`);

  if (!topic) {
    console.log('❌ No topic provided');
    return res.status(400).json({ error: 'Topic is required' });
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY;

  if (!youtubeApiKey) {
    console.error('❌ YOUTUBE_API_KEY not configured');
    return res.status(500).json({
      error: 'YouTube API key not configured. Please set YOUTUBE_API_KEY in environment.',
    });
  }

  try {
    // ============================================
    // STEP 1: Search YouTube with Smart Pattern
    // ============================================
    const searchQuery = `${topic} animated learning cartoon for kids`;
    console.log(`\n🔍 STEP 1: SEARCH`);
    console.log(`📝 Query: "${searchQuery}"`);

    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('key', youtubeApiKey);
    searchUrl.searchParams.append('maxResults', '50');
    searchUrl.searchParams.append('order', 'relevance');
    searchUrl.searchParams.append('videoDuration', 'medium,short');
    searchUrl.searchParams.append('regionCode', 'US');
    searchUrl.searchParams.append('relevanceLanguage', 'en');

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('❌ YouTube Search API error:', searchData);
      return returnFallback(res, 'API_ERROR');
    }

    if (!searchData.items || searchData.items.length === 0) {
      console.log('⚠️ No videos found in search results');
      return returnFallback(res, 'NO_RESULTS');
    }

    console.log(`✅ Found ${searchData.items.length} videos in search results`);

    // ============================================
    // STEP 2: Get Video Details (Duration, Stats)
    // ============================================
    console.log(`\n📊 STEP 2: FETCH DETAILS`);
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.append('part', 'contentDetails,statistics');
    detailsUrl.searchParams.append('id', videoIds);
    detailsUrl.searchParams.append('key', youtubeApiKey);

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = await detailsResponse.json();

    if (!detailsResponse.ok) {
      console.error('❌ YouTube Details API error:', detailsData);
      return returnFallback(res, 'DETAILS_ERROR');
    }

    // Create details map for quick lookup
    const detailsMap = {};
    detailsData.items.forEach(item => {
      detailsMap[item.id] = {
        duration: item.contentDetails.duration,
        viewCount: parseInt(item.statistics.viewCount || '0'),
        likeCount: parseInt(item.statistics.likeCount || '0'),
        commentCount: parseInt(item.statistics.commentCount || '0'),
      };
    });

    console.log(`✅ Retrieved details for ${Object.keys(detailsMap).length} videos`);

    // ============================================
    // STEP 3: Filter & Score Videos
    // ============================================
    console.log(`\n🎯 STEP 3: FILTER & SCORE`);

    const animationKeywords = [
      'animated',
      'animation',
      'cartoon',
      'kids learning',
      'learning cartoon',
    ];

    const trustedChannels = {
      Numberblocks: 120,
      'Khan Academy Kids': 100,
      'Scratch Garden': 80,
      'Jack Hartmann': 80,
      'Pinkfong Learning': 60,
      FunKidsLearning: 50,
    };

    const scoredVideos = [];
    let rejectedCount = 0;

    for (let i = 0; i < searchData.items.length; i++) {
      const item = searchData.items[i];
      const videoId = item.id.videoId;
      const details = detailsMap[videoId];

      if (!details) {
        rejectedCount++;
        continue;
      }

      // Parse duration
      const durationSeconds = parseDuration(details.duration);

      // ========== FILTER 1: Duration ==========
      // Reject if < 25 seconds OR > 10 minutes (600 seconds)
      if (durationSeconds < 25 || durationSeconds > 600) {
        rejectedCount++;
        console.log(
          `  ❌ "${item.snippet.title.substring(0, 50)}..." - Duration ${durationSeconds}s (out of range)`
        );
        continue;
      }

      // ========== FILTER 2: Animation Keywords ==========
      // Must contain animation keywords in title or description
      const title = item.snippet.title.toLowerCase();
      const description = item.snippet.description.toLowerCase();
      const channelTitle = item.snippet.channelTitle;

      const hasAnimationKeyword = animationKeywords.some(
        kw => title.includes(kw) || description.includes(kw)
      );

      if (!hasAnimationKeyword) {
        rejectedCount++;
        console.log(
          `  ❌ "${item.snippet.title.substring(0, 50)}..." - No animation keywords`
        );
        continue;
      }

      // ========== FILTER 3: Low Quality Channels ==========
      // Reject channels with very low engagement (optional, soft filter)
      const engagementScore = details.likeCount + details.commentCount;
      if (engagementScore === 0 && details.viewCount < 10000) {
        rejectedCount++;
        console.log(
          `  ❌ "${item.snippet.title.substring(0, 50)}..." - Low quality channel`
        );
        continue;
      }

      // ========== VIDEO PASSED ALL FILTERS ==========
      // Now score it
      const score = scoreVideo(item, details, trustedChannels);

      scoredVideos.push({
        videoId,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default.url,
        score,
        channelTitle,
        viewCount: details.viewCount,
        duration: durationSeconds,
      });

      console.log(
        `  ✅ "${item.snippet.title.substring(0, 50)}..." - Score: ${score}`
      );
    }

    console.log(
      `\n📈 Results: ${scoredVideos.length} valid videos, ${rejectedCount} rejected`
    );

    // ============================================
    // STEP 4: Select Best Video or Return Fallback
    // ============================================
    console.log(`\n🏆 STEP 4: SELECT BEST VIDEO`);

    if (scoredVideos.length === 0) {
      console.log('⚠️ No valid educational videos found, returning fallback');
      return returnFallback(res, 'NO_VALID_VIDEOS');
    }

    // Sort by score (descending) and select the best
    scoredVideos.sort((a, b) => b.score - a.score);
    const bestVideo = scoredVideos[0];

    console.log(`✅ BEST VIDEO SELECTED:`);
    console.log(`   Title: "${bestVideo.title.substring(0, 60)}..."`);
    console.log(`   Channel: ${bestVideo.channelTitle}`);
    console.log(`   Score: ${bestVideo.score}`);
    console.log(`   Duration: ${bestVideo.duration}s`);
    console.log(`   Views: ${bestVideo.viewCount.toLocaleString()}`);
    console.log(`\n${'='.repeat(70)}\n`);

    return res.status(200).json({
      success: true,
      title: bestVideo.title,
      videoId: bestVideo.videoId,
      thumbnail: bestVideo.thumbnail,
      score: bestVideo.score,
    });
  } catch (error) {
    console.error('❌ Video API error:', error);
    return returnFallback(res, 'EXCEPTION');
  }
}

/**
 * Parse ISO 8601 duration format
 * Example: PT5M30S = 5 minutes 30 seconds = 330 seconds
 */
function parseDuration(duration) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  const hours = parseInt(matches?.[1] || '0');
  const minutes = parseInt(matches?.[2] || '0');
  const seconds = parseInt(matches?.[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Score Video Based on Multiple Criteria
 *
 * Scoring breakdown:
 * a) Animation Keywords:
 *    +50 if title contains "animated"
 *    +40 if title contains "cartoon"
 *    +30 if description contains animation keywords
 *
 * b) Learning Intent:
 *    +25 if title includes "learn"
 *    +15 if title includes "kids"
 *
 * c) Trusted Educational Channels:
 *    +120 Numberblocks
 *    +100 Khan Academy Kids
 *    +80 Scratch Garden
 *    +80 Jack Hartmann
 *    +60 Pinkfong Learning
 *    +50 FunKidsLearning
 *
 * d) View Count Boost:
 *    +50 if views > 1,000,000
 *    +30 if views > 500,000
 *    +15 if views > 100,000
 */
function scoreVideo(item, details, trustedChannels) {
  let score = 0;
  const title = item.snippet.title.toLowerCase();
  const description = item.snippet.description.toLowerCase();
  const channelTitle = item.snippet.channelTitle;

  // ========== A) ANIMATION KEYWORDS ==========
  if (title.includes('animated')) {
    score += 50;
    console.log(`    → +50 "animated" in title`);
  }

  if (title.includes('cartoon')) {
    score += 40;
    console.log(`    → +40 "cartoon" in title`);
  }

  const descHasAnimation =
    description.includes('animated') ||
    description.includes('animation') ||
    description.includes('cartoon');
  if (descHasAnimation) {
    score += 30;
    console.log(`    → +30 animation keywords in description`);
  }

  // ========== B) LEARNING INTENT ==========
  if (title.includes('learn')) {
    score += 25;
    console.log(`    → +25 "learn" in title`);
  }

  if (title.includes('kids')) {
    score += 15;
    console.log(`    → +15 "kids" in title`);
  }

  // ========== C) TRUSTED EDUCATIONAL CHANNELS ==========
  for (const [channel, points] of Object.entries(trustedChannels)) {
    if (channelTitle.toLowerCase().includes(channel.toLowerCase())) {
      score += points;
      console.log(`    → +${points} trusted channel: "${channel}"`);
      break; // Only count one channel bonus
    }
  }

  // ========== D) VIEW COUNT BOOST ==========
  const viewCount = details.viewCount;
  if (viewCount > 1000000) {
    score += 50;
    console.log(`    → +50 views > 1M`);
  } else if (viewCount > 500000) {
    score += 30;
    console.log(`    → +30 views > 500K`);
  } else if (viewCount > 100000) {
    score += 15;
    console.log(`    → +15 views > 100K`);
  }

  return score;
}

/**
 * Return Fallback Educational Video
 * Used when:
 * - YouTube API fails
 * - No videos found
 * - No valid educational videos after filtering
 */
function returnFallback(res, reason) {
  console.log(`\n🎬 RETURNING FALLBACK VIDEO`);
  console.log(`   Reason: ${reason}`);
  console.log(`${'='.repeat(70)}\n`);

  return res.status(200).json({
    success: true,
    title: 'Learn Math Fast (Kids Version)',
    videoId: 'B3qWZ-HFZ0Y',
    thumbnail: 'fallback',
    score: 0,
  });
}