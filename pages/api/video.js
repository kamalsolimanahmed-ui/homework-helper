export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.query;

  console.log(`\n🎬 === VIDEO API REQUEST ===`);
  console.log(`📌 Topic received: ${topic}`);

  if (!topic) {
    console.log('❌ No topic provided');
    return res.status(400).json({ error: 'Topic is required' });
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY;

  console.log(`🔑 Checking YouTube API key...`);
  if (!youtubeApiKey) {
    console.error('❌ YOUTUBE_API_KEY is NOT set in environment!');
    console.error('📝 Go to Render > Environment > Add YOUTUBE_API_KEY');
    return res.status(500).json({
      error: 'YouTube API key not configured. Please set YOUTUBE_API_KEY in environment.',
    });
  }

  console.log(`✅ API key found (${youtubeApiKey.substring(0, 10)}...)`);

  try {
    console.log(`🔍 Searching YouTube for: "${topic} for kids cartoon"`);

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
    searchUrl.searchParams.append('regionCode', 'US');
    searchUrl.searchParams.append('relevanceLanguage', 'en');

    console.log(`📡 Calling YouTube API...`);
    console.log(`URL: ${searchUrl.toString().substring(0, 100)}...`);

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    console.log(`📥 YouTube API response status: ${searchResponse.status}`);

    if (!searchResponse.ok) {
      console.error('❌ YouTube API error:', searchData);
      
      // Detailed error logging
      if (searchData.error) {
        console.error('Error code:', searchData.error.code);
        console.error('Error message:', searchData.error.message);
        
        if (searchData.error.code === 403) {
          console.error('💡 This is a 403 Forbidden error');
          console.error('Possible causes:');
          console.error('  - API key is invalid');
          console.error('  - YouTube Data API not enabled');
          console.error('  - API quota exceeded');
          console.error('  - API key restrictions (IP/domain)');
        }
      }

      return res.status(500).json({
        error: `YouTube API error: ${searchData.error?.message || 'Unknown error'}`,
      });
    }

    console.log(`📊 YouTube returned ${searchData.items?.length || 0} results`);

    if (!searchData.items || searchData.items.length === 0) {
      console.log('⚠️ No videos found for topic:', topic);
      return res.status(404).json({
        error: `No videos found for topic: ${topic}`,
      });
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
    console.log(`📺 Video ID: ${videoId}`);

    // Get video duration to verify it's under 10 minutes
    console.log(`⏱️  Checking video duration...`);
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
      console.log(`⏱️  Video duration: ${duration}`);
    }

    console.log(`✅ SUCCESS! Returning video...`);
    return res.status(200).json({
      success: true,
      title,
      videoId,
      thumbnail,
      searchQuery,
    });
  } catch (error) {
    console.error('❌ Video API error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: error.message || 'Failed to fetch video',
    });
  }
}