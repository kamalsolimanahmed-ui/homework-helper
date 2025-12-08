import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google ML Kit for OCR */}
        <script
          async
          src="https://cdn.jsdelivr.net/npm/@google/model-viewer@1.12.0/dist/model-viewer.min.js"
        ></script>
        <script
          async
          src="https://cdnjs.cloudflare.com/ajax/libs/ml5js/0.12.0/ml5.min.js"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Load Google ML Kit
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/@react-pdf-viewer/core@3.0.0/lib/index.min.js';
              document.head.appendChild(script);
              
              // Alternative: Use tesseract.js (pure JS OCR)
              const tesseractScript = document.createElement('script');
              tesseractScript.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.0/dist/tesseract.min.js';
              document.head.appendChild(tesseractScript);
              
              window.ml = { vision: {} };
            `,
          }}
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}