import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    inputRef.current.click();
  }

  async function handleImageCapture(e) {
    const file = e.target.files[0];

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
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading to /api/scan...");

      const lang = localStorage.getItem("lang") || "en";

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        headers: {
          "x-lang": lang,
        },
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