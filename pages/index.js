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
      height: 380px;
      background-image: url("/hero.png");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      padding-top: 109px;
    }

    .mode-container {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 40px;
      padding: 40px 20px 0px 20px;
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
      margin-top: 10px;
      margin-bottom: 40px;
    }

    h2 {
      margin-top: 30px;
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

    /* ---------- MOBILE RESPONSIVE (PHONES) ---------- */
    @media (max-width: 700px) {
      .hero-section {
        height: 260px;
        background-size: contain;
        padding-top: 20px;
      }

      h2 {
        font-size: 22px;
        margin-top: 15px;
      }

      .mode-container {
        flex-direction: column;
        gap: 18px;
        margin-top: 15px;
      }

      .mode-box {
        width: 80%;
        max-width: 340px;
        font-size: 18px;
        padding: 16px;
        border-radius: 18px;
        margin: 0 auto;
      }

      .scan-btn {
        margin-top: 25px;
        font-size: 22px;
        padding: 14px 32px;
        border-radius: 32px;
      }
    }

    /* ---------- SMALL PHONES (iPhone SE, older Android) ---------- */
    @media (max-width: 420px) {
      .hero-section {
        height: 200px;
        padding-top: 10px;
      }

      h2 {
        font-size: 20px;
      }

      .mode-box {
        width: 90%;
        font-size: 16px;
        padding: 14px;
      }

      .scan-btn {
        font-size: 20px;
        padding: 12px 28px;
      }
    }

    /* ---------- TABLETS (iPad / Galaxy Tab) ---------- */
    @media (min-width: 700px) and (max-width: 1100px) {
      .hero-section {
        height: 350px;
        background-size: cover;
        padding-top: 40px;
      }

      h2 {
        font-size: 32px;
        margin-top: 25px;
      }

      .mode-container {
        gap: 30px;
      }

      .mode-box {
        width: 260px;
        padding: 22px;
        font-size: 22px;
        border-radius: 22px;
      }

      .scan-btn {
        padding: 20px 50px;
        font-size: 28px;
        border-radius: 40px;
        margin-top: 35px;
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

        {/* Hero Section */}
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

        {/* Scan Button Wrapper */}
        <div className="scan-btn-wrapper">
          <ScanButton />
        </div>
      </div>
    </>
  );
}