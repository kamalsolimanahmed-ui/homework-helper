import { useState, useRef } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  async function startCamera() {
    try {
      setCameraError("");
      setCameraReady(false);

      console.log("Starting camera...");

      // FIX #3: Use facingMode with ideal
      // FIX #6: Add stream logging
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      console.log("✅ STREAM STARTED:", stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video ready");
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error("❌ Camera Error:", error.message);
      setCameraError(`Camera failed: ${error.message}`);
      setShowCamera(false);
    }
  }

  async function captureAndProcess() {
    try {
      if (!videoRef.current || !canvasRef.current) return;

      // Draw video to canvas
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Stop camera
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }

      setShowCamera(false);
      setCameraReady(false);

      // Ask user to type text
      const extractedText = prompt(
        "📸 Photo captured!\n\nType the homework text you see:"
      );

      if (!extractedText || !extractedText.trim()) {
        return;
      }

      setLoading(true);
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
        alert("Error: " + (data.error || "Failed"));
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

  if (showCamera) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "black",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* FIX #1: Explicit video sizing + FIX #4: muted attribute */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!cameraReady && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <div style={{ color: "white", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                <p>Loading camera...</p>
              </div>
            </div>
          )}

          {/* FIX #1: Explicit inline styles for video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "black",
            }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Buttons - only show when camera ready */}
          {cameraReady && (
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    videoRef.current.srcObject
                      .getTracks()
                      .forEach((track) => track.stop());
                  }
                  setShowCamera(false);
                  setCameraReady(false);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#4B5563",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "9999px",
                  fontSize: "1.125rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ❌ Close
              </button>

              <button
                onClick={captureAndProcess}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: loading ? "#CCAA00" : "#FACC15",
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "9999px",
                  fontSize: "1.125rem",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "⏳ Processing..." : "📸 Capture"}
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {cameraError && (
          <div
            style={{
              backgroundColor: "#EF4444",
              color: "white",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            {cameraError}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setShowCamera(true);
          // FIX #2: Start camera on click, not on mount
          setTimeout(() => startCamera(), 100);
        }}
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
    </>
  );
}