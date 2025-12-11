import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openFileInput() {
    if (inputRef.current) {
      // CRITICAL: Reset input value so same file can be selected twice
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  async function handleFileSelected(e) {
    try {
      const files = e.target.files;
      
      if (!files || files.length === 0) {
        console.log("❌ No files selected - user cancelled");
        return;
      }

      const file = files[0];

      // Verify file exists and has size
      if (!file) {
        console.error("❌ File is null");
        alert("File error: File is null");
        return;
      }

      if (file.size === 0) {
        console.error("❌ File size is 0");
        alert("File error: Empty file (0 bytes)");
        return;
      }

      if (file.size === undefined) {
        console.error("❌ File size is undefined");
        alert("File error: Cannot determine file size");
        return;
      }

      if (!file.type) {
        console.error("❌ File type is undefined");
        alert("File error: Cannot determine file type");
        return;
      }

      if (!file.type.startsWith("image/")) {
        console.error("❌ Not an image:", file.type);
        alert("Please select an image file");
        return;
      }

      console.log("✅ File validation passed");
      console.log("   Name:", file.name);
      console.log("   Type:", file.type);
      console.log("   Size:", (file.size / 1024 / 1024).toFixed(2), "MB");

      setLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Sending to /api/scan");

      const lang = localStorage.getItem("lang") || "en";
      const parentMode = localStorage.getItem("parentMode") === "true";

      // Send to backend
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        headers: {
          "x-lang": lang,
          "x-parent": parentMode ? "true" : "false",
        },
      });

      console.log("📥 Response status:", response.status);

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ API error:", result);
        alert("Error: " + (result.error || "Processing failed"));
        setLoading(false);
        return;
      }

      if (!result.success) {
        console.error("❌ API failure:", result);
        alert("Error: " + (result.error || "Processing failed"));
        setLoading(false);
        return;
      }

      console.log("✅ Processing successful");
      console.log("   Saving results...");

      // Save and redirect
      localStorage.setItem("homeworkResult", JSON.stringify(result));
      console.log("✅ Redirecting to results...");
      router.push("/results");

    } catch (error) {
      console.error("❌ Exception:", error.message);
      alert("Error: " + error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openFileInput}
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
        NUCLEAR FIX:
        - Removed capture="environment" (causes empty files on some Android devices)
        - Using accept="image/*" only (browser handles camera/gallery)
        - Input NOT hidden (stays in DOM for proper mobile browser handling)
        - Using tabIndex="-1" to keep it out of tab order
        - Using pointer-events: none to prevent accidental clicks
        - Input must be accessible to mobile browsers
      */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "0",
          height: "0",
          padding: "0",
          border: "0",
          opacity: "0",
          visibility: "hidden",
          pointerEvents: "none",
        }}
        tabIndex="-1"
        aria-hidden="true"
      />
    </>
  );
}