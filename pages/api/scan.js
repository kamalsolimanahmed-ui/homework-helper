import formidable from "formidable";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromImage(imagePath) {
  try {
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    console.log("📸 Image loaded, size:", imageBuffer.length, "bytes");

    // Use Claude vision API to extract text (cheaper than OpenAI vision)
    // Or use OpenAI if you prefer
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Has vision capability
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract ALL text from this homework image. Return ONLY the text, nothing else.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Vision API error:", data);
      throw new Error(data.error?.message || "Vision API failed");
    }

    const extractedText = data.choices[0].message.content;
    return extractedText;
  } catch (error) {
    console.error("❌ OCR Error:", error);
    throw new Error("Failed to extract text from image");
  }
}

async function generateExplanation(homeworkText) {
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
            content: `You are a friendly homework tutor for kids ages 3-10. Explain this homework in VERY SIMPLE words.

Homework: "${homeworkText}"

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
      throw new Error(data.error?.message || "API failed");
    }

    const responseText = data.choices[0].message.content;

    let explanation;
    try {
      explanation = JSON.parse(responseText);
    } catch (e) {
      explanation = {
        simple_answer: "Great question!",
        explanation_for_kid: responseText,
        detailed_steps: "1. Read it\n2. Think\n3. Learn!",
        fun_tip: "Keep practicing! 🌟",
      };
    }

    return explanation;
  } catch (error) {
    console.error("❌ Explanation error:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let tempFilePath = null;

  try {
    // Create tmp directory
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Parse multipart form data
    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    tempFilePath = uploadedFile.filepath;

    console.log("✅ File received:", uploadedFile.originalFilename);
    console.log("✅ File size:", uploadedFile.size, "bytes");

    // Step 1: Extract text from image
    console.log("📸 Extracting text from image...");
    const extractedText = await extractTextFromImage(tempFilePath);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: "Could not read text from image. Try a clearer photo!",
      });
    }

    console.log("✅ Text extracted");

    // Step 2: Generate explanation
    console.log("🤖 Generating explanation...");
    const explanation = await generateExplanation(extractedText);

    console.log("✅ Explanation generated");

    // Return success
    return res.status(200).json({
      success: true,
      extracted_text: extractedText,
      simple_answer: explanation.simple_answer,
      explanation_for_kid: explanation.explanation_for_kid,
      detailed_steps: explanation.detailed_steps,
      fun_tip: explanation.fun_tip,
    });
  } catch (error) {
    console.error("❌ Scan API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process image",
    });
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.log("Cleanup warning:", e.message);
      }
    }
  }
}