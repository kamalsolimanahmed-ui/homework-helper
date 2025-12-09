import { useEffect, useState } from "react";
import ScanButton from "../components/ScanButton";

export default function Home() {
  const [parentMode, setParentMode] = useState(false);
  const [lang, setLang] = useState("en");

  // Load saved mode and language from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("parentMode");
    const savedLang = localStorage.getItem("lang");
    
    if (savedMode) {
      setParentMode(savedMode === "true");
    }
    if (savedLang) {
      setLang(savedLang);
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

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-col items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <div className="flex items-center gap-2 bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg">
          <span className="text-blue-600 text-xl">🌐</span>
          <select
            value={lang}
            onChange={handleLanguageChange}
            className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer text-sm"
          >
            <option value="en">🇺🇸 English (USA)</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Hero Section with Characters and Icons */}
        <div className="relative w-full h-96 flex items-center justify-center mb-8">
          {/* This is where your Canva hero image would go */}
          <div className="text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h1 className="text-6xl font-black text-yellow-400 drop-shadow-lg mb-3">
              HOMEWORK
            </h1>
            <h2 className="text-5xl font-black text-yellow-400 drop-shadow-lg mb-4">
              HELPER AI
            </h2>
            <p className="text-xl text-white font-semibold drop-shadow-md">
              Smart help for kids + parents
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-8 w-full">
          <p className="text-white text-center text-lg font-bold mb-6">
            Who's doing homework?
          </p>

          <div className="flex gap-4 justify-center mb-8">
            {/* Kid Mode Button */}
            <button
              onClick={handleKidMode}
              className={`
                py-6 px-8 rounded-3xl font-bold text-xl
                transition-all duration-300 transform
                flex flex-col items-center gap-3
                ${
                  parentMode === false
                    ? "bg-green-500 scale-105 shadow-2xl ring-4 ring-yellow-400"
                    : "bg-green-600 opacity-70 hover:opacity-100"
                }
              `}
            >
              <img
                src="/kid.png"
                alt="Kid Mode"
                className="w-20 h-20 object-contain"
              />
              <span className="text-white">Kid Mode</span>
            </button>

            {/* Parent Mode Button */}
            <button
              onClick={handleParentMode}
              className={`
                py-6 px-8 rounded-3xl font-bold text-xl
                transition-all duration-300 transform
                flex flex-col items-center gap-3
                ${
                  parentMode === true
                    ? "bg-blue-500 scale-105 shadow-2xl ring-4 ring-yellow-400"
                    : "bg-blue-600 opacity-70 hover:opacity-100"
                }
              `}
            >
              <img
                src="/parent.png"
                alt="Parent Mode"
                className="w-20 h-20 object-contain"
              />
              <span className="text-white">Parent Mode</span>
            </button>
          </div>

          {/* Mode Description */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-3 text-center mb-8">
            <p className="text-white text-sm font-semibold">
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
      </div>
    </div>
  );
}