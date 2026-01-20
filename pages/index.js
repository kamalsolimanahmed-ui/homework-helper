import { useEffect, useState } from "react";
import ScanButton from "../components/ScanButton";

export default function Home() {
  const [parentMode, setParentMode] = useState(false);
  const [lang, setLang] = useState("en");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [detectedData, setDetectedData] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("parentMode");
    const savedLang = localStorage.getItem("lang");
    
    if (savedMode) {
      setParentMode(savedMode === "true");
    }
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const scanResult = localStorage.getItem("scanResult");
      if (scanResult && !localStorage.getItem("detectionInProgress")) {
        try {
          const data = JSON.parse(scanResult);
          if (data.extracted_text) {
            localStorage.setItem("detectionInProgress", "true");
            detectAndRedirect(data.extracted_text, lang);
          }
        } catch (e) {
          console.log("Storage parse error");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [lang]);

  async function detectAndRedirect(extractedText, language) {
    try {
      console.log("🔍 Detecting homework...");
      
      const res = await fetch("/api/detect-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText: extractedText,
          language: language
        })
      });

      if (res.ok) {
        const detection = await res.json();
        console.log("✅ Detected:", detection.topic, "-", detection.skill, `(confidence: ${detection.confidence})`);
        
        if (detection.confidence < 0.7) {
          console.log("⚠️ Low confidence, asking parent to confirm");
          setDetectedData(detection);
          setManualOverride(false);
          setShowConfirmation(true);
          localStorage.removeItem("detectionInProgress");
          return;
        }

        proceedWithDetection(detection);
        return;
      }
    } catch (err) {
      console.log("Detection optional, continuing...");
    }
    
    localStorage.removeItem("detectionInProgress");
  }

  function proceedWithDetection(detection) {
    // Map grade_level to numeric level (0-10)
    const gradeToLevel = {
      'K': 0, '0': 0,
      '1': 1, '1st': 1,
      '2': 2, '2nd': 2,
      '3': 3, '3rd': 3,
      '4': 4, '4th': 4,
      '5': 5, '5th': 5,
      '6': 6, '6th': 6,
      '7': 7, '7th': 7,
      '8': 8, '8th': 8,
      '9': 9, '9th': 9,
      '10': 10, '10th': 10
    };

    const level = gradeToLevel[detection.grade_level] || 2;

    // Store learning history
    const history = {
      last_topic: detection.topic,
      last_skill: detection.skill,
      last_grade: detection.grade_level,
      last_language: detection.language,
      last_level: level,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem("learningHistory", JSON.stringify(history));
    
    // Store detection for exercise page
    localStorage.setItem("homeworkDetection", JSON.stringify(detection));
    localStorage.removeItem("detectionInProgress");
    
    // AUTO-REDIRECT to exercise with detected topic and level
    window.location.href = `/exercise?topic=${detection.topic}&language=${detection.language}&level=${level}`;
  }

  function handleConfirmYes() {
    setShowConfirmation(false);
    proceedWithDetection(detectedData);
  }

  function handleConfirmNo() {
    setShowConfirmation(false);
    setManualOverride(true);
    localStorage.removeItem("detectionInProgress");
  }

  function handleKidMode() {
    localStorage.setItem("parentMode", "false");
    setParentMode(false);
  }

  function handleParentMode() {
    localStorage.setItem("parentMode", "true");
    setParentMode(true);
  }

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  }

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      background-color: #04133A;
      font-family: Arial, sans-serif;
      color: white;
      text-align: center;
      width: 100%;
    }

    .hero-section {
      width: 100%;
      background-image: url("/hero.png");
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
    }

    @media (min-width: 1101px) {
      .hero-section {
        height: 540px;
        padding-top: 60px;
      }
    }

    @media (min-width: 700px) and (max-width: 1100px) {
      .hero-section {
        height: 420px;
        padding-top: 50px;
      }
    }

    @media (max-width: 700px) {
      .hero-section {
        height: 300px;
        padding-top: 30px;
      }
    }

    @media (max-width: 420px) {
      .hero-section {
        height: 240px;
        padding-top: 20px;
      }
    }

    .mode-container {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 50px;
      padding: 50px 20px 0px 20px;
      flex-wrap: wrap;
    }

    .mode-box {
      width: 200px;
      padding: 20px;
      background: white;
      border-radius: 20px;
      text-align: center;
      cursor: pointer;
      font-size: 20px;
      color: #04133A;
      font-weight: bold;
      transition: 0.2s;
      border: none;
      user-select: none;
      font-family: Arial, sans-serif;
    }

    .mode-box:hover {
      transform: scale(1.05);
    }

    .scan-btn-wrapper {
      display: inline-block;
      margin-top: 50px;
      margin-bottom: 40px;
    }

    h2 {
      margin-top: 40px;
      margin-bottom: 30px;
      font-size: 28px;
      font-weight: bold;
      color: white;
    }

    .language-selector {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 50;
    }

    .language-selector select {
      padding: 10px 15px;
      border-radius: 8px;
      border: none;
      background: white;
      color: #04133A;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      font-family: Arial, sans-serif;
    }

    .scan-btn-wrapper button,
    .scan-btn-wrapper div button {
      display: inline-block;
      padding: 20px 50px !important;
      background-color: #FFD000 !important;
      color: black !important;
      border-radius: 45px !important;
      font-size: 28px !important;
      font-weight: bold !important;
      cursor: pointer;
      transition: 0.2s;
      border: none !important;
      text-decoration: none;
      font-family: Arial, sans-serif !important;
    }

    .scan-btn-wrapper button:hover,
    .scan-btn-wrapper div button:hover {
      background-color: #ffbb00 !important;
      transform: scale(1.05);
    }

    .confirmation-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .confirmation-content {
      background: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 400px;
      color: #04133A;
    }

    .confirmation-content h3 {
      margin-bottom: 20px;
      font-size: 22px;
    }

    .confirmation-content p {
      margin: 12px 0;
      font-size: 16px;
    }

    .confirmation-buttons {
      display: flex;
      gap: 15px;
      margin-top: 25px;
      justify-content: center;
    }

    .confirmation-buttons button {
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 16px;
      font-family: Arial, sans-serif;
    }

    .btn-yes {
      background-color: #4CAF50;
      color: white;
    }

    .btn-no {
      background-color: #f44336;
      color: white;
    }

    @media (max-width: 700px) {
      h2 {
        font-size: 22px;
        margin-top: 20px;
      }

      .mode-container {
        flex-direction: column;
        gap: 18px;
        margin-top: 15px;
        padding: 30px 20px 0px 20px;
      }

      .mode-box {
        width: 80%;
        max-width: 340px;
        font-size: 18px;
        padding: 16px;
        border-radius: 18px;
        margin: 0 auto;
      }

      .scan-btn-wrapper button,
      .scan-btn-wrapper div button {
        padding: 16px 40px !important;
        font-size: 22px !important;
        border-radius: 38px !important;
      }

      .scan-btn-wrapper {
        margin-top: 60px;
        margin-bottom: 40px;
      }

      .confirmation-content {
        margin: 20px;
        padding: 25px;
      }

      .confirmation-buttons {
        flex-direction: column;
      }

      .confirmation-buttons button {
        width: 100%;
      }
    }

    @media (max-width: 420px) {
      h2 {
        font-size: 20px;
      }

      .mode-box {
        width: 90%;
        font-size: 16px;
        padding: 14px;
      }

      .scan-btn-wrapper button,
      .scan-btn-wrapper div button {
        padding: 14px 32px !important;
        font-size: 20px !important;
        border-radius: 32px !important;
      }

      .scan-btn-wrapper {
        margin-top: 50px;
        margin-bottom: 30px;
      }
    }

    @media (min-width: 700px) and (max-width: 1100px) {
      h2 {
        font-size: 32px;
        margin-top: 30px;
      }

      .mode-container {
        gap: 30px;
        padding: 40px 20px 0px 20px;
      }

      .mode-box {
        width: 260px;
        padding: 22px;
        font-size: 22px;
        border-radius: 22px;
      }

      .scan-btn-wrapper button,
      .scan-btn-wrapper div button {
        padding: 22px 55px !important;
        font-size: 30px !important;
        border-radius: 50px !important;
      }

      .scan-btn-wrapper {
        margin-top: 30px;
        margin-bottom: 50px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      {showConfirmation && detectedData && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>⚠️ Confirm Homework Topic</h3>
            <p><strong>Topic:</strong> {detectedData.topic}</p>
            <p><strong>Skill:</strong> {detectedData.skill}</p>
            <p><strong>Grade:</strong> Grade {detectedData.grade_level}</p>
            <p><strong>Language:</strong> {detectedData.language}</p>
            <p style={{marginTop: "20px", fontSize: "14px", fontStyle: "italic"}}>
              Is this correct?
            </p>
            <div className="confirmation-buttons">
              <button className="btn-yes" onClick={handleConfirmYes}>Yes, Continue</button>
              <button className="btn-no" onClick={handleConfirmNo}>No, Choose Topic</button>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ backgroundColor: "#04133A", minHeight: "100vh", textAlign: "center", width: "100%" }}>
        <div className="language-selector">
          <select value={lang} onChange={handleLanguageChange}>
            <option value="en">🇺🇸 English (USA)</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
        </div>

        <div className="hero-section"></div>

        <h2>Who's doing homework?</h2>

        <div className="mode-container">
          <button
            className="mode-box"
            onClick={handleKidMode}
            style={{
              backgroundColor: parentMode === false ? "#4CAF50" : "white",
              color: parentMode === false ? "white" : "#04133A",
            }}
          >
            Kid Mode
          </button>

          <button
            className="mode-box"
            onClick={handleParentMode}
            style={{
              backgroundColor: parentMode === true ? "#2196F3" : "white",
              color: parentMode === true ? "white" : "#04133A",
            }}
          >
            Parent Mode
          </button>
        </div>

        <div className="scan-btn-wrapper">
          <ScanButton />
        </div>
      </div>
    </>
  );
}