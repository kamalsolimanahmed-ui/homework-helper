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
          <p className="text-2xl font-bold">Loading your answer...</p>
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

  const modeLabel = result.mode === 'parent' ? '👨‍💼 Parent Mode' : '👧 Kid Mode';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-5xl font-bold text-white mb-2">🎉 Great Job!</h1>
          <p className="text-xl text-white opacity-90">Here's your homework answer</p>
          <p className="text-lg text-white mt-2 font-semibold">{modeLabel}</p>
        </div>

        {/* Simple Answer Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">⭐</span>
            <h2 className="text-2xl font-bold text-gray-800">The Answer</h2>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed">
            {result.simple_answer}
          </p>
        </div>

        {/* Explanation Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">💡</span>
            <h2 className="text-2xl font-bold text-gray-800">
              {result.mode === 'parent' ? 'Professional Explanation' : 'How To Solve It'}
            </h2>
          </div>
          <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {result.explanation}
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">📋</span>
            <h2 className="text-2xl font-bold text-gray-800">Steps to Remember</h2>
          </div>
          <div className="text-lg text-gray-700 whitespace-pre-line leading-relaxed">
            {result.detailed_steps}
          </div>
        </div>

        {/* Fun Tip Card */}
        <div className="bg-yellow-300 rounded-2xl p-6 mb-6 shadow-xl border-4 border-yellow-400">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">🎯</span>
            <h2 className="text-2xl font-bold text-gray-800">
              {result.mode === 'parent' ? 'Pro Tip!' : 'Fun Tip!'}
            </h2>
          </div>
          <p className="text-lg text-gray-700 font-semibold">
            {result.fun_tip}
          </p>
        </div>

        {/* Topic Card - For YouTube Integration */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-6 shadow-xl border-2 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-900">📚 Topic</h3>
              <p className="text-gray-700 text-lg font-semibold">{result.topic}</p>
            </div>
            <span className="text-4xl">📺</span>
          </div>
        </div>

        {/* Extracted Text (Optional - for debugging) */}
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 shadow-xl">
          <details>
            <summary className="text-lg font-bold text-gray-800 cursor-pointer hover:text-gray-600">
              📸 What we read from your homework
            </summary>
            <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap">
              {result.extracted_text}
            </p>
          </details>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Link href="/">
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg shadow-lg hover:bg-blue-50">
              📸 Scan Another
            </button>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl text-lg shadow-lg hover:bg-blue-700"
          >
            🖨️ Print Answer
          </button>
        </div>
      </div>
    </div>
  );
}