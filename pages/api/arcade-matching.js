export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, language = 'en', grade_level = 'elementary' } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const game = generateArcadeGame(topic, language, grade_level);
    
    const rightItems = game.pairs.map(p => p.right).sort(() => Math.random() - 0.5);

    res.status(200).json({
      theme: game.theme,
      topic: topic,
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

function generateArcadeGame(topic, language, grade_level) {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('addition')) return getAdditionGame(language);
  if (topicLower.includes('multiplication')) return getMultiplicationGame(language);
  if (topicLower.includes('subtraction')) return getSubtractionGame(language);
  if (topicLower.includes('division')) return getDivisionGame(language);
  if (topicLower.includes('fractions')) return getFractionsGame(language);
  if (topicLower.includes('vocabulary')) return getVocabularyGame(language);
  if (topicLower.includes('synonym')) return getSynonymGame(language);
  if (topicLower.includes('antonym')) return getAntonymGame(language);
  if (topicLower.includes('animal')) return getAnimalGame(language);
  if (topicLower.includes('color')) return getColorGame(language);
  if (topicLower.includes('body')) return getBodyPartGame(language);
  if (topicLower.includes('capital')) return getCapitalGame(language);
  
  return getDefaultGame(language);
}

// ============================================
// ADDITION - MATH BLASTER
// ============================================
function getAdditionGame(language) {
  const games = {
    en: {
      theme: '🚀 MATH BLASTER',
      instructions: 'Blast matching numbers! Drag left to right!',
      pairs: [
        { left: '💥 2+3', right: '5 🎯' },
        { left: '⚡ 5+5', right: '10 ⭐' },
        { left: '🔥 3+4', right: '7 💫' },
        { left: '✨ 6+2', right: '8 🎪' },
        { left: '🎸 4+1', right: '5 🎬' },
        { left: '🎭 7+3', right: '10 🎨' }
      ]
    },
    es: {
      theme: '🚀 BLASTER MATEMÁTICO',
      instructions: '¡Combina números! ¡Arrastra izquierda a derecha!',
      pairs: [
        { left: '💥 2+3', right: '5 🎯' },
        { left: '⚡ 5+5', right: '10 ⭐' },
        { left: '🔥 3+4', right: '7 💫' },
        { left: '✨ 6+2', right: '8 🎪' },
        { left: '🎸 4+1', right: '5 🎬' }
      ]
    },
    fr: {
      theme: '🚀 BLASTER MATH',
      instructions: 'Tire sur les nombres! Traîne gauche à droite!',
      pairs: [
        { left: '💥 2+3', right: '5 🎯' },
        { left: '⚡ 5+5', right: '10 ⭐' },
        { left: '🔥 3+4', right: '7 💫' },
        { left: '✨ 6+2', right: '8 🎪' }
      ]
    },
    de: {
      theme: '🚀 MATHE-BLASTER',
      instructions: 'Zahlen treffen! Zieh von links nach rechts!',
      pairs: [
        { left: '💥 2+3', right: '5 🎯' },
        { left: '⚡ 5+5', right: '10 ⭐' },
        { left: '🔥 3+4', right: '7 💫' },
        { left: '✨ 6+2', right: '8 🎪' }
      ]
    },
    ar: {
      theme: '🚀 كاسر الرياضيات',
      instructions: '!اجعل الأرقام تتطابق! اسحب من اليسار إلى اليمين',
      pairs: [
        { left: '💥 ٢+٣', right: '٥ 🎯' },
        { left: '⚡ ٥+٥', right: '١٠ ⭐' },
        { left: '🔥 ٣+٤', right: '٧ 💫' },
        { left: '✨ ٦+٢', right: '٨ 🎪' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// MULTIPLICATION - NINJA NUMBERS
// ============================================
function getMultiplicationGame(language) {
  const games = {
    en: {
      theme: '🎮 NINJA NUMBERS',
      instructions: 'Slice through the math! Connect left to right!',
      pairs: [
        { left: '⚔️ 2×3', right: '6 🥋' },
        { left: '🗡️ 4×5', right: '20 💪' },
        { left: '🔪 3×3', right: '9 🏆' },
        { left: '⚡ 2×7', right: '14 🎯' },
        { left: '💥 5×2', right: '10 🎊' },
        { left: '✨ 6×2', right: '12 🌟' }
      ]
    },
    es: {
      theme: '🎮 NINJA NÚMEROS',
      instructions: '¡Corta la matemática! ¡Conecta izquierda a derecha!',
      pairs: [
        { left: '⚔️ 2×3', right: '6 🥋' },
        { left: '🗡️ 4×5', right: '20 💪' },
        { left: '🔪 3×3', right: '9 🏆' },
        { left: '⚡ 2×7', right: '14 🎯' }
      ]
    },
    fr: {
      theme: '🎮 CHIFFRES NINJA',
      instructions: 'Tranche les maths! Relie gauche à droite!',
      pairs: [
        { left: '⚔️ 2×3', right: '6 🥋' },
        { left: '🗡️ 4×5', right: '20 💪' },
        { left: '🔪 3×3', right: '9 🏆' },
        { left: '⚡ 2×7', right: '14 🎯' }
      ]
    },
    ar: {
      theme: '🎮 أرقام النينجا',
      instructions: '!قطع الرياضيات! ربط اليسار باليمين!',
      pairs: [
        { left: '⚔️ ٢×٣', right: '٦ 🥋' },
        { left: '🗡️ ٤×٥', right: '٢٠ 💪' },
        { left: '🔪 ٣×٣', right: '٩ 🏆' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// SUBTRACTION - PIRATE TREASURE
// ============================================
function getSubtractionGame(language) {
  const games = {
    en: {
      theme: '🏴‍☠️ PIRATE TREASURE',
      instructions: 'Find the treasure! Match left to right!',
      pairs: [
        { left: '⚓ 5-2', right: '3 🪙' },
        { left: '🗺️ 10-3', right: '7 💎' },
        { left: '🏴 8-4', right: '4 👑' },
        { left: '🦜 6-1', right: '5 🎁' },
        { left: '⛵ 9-5', right: '4 🏴‍☠️' }
      ]
    },
    es: {
      theme: '🏴‍☠️ TESORO PIRATA',
      instructions: '¡Encuentra el tesoro! ¡Combina izquierda a derecha!',
      pairs: [
        { left: '⚓ 5-2', right: '3 🪙' },
        { left: '🗺️ 10-3', right: '7 💎' },
        { left: '🏴 8-4', right: '4 👑' },
        { left: '🦜 6-1', right: '5 🎁' }
      ]
    },
    fr: {
      theme: '🏴‍☠️ TRÉSOR PIRATE',
      instructions: 'Trouvez le trésor! Mélange gauche à droite!',
      pairs: [
        { left: '⚓ 5-2', right: '3 🪙' },
        { left: '🗺️ 10-3', right: '7 💎' },
        { left: '🏴 8-4', right: '4 👑' }
      ]
    },
    ar: {
      theme: '🏴‍☠️ كنز القراصنة',
      instructions: '!ابحث عن الكنز! طابق اليسار باليمين!',
      pairs: [
        { left: '⚓ ٥-٢', right: '٣ 🪙' },
        { left: '🗺️ ١٠-٣', right: '٧ 💎' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// DIVISION - SPACE RANGER
// ============================================
function getDivisionGame(language) {
  const games = {
    en: {
      theme: '🌌 SPACE RANGER',
      instructions: 'Split the asteroids! Link the equations!',
      pairs: [
        { left: '🛸 6÷2', right: '3 🌙' },
        { left: '⭐ 12÷3', right: '4 🪐' },
        { left: '🚀 15÷5', right: '3 🛰️' },
        { left: '🌠 20÷4', right: '5 🌟' },
        { left: '👽 8÷2', right: '4 💫' }
      ]
    },
    es: {
      theme: '🌌 RANGER ESPACIAL',
      instructions: '¡Divide los asteroides! ¡Vincula las ecuaciones!',
      pairs: [
        { left: '🛸 6÷2', right: '3 🌙' },
        { left: '⭐ 12÷3', right: '4 🪐' },
        { left: '🚀 15÷5', right: '3 🛰️' }
      ]
    },
    fr: {
      theme: '🌌 RANGER SPATIAL',
      instructions: 'Divisez les astéroïdes! Liez les équations!',
      pairs: [
        { left: '🛸 6÷2', right: '3 🌙' },
        { left: '⭐ 12÷3', right: '4 🪐' },
        { left: '🚀 15÷5', right: '3 🛰️' }
      ]
    },
    ar: {
      theme: '🌌 حارس الفضاء',
      instructions: '!انقسم النيازك! ربط المعادلات!',
      pairs: [
        { left: '🛸 ٦÷٢', right: '٣ 🌙' },
        { left: '⭐ ١٢÷٣', right: '٤ 🪐' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// FRACTIONS - PIZZA PARTY
// ============================================
function getFractionsGame(language) {
  const games = {
    en: {
      theme: '🍕 PIZZA PARTY',
      instructions: 'Slice the pizza! Match fractions to pieces!',
      pairs: [
        { left: '🍕 1/2', right: 'Half Pizza 🎉' },
        { left: '🍕 1/4', right: 'Slice! 🥳' },
        { left: '🍕 3/4', right: 'Big Bite! 😋' },
        { left: '🍕 1/3', right: 'Three Way 👨‍👩‍👧' },
        { left: '🍕 2/3', right: 'Double Slice 🤤' },
        { left: '🍕 1/8', right: 'Tiny Piece! ✨' }
      ]
    },
    es: {
      theme: '🍕 FIESTA PIZZA',
      instructions: '¡Divide la pizza! ¡Combina fracciones a piezas!',
      pairs: [
        { left: '🍕 1/2', right: 'Media Pizza 🎉' },
        { left: '🍕 1/4', right: '¡Trozo! 🥳' },
        { left: '🍕 3/4', right: '¡Bocado Grande! 😋' }
      ]
    },
    fr: {
      theme: '🍕 FÊTE PIZZA',
      instructions: 'Divisez la pizza! Mélangez les fractions!',
      pairs: [
        { left: '🍕 1/2', right: 'Demi-Pizza 🎉' },
        { left: '🍕 1/4', right: 'Tranche! 🥳' },
        { left: '🍕 3/4', right: 'Grosse Bouchée! 😋' }
      ]
    },
    ar: {
      theme: '🍕 حفلة البيتزا',
      instructions: '!اقسم البيتزا! طابق الكسور بالقطع!',
      pairs: [
        { left: '🍕 ١/٢', right: 'نصف بيتزا 🎉' },
        { left: '🍕 ١/٤', right: 'شريحة! 🥳' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// VOCABULARY - RACCOON WORDS
// ============================================
function getVocabularyGame(language) {
  const games = {
    en: {
      theme: '🦝 RACCOON WORDS',
      instructions: 'Help Rocky! Match words to meanings!',
      pairs: [
        { left: '🦝 GLEEFUL', right: 'Super Happy! 😄' },
        { left: '🦝 COLOSSAL', right: 'Huge! 🏔️' },
        { left: '🦝 SWIFT', right: 'Super Fast! ⚡' },
        { left: '🦝 RADIANT', right: 'Shiny Bright! ✨' },
        { left: '🦝 SAGE', right: 'Very Wise! 🧠' },
        { left: '🦝 LISTLESS', right: 'No Energy 😴' }
      ]
    },
    es: {
      theme: '🦝 PALABRAS MAPACHE',
      instructions: '¡Ayuda a Rocky! ¡Combina palabras con significados!',
      pairs: [
        { left: '🦝 ALEGRE', right: '¡Super Feliz! 😄' },
        { left: '🦝 COLOSAL', right: '¡Enorme! 🏔️' },
        { left: '🦝 VELOZ', right: '¡Super Rápido! ⚡' },
        { left: '🦝 RADIANTE', right: '¡Brillante! ✨' }
      ]
    },
    fr: {
      theme: '🦝 MOTS RATON',
      instructions: 'Aide Rocky! Mélange les mots avec les sens!',
      pairs: [
        { left: '🦝 JOYEUX', right: 'Super Heureux! 😄' },
        { left: '🦝 COLOSSAL', right: 'Énorme! 🏔️' },
        { left: '🦝 RAPIDE', right: 'Super Vite! ⚡' }
      ]
    },
    ar: {
      theme: '🦝 كلمات الراكون',
      instructions: '!ساعد روكي! طابق الكلمات بالمعاني!',
      pairs: [
        { left: '🦝 سعيد', right: '!سعيد جدا 😄' },
        { left: '🦝 ضخم', right: '!ضخم 🏔️' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// SYNONYMS - MAGIC TWINS
// ============================================
function getSynonymGame(language) {
  const games = {
    en: {
      theme: '✨ MAGIC TWINS',
      instructions: 'Find word twins! They mean the same!',
      pairs: [
        { left: '✨ TINY', right: 'Small ⭐' },
        { left: '✨ JOY', right: 'Happy 🎉' },
        { left: '✨ FURIOUS', right: 'Angry 🔥' },
        { left: '✨ CHILLY', right: 'Cold ❄️' },
        { left: '✨ DAMP', right: 'Wet 💧' },
        { left: '✨ BRILLIANT', right: 'Smart 🧠' }
      ]
    },
    es: {
      theme: '✨ GEMELOS MÁGICOS',
      instructions: '¡Encuentra gemelos! ¡Significan lo mismo!',
      pairs: [
        { left: '✨ PEQUEÑO', right: 'Diminuto ⭐' },
        { left: '✨ ALEGRÍA', right: 'Feliz 🎉' },
        { left: '✨ FURIOSO', right: 'Enojado 🔥' }
      ]
    },
    fr: {
      theme: '✨ JUMEAUX MAGIQUES',
      instructions: 'Trouvez les jumeaux! Même sens!',
      pairs: [
        { left: '✨ MINUSCULE', right: 'Petit ⭐' },
        { left: '✨ JOIE', right: 'Heureux 🎉' },
        { left: '✨ FURIEUX', right: 'Fâché 🔥' }
      ]
    },
    ar: {
      theme: '✨ التوأم السحري',
      instructions: '!ابحث عن كلمات التوأم! بنفس المعنى!',
      pairs: [
        { left: '✨ صغير', right: 'صغير جدا ⭐' },
        { left: '✨ فرح', right: 'سعيد 🎉' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// ANTONYMS - OPPOSITE WORLD
// ============================================
function getAntonymGame(language) {
  const games = {
    en: {
      theme: '⚖️ OPPOSITE WORLD',
      instructions: 'Find opposites! Complete opposites!',
      pairs: [
        { left: '⚖️ BIG', right: 'Small 🤏' },
        { left: '⚖️ HOT', right: 'Cold ❄️' },
        { left: '⚖️ HAPPY', right: 'Sad 😢' },
        { left: '⚖️ FAST', right: 'Slow 🐢' },
        { left: '⚖️ LIGHT', right: 'Dark 🌑' },
        { left: '⚖️ GOOD', right: 'Bad 👿' }
      ]
    },
    es: {
      theme: '⚖️ MUNDO OPUESTO',
      instructions: '¡Encuentra opuestos! ¡Completamente opuestos!',
      pairs: [
        { left: '⚖️ GRANDE', right: 'Pequeño 🤏' },
        { left: '⚖️ CALIENTE', right: 'Frío ❄️' },
        { left: '⚖️ FELIZ', right: 'Triste 😢' }
      ]
    },
    fr: {
      theme: '⚖️ MONDE OPPOSÉ',
      instructions: 'Trouvez les opposés! Complètement opposés!',
      pairs: [
        { left: '⚖️ GRAND', right: 'Petit 🤏' },
        { left: '⚖️ CHAUD', right: 'Froid ❄️' },
        { left: '⚖️ HEUREUX', right: 'Triste 😢' }
      ]
    },
    ar: {
      theme: '⚖️ عالم معاكس',
      instructions: '!ابحث عن أضداد! معاكسة تماما!',
      pairs: [
        { left: '⚖️ كبير', right: 'صغير 🤏' },
        { left: '⚖️ ساخن', right: 'بارد ❄️' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// ANIMALS - WILD KINGDOM
// ============================================
function getAnimalGame(language) {
  const games = {
    en: {
      theme: '🦁 WILD KINGDOM',
      instructions: 'Know the animals? Match to powers!',
      pairs: [
        { left: '🐕 DOG', right: 'Woof! 🦴' },
        { left: '🐈 CAT', right: 'Meow! 🧶' },
        { left: '🐠 FISH', right: 'Splash! 💦' },
        { left: '🦅 EAGLE', right: 'Soar! 🌤️' },
        { left: '🦁 LION', right: 'Roar! 👑' },
        { left: '🦘 KANGAROO', right: 'Jump! 🏃' }
      ]
    },
    es: {
      theme: '🦁 REINO SALVAJE',
      instructions: '¿Conoces los animales? ¡Combina con poderes!',
      pairs: [
        { left: '🐕 PERRO', right: '¡Guau! 🦴' },
        { left: '🐈 GATO', right: '¡Miau! 🧶' },
        { left: '🐠 PEZ', right: '¡Splash! 💦' },
        { left: '🦅 ÁGUILA', right: '¡Vuela! 🌤️' }
      ]
    },
    fr: {
      theme: '🦁 ROYAUME SAUVAGE',
      instructions: 'Connais les animaux? Mélange avec pouvoirs!',
      pairs: [
        { left: '🐕 CHIEN', right: 'Aboie! 🦴' },
        { left: '🐈 CHAT', right: 'Miaule! 🧶' },
        { left: '🐠 POISSON', right: 'Splash! 💦' }
      ]
    },
    ar: {
      theme: '🦁 المملكة البرية',
      instructions: '؟هل تعرف الحيوانات طابقهم!',
      pairs: [
        { left: '🐕 كلب', right: '!نباح 🦴' },
        { left: '🐈 قطة', right: '!مياو 🧶' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// COLORS - RAINBOW BLAST
// ============================================
function getColorGame(language) {
  const games = {
    en: {
      theme: '🎨 RAINBOW BLAST',
      instructions: 'Paint the world! Match to things!',
      pairs: [
        { left: '🔴 RED', right: 'Fire! 🔥' },
        { left: '🔵 BLUE', right: 'Sky! ☁️' },
        { left: '🟡 YELLOW', right: 'Sun! ☀️' },
        { left: '🟢 GREEN', right: 'Grass! 🌱' },
        { left: '⚫ BLACK', right: 'Night! 🌙' },
        { left: '⚪ WHITE', right: 'Snow! ❄️' }
      ]
    },
    es: {
      theme: '🎨 ARCOÍRIS EXPLOSIÓN',
      instructions: '¡Pinta el mundo! ¡Combina a cosas!',
      pairs: [
        { left: '🔴 ROJO', right: '¡Fuego! 🔥' },
        { left: '🔵 AZUL', right: '¡Cielo! ☁️' },
        { left: '🟡 AMARILLO', right: '¡Sol! ☀️' },
        { left: '🟢 VERDE', right: '¡Pasto! 🌱' }
      ]
    },
    fr: {
      theme: '🎨 EXPLOSION ARC-EN-CIEL',
      instructions: 'Peins le monde! Mélange les couleurs!',
      pairs: [
        { left: '🔴 ROUGE', right: 'Feu! 🔥' },
        { left: '🔵 BLEU', right: 'Ciel! ☁️' },
        { left: '🟡 JAUNE', right: 'Soleil! ☀️' }
      ]
    },
    ar: {
      theme: '🎨 انفجار قوس قزح',
      instructions: '!اطلي العالم طابق بالأشياء!',
      pairs: [
        { left: '🔴 أحمر', right: '!نار 🔥' },
        { left: '🔵 أزرق', right: '!سماء ☁️' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// BODY PARTS - SUPERHERO BODY
// ============================================
function getBodyPartGame(language) {
  const games = {
    en: {
      theme: '💪 SUPERHERO BODY',
      instructions: 'Build a hero! Match parts to powers!',
      pairs: [
        { left: '🧠 HEAD', right: 'Think! 💭' },
        { left: '👀 EYES', right: 'See! 🔍' },
        { left: '👂 EARS', right: 'Hear! 🔊' },
        { left: '👃 NOSE', right: 'Smell! 🌹' },
        { left: '🙌 HANDS', right: 'Grab! 🎁' },
        { left: '🦵 FEET', right: 'Run! 🏃' }
      ]
    },
    es: {
      theme: '💪 CUERPO SUPERHÉROE',
      instructions: '¡Construye un héroe! ¡Combina partes!',
      pairs: [
        { left: '🧠 CABEZA', right: '¡Piensa! 💭' },
        { left: '👀 OJOS', right: '¡Mira! 🔍' },
        { left: '👂 OREJAS', right: '¡Escucha! 🔊' },
        { left: '👃 NARIZ', right: '¡Huele! 🌹' }
      ]
    },
    fr: {
      theme: '💪 CORPS SUPER-HÉROS',
      instructions: 'Construis un héros! Mélange les parties!',
      pairs: [
        { left: '🧠 TÊTE', right: 'Pense! 💭' },
        { left: '👀 YEUX', right: 'Vois! 🔍' },
        { left: '👂 OREILLES', right: 'Entends! 🔊' }
      ]
    },
    ar: {
      theme: '💪 جسم فوق بشري',
      instructions: '!ابن بطلا طابق أجزاء!',
      pairs: [
        { left: '🧠 رأس', right: '!فكر 💭' },
        { left: '👀 عيون', right: '!انظر 🔍' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// CAPITALS - WORLD EXPLORER
// ============================================
function getCapitalGame(language) {
  const games = {
    en: {
      theme: '🗺️ WORLD EXPLORER',
      instructions: 'Explore! Match countries to capitals!',
      pairs: [
        { left: '🇫🇷 FRANCE', right: 'Paris! 🗼' },
        { left: '🇪🇸 SPAIN', right: 'Madrid! 🎭' },
        { left: '🇯🇵 JAPAN', right: 'Tokyo! 🎌' },
        { left: '🇧🇷 BRAZIL', right: 'Brasília! ⚽' },
        { left: '🇲🇽 MEXICO', right: 'Mexico City! 🌮' },
        { left: '🇮🇹 ITALY', right: 'Rome! 🍝' }
      ]
    },
    es: {
      theme: '🗺️ EXPLORADOR MUNDIAL',
      instructions: '¡Explora! ¡Combina países con capitales!',
      pairs: [
        { left: '🇫🇷 FRANCIA', right: '¡París! 🗼' },
        { left: '🇪🇸 ESPAÑA', right: '¡Madrid! 🎭' },
        { left: '🇯🇵 JAPÓN', right: '¡Tokio! 🎌' }
      ]
    },
    fr: {
      theme: '🗺️ EXPLORATEUR MONDIAL',
      instructions: 'Explore! Mélange les pays!',
      pairs: [
        { left: '🇫🇷 FRANCE', right: 'Paris! 🗼' },
        { left: '🇪🇸 ESPAGNE', right: 'Madrid! 🎭' },
        { left: '🇯🇵 JAPON', right: 'Tokyo! 🎌' }
      ]
    },
    ar: {
      theme: '🗺️ مستكشف العالم',
      instructions: '!استكشف طابق الدول بالعواصم!',
      pairs: [
        { left: '🇫🇷 فرنسا', right: '!باريس 🗼' },
        { left: '🇪🇸 إسبانيا', right: '!مدريد 🎭' }
      ]
    }
  };
  return games[language] || games['en'];
}

// ============================================
// DEFAULT - WORD WARRIOR
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
    },
    fr: {
      theme: '🎮 GUERRIER DES MOTS',
      instructions: 'Prêt! Relie gauche à droite!',
      pairs: [
        { left: '🎮 JOUER', right: 'Amusement! 🎉' },
        { left: '🎮 APPRENDRE', right: 'Intelligent! 🧠' }
      ]
    },
    ar: {
      theme: '🎮 محارب الكلمات',
      instructions: '!جاهز ربط اليسار باليمين!',
      pairs: [
        { left: '🎮 العب', right: '!متعة 🎉' },
        { left: '🎮 تعلم', right: '!ذكي 🧠' }
      ]
    }
  };
  return games[language] || games['en'];
}