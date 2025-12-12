// exercise.js - UPDATED
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const config = { ssr: false };

const translations = {
  en: {
    loading: 'Loading game...',
    fetchError: 'Failed to load game',
    gameNotFound: 'Game not found',
    goHome: '🏠 Go Home',
    awesome: 'Awesome!',
    youGot: 'You got',
    outOf: 'out of',
    correct: 'correct!',
    perfect: 'PERFECT! 🏆',
    great: 'Great job! ⭐',
    goodTry: 'Good try! Keep practicing! 💪',
    playAgain: '🔄 Play Again',
    home: '🏠 Home',
    dragFrom: '🟦 Drag from here',
    dropHere: '🟩 Drop here',
    checkAnswers: '✅ Check Answers',
    matchAll: 'Match all items!',
    theme: 'Theme',
    topic: 'Topic'
  },
  fr: {
    loading: 'Chargement du jeu...',
    fetchError: 'Impossible de charger le jeu',
    gameNotFound: 'Jeu non trouvé',
    goHome: '🏠 Accueil',
    awesome: 'Super!',
    youGot: 'Vous avez obtenu',
    outOf: 'sur',
    correct: 'correct!',
    perfect: 'PARFAIT! 🏆',
    great: 'Excellent! ⭐',
    goodTry: 'Bon essai! Continue de pratiquer! 💪',
    playAgain: '🔄 Rejouer',
    home: '🏠 Accueil',
    dragFrom: '🟦 Faites glisser d\'ici',
    dropHere: '🟩 Déposez ici',
    checkAnswers: '✅ Vérifier les réponses',
    matchAll: 'Associez tous les éléments!',
    theme: 'Thème',
    topic: 'Sujet'
  },
  es: {
    loading: 'Cargando juego...',
    fetchError: 'Error al cargar el juego',
    gameNotFound: 'Juego no encontrado',
    goHome: '🏠 Inicio',
    awesome: '¡Increíble!',
    youGot: 'Obtuviste',
    outOf: 'de',
    correct: '¡correcto!',
    perfect: '¡PERFECTO! 🏆',
    great: '¡Excelente! ⭐',
    goodTry: '¡Buen intento! ¡Sigue practicando! 💪',
    playAgain: '🔄 Jugar de nuevo',
    home: '🏠 Inicio',
    dragFrom: '🟦 Arrastra desde aquí',
    dropHere: '🟩 Suelta aquí',
    checkAnswers: '✅ Verificar respuestas',
    matchAll: '¡Empareja todos los elementos!',
    theme: 'Tema',
    topic: 'Tema'
  }
};

export default function Exercise() {
  const router = useRouter();
  const { topic = 'addition', language = 'en' } = router.query;
  const t = translations[language] || translations.en;

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topic || !language) return;

    async function fetchGame() {
      try {
        setLoading(true);
        setScore(null);
        setMatches({});
        setDraggedItem(null);

        const saved = localStorage.getItem('homeworkResult');
        const problemsParam = saved ? JSON.parse(saved).extracted_text : '';

        const res = await fetch(
          `/api/arcade-matching?topic=${encodeURIComponent(topic)}&language=${language}&problems=${encodeURIComponent(problemsParam)}`
        );

        if (!res.ok) {
          throw new Error(t.fetchError);
        }

        const data = await res.json();
        setGame(data);
        setError(null);
      } catch (err) {
        console.error('Game fetch error:', err);
        setError(t.fetchError);
        setGame(null);
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [topic, language, t]);

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

    if (Object.keys(newMatches).length === game.pairs.length) {
      validateMatches(newMatches);
    }
  }

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

  function handleCheckAnswers() {
    if (Object.keys(matches).length < game.pairs.length) {
      alert(`${t.matchAll} (${Object.keys(matches).length}/${game.pairs.length})`);
      return;
    }
    validateMatches(matches);
  }

  function handlePlayAgain() {
    setMatches({});
    setScore(null);
    setDraggedItem(null);
    const currentTopic = router.query.topic || 'addition';
    const currentLanguage = router.query.language || 'en';
    router.push(`/exercise?topic=${currentTopic}&language=${currentLanguage}`);
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-white">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl font-bold text-white mb-6">{error || t.gameNotFound}</p>
          <Link href="/">
            <button className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-lg hover:bg-yellow-500 transition-all">
              {t.goHome}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (score) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-yellow-400 mb-4">{t.awesome}</h2>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
            <p className="text-xl font-bold mb-4">
              {t.youGot} <span className="text-3xl">{score.correct}</span> {t.outOf}{' '}
              <span className="text-3xl">{score.total}</span> {t.correct}
            </p>
            <div className="text-6xl font-bold mb-4">{score.percentage}%</div>
            {score.percentage === 100 && <p className="text-lg">{t.perfect}</p>}
            {score.percentage >= 80 && score.percentage < 100 && (
              <p className="text-lg">{t.great}</p>
            )}
            {score.percentage < 80 && <p className="text-lg">{t.goodTry}</p>}
          </div>

          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl text-lg hover:bg-yellow-500 transition-all flex-1"
            >
              {t.playAgain}
            </button>
            <Link href="/" className="flex-1">
              <button className="w-full px-8 py-4 bg-white text-blue-900 font-bold rounded-xl text-lg hover:bg-gray-100 transition-all">
                {t.home}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 mt-6">
          <h1 className="text-5xl font-bold text-yellow-400 mb-3 drop-shadow-lg">
            {game.theme}
          </h1>
          <p className="text-xl text-gray-300">{game.instructions}</p>
        </div>

        {/* VIDEO SECTION - LANGUAGE AWARE */}
        {game.video && game.video.success && (
          <div className="mb-8 bg-slate-800 rounded-xl p-6 border-2 border-yellow-400">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">🎬 Learn More</h2>
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${game.video.videoId}`}
                title={game.video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <p className="text-gray-300 text-center">{game.video.title}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">{t.dragFrom}</h3>
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

          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">{t.dropHere}</h3>
            <div className="space-y-3">
              {game.rightItems.map((rightItem) => {
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
            {t.checkAnswers} ({Object.keys(matches).length}/{game.pairs.length})
          </button>
        </div>

        <div className="text-center text-gray-400 text-sm">
          <p>{t.theme}: {game.theme}</p>
          <p>{t.topic}: {game.topic}</p>
        </div>
      </div>
    </div>
  );
}