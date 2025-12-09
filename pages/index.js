import { useEffect, useState } from "react";
import ScanButton from "../components/ScanButton";

export default function Home() {
  const [parentMode, setParentMode] = useState(false);

  // Load saved mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("parentMode");
    if (saved) {
      setParentMode(saved === "true");
    }
  }, []);

  function handleKidMode() {
    localStorage.setItem("parentMode", "false");
    setParentMode(false);
  }

  function handleParentMode() {
    localStorage.setItem("parentMode", "true");
    setParentMode(true);
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-3 drop-shadow-lg">
            📚 Homework Helper
          </h1>
          <p className="text-2xl text-white font-bold drop-shadow-md">
            Quick answers. Smart learning.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <p className="text-white text-center text-lg font-bold mb-6">
            Who's doing homework?
          </p>

          <div className="flex gap-4 mb-8">
            {/* Kid Mode Button */}
            <button
              onClick={handleKidMode}
              className={`
                flex-1 py-6 px-4 rounded-2xl font-bold text-lg
                transition-all duration-300 transform
                ${
                  parentMode === false
                    ? "bg-green-400 scale-105 shadow-2xl ring-4 ring-white"
                    : "bg-green-300 opacity-70 hover:opacity-100"
                }
              `}
            >
              <span className="text-4xl mb-2 block">👧</span>
              <span className="text-gray-800">Kid Mode</span>
            </button>

            {/* Parent Mode Button */}
            <button
              onClick={handleParentMode}
              className={`
                flex-1 py-6 px-4 rounded-2xl font-bold text-lg
                transition-all duration-300 transform
                ${
                  parentMode === true
                    ? "bg-blue-400 scale-105 shadow-2xl ring-4 ring-white"
                    : "bg-blue-300 opacity-70 hover:opacity-100"
                }
              `}
            >
              <span className="text-4xl mb-2 block">👨‍💼</span>
              <span className="text-gray-800">Parent Mode</span>
            </button>
          </div>

          {/* Mode Description */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 mb-8">
            <p className="text-white text-center font-semibold">
              {parentMode === false
                ? "✨ Simple explanations for kids ages 7-10"
                : "📊 Professional explanations for adults"}
            </p>
          </div>
        </div>

        {/* Scan Button */}
        <div className="flex justify-center mb-8">
          <ScanButton />
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          {/* Card 1 */}
          <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-5 border-2 border-white">
            <div className="flex items-start gap-3">
              <span className="text-3xl">📷</span>
              <div>
                <h3 className="text-white font-bold text-lg">Take a Photo</h3>
                <p className="text-white text-sm opacity-90">
                  Scan your homework with your camera
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-5 border-2 border-white">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="text-white font-bold text-lg">Get Instant Help</h3>
                <p className="text-white text-sm opacity-90">
                  AI analyzes your homework instantly
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-xl p-5 border-2 border-white">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="text-white font-bold text-lg">Learn Better</h3>
                <p className="text-white text-sm opacity-90">
                  Understand the concepts, not just answers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-8 absolute top-4 right-4 z-50">
          <select
            onChange={(e) => localStorage.setItem("lang", e.target.value)}
            defaultValue={typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en"}
            className="px-4 py-2 rounded-lg font-bold bg-white text-gray-800 shadow-lg border-2 border-white"
          >
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
        </div>
      </div>
    </div>
  );
}