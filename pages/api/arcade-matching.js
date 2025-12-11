export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic = 'addition', language = 'en', difficulty = 'medium' } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const game = generateArcadeGame(topic, language, difficulty);
    
    const rightItems = game.pairs.map(p => p.right).sort(() => Math.random() - 0.5);

    res.status(200).json({
      theme: game.theme,
      topic: topic,
      difficulty: difficulty,
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
// THEME MAPPING BY TOPIC
// ============================================

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

// ============================================
// MAIN GAME GENERATOR
// ============================================

function generateArcadeGame(topic, language, difficulty) {
  const topicLower = topic.toLowerCase();
  
  // Get theme for this topic + difficulty
  const themeData = getTheme(topicLower, difficulty, language);
  
  // Generate pairs based on topic + difficulty
  let pairs = [];
  
  if (topicLower === 'addition') {
    pairs = generateAdditionPairs(difficulty);
  } else if (topicLower === 'subtraction') {
    pairs = generateSubtractionPairs(difficulty);
  } else if (topicLower === 'multiplication') {
    pairs = generateMultiplicationPairs(difficulty);
  } else if (topicLower === 'division') {
    pairs = generateDivisionPairs(difficulty);
  } else if (topicLower === 'vocabulary') {
    pairs = generateVocabularyPairs(difficulty);
  } else if (topicLower === 'synonym') {
    pairs = generateSynonymPairs(difficulty);
  } else if (topicLower === 'antonym') {
    pairs = generateAntonymPairs(difficulty);
  } else if (topicLower === 'animal') {
    pairs = generateAnimalPairs(difficulty);
  } else if (topicLower === 'color') {
    pairs = generateColorPairs(difficulty);
  } else if (topicLower === 'body') {
    pairs = generateBodyParts(difficulty);
  } else if (topicLower === 'geography' || topicLower === 'capital') {
    pairs = generateCapitalPairs(difficulty);
  } else if (topicLower === 'reading') {
    pairs = generateReadingPairs(difficulty);
  } else {
    pairs = generateDefaultPairs(difficulty);
  }

  return {
    theme: themeData.theme,
    instructions: themeData.instruction,
    pairs: pairs
  };
}

// ============================================
// THEME GETTER
// ============================================

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

// ============================================
// ADDITION - ALWAYS MATH THEME
// ============================================

function generateAdditionPairs(difficulty) {
  if (difficulty === 'easy') {
    return [
      { left: '2 + 3', right: '5' },
      { left: '4 + 1', right: '5' },
      { left: '3 + 2', right: '5' },
      { left: '1 + 4', right: '5' },
      { left: '2 + 2', right: '4' },
      { left: '3 + 1', right: '4' }
    ];
  } else if (difficulty === 'hard') {
    return [
      { left: '147 + 65', right: '212' },
      { left: '284 + 118', right: '402' },
      { left: '356 + 179', right: '535' },
      { left: '423 + 267', right: '690' },
      { left: '518 + 182', right: '700' },
      { left: '645 + 138', right: '783' }
    ];
  } else {
    // medium
    return [
      { left: '12 + 15', right: '27' },
      { left: '24 + 13', right: '37' },
      { left: '18 + 22', right: '40' },
      { left: '31 + 19', right: '50' },
      { left: '26 + 14', right: '40' },
      { left: '33 + 17', right: '50' }
    ];
  }
}

// ============================================
// SUBTRACTION - ALWAYS MATH THEME
// ============================================

function generateSubtractionPairs(difficulty) {
  if (difficulty === 'easy') {
    return [
      { left: '5 - 2', right: '3' },
      { left: '6 - 3', right: '3' },
      { left: '4 - 1', right: '3' },
      { left: '7 - 2', right: '5' },
      { left: '8 - 3', right: '5' },
      { left: '5 - 1', right: '4' }
    ];
  } else if (difficulty === 'hard') {
    return [
      { left: '347 - 125', right: '222' },
      { left: '543 - 218', right: '325' },
      { left: '762 - 349', right: '413' },
      { left: '891 - 276', right: '615' },
      { left: '654 - 327', right: '327' },
      { left: '745 - 238', right: '507' }
    ];
  } else {
    // medium
    return [
      { left: '25 - 12', right: '13' },
      { left: '37 - 15', right: '22' },
      { left: '48 - 23', right: '25' },
      { left: '56 - 24', right: '32' },
      { left: '63 - 31', right: '32' },
      { left: '42 - 18', right: '24' }
    ];
  }
}

// ============================================
// MULTIPLICATION - ALWAYS MATH THEME
// ============================================

function generateMultiplicationPairs(difficulty) {
  if (difficulty === 'easy') {
    return [
      { left: '2 × 3', right: '6' },
      { left: '4 × 2', right: '8' },
      { left: '3 × 3', right: '9' },
      { left: '5 × 2', right: '10' },
      { left: '2 × 4', right: '8' },
      { left: '3 × 2', right: '6' }
    ];
  } else if (difficulty === 'hard') {
    return [
      { left: '24 × 15', right: '360' },
      { left: '32 × 18', right: '576' },
      { left: '27 × 14', right: '378' },
      { left: '41 × 23', right: '943' },
      { left: '35 × 19', right: '665' },
      { left: '29 × 16', right: '464' }
    ];
  } else {
    // medium
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

// ============================================
// DIVISION - ALWAYS MATH THEME
// ============================================

function generateDivisionPairs(difficulty) {
  if (difficulty === 'easy') {
    return [
      { left: '6 ÷ 2', right: '3' },
      { left: '8 ÷ 2', right: '4' },
      { left: '9 ÷ 3', right: '3' },
      { left: '10 ÷ 2', right: '5' },
      { left: '12 ÷ 3', right: '4' },
      { left: '15 ÷ 3', right: '5' }
    ];
  } else if (difficulty === 'hard') {
    return [
      { left: '360 ÷ 15', right: '24' },
      { left: '576 ÷ 18', right: '32' },
      { left: '378 ÷ 14', right: '27' },
      { left: '943 ÷ 23', right: '41' },
      { left: '665 ÷ 19', right: '35' },
      { left: '464 ÷ 16', right: '29' }
    ];
  } else {
    // medium
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

// ============================================
// VOCABULARY - NON-MATH THEME
// ============================================

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
    // medium
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

// ============================================
// SYNONYM - NON-MATH THEME
// ============================================

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

// ============================================
// ANTONYM - NON-MATH THEME
// ============================================

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

// ============================================
// ANIMAL - NON-MATH THEME
// ============================================

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

// ============================================
// COLOR - NON-MATH THEME
// ============================================

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

// ============================================
// BODY PARTS - NON-MATH THEME
// ============================================

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

// ============================================
// GEOGRAPHY/CAPITALS - NON-MATH THEME
// ============================================

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

// ============================================
// READING - NON-MATH THEME
// ============================================

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

// ============================================
// DEFAULT - NON-MATH THEME
// ============================================

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