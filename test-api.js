const fs = require("fs");
const path = require("path");

async function testAPI() {
  const imagePath = path.join(__dirname, "public/test-image.jpg");
  
  if (!fs.existsSync(imagePath)) {
    console.error("❌ test-image.jpg not found in public folder!");
    console.log("📁 Add an image file to public/ folder first");
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  formData.append("file", blob, "test-image.jpg");

  try {
    const res = await fetch("http://localhost:3000/api/scan", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("✅ API Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAPI();