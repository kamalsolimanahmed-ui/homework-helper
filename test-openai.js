import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envLines = envContent.split("\n");

let openaiKey = "";
for (const line of envLines) {
  if (line.startsWith("OPENAI_API_KEY=")) {
    openaiKey = line.split("=")[1].trim();
    break;
  }
}

async function testOpenAI() {
  console.log("🧪 Testing OpenAI API...");
  console.log("API Key:", openaiKey ? "✅ Found: " + openaiKey.substring(0, 10) + "..." : "❌ NOT FOUND");

  if (!openaiKey) {
    console.error("❌ No API key found in .env.local");
    return;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Say 'Hello' in one word",
          },
        ],
        max_tokens: 50,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ OpenAI Error:", data);
      return;
    }

    console.log("✅ OpenAI Works!");
    console.log("Response:", data.choices[0].message.content);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testOpenAI();