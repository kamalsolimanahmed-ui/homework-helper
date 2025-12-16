import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Results() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
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

    if (resultData.topic && resultData.topic !== "unknown") {
      fetchVideo(resultData.topic, resultData.math_level);
    }
  }, [router]);

  async function fetchVideo(topic, mathLevel) {
    try {
      setVideoLoading(true);
      const language = localStorage.getItem('lang') || 'en';

      const res = await fetch(
        `/api/video?topic=${encodeURIComponent(topic)}&math_level=${mathLevel}&language=${language}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.warn(`⚠️ Video fetch failed: ${data.error}`);
        setVideoLoading(false);
        return;
      }

      setVideo(data);
      setVideoLoading(false);
    } catch (error) {
      console.error("❌ Video error:", error);
      setVideoLoading(false);
    }
  }

  function selectGame() {
    // Random rotation between 3 math games
    const games = ['math-blaster', 'match-master', 'math-kitchen'];
    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
  }

  function playGame() {
    const validOps = ['addition', 'subtraction', 'multiplication', 'division'];
    const operation = result.topic?.toLowerCase();

    if (!operation || !validOps.includes(operation)) {
      console.error(`❌ Invalid or missing operation: ${operation}. Expected one of: ${validOps.join(', ')}`);
      return;
    }

    // Select random game from 3 options
    const game = selectGame();
    
    // Calculate digits
    const digits = result.digits || 1;

    const params = new URLSearchParams({
      subject: 'math',
      operation: operation,
      digits: digits,
      level: parseInt(result.grade_level) || 2,
      language: localStorage.getItem('lang') || 'en'
    });

    window.location.href = `/kid-arcade-games/${game}/game.html?${params.toString()}`;
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold">Loading your answers...</p>
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
  const answers = result.simple_answer.split('\n').filter(a => a.trim());
  const explanations = result.explanation.split('\n\n').filter(e => e.trim());

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 mt-6">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            ⚡ Awesome Job!
          </h1>
          <p className="text-xl text-gray-300 opacity-90">Here are all your homework answers</p>
          <p className="text-lg text-yellow-300 mt-2 font-semibold">{modeLabel}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-4 border-purple-400">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <h3 className="text-2xl font-bold text-purple-300">Problem Summary</h3>
              <p className="text-gray-100 text-lg">
                {answers.length} problem{answers.length !== 1 ? 's' : ''} solved ✓
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-4 border-yellow-400">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3">⭐</span>
            <h2 className="text-2xl font-bold text-yellow-400">All Answers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {answers.map((answer, idx) => (
              <div key={idx} className="bg-slate-700 rounded-lg p-4 border-2 border-yellow-300">
                <p className="text-gray-300 text-sm mb-1">Problem {idx + 1}</p>
                <p className="text-yellow-200 font-bold text-lg">{answer.trim()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-4">📖 Detailed Solutions</h3>
          {explanations.map((explanation, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 mb-4 shadow-xl border-2 border-blue-400">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">💡</span>
                <h4 className="text-xl font-bold text-blue-300">
                  Problem {idx + 1} - How To Solve It
                </h4>
              </div>
              <div className="text-lg text-gray-100 leading-relaxed whitespace-pre-wrap">
                {explanation.trim()}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-2 border-green-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">📋</span>
            <h2 className="text-2xl font-bold text-green-300">Steps to Remember</h2>
          </div>
          <div className="text-lg text-gray-100 whitespace-pre-wrap leading-relaxed">
            {result.detailed_steps}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-2xl p-6 mb-6 shadow-xl border-4 border-yellow-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">🎯</span>
            <h2 className="text-2xl font-bold text-white">
              {result.mode === "parent" ? "Pro Tip!" : "Fun Tip!"}
            </h2>
          </div>
          <p className="text-lg text-white font-semibold">{result.fun_tip}</p>
        </div>

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

            {video && !videoLoading && (
              <div className="space-y-4">
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

                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-100 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    🎬 Recommended for learning this concept
                  </p>
                </div>

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

        <div className="bg-gradient-to-br from-purple-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl border-2 border-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-purple-300">📚 Topic</h3>
              <p className="text-gray-100 text-lg font-semibold">{result.topic}</p>
            </div>
            <span className="text-4xl">🏷️</span>
          </div>
        </div>

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
            🖨️ Print Answers
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={playGame}
            className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg hover:bg-green-700 transition-all"
          >
            🎮 Play a Fun Game
          </button>
        </div>
      </div>
    </div>
  );
}