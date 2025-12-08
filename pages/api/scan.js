import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { extractedText } = req.body;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: "No text provided!",
      });
    }

    console.log("📝 Processing text...");

    const explanation = await generateExplanation(extractedText);

    return res.status(200).json({
      success: true,
      extracted_text: extractedText,
      explanation_for_kid: explanation.explanation_for_kid,
      detailed_steps: explanation.detailed_steps,
      simple_answer: explanation.simple_answer,
      fun_tip: explanation.fun_tip || "Keep learning! 🌟",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process",
    });
  }
}

async function generateExplanation(text) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Explain this homework to a 5-year-old: "${text}"

Return ONLY JSON:
{
  "simple_answer": "1 sentence",
  "explanation_for_kid": "2-3 sentences with example",
  "detailed_steps": "1. Step\\n2. Step\\n3. Step",
  "fun_tip": "Fun memory trick"
}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI API failed");
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}