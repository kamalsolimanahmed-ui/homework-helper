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
  "subject": "math|reading|phonics|vocabulary|antonym|synonym|animal|color|body|geography|science|history",
  "skill": "brief skill name (e.g., '3-digit addition with carry', 'phonics sh sound')",
  "grade_level": "K|1|2|3|4|5|6|7|8|9|10",
  "difficulty": "easy|medium|hard",
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

    const topicMap = {
      'addition': 'addition',
      'subtraction': 'subtraction',
      'multiplication': 'multiplication',
      'division': 'division',
      'phonics': 'reading',
      'reading': 'reading',
      'vocabulary': 'vocabulary',
      'antonym': 'antonym',
      'synonym': 'synonym',
      'animal': 'animal',
      'color': 'color',
      'body': 'body',
      'geography': 'geography',
      'capital': 'geography',
      'science': 'vocabulary',
      'history': 'vocabulary'
    };

    const topic = topicMap[result.subject.toLowerCase()] || result.subject.toLowerCase();

    console.log(`✅ Detected: ${result.subject} - ${result.skill} (confidence: ${result.confidence})`);

    return res.status(200).json({
      success: true,
      subject: result.subject,
      skill: result.skill,
      topic: topic,
      grade_level: result.grade_level,
      difficulty: result.difficulty,
      confidence: result.confidence,
      language: language,
      message: `✅ Matches today's homework: ${result.skill}`,
    });
  } catch (error) {
    console.error('Detection error:', error);
    return res.status(500).json({ error: 'Failed to detect homework' });
  }
}