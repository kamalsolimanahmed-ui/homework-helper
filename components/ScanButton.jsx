import { useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [homeworkText, setHomeworkText] = useState("");
  const router = useRouter();

  function openCamera() {
    inputRef.current.click();
  }

  async function handleFileCapture(e) {
    const file = e.target.files[0];
    if (!file) return;

    // After user captures, ask them to type the text
    const extractedText = prompt(
      "📸 Photo captured!\n\nType the homework text you see in the photo:"
    );

    if (!extractedText || !extractedText.trim()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Sending to API...");

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: extractedText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + (data.error || "Failed to process"));
        setLoading(false);
        return;
      }

      localStorage.setItem("homeworkResult", JSON.stringify(data));
      router.push("/results");
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
      setLoading(false);
    }
  }

  if (showTextInput) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            📝 Enter Homework
          </h2>

          <textarea
            value={homeworkText}
            onChange={(e) => setHomeworkText(e.target.value)}
            placeholder="Type or paste the homework problem here..."
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #FACC15",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              minHeight: "150px",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          />

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => {
                setShowTextInput(false);
                setHomeworkText("");
              }}
              style={{
                flex: 1,
                padding: "0.75rem",
                backgroundColor: "#9CA3AF",
                color: "white",
                fontWeight: "bold",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (homeworkText.trim()) {
                  setLoading(true);
                  handleFileCapture({ target: { files: [null] } });
                }
              }}
              disabled={loading || !homeworkText.trim()}
              style={{
                flex: 1,
                padding: "0.75rem",
                backgroundColor: "#22C55E",
                color: "white",
                fontWeight: "bold",
                borderRadius: "0.5rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading || !homeworkText.trim() ? 0.5 : 1,
              }}
            >
              {loading ? "⏳ Processing..." : "✅ Submit"}
            </button>
          </div>
        </div>
      </div>
    );
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

      {/* FIX: Use native file input with camera capture - 100% reliable on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        style={{ display: "none" }}
      />
    </>
  );
}