export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic = 'addition', language = 'en', difficulty = 'auto', math_level = null, level = '2', problems = '' } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // ============================================
    // CONVERT math_level TO difficulty
    // ============================================
    let finalDifficulty;

    if (math_level) {
      // math_level takes priority: early/basic/normal/advanced
      console.log(`📊 Using detected math_level: ${math_level}`);
      if (math_level === 'early' || math_level === 'basic') {
        finalDifficulty = 'easy';
      } else if (math_level === 'normal') {
        finalDifficulty = 'medium';
      } else if (math_level === 'advanced') {
        finalDifficulty = 'hard';
      } else {
        finalDifficulty = 'medium'; // fallback
      }
    } else if (difficulty && difficulty !== 'auto') {
      // Explicit difficulty parameter
      finalDifficulty = difficulty;
    } else {
      // Auto-detect from problems
      finalDifficulty = detectDifficulty(problems, topic);
    }

    console.log(`🎮 Final difficulty for generation: ${finalDifficulty}`);

    const game = generateArcadeGame(topic, language, finalDifficulty);
    
    const rightItems = game.pairs.map(p => p.right).sort(() => Math.random() - 0.5);

    // FETCH VIDEO WITH LANGUAGE
    let videoData = null;
    try {
      const videoRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/video?topic=${encodeURIComponent(topic)}&language=${language}`
      );
      if (videoRes.ok) {
        videoData = await videoRes.json();
      }
    } catch (videoErr) {
      console.log('Video fetch optional, continuing without it');
    }

    res.status(200).json({
      theme: game.theme,
      topic: topic,
      difficulty: finalDifficulty,
      language: language,
      pairs: game.pairs.map((p, idx) => ({
        left: p.left,
        leftId: `item_${idx}`
      })),
      rightItems: rightItems.map((item, idx) => ({
        text: item,
        id: idx
      })),
      instructions: game.instructions,
      shuffleRightSide: true,
      video: videoData || null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate game' });
  }
}

function detectDifficulty(problems, topic) {
  if (!problems) return 'medium';
  const problemStr = String(problems);
  const numbers = problemStr.match(/\d+/g) || [];
  const has3Digit = numbers.some(num => num.length === 3);
  if (has3Digit) return 'hard';
  const has2Digit = numbers.some(num => num.length === 2);
  if (has2Digit) return 'medium';
  return 'easy';
}

const THEME_MAP = {
  math: [
    { difficulty: 'easy', theme: '🚀 MATH BLASTER', en: 'Match the problems!', es: '¡Combina los problemas!' },
    { difficulty: 'medium', theme: '🎮 NINJA NUMBERS', en: 'Slice through the math!', es: '¡Corta la matemática!' },
    { difficulty: 'hard', theme: '🌌 SPACE RANGER', en: 'Split the asteroids!', es: '¡Divide los asteroides!' }
  ],
  addition: [
    { difficulty: 'easy', theme: '🚀 MATH BLASTER', en: 'Match the problems!', es: '¡Combina los problemas!' },
    { difficulty: 'medium', theme: '🚀 MATH BLASTER', en: 'Match the problems!', es: '¡Combina los problemas!' },
    { difficulty: 'hard', theme: '🚀 MATH BLASTER', en: 'Match the problems!', es: '¡Combina los problemas!' }
  ],
  subtraction: [
    { difficulty: 'easy', theme: '🏴‍☠️ PIRATE MATH', en: 'Find the treasure!', es: '¡Encuentra el tesoro!' },
    { difficulty: 'medium', theme: '🏴‍☠️ PIRATE MATH', en: 'Find the treasure!', es: '¡Encuentra el tesoro!' },
    { difficulty: 'hard', theme: '🏴‍☠️ PIRATE MATH', en: 'Find the treasure!', es: '¡Encuentra el tesoro!' }
  ],
  multiplication: [
    { difficulty: 'easy', theme: '🎮 NINJA NUMBERS', en: 'Slice through!', es: '¡Corta!' },
    { difficulty: 'medium', theme: '🎮 NINJA NUMBERS', en: 'Slice through!', es: '¡Corta!' },
    { difficulty: 'hard', theme: '🎮 NINJA NUMBERS', en: 'Slice through!', es: '¡Corta!' }
  ],
  division: [
    { difficulty: 'easy', theme: '🌌 SPACE RANGER', en: 'Split asteroids!', es: '¡Divide asteroides!' },
    { difficulty: 'medium', theme: '🌌 SPACE RANGER', en: 'Split asteroids!', es: '¡Divide asteroides!' },
    { difficulty: 'hard', theme: '🌌 SPACE RANGER', en: 'Split asteroids!', es: '¡Divide asteroides!' }
  ],
  vocabulary: [
    { difficulty: 'easy', theme: '🦝 RACCOON WORDS', en: 'Match words!', es: '¡Combina palabras!' },
    { difficulty: 'medium', theme: '🦝 RACCOON WORDS', en: 'Match words!', es: '¡Combina palabras!' },
    { difficulty: 'hard', theme: '🦝 RACCOON WORDS', en: 'Match words!', es: '¡Combina palabras!' }
  ],
  synonym: [
    { difficulty: 'easy', theme: '✨ MAGIC TWINS', en: 'Find word twins!', es: '¡Encuentra gemelos!' },
    { difficulty: 'medium', theme: '✨ MAGIC TWINS', en: 'Find word twins!', es: '¡Encuentra gemelos!' },
    { difficulty: 'hard', theme: '✨ MAGIC TWINS', en: 'Find word twins!', es: '¡Encuentra gemelos!' }
  ],
  antonym: [
    { difficulty: 'easy', theme: '⚖️ OPPOSITE WORLD', en: 'Find opposites!', es: '¡Encuentra opuestos!' },
    { difficulty: 'medium', theme: '⚖️ OPPOSITE WORLD', en: 'Find opposites!', es: '¡Encuentra opuestos!' },
    { difficulty: 'hard', theme: '⚖️ OPPOSITE WORLD', en: 'Find opposites!', es: '¡Encuentra opuestos!' }
  ],
  animal: [
    { difficulty: 'easy', theme: '🦁 WILD KINGDOM', en: 'Know the animals?', es: '¿Conoces los animales?' },
    { difficulty: 'medium', theme: '🦁 WILD KINGDOM', en: 'Know the animals?', es: '¿Conoces los animales?' },
    { difficulty: 'hard', theme: '🦁 WILD KINGDOM', en: 'Know the animals?', es: '¿Conoces los animales?' }
  ],
  color: [
    { difficulty: 'easy', theme: '🎨 RAINBOW BLAST', en: 'Paint the world!', es: '¡Pinta el mundo!' },
    { difficulty: 'medium', theme: '🎨 RAINBOW BLAST', en: 'Paint the world!', es: '¡Pinta el mundo!' },
    { difficulty: 'hard', theme: '🎨 RAINBOW BLAST', en: 'Paint the world!', es: '¡Pinta el mundo!' }
  ],
  body: [
    { difficulty: 'easy', theme: '💪 SUPERHERO BODY', en: 'Build a hero!', es: '¡Construye un héroe!' },
    { difficulty: 'medium', theme: '💪 SUPERHERO BODY', en: 'Build a hero!', es: '¡Construye un héroe!' },
    { difficulty: 'hard', theme: '💪 SUPERHERO BODY', en: 'Build a hero!', es: '¡Construye un héroe!' }
  ],
  geography: [
    { difficulty: 'easy', theme: '🗺️ WORLD EXPLORER', en: 'Explore!', es: '¡Explora!' },
    { difficulty: 'medium', theme: '🗺️ WORLD EXPLORER', en: 'Explore!', es: '¡Explora!' },
    { difficulty: 'hard', theme: '🗺️ WORLD EXPLORER', en: 'Explore!', es: '¡Explora!' }
  ],
  reading: [
    { difficulty: 'easy', theme: '📚 READING QUEST', en: 'Read and match!', es: '¡Lee y combina!' },
    { difficulty: 'medium', theme: '📚 READING QUEST', en: 'Read and match!', es: '¡Lee y combina!' },
    { difficulty: 'hard', theme: '📚 READING QUEST', en: 'Read and match!', es: '¡Lee y combina!' }
  ]
};

function generateArcadeGame(topic, language, difficulty) {
  const topicLower = topic.toLowerCase();
  const themeData = getTheme(topicLower, difficulty, language);
  let pairs = [];
  
  if (topicLower === 'addition') pairs = generateAdditionPairs(difficulty);
  else if (topicLower === 'subtraction') pairs = generateSubtractionPairs(difficulty);
  else if (topicLower === 'multiplication') pairs = generateMultiplicationPairs(difficulty);
  else if (topicLower === 'division') pairs = generateDivisionPairs(difficulty);
  else if (topicLower === 'vocabulary') pairs = generateVocabularyPairs(difficulty);
  else if (topicLower === 'synonym') pairs = generateSynonymPairs(difficulty);
  else if (topicLower === 'antonym') pairs = generateAntonymPairs(difficulty);
  else if (topicLower === 'animal') pairs = generateAnimalPairs(difficulty);
  else if (topicLower === 'color') pairs = generateColorPairs(difficulty);
  else if (topicLower === 'body') pairs = generateBodyParts(difficulty);
  else if (topicLower === 'geography' || topicLower === 'capital') pairs = generateCapitalPairs(difficulty);
  else if (topicLower === 'reading') pairs = generateReadingPairs(difficulty);
  else pairs = generateDefaultPairs(difficulty);

  return {
    theme: themeData.theme,
    instructions: themeData.instruction,
    pairs: pairs
  };
}

function getTheme(topic, difficulty, language) {
  const themeList = THEME_MAP[topic] || THEME_MAP['vocabulary'];
  const diffLevel = difficulty === 'easy' ? 'easy' : difficulty === 'hard' ? 'hard' : 'medium';
  const themeData = themeList.find(t => t.difficulty === diffLevel) || themeList[1];
  const instruction = language === 'es' ? themeData.es : themeData.en;
  
  return {
    theme: themeData.theme,
    instruction: instruction
  };
}

function generateAdditionPairs(difficulty) {
  if (difficulty === 'hard') {
    return [
      { left: '472 + 159', right: '631' },
      { left: '385 + 247', right: '632' },
      { left: '516 + 284', right: '800' },
      { left: '623 + 178', right: '801' },
      { left: '745 + 256', right: '1001' },
      { left: '834 + 167', right: '1001' }
    ];
  } else if (difficulty === 'easy') {
    return [
      { left: '2 + 1', right: '3' },
      { left: '3 + 2', right: '5' },
      { left: '4 + 1', right: '5' },
      { left: '5 + 2', right: '7' },
      { left: '3 + 3', right: '6' },
      { left: '4 + 2', right: '6' }
    ];
  } else {
    return [
      { left: '12 + 13', right: '25' },
      { left: '15 + 14', right: '29' },
      { left: '20 + 15', right: '35' },
      { left: '25 + 16', right: '41' },
      { left: '30 + 20', right: '50' },
      { left: '24 + 13', right: '37' }
    ];
  }
}

function generateSubtractionPairs(difficulty) {
  if (difficulty === 'hard') {
    return [
      { left: '500 - 247', right: '253' },
      { left: '600 - 345', right: '255' },
      { left: '750 - 428', right: '322' },
      { left: '823 - 467', right: '356' },
      { left: '912 - 589', right: '323' },
      { left: '645 - 378', right: '267' }
    ];
  } else if (difficulty === 'easy') {
    return [
      { left: '5 - 2', right: '3' },
      { left: '6 - 3', right: '3' },
      { left: '7 - 2', right: '5' },
      { left: '8 - 3', right: '5' },
      { left: '10 - 5', right: '5' },
      { left: '9 - 4', right: '5' }
    ];
  } else {
    return [
      { left: '25 - 12', right: '13' },
      { left: '30 - 15', right: '15' },
      { left: '45 - 20', right: '25' },
      { left: '50 - 23', right: '27' },
      { left: '60 - 35', right: '25' },
      { left: '40 - 18', right: '22' }
    ];
  }
}

function generateMultiplicationPairs(difficulty) {
  if (difficulty === 'hard') {
    return [
      { left: '45 × 12', right: '540' },
      { left: '32 × 15', right: '480' },
      { left: '28 × 14', right: '392' },
      { left: '36 × 13', right: '468' },
      { left: '24 × 16', right: '384' },
      { left: '42 × 11', right: '462' }
    ];
  } else if (difficulty === 'easy') {
    return [
      { left: '2 × 2', right: '4' },
      { left: '3 × 3', right: '9' },
      { left: '5 × 2', right: '10' },
      { left: '2 × 4', right: '8' },
      { left: '3 × 2', right: '6' },
      { left: '4 × 2', right: '8' }
    ];
  } else {
    return [
      { left: '12 × 3', right: '36' },
      { left: '15 × 2', right: '30' },
      { left: '14 × 4', right: '56' },
      { left: '11 × 5', right: '55' },
      { left: '13 × 2', right: '26' },
      { left: '16 × 3', right: '48' }
    ];
  }
}

function generateDivisionPairs(difficulty) {
  if (difficulty === 'hard') {
    return [
      { left: '360 ÷ 15', right: '24' },
      { left: '576 ÷ 18', right: '32' },
      { left: '378 ÷ 14', right: '27' },
      { left: '943 ÷ 23', right: '41' },
      { left: '665 ÷ 19', right: '35' },
      { left: '464 ÷ 16', right: '29' }
    ];
  } else if (difficulty === 'easy') {
    return [
      { left: '6 ÷ 2', right: '3' },
      { left: '8 ÷ 2', right: '4' },
      { left: '9 ÷ 3', right: '3' },
      { left: '10 ÷ 2', right: '5' },
      { left: '12 ÷ 3', right: '4' },
      { left: '15 ÷ 3', right: '5' }
    ];
  } else {
    return [
      { left: '36 ÷ 3', right: '12' },
      { left: '30 ÷ 2', right: '15' },
      { left: '56 ÷ 4', right: '14' },
      { left: '55 ÷ 5', right: '11' },
      { left: '26 ÷ 2', right: '13' },
      { left: '48 ÷ 3', right: '16' }
    ];
  }
}

function generateVocabularyPairs(difficulty) {
  if (difficulty === 'easy') {
    return [
      { left: 'happy', right: 'joyful' },
      { left: 'big', right: 'large' },
      { left: 'fast', right: 'quick' },
      { left: 'cold', right: 'freezing' },
      { left: 'loud', right: 'noisy' },
      { left: 'small', right: 'tiny' }
    ];
  } else if (difficulty === 'hard') {
    return [
      { left: 'ephemeral', right: 'fleeting' },
      { left: 'ubiquitous', right: 'everywhere' },
      { left: 'perspicacious', right: 'keen insight' },
      { left: 'sanguine', right: 'optimistic' },
      { left: 'obfuscate', right: 'make unclear' },
      { left: 'serendipity', right: 'fortunate chance' }
    ];
  } else {
    return [
      { left: 'benevolent', right: 'kind' },
      { left: 'meticulous', right: 'careful' },
      { left: 'eloquent', right: 'articulate' },
      { left: 'pragmatic', right: 'practical' },
      { left: 'ambiguous', right: 'unclear' },
      { left: 'tenacious', right: 'persistent' }
    ];
  }
}

function generateSynonymPairs(difficulty) {
  return [
    { left: 'tiny', right: 'small' },
    { left: 'joy', right: 'happiness' },
    { left: 'furious', right: 'angry' },
    { left: 'chilly', right: 'cold' },
    { left: 'damp', right: 'wet' },
    { left: 'brilliant', right: 'smart' }
  ];
}

function generateAntonymPairs(difficulty) {
  return [
    { left: 'big', right: 'small' },
    { left: 'hot', right: 'cold' },
    { left: 'happy', right: 'sad' },
    { left: 'fast', right: 'slow' },
    { left: 'light', right: 'dark' },
    { left: 'good', right: 'bad' }
  ];
}

function generateAnimalPairs(difficulty) {
  return [
    { left: 'Dog', right: 'Barks' },
    { left: 'Cat', right: 'Meows' },
    { left: 'Fish', right: 'Swims' },
    { left: 'Bird', right: 'Flies' },
    { left: 'Lion', right: 'Roars' },
    { left: 'Kangaroo', right: 'Hops' }
  ];
}

function generateColorPairs(difficulty) {
  return [
    { left: '🔴 Red', right: 'Fire' },
    { left: '🔵 Blue', right: 'Sky' },
    { left: '🟡 Yellow', right: 'Sun' },
    { left: '🟢 Green', right: 'Grass' },
    { left: '⚫ Black', right: 'Night' },
    { left: '⚪ White', right: 'Snow' }
  ];
}

function generateBodyParts(difficulty) {
  return [
    { left: 'Head', right: 'Think' },
    { left: 'Eyes', right: 'See' },
    { left: 'Ears', right: 'Hear' },
    { left: 'Nose', right: 'Smell' },
    { left: 'Hands', right: 'Grab' },
    { left: 'Feet', right: 'Walk' }
  ];
}

function generateCapitalPairs(difficulty) {
  return [
    { left: 'France', right: 'Paris' },
    { left: 'Spain', right: 'Madrid' },
    { left: 'Japan', right: 'Tokyo' },
    { left: 'Brazil', right: 'Brasília' },
    { left: 'Mexico', right: 'Mexico City' },
    { left: 'Italy', right: 'Rome' }
  ];
}

function generateReadingPairs(difficulty) {
  if (difficulty === 'easy') {
    return [
      { left: 'The cat sat', right: 'Cat is sitting' },
      { left: 'It is raining', right: 'Wet weather' },
      { left: 'She likes to play', right: 'Enjoys playing' },
      { left: 'The sun is bright', right: 'Sunny day' },
      { left: 'Dogs are fun', right: 'Happy animals' },
      { left: 'I like ice cream', right: 'Likes dessert' }
    ];
  } else {
    return [
      { left: 'The protagonist embarked', right: 'Hero started journey' },
      { left: 'Despite obstacles, persevered', right: 'Continued despite difficulty' },
      { left: 'The atmosphere was tense', right: 'Scary mood' },
      { left: 'He contemplated', right: 'Thought deeply' },
      { left: 'The revelation shocked', right: 'Unexpected discovery' },
      { left: 'Time seemed to stand still', right: 'Moment felt long' }
    ];
  }
}

function generateDefaultPairs(difficulty) {
  return [
    { left: 'Play', right: 'Fun' },
    { left: 'Learn', right: 'Smart' },
    { left: 'Win', right: 'Champion' },
    { left: 'Try', right: 'Awesome' },
    { left: 'Success', right: 'Victory' },
    { left: 'Challenge', right: 'Goal' }
  ];
}