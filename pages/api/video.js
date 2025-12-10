export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.query;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎬 === VIDEO SEARCH ===`);
  console.log(`📌 Topic: ${topic}`);
  console.log(`${'='.repeat(70)}`);

  if (!topic) {
    console.log('❌ No topic');
    return res.status(400).json({ error: 'Topic required' });
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY;

  if (!youtubeApiKey) {
    console.error('❌ API key missing');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Try 4 different search strategies, from specific to broad
    const searchQueries = [
      { query: `${topic} animated kids`, name: 'Animated Kids' },
      { query: `${topic} kids learning`, name: 'Kids Learning' },
      { query: `${topic} educational`, name: 'Educational' },
      { query: topic, name: 'Any Topic' }
    ];

    for (const { query, name } of searchQueries) {
      console.log(`\n🔍 ATTEMPT: ${name}`);
      console.log(`📝 Query: "${query}"`);

      const video = await searchAndGetVideo(query, youtubeApiKey);
      
      if (video) {
        console.log(`✅ FOUND VIDEO!`);
        console.log(`   Title: "${video.title}"`);
        console.log(`   Duration: ${video.duration}s`);
        console.log(`${'='.repeat(70)}\n`);
        return res.status(200).json({
          success: true,
          title: video.title,
          videoId: video.videoId,
          thumbnail: video.thumbnail,
          score: video.score,
        });
      }
      console.log(`⚠️ No video found`);
    }

    // All attempts failed, use fallback
    console.log(`\n❌ All searches exhausted, using fallback`);
    return returnFallback(res);

  } catch (error) {
    console.error('❌ Error:', error.message);
    return returnFallback(res);
  }
}

/**
 * Search YouTube and return first valid video
 * Fast and broad - accepts any embeddable video under 10 minutes
 */
async function searchAndGetVideo(query, apiKey) {
  try {
    // Search
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('key', apiKey);
    searchUrl.searchParams.append('maxResults', '25'); // Smaller for faster response
    searchUrl.searchParams.append('order', 'relevance');

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Search error:', searchData.error.message);
      return null;
    }

    if (!searchData.items || searchData.items.length === 0) {
      console.log('No videos found');
      return null;
    }

    console.log(`Found ${searchData.items.length} videos`);

    // Get video details for ALL videos
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.append('part', 'contentDetails,statistics,status');
    detailsUrl.searchParams.append('id', videoIds);
    detailsUrl.searchParams.append('key', apiKey);

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = await detailsResponse.json();

    if (!detailsResponse.ok) {
      console.error('Details error:', detailsData.error.message);
      return null;
    }

    const detailsMap = {};
    detailsData.items.forEach(item => {
      detailsMap[item.id] = {
        duration: item.contentDetails.duration,
        viewCount: parseInt(item.statistics.viewCount || '0'),
        likeCount: parseInt(item.statistics.likeCount || '0'),
        commentCount: parseInt(item.statistics.commentCount || '0'),
        embeddable: item.status.embeddable,
        licensedContent: item.contentDetails.licensedContent,
        regionRestriction: item.contentDetails.regionRestriction,
      };
    });

    // Find FIRST embeddable video under 10 minutes
    for (let i = 0; i < searchData.items.length; i++) {
      const item = searchData.items[i];
      const videoId = item.id.videoId;
      const details = detailsMap[videoId];

      if (!details) continue;

      // Check if embeddable
      if (details.embeddable !== true) {
        console.log(`  ❌ Not embeddable`);
        continue;
      }

      // Check region restrictions
      if (details.regionRestriction) {
        console.log(`  ❌ Region restricted`);
        continue;
      }

      // Check licensed content
      if (details.licensedContent === true) {
        console.log(`  ❌ Licensed content only`);
        continue;
      }

      // Check duration: must be under 10 minutes (600 seconds)
      const durationSeconds = parseDuration(details.duration);
      if (durationSeconds < 5 || durationSeconds > 600) {
        console.log(`  ❌ Duration ${durationSeconds}s out of range`);
        continue;
      }

      // This video is VALID!
      let score = 100;

      // Boost score for quality
      if (details.viewCount > 100000) score += 50;
      if (details.likeCount > 1000) score += 25;

      console.log(`  ✅ VALID VIDEO: "${item.snippet.title.substring(0, 50)}..."`);
      console.log(`     Duration: ${durationSeconds}s | Views: ${details.viewCount}`);

      return {
        videoId,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default.url,
        score,
        duration: durationSeconds,
      };
    }

    console.log('No embeddable videos found in results');
    return null;

  } catch (error) {
    console.error('Search error:', error.message);
    return null;
  }
}

/**
 * Parse ISO 8601 duration
 * PT5M30S = 330 seconds
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
 * Fallback video
 */
function returnFallback(res) {
  console.log(`🎬 Using fallback`);
  console.log(`${'='.repeat(70)}\n`);

  return res.status(200).json({
    success: true,
    title: 'Educational Video',
    videoId: 'crfvqKKMpZM',
    thumbnail: 'fallback',
    score: 0,
  });
}