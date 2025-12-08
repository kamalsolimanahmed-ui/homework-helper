import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    // This opens native camera app - NOT browser camera
    inputRef.current.click();
  }

  async function handleImageCapture(e) {
    const file = e.target.files[0];
    
    // Validation: file must exist and be an image
    if (!file) {
      console.error("❌ No file selected");
      alert("No image selected. Please try again.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("❌ Not an image file");
      alert("Please select an image file.");
      return;
    }

    console.log("✅ File received:", file.name);
    console.log("✅ File size:", (file.size / 1024 / 1024).toFixed(2), "MB");
    console.log("✅ File type:", file.type);

    setLoading(true);

    try {
      // Create FormData with the actual image file
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading to /api/scan...");

      // Send to backend
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData, // FormData, NOT JSON
      });

      const data = await res.json();

      console.log("📥 Response:", data);

      if (!res.ok) {
        console.error("❌ API error:", data);
        alert("Error: " + (data.error || "Failed to process image"));
        setLoading(false);
        return;
      }

      if (!data.success) {
        console.error("❌ API returned failure:", data);
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      console.log("✅ Success! Storing result...");

      // Store and redirect
      localStorage.setItem("homeworkResult", JSON.stringify(data));
      router.push("/results");
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Error: " + error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openCamera}
        disabled={loading}
        style={{
          paddingLeft: "3rem",
          paddingRight: "3rem",
          paddingTop: "1.25rem",
          paddingBottom: "1.25rem",
          backgroundColor: "#FACC15",
          color: "black",
          fontWeight: "bold",
          borderRadius: "9999px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          fontSize: "1.25rem",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          transition: "all 200ms",
        }}
      >
        {loading ? "⏳ Processing..." : "Homework Scan"}
      </button>

      {/* 
        Native file input with capture attribute
        - Opens native camera app (NOT browser camera)
        - Works 100% on Samsung Chrome
        - Returns actual file data (NOT empty)
        - No canvas, no memory issues
      */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleImageCapture}
        style={{ display: "none" }}
      />
    </>
  );
}