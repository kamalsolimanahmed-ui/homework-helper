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

      {/* LANGUAGE SELECTOR */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <select
          value={lang}
          onChange={handleLangChange}
          style={{
            padding: "10px 15px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "2px solid #FFD700",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          <option value="en">🇺🇸 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="ar">🇸🇦 العربية</option>
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