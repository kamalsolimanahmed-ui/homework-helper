import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    inputRef.current.click();
  }

  async function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.5
          );
        };
        
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function extractTextWithTesseract(blob) {
    try {
      // Check if Tesseract is loaded
      if (!window.Tesseract) {
        throw new Error("OCR library not loaded");
      }

      const { createWorker } = window.Tesseract;
      const worker = await createWorker();
      const result = await worker.recognize(blob);
      await worker.terminate();

      return result.data.text;
    } catch (error) {
      console.error("Tesseract OCR error:", error);
      throw new Error("Failed to extract text - please try a clearer image");
    }
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    setLoading(true);

    try {
      console.log("📸 File selected:", file.name);
      console.log("📸 Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");
      
      // Compress image
      const compressedBlob = await compressImage(file);
      console.log("✅ Compressed to:", (compressedBlob.size / 1024 / 1024).toFixed(2), "MB");

      console.log("🔍 Extracting text with OCR...");
      
      // Extract text using Tesseract OCR
      const extractedText = await extractTextWithTesseract(compressedBlob);
      
      if (!extractedText || extractedText.trim().length === 0) {
        alert("❌ Could not read text. Try a clearer photo!");
        setLoading(false);
        return;
      }

      console.log("✅ Text extracted:", extractedText);
      console.log("📤 Sending to /api/scan...");

      // Send ONLY text to backend (no file upload)
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: extractedText,
        }),
      });

      console.log("Response status:", res.status);

      const data = await res.json();

      console.log("Response data:", data);

      if (!res.ok) {
        console.error("API Error:", data);
        alert("❌ Error: " + (data.error || "Failed to process"));
        setLoading(false);
        return;
      }

      console.log("✅ Success! Storing result...");

      // Store result
      localStorage.setItem("homeworkResult", JSON.stringify(data));
      
      console.log("📍 Redirecting to /results...");
      router.push("/results");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Error: " + error.message);
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
        type="file"
        accept="image/*"
        capture="environment"
        ref={inputRef}
        onChange={uploadImage}
        className="hidden"
      />
    </>
  );
}