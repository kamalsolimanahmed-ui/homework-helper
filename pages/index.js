import { useEffect, useState } from "react";
import ScanButton from "../components/ScanButton";

export default function Home() {
  const [parentMode, setParentMode] = useState(false);
  const [lang, setLang] = useState("en");

  // Load saved mode and language from localStorage
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

    /* ---------- DESKTOP (>1100px) ---------- */
    @media (min-width: 1101px) {
      .hero-section {
        height: 540px;
        padding-top: 60px;
      }
    }

    /* ---------- TABLET (700px - 1100px) ---------- */
    @media (min-width: 700px) and (max-width: 1100px) {
      .hero-section {
        height: 420px;
        padding-top: 50px;
      }
    }

    /* ---------- PHONE (≤700px) ---------- */
    @media (max-width: 700px) {
      .hero-section {
        height: 300px;
        padding-top: 30px;
      }
    }

    /* ---------- SMALL PHONE (≤420px) ---------- */
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

    /* Style ScanButton - Make it BIGGER and PROFESSIONAL */
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

    /* ---------- RESPONSIVE ADJUSTMENTS FOR BUTTONS ---------- */
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
      
      <div style={{ backgroundColor: "#04133A", minHeight: "100vh", textAlign: "center", width: "100%" }}>
        {/* Language Selector */}
        <div className="language-selector">
          <select value={lang} onChange={handleLanguageChange}>
            <option value="en">🇺🇸 English (USA)</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
        </div>

        {/* Hero Section - PUSHED DOWN WITH PADDING */}
        <div className="hero-section"></div>

        {/* Heading */}
        <h2>Who's doing homework?</h2>

        {/* Mode Container */}
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

        {/* Scan Button Wrapper - BIGGER & MORE PROFESSIONAL - NOW WITH MORE SPACE */}
        <div className="scan-btn-wrapper">
          <ScanButton />
        </div>
      </div>
    </>
  );
}