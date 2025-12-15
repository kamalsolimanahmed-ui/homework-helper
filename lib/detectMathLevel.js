// Helper function to detect math level from homework text
export function detectMathLevel(homeworkText) {
  try {
    // Parse homework structure to get digits
    const { digits } = parseHomeworkStructure(homeworkText);
    
    // Map digits to grade-based level (simplified)
    // 1-digit → early, 2-digit → basic, 3-digit → normal
    if (digits === 1) return 'early';
    if (digits === 2) return 'basic';
    if (digits >= 3) return 'normal';
    
    return 'basic';
  } catch (error) {
    console.error('Error detecting math level:', error);
    return 'basic'; // Safe default
  }
}

function parseHomeworkStructure(text) {
  // Normalize dashes
  let normalized = text.replace(/[–—−]/g, '-');

  // Extract all numbers
  const numberMatches = normalized.match(/\d+/g) || [];
  const numbers = numberMatches.map(n => parseInt(n, 10));
  
  // Determine digit size ONLY from largest detected number
  let digits = 1;
  if (numbers.length > 0) {
    const maxNum = Math.max(...numbers);
    if (maxNum >= 100) digits = 3;
    else if (maxNum >= 10) digits = 2;
    else digits = 1;
  }

  return { digits, numbers };
}