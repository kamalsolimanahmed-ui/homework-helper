import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    console.log("📸 Opening camera...");
    inputRef.current.click();
  }

  async function handleImageCapture(e) {
    console.log("📸 handleImageCapture triggered");
    console.log("📸 Event:", e);
    console.log("📸 Files object:", e.target.files);

    const file = e.target.files?.[0];

    console.log("📸 File received:", file);
    console.log("📸 File type:", file?.type);
    console.log("📸 File size:", file?.size);
    console.log("📸 File name:", file?.name);

    if (!file) {
      console.error("❌ NO FILE RECEIVED - Camera capture failed or user cancelled");
      alert("❌ No image captured. Please try again.");
      return;
    }

    if (file.size === 0) {
      console.error("❌ FILE SIZE IS 0 - Empty file returned");
      alert("❌ Empty file received. Please try again.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("❌ NOT AN IMAGE - File type:", file.type);
      alert("Please select an image file");
      return;
    }

    console.log("✅ Image captured successfully:", file.name);
    console.log("✅ File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 FormData created");
      console.log("📤 FormData has file:", formData.has("file"));

      const lang = localStorage.getItem("lang") || "en";
      const parentMode = localStorage.getItem("parentMode") === "true";

      console.log("📤 Uploading to /api/scan...");
      console.log("📤 Language:", lang);
      console.log("📤 Parent mode:", parentMode);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        headers: {
          "x-lang": lang,
          "x-parent": parentMode ? "true" : "false",
        },
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", res.headers);

      const data = await res.json();

      console.log("📥 API Response:", data);

      if (!res.ok) {
        console.error("❌ API Error - Status:", res.status);
        console.error("❌ API Error - Message:", data.error);
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

      console.log("✅ Success! Data received:", data);
      console.log("✅ Saving to localStorage...");

      localStorage.setItem("homeworkResult", JSON.stringify(data));

      console.log("✅ Redirecting to /results...");
      router.push("/results");
    } catch (error) {
      console.error("❌ Upload error:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
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
        aria-hidden="true"
      />
    </>
  );
}