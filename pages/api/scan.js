import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { extractedText } = req.body;

    if (!extractedText?.trim()) {
      return res.status(400).json({ error: "No text provided!" });
    }

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
            content: `Explain to 5yo: "${extractedText}"\n\nReturn JSON only:\n{"simple_answer":"","explanation_for_kid":"","detailed_steps":"","fun_tip":""}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message);

    return res.status(200).json({
      success: true,
      extracted_text: extractedText,
      ...JSON.parse(data.choices[0].message.content),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}