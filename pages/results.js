import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Results() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Crown Header - GOLDEN */}
        <div className="text-center mb-8 mt-6">
          <div className="text-7xl mb-3">👑</div>
          <h1 className="text-5xl font-black text-amber-900 mb-2">YOU'RE A GENIUS! 🧠</h1>
          <p className="text-2xl text-amber-700 font-semibold">
            Here's your GOLDEN lesson from a World-Class Teacher
          </p>
        </div>

        {/* Golden Badge - Simple Answer */}
        <div className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 rounded-2xl p-1 mb-6 shadow-2xl">
          <div className="bg-white rounded-2xl p-8">
            <div className="flex items-center mb-4 justify-center">
              <span className="text-5xl">🏆</span>
            </div>
            <p className="text-center text-2xl font-bold text-amber-900">
              {result.simple_answer}
            </p>
          </div>
        </div>

        {/* Main Explanation Card - PREMIUM STYLED */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-2xl border-4 border-amber-200">
          <div className="flex items-center mb-6">
            <span className="text-5xl mr-4">📖</span>
            <h2 className="text-3xl font-black text-amber-900">Your Golden Lesson</h2>
          </div>
          <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line font-medium space-y-4 border-l-4 border-amber-300 pl-6">
            {result.explanation_for_kid}
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-6 shadow-xl border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3">🎯</span>
            <h2 className="text-2xl font-bold text-blue-900">How To Master This</h2>
          </div>
          <div className="text-lg text-blue-900 whitespace-pre-line leading-relaxed space-y-2">
            {result.detailed_steps}
          </div>
        </div>

        {/* Gold Tip Card - PREMIUM */}
        <div className="bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 rounded-2xl p-8 mb-6 shadow-2xl border-4 border-amber-400">
          <div className="flex items-center mb-4">
            <span className="text-5xl mr-4">✨</span>
            <h2 className="text-2xl font-black text-amber-900">GENIUS TIP!</h2>
          </div>
          <p className="text-lg text-amber-900 font-bold leading-relaxed">
            {result.fun_tip}
          </p>
        </div>

        {/* Parent/Teacher Insight */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-8 shadow-lg border-2 border-purple-200">
          <details className="cursor-pointer">
            <summary className="text-lg font-bold text-purple-900 hover:text-purple-700 flex items-center gap-2">
              👨‍🏫 Teacher's Note (For Parents/Teachers)
            </summary>
            <div className="mt-4 text-purple-800 text-sm space-y-2">
              <p>
                ✓ This lesson uses story-based learning - the most powerful teaching method
              </p>
              <p>
                ✓ Your child is learning like they're taught by award-winning educators
              </p>
              <p>
                ✓ The memory tricks are based on neuroscience research (spaced repetition)
              </p>
              <p>
                ✓ Encourage them to teach this to someone else - that's when learning sticks!
              </p>
            </div>
          </details>
        </div>

        {/* Extracted Text (Optional) */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-8 shadow-lg border-2 border-gray-300">
          <details>
            <summary className="text-lg font-bold text-gray-800 cursor-pointer hover:text-gray-600">
              📸 What we read from your homework
            </summary>
            <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap font-mono">
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

        {/* Footer Message */}
        <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
          <p className="text-purple-900 font-bold text-lg mb-2">
            💪 Remember: Every problem you solve makes your brain STRONGER!
          </p>
          <p className="text-purple-800">
            You're not just learning homework - you're building YOUR GENIUS SUPERPOWER!
          </p>
        </div>
      </div>
    </div>
  );
}