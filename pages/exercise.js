export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, problems, language = 'en' } = req.body;

  if (!subject || !problems || !Array.isArray(problems) || problems.length === 0) {
    return res.status(400).json({ error: 'Subject and problems array required' });
  }

  try {
    let exercise;

    switch (subject.toLowerCase()) {
      case 'math':
        exercise = generateMathExercises(problems, language);
        break;
      case 'vocabulary':
        exercise = generateVocabularyExercises(problems, language);
        break;
      case 'science':
        exercise = generateScienceExercises(problems, language);
        break;
      case 'grammar':
        exercise = generateGrammarExercises(problems, language);
        break;
      case 'geography':
        exercise = generateGeographyExercises(problems, language);
        break;
      default:
        return res.status(400).json({ error: 'Unknown subject' });
    }

    res.status(200).json(exercise);
  } catch (error) {
    console.error('Exercise generation error:', error);
    res.status(500).json({ error: 'Failed to generate exercises' });
  }
}

// ============================================
// MATH EXERCISES
// ============================================

function generateMathExercises(problems, language) {
  // Analyze first problem to detect difficulty
  const difficulty = analyzeMathDifficulty(problems[0]);
  
  // Generate 6 new problems at same difficulty
  const exercises = [];
  for (let i = 0; i < 6; i++) {
    exercises.push(generateMathProblem(difficulty));
  }

  const themes = {
    en: {
      'addition': '🚀 MATH BLASTER',
      'subtraction': '🏴‍☠️ PIRATE MATH',
      'multiplication': '🎮 NINJA NUMBERS',
      'division': '🌌 SPACE RANGER'
    },
    es: {
      'addition': '🚀 BLASTER MATEMÁTICO',
      'subtraction': '🏴‍☠️ MATEMÁTICA PIRATA',
      'multiplication': '🎮 NINJA NÚMEROS',
      'division': '🌌 RANGER ESPACIAL'
    }
  };

  const instructions = {
    en: 'Match the problems to their answers!',
    es: '¡Combina los problemas con sus respuestas!',
    fr: 'Associez les problèmes à leurs réponses!',
    de: 'Ordnen Sie die Probleme ihren Antworten zu!',
    ar: '!طابق المشاكل بإجاباتها'
  };

  return {
    theme: themes[language]?.[difficulty.operation] || '🚀 MATH CHALLENGE',
    topic: difficulty.operation,
    difficulty: difficulty.level,
    pairs: exercises.map((ex, idx) => ({
      left: `${ex.a} ${ex.op} ${ex.b}`,
      leftId: `math_${idx}`,
      right: ex.answer.toString()
    })),
    rightItems: shuffleArray(exercises.map(ex => ({ text: ex.answer.toString() }))).map((item, idx) => ({
      text: item.text,
      id: idx
    })),
    instructions: instructions[language] || instructions['en'],
    shuffleRightSide: true
  };
}

function analyzeMathDifficulty(problem) {
  // Detect operation
  let operation = '+';
  let operand = problem;

  if (problem.includes('×') || problem.includes('*')) {
    operation = 'multiplication';
    operand = problem.replace(/×|\*/g, '');
  } else if (problem.includes('÷') || problem.includes('/')) {
    operation = 'division';
    operand = problem.replace(/÷|\//g, '');
  } else if (problem.includes('−') || problem.includes('-')) {
    operation = 'subtraction';
    operand = problem.replace(/−|-/g, '');
  } else {
    operation = 'addition';
    operand = problem.replace(/\+/g, '');
  }

  // Parse numbers
  const parts = operand.split(/[+\-×÷*/]/).map(p => p.trim());
  const a = parseInt(parts[0]) || 0;
  const b = parseInt(parts[1]) || 0;

  // Detect digit count
  const maxDigits = Math.max(a.toString().length, b.toString().length);
  const minDigits = Math.min(a.toString().length, b.toString().length);

  // Detect carrying/borrowing (for addition/subtraction)
  let carryOrBorrow = false;
  if (operation === 'addition' || operation === 'subtraction') {
    const aStr = a.toString().padStart(maxDigits, '0');
    const bStr = b.toString().padStart(maxDigits, '0');

    if (operation === 'addition') {
      for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) + parseInt(bStr[i]) >= 10) {
          carryOrBorrow = true;
          break;
        }
      }
    } else {
      for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) < parseInt(bStr[i])) {
          carryOrBorrow = true;
          break;
        }
      }
    }
  }

  const carryText = carryOrBorrow ? 'with carrying' : 'without carrying';
  const borrowText = carryOrBorrow ? 'with borrowing' : 'without borrowing';

  return {
    operation: operation === '+' ? 'addition' : operation,
    digits: maxDigits,
    minDigits: minDigits,
    level:
      operation === 'addition'
        ? `${maxDigits}-digit + ${maxDigits}-digit ${carryText}`
        : operation === 'subtraction'
        ? `${maxDigits}-digit − ${maxDigits}-digit ${borrowText}`
        : operation === 'multiplication'
        ? `${maxDigits}-digit × ${minDigits}-digit`
        : `${maxDigits}-digit ÷ ${minDigits}-digit`
  };
}

function generateMathProblem(difficulty) {
  const op = difficulty.operation;
  const digits = difficulty.digits;
  const minDigits = difficulty.minDigits;

  if (op === 'addition') {
    let needsCarry = difficulty.level.includes('with carrying');
    let a, b, valid = false;

    while (!valid) {
      a = randomInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
      b = randomInt(Math.pow(10, minDigits - 1), Math.pow(10, minDigits) - 1);

      // Check if carrying needed
      let hasCarry = false;
      const aStr = a.toString();
      const bStr = b.toString().padStart(aStr.length, '0');
      for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) + parseInt(bStr[i]) >= 10) {
          hasCarry = true;
          break;
        }
      }

      valid = hasCarry === needsCarry;
    }

    return { a, b, op: '+', answer: a + b };
  } else if (op === 'subtraction') {
    let needsBorrow = difficulty.level.includes('with borrowing');
    let a, b, valid = false;

    while (!valid) {
      a = randomInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
      b = randomInt(Math.pow(10, minDigits - 1), Math.pow(10, minDigits) - 1);

      if (a < b) [a, b] = [b, a]; // Ensure a > b

      // Check if borrowing needed
      let hasBorrow = false;
      const aStr = a.toString();
      const bStr = b.toString().padStart(aStr.length, '0');
      for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) < parseInt(bStr[i])) {
          hasBorrow = true;
          break;
        }
      }

      valid = hasBorrow === needsBorrow;
    }

    return { a, b, op: '−', answer: a - b };
  } else if (op === 'multiplication') {
    const a = randomInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    const b = randomInt(Math.pow(10, minDigits - 1), Math.pow(10, minDigits) - 1);
    return { a, b, op: '×', answer: a * b };
  } else {
    const b = randomInt(1, 12);
    const a = b * randomInt(1, 20);
    return { a, b, op: '÷', answer: a / b };
  }
}

// ============================================
// VOCABULARY EXERCISES
// ============================================

function generateVocabularyExercises(problems, language) {
  // Analyze difficulty from first problem
  const difficulty = analyzeVocabularyDifficulty(problems[0]);

  // Generate 6 matching pairs
  const pairs = generateVocabularyPairs(difficulty, 6, language);

  return {
    theme: '🦝 WORD MASTER',
    topic: 'vocabulary',
    difficulty: difficulty.type,
    pairs: pairs.map((pair, idx) => ({
      left: pair.word,
      leftId: `vocab_${idx}`,
      right: pair.match
    })),
    rightItems: shuffleArray(pairs.map(p => ({ text: p.match }))).map((item, idx) => ({
      text: item.text,
      id: idx
    })),
    instructions: 'Match words to their meanings!',
    shuffleRightSide: true
  };
}

function analyzeVocabularyDifficulty(word) {
  const length = word.length;
  const isComplex = length > 8;

  // Infer type from common patterns
  let type = 'definition';
  if (word.toLowerCase().includes('opposite') || word.toLowerCase().includes('antonym')) {
    type = 'antonym';
  } else if (word.toLowerCase().includes('same') || word.toLowerCase().includes('synonym')) {
    type = 'synonym';
  }

  return {
    type: type,
    length: length,
    difficulty: isComplex ? 'advanced' : 'basic'
  };
}

function generateVocabularyPairs(difficulty, count, language) {
  const wordLists = {
    en: {
      basic: [
        { word: 'happy', match: 'joyful' },
        { word: 'big', match: 'large' },
        { word: 'fast', match: 'quick' },
        { word: 'bright', match: 'shiny' },
        { word: 'tiny', match: 'small' },
        { word: 'smart', match: 'intelligent' }
      ],
      advanced: [
        { word: 'eloquent', match: 'articulate' },
        { word: 'benevolent', match: 'generous' },
        { word: 'meticulous', match: 'precise' },
        { word: 'serendipity', match: 'fortunate coincidence' },
        { word: 'ephemeral', match: 'fleeting' },
        { word: 'ubiquitous', match: 'everywhere' }
      ]
    },
    es: {
      basic: [
        { word: 'feliz', match: 'alegre' },
        { word: 'grande', match: 'enorme' },
        { word: 'rápido', match: 'veloz' },
        { word: 'brillante', match: 'resplandeciente' },
        { word: 'pequeño', match: 'diminuto' },
        { word: 'inteligente', match: 'listo' }
      ],
      advanced: [
        { word: 'elocuente', match: 'articulado' },
        { word: 'benévolo', match: 'generoso' },
        { word: 'meticuloso', match: 'preciso' },
        { word: 'efímero', match: 'pasajero' },
        { word: 'ubicuo', match: 'en todas partes' },
        { word: 'perspicaz', match: 'sagaz' }
      ]
    }
  };

  const list = wordLists[language]?.[difficulty.difficulty] || wordLists['en'][difficulty.difficulty];
  return list.slice(0, count);
}

// ============================================
// SCIENCE EXERCISES
// ============================================

function generateScienceExercises(problems, language) {
  const difficulty = analyzeScienceDifficulty(problems[0]);

  const exercises = generateSciencePairs(difficulty, 6, language);

  return {
    theme: '🔬 SCIENCE LAB',
    topic: 'science',
    difficulty: difficulty.type,
    pairs: exercises.map((ex, idx) => ({
      left: ex.left,
      leftId: `science_${idx}`,
      right: ex.right
    })),
    rightItems: shuffleArray(exercises.map(ex => ({ text: ex.right }))).map((item, idx) => ({
      text: item.text,
      id: idx
    })),
    instructions: 'Match science terms to their definitions!',
    shuffleRightSide: true
  };
}

function analyzeScienceDifficulty(problem) {
  const type = problem.includes('→') || problem.includes('label') ? 'labeling' : 'definition';
  return {
    type: type,
    difficulty: problem.length > 30 ? 'advanced' : 'basic'
  };
}

function generateSciencePairs(difficulty, count, language) {
  const pairs = {
    en: [
      { left: 'Heart', right: 'Pumps blood throughout the body' },
      { left: 'Photosynthesis', right: 'Plants make food using sunlight' },
      { left: 'Mitochondria', right: 'Powerhouse of the cell' },
      { left: 'Ecosystem', right: 'Community of organisms in an area' },
      { left: 'Gravity', right: 'Force that pulls objects down' },
      { left: 'Atom', right: 'Smallest unit of matter' }
    ],
    es: [
      { left: 'Corazón', right: 'Bombea sangre por todo el cuerpo' },
      { left: 'Fotosíntesis', right: 'Las plantas hacen comida con luz solar' },
      { left: 'Mitocondria', right: 'Central eléctrica de la célula' },
      { left: 'Ecosistema', right: 'Comunidad de organismos en un área' },
      { left: 'Gravedad', right: 'Fuerza que tira objetos hacia abajo' },
      { left: 'Átomo', right: 'Unidad más pequeña de materia' }
    ]
  };

  const list = pairs[language] || pairs['en'];
  return list.slice(0, count);
}

// ============================================
// GRAMMAR EXERCISES
// ============================================

function generateGrammarExercises(problems, language) {
  const difficulty = analyzeGrammarDifficulty(problems[0]);

  const exercises = generateGrammarPairs(difficulty, 6, language);

  return {
    theme: '✏️ GRAMMAR MASTER',
    topic: 'grammar',
    difficulty: difficulty.type,
    pairs: exercises.map((ex, idx) => ({
      left: ex.incorrect,
      leftId: `grammar_${idx}`,
      right: ex.correct
    })),
    rightItems: shuffleArray(exercises.map(ex => ({ text: ex.correct }))).map((item, idx) => ({
      text: item.text,
      id: idx
    })),
    instructions: 'Match incorrect sentences to their corrections!',
    shuffleRightSide: true
  };
}

function analyzeGrammarDifficulty(problem) {
  const type = problem.includes('plural') ? 'plural' : problem.includes('tense') ? 'tense' : 'general';
  return {
    type: type,
    difficulty: problem.length > 50 ? 'advanced' : 'basic'
  };
}

function generateGrammarPairs(difficulty, count, language) {
  const pairs = {
    en: [
      { incorrect: 'She go to school', correct: 'She goes to school' },
      { incorrect: 'I is happy', correct: 'I am happy' },
      { incorrect: 'He have a dog', correct: 'He has a dog' },
      { incorrect: 'They was running', correct: 'They were running' },
      { incorrect: 'She dont like apples', correct: 'She does not like apples' },
      { incorrect: 'He are my friend', correct: 'He is my friend' }
    ],
    es: [
      { incorrect: 'Yo va al colegio', correct: 'Yo voy al colegio' },
      { incorrect: 'Ella son inteligente', correct: 'Ella es inteligente' },
      { incorrect: 'Ellos tiene libros', correct: 'Ellos tienen libros' },
      { incorrect: 'Yo esta corriendo', correct: 'Yo estoy corriendo' },
      { incorrect: 'Nosotros somos yendo', correct: 'Nosotros vamos' },
      { incorrect: 'El libro son rojo', correct: 'El libro es rojo' }
    ]
  };

  const list = pairs[language] || pairs['en'];
  return list.slice(0, count);
}

// ============================================
// GEOGRAPHY EXERCISES
// ============================================

function generateGeographyExercises(problems, language) {
  const difficulty = analyzeGeographyDifficulty(problems[0]);

  const exercises = generateGeographyPairs(difficulty, 6, language);

  return {
    theme: '🗺️ WORLD EXPLORER',
    topic: 'geography',
    difficulty: difficulty.type,
    pairs: exercises.map((ex, idx) => ({
      left: ex.country,
      leftId: `geo_${idx}`,
      right: ex.capital
    })),
    rightItems: shuffleArray(exercises.map(ex => ({ text: ex.capital }))).map((item, idx) => ({
      text: item.text,
      id: idx
    })),
    instructions: 'Match countries to their capitals!',
    shuffleRightSide: true
  };
}

function analyzeGeographyDifficulty(problem) {
  const type = problem.includes('→') ? 'capital' : 'general';
  return {
    type: type,
    difficulty: 'basic'
  };
}

function generateGeographyPairs(difficulty, count, language) {
  const pairs = {
    en: [
      { country: 'France', capital: 'Paris' },
      { country: 'Spain', capital: 'Madrid' },
      { country: 'Japan', capital: 'Tokyo' },
      { country: 'Brazil', capital: 'Brasília' },
      { country: 'Mexico', capital: 'Mexico City' },
      { country: 'Italy', capital: 'Rome' }
    ],
    es: [
      { country: 'Francia', capital: 'París' },
      { country: 'España', capital: 'Madrid' },
      { country: 'Japón', capital: 'Tokio' },
      { country: 'Brasil', capital: 'Brasilia' },
      { country: 'México', capital: 'Ciudad de México' },
      { country: 'Italia', capital: 'Roma' }
    ]
  };

  const list = pairs[language] || pairs['en'];
  return list.slice(0, count);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}