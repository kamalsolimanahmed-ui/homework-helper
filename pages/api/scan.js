import formidable from "formidable";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function generateExplanationWithGPT(homeworkText) {
  try {
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
            content: `You are a super friendly homework tutor for kids ages 3-10. Use VERY SIMPLE words, short sentences, and lots of emojis!

Homework text: "${homeworkText}"

IMPORTANT RULES:
- Use words a 3-year-old can understand
- Keep sentences SHORT (5-10 words max)
- Add emojis to make it FUN 🎉
- Use examples kids know (toys, candies, friends, animals)
- Don't use big words or technical terms
- Make it feel like a friend talking, not a teacher
- Be silly and fun!

Return ONLY this JSON (no markdown, no backticks):
{
  "simple_answer": "ONE very short sentence (a 3yo can understand)",
  "explanation_for_kid": "2-3 short sentences with an easy toy/candy example. Add emojis!",
  "detailed_steps": "1. First super simple step\\n2. Next step\\n3. Last step\\n(each step = 1 sentence max)",
  "fun_tip": "One funny way to remember it. Make it silly and fun!"
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
      return await generateExplanationWithDeepSeek(homeworkText);
    }

    const responseText = data.choices[0].message.content;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      parsedResponse = {
        simple_answer: "Here's the answer! 🎉",
        explanation_for_kid: responseText,
        detailed_steps: "1. Read it 📖\n2. Think about it 🤔\n3. You got it! 🌟",
        fun_tip: "Keep learning and have fun! 🚀",
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error("GPT Error:", error);
    return await generateExplanationWithDeepSeek(homeworkText);
  }
}

async function generateExplanationWithDeepSeek(homeworkText) {
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `You are a super friendly homework tutor for kids ages 3-10. Use VERY SIMPLE words, short sentences, and lots of emojis!

Homework text: "${homeworkText}"

IMPORTANT RULES:
- Use words a 3-year-old can understand
- Keep sentences SHORT (5-10 words max)
- Add emojis to make it FUN 🎉
- Use examples kids know (toys, candies, friends, animals)
- Don't use big words or technical terms
- Make it feel like a friend talking, not a teacher
- Be silly and fun!

Return ONLY this JSON (no markdown, no backticks):
{
  "simple_answer": "ONE very short sentence (a 3yo can understand)",
  "explanation_for_kid": "2-3 short sentences with an easy toy/candy example. Add emojis!",
  "detailed_steps": "1. First super simple step\\n2. Next step\\n3. Last step\\n(each step = 1 sentence max)",
  "fun_tip": "One funny way to remember it. Make it silly and fun!"
}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "DeepSeek API error");
    }

    const responseText = data.choices[0].message.content;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      parsedResponse = {
        simple_answer: "Here's the answer! 🎉",
        explanation_for_kid: responseText,
        detailed_steps: "1. Read it 📖\n2. Think about it 🤔\n3. You got it! 🌟",
        fun_tip: "Keep learning and have fun! 🚀",
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error("DeepSeek Error:", error);
    throw new Error("Failed to generate explanation");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let tempFilePath = null;

  try {
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // INCREASED maxFileSize to 15MB for mobile images
    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 15 * 1024 * 1024, // 15MB (was 5MB)
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    tempFilePath = uploadedFile.filepath;

    // Extract text from request body (sent as JSON from frontend compression)
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
      req.on("error", reject);
    });

    const extractedText = body.extractedText;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: "No text provided. Try a clearer photo!",
      });
    }

    console.log("📝 Received text, generating explanation...");
    const explanation = await generateExplanationWithGPT(extractedText);

    console.log("✅ Explanation generated!");

    return res.status(200).json({
      success: true,
      extracted_text: extractedText,
      explanation_for_kid: explanation.explanation_for_kid,
      detailed_steps: explanation.detailed_steps,
      simple_answer: explanation.simple_answer,
      fun_tip: explanation.fun_tip || "Keep learning! 🌟",
    });
  } catch (error) {
    console.error("❌ Scan API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process homework",
    });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.log("Cleanup warning:", e.message);
      }
    }
  }
}