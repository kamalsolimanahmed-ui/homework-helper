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
    
    // DEBUG: Check if API key exists
    console.log("🔑 API Key check:");
    console.log("   OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ FOUND" : "❌ NOT FOUND");
    console.log("   DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY ? "✅ FOUND" : "❌ NOT FOUND");

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
    
    console.log("🔑 Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "NONE");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set in Vercel environment variables");
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

Return ONLY JSON (no markdown):
{
  "simple_answer": "1 short sentence",
  "explanation_for_kid": "2-3 simple sentences with example",
  "detailed_steps": "1. First\\n2. Then\\n3. Done",
  "fun_tip": "Fun memory trick"
}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    
    console.log("📤 API Response status:", response.status);

    if (!response.ok) {
      console.error("❌ OpenAI Error:", data);
      throw new Error(data.error?.message || "OpenAI API failed");
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("No response from OpenAI");
    }

    const responseText = data.choices[0].message.content;
    console.log("✅ Raw response:", responseText);

    return JSON.parse(responseText);
  } catch (error) {
    console.error("❌ API Error:", error.message);
    throw error;
  }
}