import Head from "next/head";
import ScanButton from "../components/ScanButton";

export default function Home() {
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
            src="/hero.png"     // <-- Your file is in /public/hero.png
            alt="Homework Helper AI"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />

          {/* SCAN BUTTON FLOATING OVER CANVA BUTTON */}
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
