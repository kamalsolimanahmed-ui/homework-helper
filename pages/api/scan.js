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

    console.log(`🏆 Generating AWARD-WINNING explanations in ${langName}...`);

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
            content: `You are a LEGENDARY 30+ YEAR AWARD-WINNING TEACHER. Your explanations have won international teaching awards. You make kids FALL IN LOVE with learning.

Your teaching style:
✓ Tell STORIES not just facts
✓ Connect to REAL LIFE (pizza, friends, games, animals they love)
✓ Use SENSORY details (see, hear, feel, taste, smell)
✓ Make kids feel like HEROES on a quest
✓ Use BRAIN SCIENCE memory tricks
✓ Make them LAUGH while learning
✓ Challenge them to think DEEPER
✓ Celebrate their INTELLIGENCE

Homework to teach:
"${homeworkText}"

GOLDEN EXPLANATION FORMAT (AWARD-WINNING):

For EACH problem follow this EXACT structure:

📍 PROBLEM: [Show the equation]

🎯 THE QUEST: [Tell a story that matches the problem]
Example: "Imagine you're collecting pizza slices for a party..."

💭 HOW THE MIND WORKS: [Brain science trick to remember]
Example: "Your brain LOVES stories! When you see 147 + 65, imagine 147 kids + 65 more kids joining..."

🧠 THE MEMORY TRICK: [Use association/rhyme/pattern]
Example: "147 + 65 = 212... Think: '2-1-2 is like a sandwich: cheese in middle!' 🥪"

⚡ THE ANSWER: [Bold and celebrate]
Answer = ${homeworkText} emoji

🎨 WHY THIS MATTERS: [Real world connection]
Example: "This helps you count money, trading cards, candy, friends, ANYTHING you collect!"

🏆 YOU ARE A GENIUS IF YOU: [Challenge question]
Example: "Can you figure out 212 - 65? (You already know the answer!)"

---

CRITICAL RULES:
• Tell STORIES for each problem (not just math)
• Use SENSORY words (imagine, see, hear, feel)
• Include BRAIN SCIENCE (how memory works)
• Make them feel like HEROES
• Use REAL THINGS kids love (games, food, friends, animals)
• EMOTIONAL connection not just facts
• Challenge them to think DEEPER
• Make them LAUGH (humor + learning = best)
• CELEBRATE their intelligence
• NUMBER each problem clearly

Answer in ${langName} ONLY. Make it WORLD-CLASS.

Return this JSON:
{
  "simple_answer": "🏆 You're about to become a MATH GENIUS! 🧠",
  "explanation_for_kid": "[Use EXACT format above - tell stories, use sensory words, brain science, real-world connections, challenges, celebration - for EACH problem with clear separation]",
  "detailed_steps": "1. Read the STORY behind each problem\\n2. Visualize it in your mind (imagine it!)\\n3. Remember the memory trick (it sticks!)\\n4. Use it anywhere you count\\n5. Challenge yourself with the GENIUS question!",
  "fun_tip": "The BEST learners are storytellers! When you learn through stories, your brain keeps it FOREVER! Try teaching someone else - THAT'S when you know you're a genius! 🌟"
}`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.95,
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
        simple_answer: '🏆 You\'re about to become a GENIUS! 🧠',
        explanation_for_kid: responseText,
        detailed_steps: '1. Read the story\n2. Visualize it\n3. Remember the trick\n4. Use it everywhere\n5. Become a genius!',
        fun_tip: 'The best learners are storytellers! 🌟',
      };
    }

    console.log('✅ AWARD-WINNING explanations generated');
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

          console.log('✅ Success! Sending AWARD-WINNING homework help...');
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