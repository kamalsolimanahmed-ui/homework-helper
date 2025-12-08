import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

export default function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!showCamera) return;

    setCameraReady(false);
    setCameraError("");

    const startCamera = async () => {
      try {
        console.log("Starting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        console.log("Camera stream obtained");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video ready");
            setCameraReady(true);
          };
        }
      } catch (error) {
        console.error("Camera error:", error);
        setCameraError("Camera failed. Type text instead.");
        setShowCamera(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera]);

  async function captureAndProcess() {
    try {
      if (!videoRef.current || !canvasRef.current) return;

      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(async (blob) => {
        try {
          setLoading(true);

          // Stop camera
          if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          }
          setShowCamera(false);

          // Ask user to type text
          const extractedText = prompt(
            "📸 Photo captured!\n\nType the homework text you see:"
          );

          if (!extractedText || !extractedText.trim()) {
            setLoading(false);
            return;
          }

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
      }, "image/jpeg", 0.6);
    } catch (error) {
      console.error("Capture error:", error);
      alert("Error: " + error.message);
      setLoading(false);
    }
  }

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Camera Preview */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {!cameraReady && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p>Loading camera...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Buttons - Only show when camera ready */}
          {cameraReady && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
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
          )}
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
      className="px-12 py-5 bg-yellow-400 text-black font-bold rounded-full shadow-2xl text-xl hover:bg-yellow-500 hover:scale-105 disabled:opacity-50 transition-all duration-200 z-50 relative"
    >
      {loading ? "⏳ Processing..." : "Homework Scan"}
    </button>
  );
}