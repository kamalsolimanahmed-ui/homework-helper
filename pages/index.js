import Head from "next/head";
import { useState, useEffect } from "react";
import ScanButton from "../components/ScanButton";

export default function Home() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") || "en";
    setLang(saved);
  }, []);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <div
      style={{
        backgroundColor: "#0b0f25",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      <Head>
        <title>Homework Helper AI</title>
      </Head>

      {/* LANGUAGE SELECTOR - PROFESSIONAL & VISIBLE */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "12px 18px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* LABEL */}
        <span
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#0b0f25",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🌍 Language:
        </span>

        {/* DROPDOWN */}
        <select
          value={lang}
          onChange={handleLangChange}
          style={{
            padding: "8px 12px",
            fontSize: "15px",
            fontWeight: "600",
            borderRadius: "8px",
            border: "2px solid #FFD700",
            backgroundColor: "#0b0f25",
            color: "#FFD700",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 215, 0, 0.2)",
            transition: "all 0.3s ease",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            backgroundSize: "20px",
            paddingRight: "35px",
            minWidth: "160px",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 4px 16px rgba(255, 215, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.2)";
          }}
        >
          <option value="en">🇺🇸 English (USA)</option>
          <option value="fr">🇫🇷 Français (French)</option>
          <option value="de">🇩🇪 Deutsch (German)</option>
          <option value="es">🇪🇸 Español (Spanish)</option>
          <option value="ar">🇸🇦 العربية (Arabic)</option>
        </select>
      </div>

      {/* HERO SECTION */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          {/* HERO IMAGE */}
          <img
            src="/hero.png"
            alt="Homework Helper AI"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />

          {/* SCAN BUTTON */}
          <div
            style={{
              position: "absolute",
              top: "58%",
              left: "70%",
              transform: "translateX(-50%)",
              width: "60%",
              zIndex: 50,
            }}
          >
            <ScanButton />
          </div>
        </div>
      </div>
    </div>
  );
}