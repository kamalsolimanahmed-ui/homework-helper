const busboy = require('busboy');

export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromImage(imageBase64) {
  try {
    console.log('📸 Sending image to OpenAI Vision API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract EVERY SINGLE text, number, word, question, and detail from this image. Return ONLY the exact content you see, nothing else. Get EVERYTHING.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Vision API error:', data);
      throw new Error(data.error?.message || 'Vision API failed');
    }

    const extractedText = data.choices[0].message.content;
    console.log('✅ Text extracted from image');
    return extractedText;
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

async function generateExplanation(homeworkText, lang = 'en', parent = false) {
  try {
    let langName = 'English';
    if (lang === 'fr') langName = 'French';
    if (lang === 'de') langName = 'German';
    if (lang === 'es') langName = 'Spanish';
    if (lang === 'ar') langName = 'Arabic';

    const mode = parent ? 'PARENT' : 'KID';
    console.log(`🤖 Generating ${mode} explanation in ${langName}...`);

    let prompt = '';

    if (parent) {
      // ULTRA-DETAILED PARENT PROMPT
      prompt = `You are a world-class educator helping PARENTS understand their child's homework.

HOMEWORK CONTENT TO EXPLAIN:
"""
${homeworkText}
"""

RESPOND ONLY IN: ${langName}

YOU MUST:
1. Identify each problem clearly
2. Solve it step-by-step (show ALL work)
3. Explain WHY the method works
4. Show what the child should learn
5. Identify the TOPIC (addition, subtraction, multiplication, division, fractions, decimals, algebra, geometry, word-problem, reading, grammar, science, or unknown)

EXAMPLE - If problem is 147 + 65:

Step 1: Line up by place value
Step 2: Add ones: 7 + 5 = 12 (write 2, carry 1)
Step 3: Add tens: 4 + 6 + 1 = 11 (write 1, carry 1)
Step 4: Add hundreds: 1 + 1 = 2
Answer: 212

WHY THIS WORKS: Place value groups numbers into ones, tens, hundreds, etc. When a column exceeds 9, we "carry" to the next column.

RETURN ONLY VALID JSON (no markdown, no backticks, NO extra text):
{
  "simple_answer": "212",
  "explanation": "Place value addition works by aligning digits and adding column by column. For 147 + 65: ones (7+5=12), tens (4+6+1=11), hundreds (1+1=2), giving 212. This method works because it systematically combines quantities by magnitude. Help your child understand that carrying happens when a column sum exceeds 9.",
  "detailed_steps": "1. Write numbers vertically, aligning by place value\\n2. Add ones column: 7 + 5 = 12 (write 2 below, carry 1)\\n3. Add tens column: 1 + 4 + 6 = 11 (write 1 below, carry 1)\\n4. Add hundreds column: 1 + 1 = 2\\n5. Read the complete answer: 212",
  "fun_tip": "Use real objects (coins, blocks) to show place value visually.",
  "topic": "addition"
}`;
    } else {
      // ULTRA-DETAILED KID PROMPT
      prompt = `You are the BEST teacher for kids ages 7-10. Your job is to make them feel SMART and CONFIDENT!

HOMEWORK TO SOLVE:
"""
${homeworkText}
"""

RESPOND ONLY IN: ${langName}

VERY IMPORTANT RULES:
✓ Use SHORT simple sentences (8-12 words MAX per sentence)
✓ Use words they understand (no big words!)
✓ SHOW HOW TO DO IT step by step
✓ Be encouraging and positive
✓ Use EXACTLY ONE emoji at the end (not more!)
✓ Explain WHAT and WHY
✓ Make them feel proud

EXAMPLE - If problem is 15 - 3:

Subtraction means take away!
You have 15, and you take away 3.
Now you have 12 left.
You did it! Great job! 🌟

ANOTHER EXAMPLE - If 147 + 65:

Adding means putting groups together.
147 plus 65 means have 147, then get 65 more.
We add ones (7+5=12), tens (4+6=10, plus 1=11), hundreds (1+1=2).
That's 212! You're awesome! ✨

RETURN ONLY VALID JSON (no markdown, no backticks, NO extra text):
{
  "simple_answer": "212",
  "explanation": "When we add, we put numbers together! 147 + 65 means we have 147 and get 65 more. Ones: 7 + 5 = 12. Tens: 4 + 6 = 10, plus the 1 we carried = 11. Hundreds: 1 + 1 = 2. Answer: 212! You're a math superstar! 🌟",
  "detailed_steps": "1. Write the numbers one on top of the other\\n2. Add the ones (right): 7 + 5 = 12\\n3. Write 2, carry the 1\\n4. Add the tens: 1 + 4 + 6 = 11\\n5. Write 1, carry the 1\\n6. Add the hundreds: 1 + 1 = 2\\n7. Read your answer: 212",
  "fun_tip": "You're doing amazing! Every problem you solve makes you stronger!",
  "topic": "addition"
}`;
    }

    console.log('📝 Calling OpenAI with ULTRA-DETAILED prompt...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.3, // Lower = more consistent, focused
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API failed');
    }

    const responseText = data.choices[0].message.content;
    console.log('📥 Response received, parsing...');

    let explanation;
    try {
      explanation = JSON.parse(responseText);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('⚠️ JSON parse failed, extracting...');
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          explanation = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted and parsed JSON');
        } catch (e2) {
          console.error('❌ Cannot parse JSON:', responseText.substring(0, 200));
          throw new Error('Could not parse API response as JSON');
        }
      } else {
        throw new Error('No JSON found in API response');
      }
    }

    // VALIDATE RESPONSE QUALITY
    if (!explanation.simple_answer) {
      throw new Error('Missing: simple_answer');
    }

    if (!explanation.explanation) {
      throw new Error('Missing: explanation');
    }

    const explanationLength = explanation.explanation.length;
    console.log(`📊 Explanation length: ${explanationLength} characters`);

    // ENFORCE MINIMUM QUALITY
    if (explanationLength < 80) {
      console.error(`❌ Explanation too short (${explanationLength}), requiring detailed response`);
      throw new Error('Explanation too generic, requesting detailed response');
    }

    if (!explanation.detailed_steps) {
      console.warn('⚠️ Missing detailed_steps, using explanation');
      explanation.detailed_steps = explanation.explanation;
    }

    if (!explanation.fun_tip) {
      console.warn('⚠️ Missing fun_tip');
      explanation.fun_tip = parent 
        ? 'Help your child practice this concept regularly.'
        : 'You are doing great! Keep practicing!';
    }

    // VALIDATE TOPIC
    const validTopics = [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'fractions',
      'decimals',
      'algebra',
      'geometry',
      'word-problem',
      'reading',
      'grammar',
      'science',
      'unknown',
    ];

    if (!explanation.topic || !validTopics.includes(explanation.topic)) {
      console.warn(`⚠️ Invalid topic: ${explanation.topic}, defaulting to unknown`);
      explanation.topic = 'unknown';
    }

    console.log('✅ Explanation validated and complete');
    console.log(`📚 Topic: ${explanation.topic}`);
    return explanation;
  } catch (error) {
    console.error('❌ Explanation generation error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lang = req.headers['x-lang'] || 'en';
  const parent = req.headers['x-parent'] === 'true';

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 NEW REQUEST - ${new Date().toLocaleTimeString()}`);
  console.log(`📋 Mode: ${parent ? 'PARENT' : 'KID'} | Language: ${lang}`);
  console.log(`${'='.repeat(60)}`);

  try {
    const bb = busboy({ headers: req.headers });
    let imageBuffer = null;

    return new Promise((resolve) => {
      bb.on('file', (fieldname, file) => {
        if (fieldname !== 'file') {
          file.resume();
          return;
        }

        const chunks = [];

        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', () => {
          imageBuffer = Buffer.concat(chunks);
          console.log(`✅ Image uploaded: ${imageBuffer.length} bytes`);
        });

        file.on('error', (error) => {
          console.error('❌ File error:', error);
          res.status(400).json({ error: 'File upload failed' });
          resolve();
        });
      });

      bb.on('close', async () => {
        try {
          if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('No image data received');
          }

          const imageBase64 = imageBuffer.toString('base64');
          console.log(`📸 Processing image (${imageBuffer.length} bytes)...`);

          // EXTRACT TEXT
          const extractedText = await extractTextFromImage(imageBase64);

          if (!extractedText || extractedText.trim().length < 5) {
            throw new Error('Could not extract text from image');
          }

          console.log(`📄 Text extracted: ${extractedText.length} characters`);

          // GENERATE EXPLANATION
          const explanation = await generateExplanation(extractedText, lang, parent);

          console.log(`\n✅ SUCCESS! Sending response...`);
          console.log(`${'='.repeat(60)}\n`);

          return res.status(200).json({
            success: true,
            extracted_text: extractedText,
            simple_answer: explanation.simple_answer,
            explanation: explanation.explanation,
            detailed_steps: explanation.detailed_steps,
            fun_tip: explanation.fun_tip,
            topic: explanation.topic,
            mode: parent ? 'parent' : 'kid',
          });
        } catch (error) {
          console.error(`❌ ERROR: ${error.message}`);
          console.log(`${'='.repeat(60)}\n`);
          
          return res.status(500).json({
            error: error.message || 'Failed to process homework',
            timestamp: new Date().toISOString(),
          });
        }
      });

      req.pipe(bb);
    });
  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}