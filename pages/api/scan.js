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

async function generateExplanation(homeworkText, lang = 'en') {
  try {
    let langName = 'English';
    if (lang === 'fr') langName = 'French';
    if (lang === 'de') langName = 'German';
    if (lang === 'es') langName = 'Spanish';
    if (lang === 'ar') langName = 'Arabic';

    console.log(`🎯 Generating CLEAR simple explanations in ${langName}...`);

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
            content: `Explain math for kids ages 7-10 in ${langName}.

Homework:
"${homeworkText}"

RULES (MUST FOLLOW):
✓ Use VERY SHORT sentences (5-10 words MAX)
✓ No long stories or paragraphs
✓ Use only 1-2 emojis total per problem
✓ Show clear math thinking
✓ Use simple real-life examples
✓ Maximum 3-4 lines per problem
✓ Fun but NOT silly

FOR EACH PROBLEM, use this EXACT format:

Problem X: [the equation]

simple_answer: [just the answer number]

explanation_for_kid: 
[2-4 SHORT sentences. One sentence per line. Each sentence 5-10 words.]

detailed_steps:
• Step 1 (5-10 words)
• Step 2 (5-10 words)
• Step 3 (5-10 words)

fun_tip: [One short encouraging sentence]

---

EXAMPLE (follow EXACTLY):

Problem 1: 147 + 65

simple_answer: 212

explanation_for_kid:
You have 147 things.
You get 65 more things.
Now count them all together.
That's 212 things!

detailed_steps:
• Put 147 in your head
• Add 65 more to it
• You get 212

fun_tip: Adding is just counting up!

---

NOW ANSWER FOR ALL PROBLEMS in ${langName}:

${homeworkText}

Return only JSON (no markdown):
{
  "simple_answer": "All answers solved!",
  "explanation_for_kid": "[Format all problems as above]",
  "detailed_steps": "1. Read each problem\\n2. Count carefully\\n3. Write the answer",
  "fun_tip": "You're doing great! Keep practicing!"
}`,
          },
        ],
        max_tokens: 3500,
        temperature: 0.8,
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
        simple_answer: 'All problems solved!',
        explanation_for_kid: responseText,
        detailed_steps: '1. Read the problem\n2. Do the math\n3. Write the answer',
        fun_tip: 'Great job! You can do this!',
      };
    }

    console.log('✅ Simple clear explanations generated');
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

  const lang = req.headers['x-lang'] || 'en';

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

          const explanation = await generateExplanation(extractedText, lang);

          console.log('✅ Success! Sending clear homework help...');
          return res.status(200).json({
            success: true,
            extracted_text: extractedText,
            simple_answer: explanation.simple_answer,
            explanation_for_kid: explanation.explanation_for_kid,
            detailed_steps: explanation.detailed_steps,
            fun_tip: explanation.fun_tip,
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