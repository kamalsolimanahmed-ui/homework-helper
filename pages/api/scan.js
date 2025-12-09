import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

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
    const { files } = await parseForm(req);

    const uploaded = files.file;
    if (!uploaded) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = await fs.promises.readFile(uploaded.filepath);
    const base64 = buffer.toString("base64");

    const text = await extractText(base64);
    const result = await explain(text);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("❌ API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
