import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const config = { ssr: false };

const translations = {
  en: { goHome: '🏠 Home', backButton: '← Back' },
  fr: { goHome: '🏠 Accueil', backButton: '← Retour' },
  es: { goHome: '🏠 Inicio', backButton: '← Atrás' }
};

export default function Results() {
  const router = useRouter();
  const language = router.query.language || 'en';
  const t = translations[language] || translations.en;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [showGameIntro, setShowGameIntro] = useState(false);
  const [played, setPlayed] = useState(false);
  const [justPlayed, setJustPlayed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('homeworkResult');
      if (saved) {
        setResult(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading result:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const key = `played_${result.id || result.topic}`;
    setPlayed(!!localStorage.getItem(key));
  }, [result]);

  useEffect(() => {
    document.body.style.overflow = (showGameIntro || showGame) ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showGameIntro, showGame]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = "/game.html";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const exitGame = () => {
    setShowGame(false);
    setShowGameIntro(false);
    setPlayed(true);
    setJustPlayed(true);
    if (result) {
      localStorage.setItem(`played_${result.id || result.topic}`, "1");
    }
    setTimeout(() => setJustPlayed(false), 1000);
  };

  useEffect(() => {
    if (!showGame) return;
    const timer = setTimeout(() => {
      exitGame();
    }, 60_000);
    return () => clearTimeout(timer);
  }, [showGame, result]);

  useEffect(() => {
    if (!showGame || !result) return;
    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.postMessage(
      { level: result.level, subject: result.subject, lang: language },
      "*"
    );
  }, [showGame, result, language]);

  if (loading) {
    return <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center"><p className="text-white text-2xl">Loading...</p></div>;
  }

  if (!result) {
    return <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center"><p className="text-white text-2xl">No results found</p></div>;
  }

  const gameKey = result.subject === "math" ? "tap-answer" : "match-words";

  const gameLabel =
    result.level === "early" || result.level === "basic"
      ? "Play a Fun Game 🎮"
      : "Play a Quick Game 🎮";

  if (showGameIntro) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-6">
        <img src="/images/intro-bg.png" alt="Game intro" className="max-w-md mb-6" />
        <button
          onClick={() => { setShowGameIntro(false); setShowGame(true); }}
          className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-xl hover:bg-yellow-500 transition-all"
        >
          Start Game 🎮
        </button>
      </div>
    );
  }

  if (showGame) {
    return (
      <div className="w-full h-screen bg-black p-4 overflow-hidden">
        <button onClick={exitGame} className="mb-4 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200">{t.backButton}</button>
        <div className="transition-opacity duration-300 opacity-100">
          <iframe src={`/game.html?g=${gameKey}`} sandbox="allow-scripts allow-same-origin" className="w-full h-screen border-0 rounded-lg"></iframe>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={showGame ? "pointer-events-none" : ""}>
        <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
              <h1 className="text-4xl font-bold text-purple-600 mb-6">📊 Results</h1>
              {justPlayed && <p className="text-green-600 font-bold text-lg mb-4">Practice complete 🎉</p>}
              <div className="space-y-4 mb-8">
                <p className="text-lg"><strong>Topic:</strong> {result.topic}</p>
                <p className="text-lg"><strong>Explanation:</strong></p>
                <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">{result.explanation}</div>
                {result.fun_tip && <p className="text-lg text-green-600"><strong>💡 Tip:</strong> {result.fun_tip}</p>}
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  disabled={played}
                  onClick={() => setShowGameIntro(true)}
                  className={`flex-1 px-6 py-3 font-bold rounded-lg text-lg ${
                    played ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  {played ? "Game Played 🎉" : gameLabel}
                </button>
                <Link href="/" className="flex-1"><button className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-lg">{t.goHome}</button></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}