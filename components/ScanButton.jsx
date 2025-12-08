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
          
          // Calculate new dimensions (max width 1200px)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.7 quality
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
        };
        
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      console.log("📸 Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");
      
      // Compress image
      const compressedBlob = await compressImage(file);
      console.log("✅ Compressed to:", (compressedBlob.size / 1024 / 1024).toFixed(2), "MB");

      // Create FormData with compressed image
      const formData = new FormData();
      formData.append("file", compressedBlob, "homework.jpg");

      // Send to backend
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ Error: " + (data.error || "Failed to process"));
        setLoading(false);
        return;
      }

      // Store result
      localStorage.setItem("homeworkResult", JSON.stringify(data));
      router.push("/results");
    } catch (error) {
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