import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!showCamera) return;

    // Access device camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Camera error:", error);
        setCameraError("Camera not available. Use text input instead.");
      });

    return () => {
      // Stop camera when component unmounts
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera]);

  async function captureAndProcess() {
    try {
      if (!videoRef.current || !canvasRef.current) return;

      // Draw video frame to canvas
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Convert canvas to blob
      canvasRef.current.toBlob(async (blob) => {
        try {
          setLoading(true);

          console.log("📸 Captured image size:", (blob.size / 1024 / 1024).toFixed(2), "MB");

          // Stop camera
          if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          }
          setShowCamera(false);

          // For now, ask user to type the text they see
          const extractedText = prompt(
            "📸 Photo captured!\n\nType the homework text you see in the photo:"
          );

          if (!extractedText || !extractedText.trim()) {
            setLoading(false);
            return;
          }

          console.log("📤 Sending to /api/scan...");

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
            alert("❌ Error: " + (data.error || "Failed to process"));
            setLoading(false);
            return;
          }

          console.log("✅ Success! Storing result...");

          localStorage.setItem("homeworkResult", JSON.stringify(data));
          router.push("/results");
        } catch (error) {
          console.error("❌ Error:", error);
          alert("❌ Error: " + error.message);
          setLoading(false);
        }
      }, "image/jpeg", 0.6);
    } catch (error) {
      console.error("Capture error:", error);
      alert("❌ Error: " + error.message);
      setLoading(false);
    }
  }

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Camera Preview */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Capture Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
            <button
              onClick={() => {
                if (videoRef.current?.srcObject) {
                  videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
                }
                setShowCamera(false);
              }}
              className="px-6 py-3 bg-gray-600 text-white font-bold rounded-full text-lg hover:bg-gray-700"
            >
              ❌ Close
            </button>
            <button
              onClick={captureAndProcess}
              disabled={loading}
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-full text-lg hover:bg-yellow-500 disabled:opacity-50"
            >
              {loading ? "⏳ Processing..." : "📸 Capture"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {cameraError && (
          <div className="bg-red-500 text-white p-4 text-center">
            {cameraError}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowCamera(true)}
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
  );
}