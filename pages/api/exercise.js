import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Exercise() {
  const router = useRouter();
  const { topic = 'addition', language = 'en' } = router.query;

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  // Fetch game on mount or when topic/language changes
  useEffect(() => {
    if (!topic || !language) return;

    async function fetchGame() {
      try {
        setLoading(true);
        setScore(null);
        setMatches({});
        setDraggedItem(null);

        const res = await fetch(
          `/api/arcade-matching?topic=${encodeURIComponent(topic)}&language=${language}`
        );

        if (!res.ok) {
          throw new Error('Failed to load game');
        }

        const data = await res.json();
        setGame(data);
        setError(null);
      } catch (err) {
        console.error('Game fetch error:', err);
        setError('Failed to load game. Please try again.');
        setGame(null);
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [topic, language]);

  // Drag handlers
  function handleDragStart(e, pair) {
    setDraggedItem(pair);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, rightItem) {
    e.preventDefault();

    if (!draggedItem) return;

    const newMatches = {
      ...matches,
      [draggedItem.leftId]: rightItem.text
    };

    setMatches(newMatches);
    setDraggedItem(null);

    // Auto-validate if all items matched
    if (Object.keys(newMatches).length === game.pairs.length) {
      validateMatches(newMatches);
    }
  }

  // Validation logic
  function validateMatches(matchesState) {
    let correct = 0;

    game.pairs.forEach((pair) => {
      if (matchesState[pair.leftId] === pair.right) {
        correct++;
      }
    });

    setScore({
      correct,
      total: game.pairs.length,
      percentage: Math.round((correct / game.pairs.length) * 100)
    });
  }

  // Manual check (in case user wants to submit before all matched)
  function handleCheckAnswers() {
    if (Object.keys(matches).length < game.pairs.length) {
      alert(`Match all items! (${Object.keys(matches).length}/${game.pairs.length})`);
      return;
    }
    validateMatches(matches);
  }

  // Play again
  function handlePlayAgain() {
    setMatches({});
    setScore(null);
    setDraggedItem(null);
    // Re-fetch same game
    const currentTopic = router.query.topic || 'addition';
    const currentLanguage = router.query.language || 'en';
    router.push(`/exercise?topic=${currentTopic}&language=${currentLanguage}`);
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl font-bold text-white mb-6">{error || 'Game not found'}</p>
          <Link href="/">
            <button className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-lg hover:bg-yellow-500 transition-all">
              🏠 Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (score) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-yellow-400 mb-4">Awesome!</h2>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
            <p className="text-xl font-bold mb-4">
              You got <span className="text-3xl">{score.correct}</span> out of{' '}
              <span className="text-3xl">{score.total}</span> correct!
            </p>
            <div className="text-6xl font-bold mb-4">{score.percentage}%</div>
            {score.percentage === 100 && <p className="text-lg">PERFECT! 🏆</p>}
            {score.percentage >= 80 && score.percentage < 100 && (
              <p className="text-lg">Great job! 🌟</p>
            )}
            {score.percentage < 80 && <p className="text-lg">Good try! Keep practicing! 💪</p>}
          </div>

          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-lg hover:bg-yellow-500 transition-all flex-1"
            >
              🔄 Play Again
            </button>
            <Link href="/" className="flex-1">
              <button className="w-full px-8 py-4 bg-white text-blue-900 font-bold rounded-xl text-lg hover:bg-gray-100 transition-all">
                🏠 Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Game state
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-5xl font-bold text-yellow-400 mb-3 drop-shadow-lg">
            {game.theme}
          </h1>
          <p className="text-xl text-gray-300">{game.instructions}</p>
        </div>

        {/* Main game container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* LEFT COLUMN - Draggable items */}
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">📍 Drag from here</h3>
            <div className="space-y-3">
              {game.pairs.map((pair) => {
                const isMatched = matches[pair.leftId];
                const isDragging = draggedItem?.leftId === pair.leftId;

                return (
                  <div
                    key={pair.leftId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, pair)}
                    className={`
                      p-4 rounded-lg font-bold text-center cursor-move
                      transition-all duration-200 select-none
                      ${
                        isDragging
                          ? 'bg-yellow-400 text-black shadow-lg scale-105'
                          : isMatched
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                      }
                    `}
                  >
                    {pair.left}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN - Drop zones */}
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">📌 Drop here</h3>
            <div className="space-y-3">
              {game.rightItems.map((rightItem) => {
                // Find which left item is matched to this right item
                const matchedLeftId = Object.entries(matches).find(
                  ([, rightText]) => rightText === rightItem.text
                )?.[0];
                const isMatched = !!matchedLeftId;

                return (
                  <div
                    key={`${rightItem.id}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, rightItem)}
                    className={`
                      p-4 rounded-lg font-bold text-center min-h-14 flex items-center justify-center
                      transition-all duration-200 border-2
                      ${
                        isMatched
                          ? 'bg-green-500 text-white border-green-400 shadow-md'
                          : 'bg-slate-700 text-gray-300 border-gray-500 hover:border-yellow-400 hover:shadow-lg'
                      }
                    `}
                  >
                    {rightItem.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Check button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCheckAnswers}
            disabled={Object.keys(matches).length === 0}
            className={`
              px-8 py-4 font-bold rounded-lg text-lg transition-all duration-200
              ${
                Object.keys(matches).length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg hover:shadow-xl'
              }
            `}
          >
            ✅ Check Answers ({Object.keys(matches).length}/{game.pairs.length})
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-gray-400 text-sm">
          <p>Theme: {game.theme}</p>
          <p>Topic: {game.topic}</p>
        </div>
      </div>
    </div>
  );
}