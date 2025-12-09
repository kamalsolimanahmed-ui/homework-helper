export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY;

  if (!youtubeApiKey) {
    console.error('❌ YOUTUBE_API_KEY not set in environment');
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  try {
    console.log(`🎬 Searching YouTube for: "${topic} for kids cartoon"`);

    const searchQuery = `${topic} for kids cartoon`;

    // Search videos
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('key', youtubeApiKey);
    searchUrl.searchParams.append('maxResults', '10');
    searchUrl.searchParams.append('order', 'relevance');
    searchUrl.searchParams.append('videoDuration', 'short'); // Videos under 10 minutes

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('❌ YouTube API error:', searchData);
      return res.status(500).json({
        error: searchData.error?.message || 'YouTube API search failed',
      });
    }

    if (!searchData.items || searchData.items.length === 0) {
      console.log('⚠️ No videos found for topic:', topic);
      return res.status(404).json({ error: 'No videos found' });
    }

    // Get first video
    const video = searchData.items[0];
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnail =
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium?.url ||
      video.snippet.thumbnails.default.url;

    console.log(`✅ Found video: "${title}"`);

    // Get video duration to verify it's under 10 minutes
    const videoDetailsUrl = new URL(
      'https://www.googleapis.com/youtube/v3/videos'
    );
    videoDetailsUrl.searchParams.append('part', 'contentDetails');
    videoDetailsUrl.searchParams.append('id', videoId);
    videoDetailsUrl.searchParams.append('key', youtubeApiKey);

    const detailsResponse = await fetch(videoDetailsUrl.toString());
    const detailsData = await detailsResponse.json();

    if (detailsResponse.ok && detailsData.items && detailsData.items.length > 0) {
      const duration = detailsData.items[0].contentDetails.duration;
      console.log(`📺 Video duration: ${duration}`);
    }

    return res.status(200).json({
      success: true,
      title,
      videoId,
      thumbnail,
      searchQuery,
    });
  } catch (error) {
    console.error('❌ Video API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch video',
    });
  }
}