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

    const mode = parent ? 'PARENT (professional)' : 'KID (simple)';
    console.log(`🤖 Generating ${mode} explanations in ${langName}...`);

    // CONSTRUCT PROMPT BASED ON MODE
    const modeInstructions = parent ? `
PARENT MODE - PROFESSIONAL EXPLANATION:
• Clear, logical reasoning
• Short professional paragraphs
• ZERO emojis
• Adult vocabulary
• Direct step-by-step
• Explain WHY the method works
• Trustworthy tone
• No storytelling or silly examples
` : `
KID MODE - SIMPLE EXPLANATION (ages 7-10):
• Very short sentences (5-12 words max)
• Encouraging and supportive tone
• Simple vocabulary kids understand
• Max 1-2 emojis TOTAL (not per line)
• No long stories or paragraphs
• Clear math logic, not dramatic
• Say things like: "Let's solve it together!"
• Good for kids who struggle
`;

    const topicInstructions = `
TOPIC CLASSIFICATION:
Analyze the homework and return the topic in English ONLY:
- "addition" (adding numbers)
- "subtraction" (subtracting numbers)
- "multiplication" (times/multiply)
- "division" (divide/split)
- "fractions" (parts of whole numbers)
- "decimals" (numbers with dots)
- "algebra" (equations with letters like x)
- "geometry" (shapes, angles, areas)
- "word-problem" (story math problems)
- "reading" (reading comprehension)
- "grammar" (grammar rules, spelling)
- "science" (science topics)
- "unknown" (if you can't tell)

Return the EXACT word from the list above. This MUST be in English.
`;

    const prompt = `You are a homework tutor. ${modeInstructions}

Homework:
"${homeworkText}"

${topicInstructions}

Respond in ${langName} ONLY (but topic must be English).

For EACH problem:

Problem X: [equation]

simple_answer: [just the answer number]

explanation:
[${parent ? '2-3 clear sentences explaining the logic' : '2-4 short sentences, 5-12 words each'}]

detailed_steps:
• Step 1
• Step 2
• Step 3

fun_tip: [${parent ? 'one professional tip' : 'one encouraging sentence'}]

---

Return ONLY JSON (no markdown):
{
  "simple_answer": "all problems solved",
  "explanation": "[entire explanation for all problems]",
  "detailed_steps": "1. Read\\n2. Calculate\\n3. Check",
  "fun_tip": "[${parent ? 'A professional insight' : 'An encouraging message'}]",
  "topic": "[ENGLISH word from the list above]"
}`;

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
        max_tokens: 3000,
        temperature: parent ? 0.7 : 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Explanation API error:', data);
      throw new Error(data.error?.message || 'Explanation API failed');
    }

    const responseText = data.choices[0].message.content;

    let explanation;
    try {
      explanation = JSON.parse(responseText);
    } catch (e) {
      console.warn('JSON parse error, using fallback');
      explanation = {
        simple_answer: 'Problem solved',
        explanation: responseText,
        detailed_steps: '1. Read\n2. Calculate\n3. Check',
        fun_tip: parent ? 'Practice helps!' : 'Great effort!',
        topic: 'unknown',
      };
    }

    console.log('✅ Explanation generated');
    return explanation;
  } catch (error) {
    console.error('❌ Explanation error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // READ HEADERS
  const lang = req.headers['x-lang'] || 'en';
  const parent = req.headers['x-parent'] === 'true';

  try {
    const bb = busboy({ headers: req.headers });
    let imageBuffer = null;
    let fileName = '';

    return new Promise((resolve) => {
      bb.on('file', (fieldname, file, info) => {
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
          fileName = info.filename;
          console.log(`✅ File received: ${fileName}, size: ${imageBuffer.length} bytes`);
        });

        file.on('error', (error) => {
          console.error('File stream error:', error);
          res.status(400).json({ error: 'Failed to upload file' });
          resolve();
        });
      });

      bb.on('close', async () => {
        try {
          if (!imageBuffer || imageBuffer.length === 0) {
            console.error('❌ No file data received');
            return res.status(400).json({ error: 'No file uploaded' });
          }

          console.log(`📦 Processing image: ${imageBuffer.length} bytes`);

          const imageBase64 = imageBuffer.toString('base64');

          const extractedText = await extractTextFromImage(imageBase64);

          if (!extractedText || extractedText.trim().length === 0) {
            console.error('❌ No text extracted from image');
            return res.status(400).json({
              error: 'Could not read text from image. Try a clearer photo!',
            });
          }

          console.log('📝 Extracted text:', extractedText.substring(0, 100) + '...');

          // PASS PARENT MODE TO FUNCTION
          const explanation = await generateExplanation(extractedText, lang, parent);

          console.log('✅ Success! Sending homework help...');
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
          console.error('❌ API Error:', error);
          return res.status(500).json({
            error: error.message || 'Failed to process image',
          });
        }
      });

      req.pipe(bb);
    });
  } catch (error) {
    console.error('❌ Handler Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}