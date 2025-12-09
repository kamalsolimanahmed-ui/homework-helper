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
      <div className="w-full min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold">Loading your answers...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl mb-4">❌ No data found</p>
          <Link href="/">
            <button className="px-6 py-3 bg-white text-red-500 font-bold rounded-lg">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Great Job! ✅</h1>
          <p className="text-lg text-gray-700">Here are your answers</p>
        </div>

        {/* Main Explanation */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border-4 border-blue-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Lesson</h2>
          <div className="text-base text-gray-800 leading-relaxed whitespace-pre-line space-y-4">
            {result.explanation_for_kid}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-green-50 rounded-2xl p-8 mb-8 shadow-lg border-4 border-green-300">
          <h2 className="text-2xl font-bold text-green-900 mb-6">How To Do It</h2>
          <div className="text-base text-gray-800 whitespace-pre-line space-y-3">
            {result.detailed_steps}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-yellow-50 rounded-2xl p-8 mb-8 shadow-lg border-4 border-yellow-300">
          <h2 className="text-2xl font-bold text-yellow-900 mb-3">💡 Remember</h2>
          <p className="text-lg text-gray-800 font-semibold">{result.fun_tip}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mb-8">
          <Link href="/">
            <button className="w-full px-6 py-4 bg-blue-500 text-white font-bold rounded-xl text-lg hover:bg-blue-600">
              Scan Another Problem
            </button>
          </Link>
          <button
            onClick={() => window.print()}
            className="w-full px-6 py-4 bg-green-500 text-white font-bold rounded-xl text-lg hover:bg-green-600"
          >
            Print This
          </button>
        </div>

        {/* Show Extracted Text */}
        <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-400">
          <details>
            <summary className="font-bold text-gray-800 cursor-pointer mb-3">
              📸 What we read
            </summary>
            <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {result.extracted_text}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}