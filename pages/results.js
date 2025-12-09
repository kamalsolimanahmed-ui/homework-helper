import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Results() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("homeworkResult");

    if (!saved) {
      router.push("/");
      return;
    }

    const resultData = JSON.parse(saved);
    setResult(resultData);
    setLoading(false);

    // Fetch YouTube video based on topic
    if (resultData.topic && resultData.topic !== "unknown") {
      fetchVideo(resultData.topic);
    }
  }, [router]);

  async function fetchVideo(topic) {
    try {
      setVideoLoading(true);
      setVideoError(null);

      console.log(`🎬 Fetching video for topic: ${topic}`);

      const res = await fetch(`/api/video?topic=${encodeURIComponent(topic)}`);
      const data = await res.json();

      if (!res.ok) {
        console.warn(`⚠️ Video fetch failed: ${data.error}`);
        setVideoError(data.error);
        setVideoLoading(false);
        return;
      }

      console.log(`✅ Video found: ${data.title}`);
      setVideo(data);
      setVideoLoading(false);
    } catch (error) {
      console.error("❌ Video error:", error);
      setVideoError("Could not load video recommendation");
      setVideoLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold">Loading your answer...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl mb-4">❌ No homework data found</p>
          <Link href="/">
            <button className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500">
              Go Back Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const modeLabel = result.mode === "parent" ? "👨‍💼 Parent Mode" : "👧 Kid Mode";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            ⚡ Awesome Job!
          </h1>
          <p className="text-xl text-gray-300 opacity-90">Here's your homework answer</p>
          <p className="text-lg text-yellow-300 mt-2 font-semibold">{modeLabel}</p>
        </div>

        {/* Simple Answer Card */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-2 border-yellow-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">⭐</span>
            <h2 className="text-2xl font-bold text-yellow-400">The Answer</h2>
          </div>
          <p className="text-xl text-gray-100 leading-relaxed">
            {result.simple_answer}
          </p>
        </div>

        {/* Explanation Card */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-2 border-blue-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">💡</span>
            <h2 className="text-2xl font-bold text-blue-300">
              {result.mode === "parent" ? "Professional Explanation" : "How To Solve It"}
            </h2>
          </div>
          <div className="text-lg text-gray-100 leading-relaxed whitespace-pre-line">
            {result.explanation}
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-2 border-green-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">📋</span>
            <h2 className="text-2xl font-bold text-green-300">Steps to Remember</h2>
          </div>
          <div className="text-lg text-gray-100 whitespace-pre-line leading-relaxed">
            {result.detailed_steps}
          </div>
        </div>

        {/* Fun Tip Card */}
        <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-2xl p-6 mb-6 shadow-xl border-4 border-yellow-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">🎯</span>
            <h2 className="text-2xl font-bold text-white">
              {result.mode === "parent" ? "Pro Tip!" : "Fun Tip!"}
            </h2>
          </div>
          <p className="text-lg text-white font-semibold">
            {result.fun_tip}
          </p>
        </div>

        {/* YouTube Video Recommendation Card */}
        {result.topic && result.topic !== "unknown" && (
          <div className="bg-gradient-to-br from-red-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-4 border-red-500">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">📺</span>
              <h2 className="text-2xl font-bold text-red-300">Learn More</h2>
            </div>

            {videoLoading && (
              <div className="w-full bg-slate-700 rounded-lg p-8 text-center">
                <p className="text-gray-300 font-semibold">⏳ Loading video...</p>
              </div>
            )}

            {videoError && (
              <div className="w-full bg-yellow-900 rounded-lg p-4 border-2 border-yellow-600">
                <p className="text-yellow-200">
                  ⚠️ Could not load video recommendation for this topic
                </p>
              </div>
            )}

            {video && !videoLoading && !videoError && (
              <div className="space-y-4">
                {/* Video Iframe */}
                <div className="w-full rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    width="100%"
                    height="220"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                    className="rounded-lg"
                  />
                </div>

                {/* Video Title */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-100 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    🎬 Recommended for {result.mode === "parent" ? "learning together" : "visual learning"}
                  </p>
                </div>

                {/* Watch on YouTube Button */}
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block px-4 py-3 bg-red-600 text-white font-bold rounded-lg text-center hover:bg-red-700 transition-all"
                >
                  ▶️ Watch on YouTube
                </a>
              </div>
            )}
          </div>
        )}

        {/* Topic Card */}
        <div className="bg-gradient-to-br from-purple-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-2 border-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-purple-300">📚 Topic</h3>
              <p className="text-gray-100 text-lg font-semibold">{result.topic}</p>
            </div>
            <span className="text-4xl">🏷️</span>
          </div>
        </div>

        {/* Extracted Text (Optional) */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-xl border-2 border-slate-600">
          <details className="cursor-pointer group">
            <summary className="text-lg font-bold text-gray-300 cursor-pointer hover:text-gray-100 flex items-center gap-2 pb-3 border-b-2 border-slate-600 group-open:border-slate-500">
              📸 What we read from your homework
              <span className="ml-auto text-gray-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="text-sm text-gray-400 mt-4 whitespace-pre-wrap font-mono bg-slate-900 p-4 rounded">
              {result.extracted_text}
            </p>
          </details>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Link href="/">
            <button className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl text-lg shadow-lg hover:bg-gray-100">
              📸 Scan Another
            </button>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-lg shadow-lg hover:bg-yellow-500"
          >
            🖨️ Print Answer
          </button>
        </div>
      </div>
    </div>
  );
}