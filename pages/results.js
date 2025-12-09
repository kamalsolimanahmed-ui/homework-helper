import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Results() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("homeworkResult");

    if (!saved) {
      router.push("/");
      return;
    }

    setResult(JSON.parse(saved));
    setLoading(false);
  }, [router]);

  const parseProblems = (text) => {
    // Split by "المشكلة" (Problem in Arabic) or "Problem" (English)
    const problemRegex = /(?:المشكلة|Problem)\s+\d+:/gi;
    const problems = text.split(problemRegex).filter((p) => p.trim());
    return problems.map((p) => p.trim());
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold">Loading your golden lesson...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl mb-4">❌ No homework data found</p>
          <Link href="/">
            <button className="px-6 py-3 bg-white text-red-500 font-bold rounded-lg">
              Go Back Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const problems = parseProblems(result.explanation_for_kid);
  const colors = [
    "from-red-100 to-pink-100",
    "from-blue-100 to-cyan-100",
    "from-green-100 to-emerald-100",
    "from-yellow-100 to-orange-100",
    "from-purple-100 to-pink-100",
    "from-indigo-100 to-blue-100",
    "from-rose-100 to-red-100",
    "from-lime-100 to-green-100",
    "from-sky-100 to-blue-100",
    "from-amber-100 to-yellow-100",
    "from-fuchsia-100 to-purple-100",
    "from-teal-100 to-cyan-100",
    "from-orange-100 to-red-100",
    "from-emerald-100 to-green-100",
    "from-violet-100 to-purple-100",
  ];

  const emojis = [
    "🍕",
    "🎮",
    "🐾",
    "💵",
    "⚽",
    "🎮",
    "🏆",
    "💳",
    "🎯",
    "🎁",
    "🎪",
    "🏋️",
    "🎨",
    "🌈",
    "🚀",
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Crown Header */}
        <div className="text-center mb-8 mt-6">
          <div className="text-7xl mb-3 animate-bounce">👑</div>
          <h1 className="text-5xl font-black text-amber-900 mb-2">YOU'RE A GENIUS! 🧠</h1>
          <p className="text-xl text-gray-700 font-semibold">
            World-Class Teacher's Golden Lessons
          </p>
        </div>

        {/* Simple Answer Badge */}
        <div className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 rounded-2xl p-1 mb-8 shadow-2xl">
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-amber-900">
              {result.simple_answer}
            </p>
          </div>
        </div>

        {/* Problem Cards */}
        <div className="space-y-4 mb-8">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${colors[idx % colors.length]} rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-all`}
            >
              {/* Card Header - Always Visible */}
              <button
                onClick={() =>
                  setExpandedCard(expandedCard === idx ? -1 : idx)
                }
                className="w-full p-6 text-left hover:bg-black hover:bg-opacity-5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{emojis[idx % emojis.length]}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Problem {idx + 1}
                      </h3>
                      <p className="text-sm text-gray-600">Click to expand</p>
                    </div>
                  </div>
                  <span className="text-2xl">
                    {expandedCard === idx ? "▼" : "▶"}
                  </span>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedCard === idx && (
                <div className="border-t-2 border-gray-300 p-6 bg-white bg-opacity-70">
                  <div className="text-base text-gray-800 leading-relaxed whitespace-pre-line space-y-4">
                    {problem}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Steps Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-6 shadow-xl border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <span className="text-5xl mr-4">🎯</span>
            <h2 className="text-3xl font-black text-blue-900">How To Master This</h2>
          </div>
          <div className="space-y-3">
            {result.detailed_steps.split("\n").map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-lg text-blue-900 font-semibold pt-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Golden Tip Card */}
        <div className="bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 rounded-2xl p-8 mb-6 shadow-2xl border-4 border-amber-400">
          <div className="flex items-center mb-4">
            <span className="text-5xl mr-4">✨</span>
            <h2 className="text-3xl font-black text-amber-900">GENIUS TIP!</h2>
          </div>
          <p className="text-xl text-amber-900 font-bold leading-relaxed">
            {result.fun_tip}
          </p>
        </div>

        {/* Teacher's Note */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-8 shadow-lg border-2 border-purple-200">
          <details className="cursor-pointer group">
            <summary className="text-lg font-bold text-purple-900 hover:text-purple-700 flex items-center gap-2 pb-4 border-b-2 border-purple-300 group-open:border-purple-500">
              👨‍🏫 For Parents & Teachers
              <span className="ml-auto text-purple-500 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-4 text-purple-800 space-y-3">
              <p className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>
                  <strong>Story-Based Learning:</strong> Most powerful teaching
                  method proven by neuroscience
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>
                  <strong>Multiple Intelligence:</strong> Visual, verbal, logical,
                  emotional engagement
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>
                  <strong>Memory Tricks:</strong> Based on spaced repetition &
                  pattern recognition
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>
                  <strong>Real-World Connections:</strong> Helps kids understand
                  WHY math matters
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">🎯</span>
                <span className="font-bold text-purple-900">
                  Best tip: Have them TEACH you! That's when learning becomes
                  permanent! 🌟
                </span>
              </p>
            </div>
          </details>
        </div>

        {/* Extracted Text */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 shadow-lg border-2 border-gray-400">
          <details className="cursor-pointer group">
            <summary className="text-lg font-bold text-gray-800 cursor-pointer hover:text-gray-600 flex items-center gap-2 pb-3 border-b-2 border-gray-400 group-open:border-gray-600">
              📸 What we read from your homework
              <span className="ml-auto text-gray-600 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap font-mono bg-white p-4 rounded">
              {result.extracted_text}
            </p>
          </details>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 justify-center mb-8">
          <Link href="/">
            <button className="w-full px-8 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              📸 Scan Another Problem
            </button>
          </Link>
          <button
            onClick={() => window.print()}
            className="w-full px-8 py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 font-bold rounded-xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            🖨️ Print This Golden Lesson
          </button>
        </div>

        {/* Footer */}
        <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
          <p className="text-purple-900 font-bold text-lg mb-2">
            💪 Every problem = Stronger brain!
          </p>
          <p className="text-purple-800">
            You're not just learning math - you're building YOUR GENIUS SUPERPOWER!
          </p>
        </div>
      </div>
    </div>
  );
}