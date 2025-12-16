import { useRef, useState, useEffect, useCallback } from "react";

export default function ScanButton() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(false);
  const cameraStartingRef = useRef(false); // FIX 1: Lock to prevent multiple getUserMedia calls

  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  // Detect mobile
  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(mobile);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      setCameraOpen(false); // FIX 4: Clear UI state on unmount
      cameraStartingRef.current = false; // FIX 4: Reset lock on unmount
    };
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // ============ PROCESS FILE ============
  const processFile = useCallback(async (fileOrBlob) => {
    if (processingRef.current) {
      console.log("⚠️ Already processing");
      return;
    }
    processingRef.current = true;

    try {
      console.log("📸 Processing:", fileOrBlob?.size, "bytes");

      if (!fileOrBlob || fileOrBlob.size === 0) {
        throw new Error("No image data");
      }

      setStatusText("Uploading...");

      const formData = new FormData();
      formData.append("file", fileOrBlob, "photo.jpg");

      const lang = localStorage.getItem("lang") || "en";
      const parentMode = localStorage.getItem("parentMode") === "true";

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        headers: {
          "x-lang": lang,
          "x-parent": parentMode ? "true" : "false",
        },
      });

      const result = await response.json();
      console.log("📥 Response:", response.status);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Processing failed");
      }

      // FIX 3: Stop camera before navigation
      stopCamera();
      setCameraOpen(false);

      localStorage.setItem("homeworkResult", JSON.stringify(result));
      setStatusText("Done!");

      // Use window.location - most reliable on mobile
      window.location.href = "/results";

    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error: " + error.message);
      setLoading(false);
      setStatusText("");
      processingRef.current = false;
    }
  }, [stopCamera]);

  // ============ FILE PICKER (UPLOAD) ============
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("📄 File selected:", file.name);
      setLoading(true);
      setStatusText("Processing...");
      processFile(file);
    }
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }, [processFile]);

  const openFilePicker = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (loading) return;
    
    // IMPORTANT: Remove capture attribute to open gallery/file picker
    if (inputRef.current) {
      inputRef.current.removeAttribute("capture");
      inputRef.current.click();
    }
  }, [loading]);

  // ============ CUSTOM CAMERA (getUserMedia) ============
  const openCamera = useCallback(async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (loading || cameraStartingRef.current) return; // FIX 2: Add lock check

    try {
      cameraStartingRef.current = true; // FIX 2: Set lock before starting
      setCameraOpen(true);
      setCameraReady(false);
      setStatusText("Starting camera...");

      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Wait for video element to be available
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setCameraReady(true);
              setStatusText("");
            })
            .catch((err) => {
              console.error("Play error:", err);
              setCameraReady(true);
              setStatusText("");
            });
        };
      }
    } catch (error) {
      console.error("❌ Camera error:", error);
      cameraStartingRef.current = false; // FIX 2: Reset lock on error
      setCameraOpen(false);
      setStatusText("");
      
      if (error.name === "NotAllowedError") {
        alert("Camera permission denied. Please allow camera access and try again, or use 'Upload Photo' instead.");
      } else if (error.name === "NotFoundError") {
        alert("No camera found. Please use 'Upload Photo' instead.");
      } else {
        alert("Camera error: " + error.message + "\n\nTry 'Upload Photo' instead.");
      }
    }
  }, [loading]);

  const closeCamera = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    stopCamera();
    setCameraOpen(false);
    cameraStartingRef.current = false; // Reset lock when closing
    setStatusText("");
  }, [stopCamera]);

  const capturePhoto = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!videoRef.current || !canvasRef.current || loading) return;

    console.log("📸 Capturing photo...");
    setLoading(true);
    setStatusText("Capturing...");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas to video dimensions
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      // Draw frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop camera immediately after drawing
      stopCamera();
      setCameraOpen(false);
      cameraStartingRef.current = false; // Reset lock after capture

      setStatusText("Processing...");

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            console.log("✅ Blob created:", blob.size, "bytes");
            processFile(blob);
          } else {
            console.error("❌ Empty blob");
            alert("Failed to capture photo. Please try again.");
            setLoading(false);
            setStatusText("");
            processingRef.current = false;
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("❌ Capture error:", error);
      alert("Capture failed: " + error.message);
      setLoading(false);
      setStatusText("");
      stopCamera();
      setCameraOpen(false);
      cameraStartingRef.current = false; // Reset lock on error
      processingRef.current = false;
    }
  }, [loading, stopCamera, processFile]);

  // ============ CAMERA UI ============
  if (cameraOpen) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#000",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Video Preview */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Viewfinder overlay */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: "400px",
              aspectRatio: "4/3",
              border: "3px solid rgba(255,255,255,0.5)",
              borderRadius: "12px",
              pointerEvents: "none",
            }}
          />

          {/* Status message */}
          {statusText && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                padding: "20px 40px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {statusText}
            </div>
          )}

          {/* Instruction text */}
          {cameraReady && !loading && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "20px",
                fontSize: "14px",
              }}
            >
              Point at homework and tap Capture
            </div>
          )}
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Bottom controls */}
        <div
          style={{
            background: "rgba(0,0,0,0.9)",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Cancel button */}
          <button
            type="button"
            onClick={closeCamera}
            disabled={loading}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "none",
              background: "#666",
              color: "#fff",
              fontSize: "24px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            ✕
          </button>

          {/* Capture button */}
          <button
            type="button"
            onClick={capturePhoto}
            disabled={loading || !cameraReady}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "4px solid #fff",
              background: loading ? "#666" : cameraReady ? "#FFD000" : "#999",
              cursor: loading || !cameraReady ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            {loading ? "⏳" : "📸"}
          </button>

          {/* Placeholder for symmetry */}
          <div style={{ width: "60px", height: "60px" }} />
        </div>
      </div>
    );
  }

  // ============ MAIN BUTTONS UI ============
  return (
    <>
      {/* Loading overlay */}
      {loading && statusText && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px 50px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>⏳</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
              {statusText}
            </div>
          </div>
        </div>
      )}

      {/* Main buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "24px",
        }}
      >
        {/* Camera button - uses getUserMedia (works on mobile without refresh) */}
        <button
          type="button"
          onClick={openCamera}
          disabled={loading}
          style={{
            padding: "14px 32px",
            borderRadius: "50px",
            border: "none",
            background: loading ? "#999" : "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "18px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          📸 Scan Homework
        </button>

        {/* Upload button - opens file picker */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={loading}
          style={{
            padding: "14px 32px",
            borderRadius: "50px",
            border: "none",
            background: loading ? "#999" : "#FFD000",
            color: "#000",
            fontWeight: "bold",
            fontSize: "18px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          📁 Upload Photo
        </button>
      </div>

      {/* Hidden file input - NO capture attribute */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
        tabIndex={-1}
      />
    </>
  );
}