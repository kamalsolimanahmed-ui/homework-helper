/**
 * Detects the math level from homework text
 * Returns: 'early' | 'basic' | 'normal' | 'advanced'
 * 
 * RULES:
 * - early: ages 6-7, numbers 0-10, single + or -
 * - basic: ages 7-8, numbers 0-20, simple operations
 * - normal: ages 9-10, numbers 0-100, multiplication/division
 * - advanced: ages 11+, numbers >100, multi-step, word problems
 */
export function detectMathLevel(extractedText) {
  if (!extractedText || typeof extractedText !== 'string') {
    return 'basic'; // Safe default
  }

  const text = extractedText.toLowerCase();
  
  // Extract all numbers from text
  const numberMatches = text.match(/\b\d+\b/g);
  if (!numberMatches || numberMatches.length === 0) {
    return 'basic'; // Can't detect, use safe default
  }

  const numbers = numberMatches.map(n => parseInt(n, 10));
  const maxNumber = Math.max(...numbers);
  const minNumber = Math.min(...numbers);
  
  console.log(`🔢 Math Detection: max=${maxNumber}, min=${minNumber}`);

  // ============================================
  // 1. NUMBER SIZE DETECTION
  // ============================================
  
  let levelByNumbers = 'basic'; // default
  
  if (maxNumber <= 10) {
    levelByNumbers = 'early';
  } else if (maxNumber <= 20) {
    levelByNumbers = 'basic';
  } else if (maxNumber <= 100) {
    levelByNumbers = 'normal';
  } else {
    levelByNumbers = 'advanced';
  }

  console.log(`   Level by number size: ${levelByNumbers}`);

  // ============================================
  // 2. OPERATION TYPE DETECTION
  // ============================================
  
  const hasAddition = /\+|plus|add/i.test(text);
  const hasSubtraction = /-|minus|subtract/i.test(text);
  const hasMultiplication = /\*|×|multiply|times|of/i.test(text);
  const hasDivision = /\/|÷|divide|split|share/i.test(text);
  const hasExponents = /\^|\*\*|power|square|cube/i.test(text);
  const hasFractions = /\/|fraction|half|third|quarter/i.test(text);

  const operationCount = [hasAddition, hasSubtraction, hasMultiplication, hasDivision].filter(Boolean).length;

  let levelByOperations = 'basic'; // default

  // + / - only → cap at basic
  if ((hasAddition || hasSubtraction) && !hasMultiplication && !hasDivision) {
    levelByOperations = 'basic';
  }
  
  // × / ÷ introduced → normal or higher
  if (hasMultiplication || hasDivision) {
    levelByOperations = 'normal';
  }
  
  // Complex operations → advanced
  if (hasExponents || hasFractions || operationCount > 2) {
    levelByOperations = 'advanced';
  }

  console.log(`   Level by operations: ${levelByOperations}`);

  // ============================================
  // 3. QUESTION FORMAT DETECTION
  // ============================================
  
  // Word problem indicators (longer text, narrative)
  const wordProblemIndicators = [
    /john|mary|tom|sarah|alex|bought|sold|has|there|find|how many|how much|cost|price/i,
    /problem|word problem|story/i,
  ];

  const isWordProblem = wordProblemIndicators.some(pattern => pattern.test(text));

  // Multi-step detection (multiple operations or questions)
  const multiStepIndicators = /then|next|finally|after that|first|second|step|calculate/i;
  const isMultiStep = multiStepIndicators.test(text);

  let levelByFormat = 'basic'; // default

  if (isMultiStep) {
    levelByFormat = 'advanced';
  } else if (isWordProblem) {
    levelByFormat = 'normal';
  }

  console.log(`   Level by format: ${levelByFormat}`);

  // ============================================
  // 4. COMBINE ALL SIGNALS
  // ============================================
  
  const levels = [levelByNumbers, levelByOperations, levelByFormat];
  
  // If any signal says "advanced", likely advanced
  if (levels.includes('advanced')) {
    const finalLevel = 'advanced';
    console.log(`   🎯 FINAL LEVEL: ${finalLevel} (advanced signal detected)`);
    return finalLevel;
  }

  // If any signal says "normal" and none say "early", likely normal
  if (levels.includes('normal') && !levels.includes('early')) {
    const finalLevel = 'normal';
    console.log(`   🎯 FINAL LEVEL: ${finalLevel}`);
    return finalLevel;
  }

  // If numbers are small or operations are basic, likely early/basic
  if (levelByNumbers === 'early' || (operationCount === 1 && !hasMultiplication && !hasDivision)) {
    const finalLevel = levelByNumbers === 'early' ? 'early' : 'basic';
    console.log(`   🎯 FINAL LEVEL: ${finalLevel}`);
    return finalLevel;
  }

  // Default safe bet for 7+ year olds
  const finalLevel = 'basic';
  console.log(`   🎯 FINAL LEVEL: ${finalLevel} (safe default)`);
  return finalLevel;
}

export function getMathLevelLabel(level) {
  const labels = {
    early: 'Early (Ages 6-7)',
    basic: 'Basic (Ages 7-8)',
    normal: 'Normal (Ages 9-10)',
    advanced: 'Advanced (Ages 11+)',
  };
  return labels[level] || 'Unknown';
}