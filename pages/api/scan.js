const busboy = require('busboy');

export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromImage(imageBase64) {
  try {
    console.log('📸 Sending image to OpenAI Vision API for text extraction...');

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
                text: 'Extract EVERY SINGLE text, number, equation, word, and detail from this image. Return ONLY the exact content. Include ALL problems/equations you see.',
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
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Vision API error:', data);
      throw new Error(data.error?.message || 'Vision API failed');
    }

    const extractedText = data.choices[0].message.content;
    console.log('✅ Text extracted from image');
    console.log(`📝 Extracted length: ${extractedText.length} characters`);
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
    console.log(`🤖 Generating ${mode} explanation for ALL PROBLEMS in ${langName}...`);

    let prompt = '';

    if (parent) {
      prompt = `You are a professional educator helping PARENTS understand their child's homework.

HOMEWORK SHEET WITH MULTIPLE PROBLEMS:
"""
${homeworkText}
"""

RESPOND ONLY IN: ${langName}

CRITICAL: You must solve ALL problems on this sheet. Not just one!

For EACH problem:
1. State the problem clearly
2. Show step-by-step solution
3. Show the answer
4. Explain why the method works

Then at the end:
5. Identify the main TOPIC (addition, subtraction, multiplication, division, fractions, decimals, algebra, geometry, word-problem, reading, grammar, science, or unknown)

FORMAT - Return ONLY valid JSON (no markdown):
{
  "simple_answer": "List ALL answers separated by \\n. Example: 1) 212\\n2) 18\\n3) 56",
  "explanation": "Solve problem 1... [show work]\\n\\nSolve problem 2... [show work]\\n\\nSolve problem 3... [show work]\\nEtc. for ALL problems.",
  "detailed_steps": "Problem 1:\\n1. Step 1\\n2. Step 2\\n\\nProblem 2:\\n1. Step 1\\n2. Step 2\\nEtc.",
  "fun_tip": "Teaching tip for helping with this type of problem",
  "topic": "addition"
}`;
    } else {
      prompt = `You are the BEST teacher for kids ages 7-10!

HOMEWORK SHEET WITH MULTIPLE PROBLEMS:
"""
${homeworkText}
"""

RESPOND ONLY IN: ${langName}

CRITICAL RULE: Solve EVERY problem on the sheet! Not just one!

For EACH problem, show:
1. What the problem is
2. How to solve it (simple steps)
3. The answer
4. Encouraging message

Keep explanations SHORT and SIMPLE.
Use words kids understand.

Then identify the TOPIC at the end.

FORMAT - Return ONLY valid JSON (no markdown):
{
  "simple_answer": "List all answers. Example: 1) 212\\n2) 18\\n3) 56\\n4) 100",
  "explanation": "Problem 1: [kid-friendly explanation with answer]\\n\\nProblem 2: [explanation]\\n\\nProblem 3: [explanation]\\nEtc. for ALL problems. Make them feel proud!",
  "detailed_steps": "Problem 1:\\n1. Simple step\\n2. Simple step\\n\\nProblem 2:\\n1. Step\\n2. Step\\nEtc.",
  "fun_tip": "You solved ALL the problems! That's awesome!",
  "topic": "addition"
}`;
    }

    console.log('📝 Calling OpenAI to solve ALL problems...');

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
        max_tokens: 3500,
        temperature: 0.3,
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
          console.error('❌ Cannot parse JSON');
          throw new Error('Could not parse API response as JSON');
        }
      } else {
        throw new Error('No JSON found in API response');
      }
    }

    // Validate response
    if (!explanation.simple_answer) throw new Error('Missing: simple_answer');
    if (!explanation.explanation) throw new Error('Missing: explanation');

    const explanationLength = explanation.explanation.length;
    console.log(`📊 Explanation length: ${explanationLength} characters`);

    if (explanationLength < 100) {
      console.error(`❌ Explanation too short (${explanationLength})`);
      throw new Error('Explanation too generic, requesting detailed response');
    }

    if (!explanation.detailed_steps) {
      explanation.detailed_steps = explanation.explanation;
    }

    if (!explanation.fun_tip) {
      explanation.fun_tip = parent 
        ? 'Help your child review all solutions.'
        : 'You solved all the problems! Amazing work!';
    }

    // Validate topic
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

    console.log('✅ All problems solved successfully!');
    console.log(`📚 Topic: ${explanation.topic}`);
    return explanation;
  } catch (error) {
    console.error('❌ Error generating explanations:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lang = req.headers['x-lang'] || 'en';
  const parent = req.headers['x-parent'] === 'true';

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 NEW REQUEST - ${new Date().toLocaleTimeString()}`);
  console.log(`📋 Mode: ${parent ? 'PARENT' : 'KID'} | Language: ${lang}`);
  console.log(`${'='.repeat(70)}`);

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
          console.log(`📋 Preview: ${extractedText.substring(0, 100)}...`);

          // GENERATE EXPLANATION FOR ALL PROBLEMS
          const explanation = await generateExplanation(extractedText, lang, parent);

          console.log(`\n✅ SUCCESS! Sending response with ALL solutions...`);
          console.log(`${'='.repeat(70)}\n`);

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
          console.log(`${'='.repeat(70)}\n`);
          
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