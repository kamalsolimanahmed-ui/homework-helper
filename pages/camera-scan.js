'use client';

import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

export default function CameraScan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const analyzeLoopRef = useRef(null);
  const stillnessCheckRef = useRef({
    previousFrame: null,
    stillCounter: 0,
    requiredFrames: 50,  // Premium: ~2 seconds at 24fps
  });

  const [status, setStatus] = useState('Requesting camera access...');
  const [hint, setHint] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateLaplacianVariance = (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let sum = 0;
    let sumSq = 0;
    let count = 0;

    for (let i = 1; i < height - 1; i++) {
      for (let j = 1; j < width - 1; j++) {
        const idx = (i * width + j) * 4;
        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const neighbors = [
          (data[((i - 1) * width + j) * 4] + data[((i - 1) * width + j) * 4 + 1] + data[((i - 1) * width + j) * 4 + 2]) / 3,
          (data[((i + 1) * width + j) * 4] + data[((i + 1) * width + j) * 4 + 1] + data[((i + 1) * width + j) * 4 + 2]) / 3,
          (data[(i * width + j - 1) * 4] + data[(i * width + j - 1) * 4 + 1] + data[(i * width + j - 1) * 4 + 2]) / 3,
          (data[(i * width + j + 1) * 4] + data[(i * width + j + 1) * 4 + 1] + data[(i * width + j + 1) * 4 + 2]) / 3,
        ];
        const laplacian = 4 * center - neighbors.reduce((a, b) => a + b, 0);
        sum += laplacian;
        sumSq += laplacian * laplacian;
        count++;
      }
    }

    const mean = sum / count;
    const variance = sumSq / count - mean * mean;
    return Math.max(0, variance);
  };

  const calculateAverageLuminance = (imageData) => {
    const data = imageData.data;
    let sum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sum += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    return sum / (data.length / 4);
  };

  const detectTextPresence = async (canvas) => {
    try {
      const result = await Tesseract.recognize(canvas, 'eng', {
        logger: () => {},
      });
      return result.data.text.trim().length > 0;
    } catch {
      return false;
    }
  };

  const calculateFrameDifference = (currentImageData, previousImageData) => {
    if (!previousImageData) return 0;

    const current = currentImageData.data;
    const previous = previousImageData.data;
    let diff = 0;

    for (let i = 0; i < current.length; i += 16) {
      diff += Math.abs(current[i] - previous[i]);
    }

    return diff / (current.length / 16);
  };

  const startAnalysisLoop = () => {
    const analyzeFrame = async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) {
        analyzeLoopRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const sharpness = calculateLaplacianVariance(imageData);
      const isSharp = sharpness > 150;  // Premium: higher threshold

      const brightness = calculateAverageLuminance(imageData);
      const isBright = brightness > 60 && brightness < 190;  // Premium: stricter range

      let hasText = false;
      try {
        hasText = await detectTextPresence(canvas);
      } catch {
        hasText = false;
      }

      const frameDiff = calculateFrameDifference(imageData, stillnessCheckRef.current.previousFrame);
      const isStill = frameDiff < 8;  // Premium: much stricter stillness

      if (isStill) {
        stillnessCheckRef.current.stillCounter++;
      } else {
        stillnessCheckRef.current.stillCounter = 0;
      }

      stillnessCheckRef.current.previousFrame = imageData;

      if (!isSharp) {
        setHint('Move closer - focus needed');
      } else if (!isBright) {
        setHint('Improve lighting');
      } else if (!hasText) {
        setHint('Point at homework');
      } else if (!isStill) {
        setHint('Hold very steady...');
      } else {
        setHint('Perfect! Capturing...');
      }

      if (isSharp && isBright && hasText && stillnessCheckRef.current.stillCounter >= stillnessCheckRef.current.requiredFrames) {
        captureAndUpload(canvas);
        return;
      }

      analyzeLoopRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeLoopRef.current = requestAnimationFrame(analyzeFrame);
  };

  const captureAndUpload = async (canvas) => {
    setIsProcessing(true);
    setStatus('Analyzing...');

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus('Capture failed');
          setTimeout(startAnalysisLoop, 1000);
          setIsProcessing(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', blob, 'homework.jpg');

        const uploadBlob = async () => {
          try {
            const response = await fetch('/api/scan', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            const data = await response.json();
            localStorage.setItem('scanResult', JSON.stringify(data));
            window.location.href = '/result';
          } catch (error) {
            setStatus('Upload failed, retrying...');
            setTimeout(startAnalysisLoop, 1000);
            setIsProcessing(false);
          }
        };

        uploadBlob();
      }, 'image/jpeg', 0.85);
    } catch (error) {
      setStatus('Capture error');
      setTimeout(startAnalysisLoop, 1000);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
            setStatus('Scanning...');
            startAnalysisLoop();
          };
        }
      } catch (error) {
        if (isMounted) {
          if (error.name === 'NotAllowedError') {
            setStatus('Camera permission denied. Please enable in settings.');
          } else if (error.name === 'NotFoundError') {
            setStatus('No camera found on this device.');
          } else {
            setStatus('Camera error: ' + error.message);
          }
        }
      }
    };

    initializeCamera();

    return () => {
      isMounted = false;
      if (analyzeLoopRef.current) {
        cancelAnimationFrame(analyzeLoopRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#000',
    overflow: 'hidden',
  };

  const videoStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const statusStyle = {
    textAlign: 'center',
    color: 'white',
    background: 'rgba(0, 0, 0, 0.6)',
    padding: '20px 30px',
    borderRadius: '12px',
    pointerEvents: 'auto',
  };

  const statusTextStyle = {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  };

  const statusHintStyle = {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
  };

  const buttonStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    pointerEvents: 'auto',
    transition: 'background 0.2s',
  };

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div style={containerStyle}>
      <video ref={videoRef} autoPlay playsInline muted style={videoStyle} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={overlayStyle}>
        <div style={statusStyle}>
          <p style={statusTextStyle}>{status}</p>
          {hint && <p style={statusHintStyle}>{hint}</p>}
        </div>

        <button
          onClick={handleBackClick}
          style={{
            ...buttonStyle,
            opacity: isProcessing ? 0.6 : 1,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
          }}
          disabled={isProcessing}
        >
          Back
        </button>
      </div>
    </div>
  );
}