export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { extractedText, language = 'en' } = req.body;

  if (!extractedText) {
    return res.status(400).json({ error: 'Extracted text required' });
  }

  try {
    console.log('🔍 Detecting homework subject and skill...');

    // ============================================
    // STEP 1: PARSE HOMEWORK STRUCTURE
    // ============================================

    const { operation, digits, skill, numbers } = parseHomeworkStructure(extractedText);

    console.log(`\n✅ STRUCTURE ANALYSIS`);
    console.log(`   Operation: ${operation}`);
    console.log(`   Digits: ${digits}`);
    console.log(`   Skill: ${skill}`);
    console.log(`   Numbers: ${numbers.join(', ')}`);

    // ============================================
    // STEP 2: USE AI FOR SUBJECT + GRADE
    // ============================================

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Analyze this homework and respond with ONLY valid JSON (no markdown, no explanation):

Homework text:
"${extractedText}"

Language: ${language}

Respond with EXACTLY this JSON structure (no extra text):
{
  "subject": "math|reading|phonics|vocabulary|grammar|antonym|synonym",
  "grade_level": "K|1|2|3|4|5|6|7|8|9|10",
  "confidence": 0.0-1.0
}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Detection error:', data);
      return res.status(500).json({ error: 'Detection failed' });
    }

    let result;
    try {
      const content = data.choices[0].message.content.trim();
      result = JSON.parse(content);
    } catch (e) {
      console.error('JSON parse error:', e);
      return res.status(500).json({ error: 'Invalid detection response' });
    }

    // ============================================
    // STEP 3: BUILD FINAL METADATA
    // ============================================

    const topicMap = {
      'addition': 'addition',
      'subtraction': 'subtraction',
      'multiplication': 'multiplication',
      'division': 'division',
      'phonics': 'reading',
      'reading': 'reading',
      'vocabulary': 'vocabulary',
      'grammar': 'grammar',
    };

    const finalTopic = topicMap[operation] || operation;

    // Map grade + operation to math_level
    const mathLevel = mapToMathLevel(result.grade_level, operation);

    console.log(`\n📊 FINAL METADATA`);
    console.log(`   Subject: ${result.subject}`);
    console.log(`   Topic: ${finalTopic}`);
    console.log(`   Grade: ${result.grade_level}`);
    console.log(`   Math Level: ${mathLevel}`);
    console.log(`   Digits: ${digits}`);
    console.log(`   Skill: ${skill}`);
    console.log(`   Confidence: ${result.confidence}`);

    return res.status(200).json({
      success: true,
      subject: result.subject,
      topic: finalTopic,
      operation: operation,
      grade_level: result.grade_level,
      math_level: mathLevel,
      digits: digits,
      skill: skill,
      numbers: numbers,
      confidence: result.confidence,
      language: language,
    });
  } catch (error) {
    console.error('Detection error:', error);
    return res.status(500).json({ error: 'Failed to detect homework' });
  }
}

// ============================================
// PARSE HOMEWORK STRUCTURE
// ============================================

function parseHomeworkStructure(text) {
  // Normalize dashes
  let normalized = text.replace(/[–—−]/g, '-');

  // Extract all numbers
  const numberMatches = normalized.match(/\d+/g) || [];
  const numbers = numberMatches.map(n => parseInt(n, 10));
  const maxNum = Math.max(...numbers);

  // Determine operation
  let operation = 'unknown';
  if (normalized.includes('-') && !normalized.includes('--')) {
    operation = 'subtraction';
  } else if (normalized.includes('+')) {
    operation = 'addition';
  } else if (normalized.match(/[×*]/)) {
    operation = 'multiplication';
  } else if (normalized.match(/[÷/]/)) {
    operation = 'division';
  } else if (normalized.toLowerCase().includes('grammar') || normalized.toLowerCase().includes('verb')) {
    operation = 'grammar';
  } else if (normalized.toLowerCase().includes('read')) {
    operation = 'reading';
  }

  // Determine digit size
  let digits = 1;
  if (maxNum >= 100) digits = 3;
  else if (maxNum >= 10) digits = 2;

  // Determine skill
  let skill = '';

  if (operation === 'subtraction' && digits >= 2) {
    // Check if borrowing needed (e.g., 32 - 17 needs borrowing)
    if (numberMatches.length >= 2) {
      const [num1, num2] = [parseInt(numberMatches[0]), parseInt(numberMatches[1])];
      if (hasBorrowingNeeded(num1, num2)) {
        skill = 'borrowing';
      }
    }
  } else if (operation === 'addition' && digits >= 2) {
    skill = 'regrouping';
  } else if (operation === 'multiplication' && digits >= 2) {
    skill = 'multi_digit';
  }

  return { operation, digits, skill, numbers };
}

function hasBorrowingNeeded(num1, num2) {
  const str1 = String(num1);
  const str2 = String(num2);

  // Check each digit position
  for (let i = 0; i < str1.length; i++) {
    const pos1 = parseInt(str1[i], 10);
    const pos2 = parseInt(str2[i], 10);
    if (pos1 < pos2) return true;
  }
  return false;
}

function mapToMathLevel(gradeLevel, operation) {
  const grade = parseInt(gradeLevel) || 0;

  // Grade-based mapping
  if (grade <= 1) return 'early';
  if (grade <= 3) return 'basic';
  if (grade <= 7) return 'normal';
  return 'advanced';
}