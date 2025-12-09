import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    // Click hidden input → opens native camera app
    inputRef.current.click();
  }

  async function handleImageCapture(e) {
    const file = e.target.files[0];

    // File validation
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    console.log("✅ Image captured:", file.name);
    console.log("✅ File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

    setLoading(true);

    try {
      // Create FormData with REAL image file
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading to /api/scan...");

      // Send to backend - NO manual Content-Type header!
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData, // Let browser set Content-Type automatically
      });

      const data = await res.json();

      console.log("📥 API Response:", data);

      if (!res.ok) {
        console.error("❌ API Error:", data);
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

      console.log("✅ Success! Redirecting to results...");

      // Store and redirect
      localStorage.setItem("homeworkResult", JSON.stringify(data));
      router.push("/results");
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("Error: " + error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openCamera}
        disabled={loading}
        className="
          px-12 py-5
          bg-yellow-400 
          text-black 
          font-bold 
          rounded-full
          shadow-2xl 
          text-xl
          hover:bg-yellow-500 
          hover:scale-105
          disabled:opacity-50
          transition-all
          duration-200
          z-50
          relative
        "
      >
        {loading ? "⏳ Processing..." : "Homework Scan"}
      </button>

      {/* Native camera input - NO getUserMedia, NO canvas, NO prompt fallback */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageCapture}
        className="hidden"
      />
    </>
  );
}