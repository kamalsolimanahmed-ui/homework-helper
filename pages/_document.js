import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#0b0f25" />
      </Head>
      <body className="bg-[#0b0f25]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
