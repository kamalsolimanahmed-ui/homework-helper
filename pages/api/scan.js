export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractText(base64) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
          content: [
            { type: "text", text: "Extract all text from this image." },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
    }),
  });

  const json = await res.json();
  return json.choices[0].message.content;
}

async function explain(text) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
          content: `Return this JSON only:
{
 "simple_answer": "",
 "explanation_for_kid": "",
 "detailed_steps": "",
 "fun_tip": ""
}
Explain this: ${text}`,
        },
      ],
    }),
  });

  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

export default async function handler(req, res) {
  try {
    const form = await req.formData();        // <— THIS replaces Busboy & Formidable
    const file = form.get("file");

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const text = await extractText(base64);
    const result = await explain(text);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
