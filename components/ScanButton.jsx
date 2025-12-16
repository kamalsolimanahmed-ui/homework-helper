import { useRef, useState, useEffect, useCallback } from "react";

export default function ScanButton() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraOpen(false);
  }, []);

  const processFile = useCallback(async (fileOrBlob) => {
    if (!fileOrBlob || fileOrBlob.size === 0) {
      alert("No image data");
      return;
    }

    try {
      setLoading(true);
      setStatusText("Uploading...");

      stopCamera();

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

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Processing failed");
      }

      localStorage.setItem("homeworkResult", JSON.stringify(result));
      setStatusText("Done!");

      setTimeout(() => {
        window.location.href = "/results";
      }, 500);

    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
      setLoading(false);
      setStatusText("");
    }
  }, [stopCamera]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [processFile]);

  const openFilePicker = useCallback((e) => {
    e?.preventDefault?.();
    if (loading) return;
    if (inputRef.current) {
      inputRef.current.removeAttribute("capture");
      inputRef.current.click();
    }
  }, [loading]);

  const openCamera = useCallback(async (e) => {
    e?.preventDefault?.();
    if (loading || cameraOpen) return;

    try {
      setCameraOpen(true);
      setCameraReady(false);
      setStatusText("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;

        await videoRef.current.play();

        setCameraReady(true);
        setStatusText("");
      }
    } catch (error) {
      console.error("Camera error:", error);
      stopCamera();
      setStatusText("");

      if (error.name === "NotAllowedError") {
        alert(
          "Camera permission denied. Please allow camera access and try again, or use 'Upload Photo' instead."
        );
      } else if (error.name === "NotFoundError") {
        alert("No camera found. Please use 'Upload Photo' instead.");
      } else {
        alert("Camera error: " + error.message + "\n\nTry 'Upload Photo' instead.");
      }
    }
  }, [loading, cameraOpen, stopCamera]);

  const closeCamera = useCallback((e) => {
    e?.preventDefault?.();
    stopCamera();
    setStatusText("");
  }, [stopCamera]);

  const capturePhoto = useCallback((e) => {
    e?.preventDefault?.();

    if (!videoRef.current || !canvasRef.current || loading) return;

    try {
      setLoading(true);
      setStatusText("Capturing...");

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      stopCamera();

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            processFile(blob);
          } else {
            alert("Failed to capture photo. Please try again.");
            setLoading(false);
            setStatusText("");
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("Capture error:", error);
      alert("Capture failed: " + error.message);
      setLoading(false);
      setStatusText("");
      stopCamera();
    }
  }, [loading, stopCamera, processFile]);

  if (cameraOpen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100svh",
          background: "#000",
          zIndex: 99999,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

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
                zIndex: 1,
              }}
            >
              {statusText}
            </div>
          )}

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
                zIndex: 1,
              }}
            >
              Point at homework and tap Capture
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

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

          <div style={{ width: "60px", height: "60px" }} />
        </div>
      </div>
    );
  }

  return (
    <>
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

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "24px",
        }}
      >
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