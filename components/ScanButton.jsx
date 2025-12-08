import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openCamera() {
    inputRef.current.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      console.log("📸 File selected:", file.name);
      console.log("📸 File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

      // Ask user to type homework text from the photo
      const extractedText = prompt(
        "📸 Photo captured!\n\nType the homework text you see in the photo:"
      );

      if (!extractedText || !extractedText.trim()) {
        setLoading(false);
        return;
      }

      console.log("📤 Sending to /api/scan...");

      // Send text to backend
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: extractedText.trim(),
        }),
      });

      const data = await res.json();

      console.log("Response:", data);

      if (!res.ok) {
        alert("❌ Error: " + (data.error || "Failed to process"));
        setLoading(false);
        return;
      }

      console.log("✅ Success! Storing result...");

      // Store result
      localStorage.setItem("homeworkResult", JSON.stringify(data));

      // Redirect to results
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

      {/* Native file input - works on all phones */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
    </>
  );
}