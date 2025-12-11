export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, language = 'en', difficulty = 'auto', problems = '' } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Analyze difficulty from problems if provided
    const analyzedDifficulty = difficulty === 'auto' 
      ? analyzeDifficulty(topic, problems)
      : difficulty;

    const game = generateArcadeGame(topic, language, analyzedDifficulty, problems);
    
    const rightItems = game.pairs.map(p => p.right).sort(() => Math.random() - 0.5);

    res.status(200).json({
      theme: game.theme,
      topic: topic,
      difficulty: analyzedDifficulty,
      pairs: game.pairs.map((p, idx) => ({
        left: p.left,
        leftId: `item_${idx}`
      })),
      rightItems: rightItems.map((item, idx) => ({
        text: item,
        id: idx
      })),
      instructions: game.instructions,
      shuffleRightSide: true
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate game' });
  }
}

// ============================================
// DIFFICULTY ANALYZER
// ============================================

function analyzeDifficulty(topic, problems) {
  if (!problems) return 'intermediate';

  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('math') || topicLower.match(/[0-9+\-×÷]/)) {
    return analyzeMathDifficulty(problems);
  } else if (topicLower.includes('vocab') || topicLower.includes('word')) {
    return analyzeVocabDifficulty(problems);
  } else if (topicLower.includes('read') || topicLower.includes('comprehension')) {
    return analyzeReadingDifficulty(problems);
  } else if (topicLower.includes('science')) {
    return analyzeScienceDifficulty(problems);
  } else if (topicLower.includes('grammar')) {
    return analyzeGrammarDifficulty(problems);
  } else if (topicLower.includes('geo') || topicLower.includes('capital')) {
    return analyzeGeographyDifficulty(problems);
  }
  
  return 'intermediate';
}

function analyzeMathDifficulty(problems) {
  if (!problems) return 'intermediate';
  
  const problemStr = String(problems).split(/[\n,]/)[0];
  const digits = (problemStr.match(/\d/g) || []).length;
  const maxNum = Math.max(...(problemStr.match(/\d+/g) || [0]).map(Number));
  
  if (maxNum < 10) return 'easy';
  if (maxNum < 100) return 'intermediate';
  if (maxNum < 1000) return 'advanced';
  return 'expert';
}

function analyzeVocabDifficulty(problems) {
  if (!problems) return 'intermediate';
  
  const words = String(problems).split(/[\s,\n]+/).filter(w => w.length > 0);
  const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  if (avgLength < 5) return 'easy';
  if (avgLength < 8) return 'intermediate';
  if (avgLength < 12) return 'advanced';
  return 'expert';
}

function analyzeReadingDifficulty(problems) {
  if (!problems) return 'intermediate';
  
  const text = String(problems);
  const sentences = (text.match(/[.!?]/g) || []).length;
  const words = text.split(/\s+/).length;
  const avgSentenceLength = words / (sentences || 1);
  
  if (avgSentenceLength < 8) return 'easy';
  if (avgSentenceLength < 15) return 'intermediate';
  if (avgSentenceLength < 25) return 'advanced';
  return 'expert';
}

function analyzeScienceDifficulty(problems) {
  if (!problems) return 'intermediate';
  
  const text = String(problems).toLowerCase();
  const complexity = text.length;
  
  if (complexity < 30) return 'easy';
  if (complexity < 100) return 'intermediate';
  if (complexity < 300) return 'advanced';
  return 'expert';
}

function analyzeGrammarDifficulty(problems) {
  if (!problems) return 'intermediate';
  
  const text = String(problems);
  const hasComplexSyntax = /;|:/.test(text);
  const hasPerfectTense = /has|have|had/.test(text.toLowerCase());
  
  if (hasComplexSyntax || hasPerfectTense) return 'advanced';
  if (/is|are|am|was|were/.test(text.toLowerCase())) return 'intermediate';
  return 'easy';
}

function analyzeGeographyDifficulty(problems) {
  // Geography difficulty is usually consistent
  return 'intermediate';
}

// ============================================
// GAME GENERATOR
// ============================================

function generateArcadeGame(topic, language, difficulty, problems) {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('math') || topicLower.match(/[0-9+\-×÷]/)) {
    return generateMathGame(language, difficulty, problems);
  } else if (topicLower.includes('vocab') || topicLower.includes('word')) {
    return generateVocabularyGame(language, difficulty, problems);
  } else if (topicLower.includes('read') || topicLower.includes('comprehension')) {
    return generateReadingGame(language, difficulty, problems);
  } else if (topicLower.includes('science')) {
    return generateScienceGame(language, difficulty, problems);
  } else if (topicLower.includes('grammar')) {
    return generateGrammarGame(language, difficulty, problems);
  } else if (topicLower.includes('geo') || topicLower.includes('capital')) {
    return generateGeographyGame(language, difficulty, problems);
  }
  
  return getDefaultGame(language);
}

// ============================================
// MATH GAMES - DYNAMIC DIFFICULTY
// ============================================

function generateMathGame(language, difficulty, problems) {
  const mathDifficulty = difficulty || analyzeMathDifficulty(problems);
  
  const themes = {
    en: '🚀 MATH BLASTER',
    es: '🚀 BLASTER MATEMÁTICO',
    fr: '🚀 BLASTER MATH',
    de: '🚀 MATHE-BLASTER',
    ar: '🚀 كاسر الرياضيات'
  };

  const instructions = {
    en: 'Match the problems to their answers!',
    es: '¡Combina los problemas con sus respuestas!',
    fr: 'Associez les problèmes à leurs réponses!',
    de: 'Ordnen Sie die Probleme ihren Antworten zu!',
    ar: '!طابق المشاكل بإجاباتها'
  };

  let pairs = [];

  if (mathDifficulty === 'easy') {
    pairs = [
      { left: '2 + 3', right: '5' },
      { left: '4 + 1', right: '5' },
      { left: '3 + 2', right: '5' },
      { left: '1 + 4', right: '5' },
      { left: '2 + 2', right: '4' },
      { left: '3 + 1', right: '4' }
    ];
  } else if (mathDifficulty === 'intermediate') {
    pairs = [
      { left: '12 + 15', right: '27' },
      { left: '24 + 13', right: '37' },
      { left: '18 + 22', right: '40' },
      { left: '31 + 19', right: '50' },
      { left: '26 + 14', right: '40' },
      { left: '33 + 17', right: '50' }
    ];
  } else if (mathDifficulty === 'advanced') {
    pairs = [
      { left: '147 + 65', right: '212' },
      { left: '284 + 118', right: '402' },
      { left: '356 + 179', right: '535' },
      { left: '423 + 267', right: '690' },
      { left: '518 + 182', right: '700' },
      { left: '645 + 138', right: '783' }
    ];
  } else {
    pairs = [
      { left: '1247 + 853', right: '2100' },
      { left: '2584 + 1416', right: '4000' },
      { left: '3672 + 2128', right: '5800' },
      { left: '4891 + 3209', right: '8100' },
      { left: '5234 + 2766', right: '8000' },
      { left: '6145 + 2855', right: '9000' }
    ];
  }

  return {
    theme: themes[language] || themes['en'],
    instructions: instructions[language] || instructions['en'],
    pairs: pairs
  };
}

// ============================================
// VOCABULARY GAMES - DYNAMIC DIFFICULTY
// ============================================

function generateVocabularyGame(language, difficulty, problems) {
  const vocabDifficulty = difficulty || analyzeVocabDifficulty(problems);

  const themes = {
    en: '🦝 WORD MASTER',
    es: '🦝 MAESTRO DE PALABRAS',
    fr: '🦝 MAÎTRE DES MOTS',
    ar: '🦝 معلم الكلمات'
  };

  const instructions = {
    en: 'Match words to their meanings!',
    es: '¡Combina palabras con sus significados!',
    fr: 'Associez les mots à leurs sens!',
    ar: '!طابق الكلمات بمعانيها'
  };

  let pairs = [];

  if (vocabDifficulty === 'easy') {
    pairs = [
      { left: 'happy', right: 'joyful' },
      { left: 'big', right: 'large' },
      { left: 'fast', right: 'quick' },
      { left: 'cold', right: 'freezing' },
      { left: 'loud', right: 'noisy' },
      { left: 'small', right: 'tiny' }
    ];
  } else if (vocabDifficulty === 'intermediate') {
    pairs = [
      { left: 'benevolent', right: 'kind and generous' },
      { left: 'meticulous', right: 'very careful' },
      { left: 'eloquent', right: 'fluent speaker' },
      { left: 'pragmatic', right: 'practical approach' },
      { left: 'ambiguous', right: 'unclear meaning' },
      { left: 'tenacious', right: 'persistent' }
    ];
  } else if (vocabDifficulty === 'advanced') {
    pairs = [
      { left: 'ephemeral', right: 'lasting briefly' },
      { left: 'ubiquitous', right: 'everywhere present' },
      { left: 'perspicacious', right: 'keen insight' },
      { left: 'sanguine', right: 'optimistic' },
      { left: 'obfuscate', right: 'make unclear' },
      { left: 'serendipity', right: 'fortunate accident' }
    ];
  } else {
    pairs = [
      { left: 'sesquipedalian', right: 'lengthy word' },
      { left: 'petrichor', right: 'rain smell' },
      { left: 'onomatopoeia', right: 'sound imitation' },
      { left: 'defenestration', right: 'window throwing' },
      { left: 'gobbledygook', right: 'confusing language' },
      { left: 'lollygag', right: 'waste time' }
    ];
  }

  return {
    theme: themes[language] || themes['en'],
    instructions: instructions[language] || instructions['en'],
    pairs: pairs
  };
}

// ============================================
// READING COMPREHENSION GAMES
// ============================================

function generateReadingGame(language, difficulty, problems) {
  const readingDifficulty = difficulty || analyzeReadingDifficulty(problems);

  const themes = {
    en: '📚 READING QUEST',
    es: '📚 BÚSQUEDA DE LECTURA',
    fr: '📚 QUÊTE DE LECTURE',
    ar: '📚 مغامرة القراءة'
  };

  const instructions = {
    en: 'Match passages to their meanings!',
    es: '¡Combina pasajes con sus significados!',
    fr: 'Associez les passages à leurs sens!',
    ar: '!طابق النصوص بمعانيها'
  };

  let pairs = [];

  if (readingDifficulty === 'easy') {
    pairs = [
      { left: 'The cat sat on the mat', right: 'Cat is sitting' },
      { left: 'It is raining outside', right: 'Wet weather' },
      { left: 'She likes to play', right: 'Enjoys playing' },
      { left: 'The sun is bright', right: 'Sunny day' },
      { left: 'Dogs are fun', right: 'Puppies are happy' },
      { left: 'I like ice cream', right: 'Likes dessert' }
    ];
  } else if (readingDifficulty === 'intermediate') {
    pairs = [
      { left: 'The protagonist embarked on a grand adventure', right: 'Hero starts journey' },
      { left: 'Despite the obstacles, she persevered', right: 'Continued despite difficulty' },
      { left: 'The atmosphere was tense and foreboding', right: 'Scary mood' },
      { left: 'He contemplated the mysterious artifact', right: 'Thought about strange object' },
      { left: 'The revelation shocked everyone', right: 'Unexpected discovery' },
      { left: 'Time seemed to stand still', right: 'Moment felt long' }
    ];
  } else {
    pairs = [
      { left: 'The author employs metaphorical language to convey existential dread', right: 'Uses symbols for fear' },
      { left: 'The narrative demonstrates an intricate examination of moral ambiguity', right: 'Complex ethics shown' },
      { left: 'Beneath the surface lies a profound commentary on societal constructs', right: 'Deep social critique' },
      { left: 'The denouement subverts conventional narrative expectations', right: 'Ending surprises reader' },
      { left: 'Juxtaposition of contrasting imagery creates thematic resonance', right: 'Opposites reinforce meaning' },
      { left: 'The protagonist\s internal conflict epitomizes the fundamental human struggle', right: 'Character\s inner turmoil universal' }
    ];
  }

  return {
    theme: themes[language] || themes['en'],
    instructions: instructions[language] || instructions['en'],
    pairs: pairs
  };
}

// ============================================
// SCIENCE GAMES
// ============================================

function generateScienceGame(language, difficulty, problems) {
  const scienceDifficulty = difficulty || analyzeScienceDifficulty(problems);

  const themes = {
    en: '🔬 SCIENCE LAB',
    es: '🔬 LABORATORIO CIENTÍFICO',
    fr: '🔬 LAB SCIENCE',
    ar: '🔬 مختبر العلوم'
  };

  const instructions = {
    en: 'Match science terms to definitions!',
    es: '¡Combina términos científicos con definiciones!',
    fr: 'Associez les termes scientifiques aux définitions!',
    ar: '!طابق المصطلحات العلمية بالتعاريف'
  };

  let pairs = [];

  if (scienceDifficulty === 'easy') {
    pairs = [
      { left: 'Sun', right: 'Star in sky' },
      { left: 'Tree', right: 'Has leaves' },
      { left: 'Water', right: 'Liquid H2O' },
      { left: 'Animal', right: 'Living creature' },
      { left: 'Plant', right: 'Grows from seed' },
      { left: 'Rock', right: 'Stone on ground' }
    ];
  } else if (scienceDifficulty === 'intermediate') {
    pairs = [
      { left: 'Photosynthesis', right: 'Plants make food' },
      { left: 'Mitochondria', right: 'Cell powerhouse' },
      { left: 'Gravity', right: 'Pulls objects down' },
      { left: 'Ecosystem', right: 'Living community' },
      { left: 'Molecule', right: 'Atoms bonded' },
      { left: 'Climate', right: 'Long-term weather' }
    ];
  } else {
    pairs = [
      { left: 'Osmosis', right: 'Water membrane movement' },
      { left: 'Thermodynamics', right: 'Heat energy laws' },
      { left: 'Catalysis', right: 'Reaction acceleration' },
      { left: 'Homeostasis', right: 'Internal balance' },
      { left: 'Entropy', right: 'Disorder increase' },
      { left: 'Quantum entanglement', right: 'Particle connection' }
    ];
  }

  return {
    theme: themes[language] || themes['en'],
    instructions: instructions[language] || instructions['en'],
    pairs: pairs
  };
}

// ============================================
// GRAMMAR GAMES
// ============================================

function generateGrammarGame(language, difficulty, problems) {
  const grammarDifficulty = difficulty || analyzeGrammarDifficulty(problems);

  const themes = {
    en: '✏️ GRAMMAR MASTER',
    es: '✏️ MAESTRO DE GRAMÁTICA',
    fr: '✏️ MAÎTRE DE GRAMMAIRE',
    ar: '✏️ معلم القواعد'
  };

  const instructions = {
    en: 'Match incorrect to correct!',
    es: '¡Combina incorrecto con correcto!',
    fr: 'Associez l\'incorrect au correct!',
    ar: '!طابق الخطأ بالصحيح'
  };

  let pairs = [];

  if (grammarDifficulty === 'easy') {
    pairs = [
      { left: 'She go', right: 'She goes' },
      { left: 'I is', right: 'I am' },
      { left: 'They was', right: 'They were' },
      { left: 'He have', right: 'He has' },
      { left: 'You is', right: 'You are' },
      { left: 'It are', right: 'It is' }
    ];
  } else if (grammarDifficulty === 'intermediate') {
    pairs = [
      { left: 'She don\'t like it', right: 'She doesn\'t like it' },
      { left: 'He were running', right: 'He was running' },
      { left: 'They has gone', right: 'They have gone' },
      { left: 'I seen it', right: 'I saw it' },
      { left: 'She go yesterday', right: 'She went yesterday' },
      { left: 'We has finished', right: 'We have finished' }
    ];
  } else {
    pairs = [
      { left: 'If I was you', right: 'If I were you' },
      { left: 'He should of gone', right: 'He should have gone' },
      { left: 'Between you and I', right: 'Between you and me' },
      { left: 'Whom is calling?', right: 'Who is calling?' },
      { left: 'Its a beautiful day', right: 'It\'s a beautiful day' },
      { left: 'The data are complete', right: 'The data is complete' }
    ];
  }

  return {
    theme: themes[language] || themes['en'],
    instructions: instructions[language] || instructions['en'],
    pairs: pairs
  };
}

// ============================================
// GEOGRAPHY GAMES
// ============================================

function generateGeographyGame(language, difficulty, problems) {
  const themes = {
    en: '🗺️ WORLD EXPLORER',
    es: '🗺️ EXPLORADOR MUNDIAL',
    fr: '🗺️ EXPLORATEUR MONDIAL',
    ar: '🗺️ مستكشف العالم'
  };

  const instructions = {
    en: 'Match countries to capitals!',
    es: '¡Combina países con capitales!',
    fr: 'Associez les pays aux capitales!',
    ar: '!طابق الدول بالعواصم'
  };

  const pairs = [
    { left: '🇫🇷 France', right: 'Paris 🗼' },
    { left: '🇪🇸 Spain', right: 'Madrid 🎭' },
    { left: '🇯🇵 Japan', right: 'Tokyo 🎌' },
    { left: '🇧🇷 Brazil', right: 'Brasília ⚽' },
    { left: '🇲🇽 Mexico', right: 'Mexico City 🌮' },
    { left: '🇮🇹 Italy', right: 'Rome 🍝' }
  ];

  return {
    theme: themes[language] || themes['en'],
    instructions: instructions[language] || instructions['en'],
    pairs: pairs
  };
}

// ============================================
// DEFAULT GAME
// ============================================

function getDefaultGame(language) {
  const games = {
    en: {
      theme: '🎮 WORD WARRIOR',
      instructions: 'Get ready! Connect left to right!',
      pairs: [
        { left: '🎮 PLAY', right: 'Fun! 🎉' },
        { left: '🎮 LEARN', right: 'Smart! 🧠' },
        { left: '🎮 WIN', right: 'Champion! 👑' },
        { left: '🎮 TRY', right: 'Awesome! ⭐' }
      ]
    },
    es: {
      theme: '🎮 GUERRERO DE PALABRAS',
      instructions: '¡Listo! ¡Conecta izquierda a derecha!',
      pairs: [
        { left: '🎮 JUGAR', right: '¡Diversión! 🎉' },
        { left: '🎮 APRENDER', right: '¡Inteligente! 🧠' }
      ]
    }
  };
  return games[language] || games['en'];
}