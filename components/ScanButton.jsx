import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    // Tap the hidden input → opens native camera app
    inputRef.current.click();
  }

  async function handleImageCapture(e) {
    const file = e.target.files[0];

    // Validate file exists and is an image
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
      // Create FormData with the real image file
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading to /api/scan...");

      // POST to backend with the actual image
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData, // FormData, not JSON
      });

      const data = await res.json();

      console.log("📥 API Response:", data);

      if (!res.ok) {
        alert("Error: " + (data.error || "Failed to process image"));
        setLoading(false);
        return;
      }

      if (!data.success) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      console.log("✅ Success! Storing result and redirecting...");

      // Store result in localStorage
      localStorage.setItem("homeworkResult", JSON.stringify(data));

      // Redirect to results page
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

      {/* 
        Native file input with camera capture
        - Opens system camera app (NOT browser preview)
        - Returns real image file (NOT empty data)
        - Works 100% on Samsung Chrome
        - No getUserMedia(), no canvas, no memory issues
        - capture="environment" = back camera (homework photos)
        - capture="user" = front camera (selfies)
      */}
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