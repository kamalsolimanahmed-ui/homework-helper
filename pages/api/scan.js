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

async function generateExplanation(homeworkText) {
  try {
    console.log('🤖 Generating funny memorable explanations...');

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
            content: `You are a FUNNY, SILLY homework tutor for kids ages 3-10. Make them LAUGH while they learn!

Homework to help with:
"${homeworkText}"

SOLVE EVERY PROBLEM and make FUNNY JOKES about each answer!

Format EXACTLY like this with EACH answer on its OWN LINE:
1. [Problem] = [Answer] 😂 [FUNNY MEMORY TRICK]
2. [Problem] = [Answer] 🤣 [SILLY JOKE]
3. [Problem] = [Answer] 😆 [FUNNY ANALOGY]
(Keep going for EVERY problem)

Examples of FUNNY tricks:
- "147 + 65 = 212! It's like 147 pizza slices + 65 more = SO MUCH PIZZA YOU'LL EXPLODE! 🍕💥"
- "249 + 54 = 303! Like 249 penguins + 54 more = A PENGUIN ARMY MARCHING! 🐧🐧🐧"
- "480 + 96 = 576! It's 480 bananas + 96 more = ENOUGH TO SLIP ON FOREVER! 🍌😂"

Return ONLY this JSON (no markdown, no backticks):
{
  "simple_answer": "Here's your homework solved with FUNNY tricks to remember! 😂",
  "explanation_for_kid": "FUNNY ANSWERS:\\n(Format with EACH answer on its own line with FUNNY emojis and jokes)",
  "detailed_steps": "1. Look at the funny joke for each problem\\n2. The joke will STICK IN YOUR BRAIN\\n3. You'll NEVER forget the answer!\\n4. Now YOU tell your friends the funny joke!",
  "fun_tip": "Share these FUNNY tricks with your friends! Whoever laughs the hardest remembers best! 🎉"
}`,
          },
        ],
        max_tokens: 2500,
        temperature: 0.9,
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
        simple_answer: 'Here are all the answers with FUNNY jokes!',
        explanation_for_kid: responseText,
        detailed_steps: '1. Read the funny joke\n2. Remember the answer\n3. Tell your friends!\n4. LAUGH together!',
        fun_tip: 'The sillier the joke, the better you remember! 🎉',
      };
    }

    console.log('✅ Funny explanations generated');
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

          const explanation = await generateExplanation(extractedText);

          console.log('✅ Success! Sending homework help with FUNNY tricks...');
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