import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#FACC15" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Homework Helper" />
        <meta name="description" content="AI homework helper for kids ages 3-10" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192" />

        {/* Splash Screen for iOS */}
        <link rel="apple-touch-startup-image" href="/splash.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Register Service Worker */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ SW registered'))
                .catch(err => console.log('❌ SW error:', err));
            }
          `
        }} />
      </body>
    </Html>
  );
}