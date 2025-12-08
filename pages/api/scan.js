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

    console.log("📝 Processing homework text...");

    // Call OpenAI GPT-4o-mini
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `You are a friendly homework tutor for kids ages 3-10. Explain this homework in VERY SIMPLE words.

Homework: "${extractedText}"

Return ONLY this JSON (no markdown, no backticks):
{
  "simple_answer": "ONE short sentence a 3yo can understand",
  "explanation_for_kid": "2-3 short sentences with a simple example. Add emojis!",
  "detailed_steps": "1. Simple step\\n2. Next step\\n3. Last step",
  "fun_tip": "One funny way to remember this!"
}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI Error:", data);
      throw new Error(data.error?.message || "OpenAI API failed");
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("No response from OpenAI");
    }

    const responseText = data.choices[0].message.content;

    let explanation;
    try {
      explanation = JSON.parse(responseText);
    } catch (e) {
      console.warn("JSON parse error, using fallback");
      explanation = {
        simple_answer: "Great question!",
        explanation_for_kid: responseText,
        detailed_steps: "1. Read it\n2. Think\n3. Learn!",
        fun_tip: "Keep practicing! 🌟",
      };
    }

    return res.status(200).json({
      success: true,
      extracted_text: extractedText,
      simple_answer: explanation.simple_answer,
      explanation_for_kid: explanation.explanation_for_kid,
      detailed_steps: explanation.detailed_steps,
      fun_tip: explanation.fun_tip,
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process homework",
    });
  }
}