/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // NEW correct key for Next.js 16
  serverExternalPackages: ["busboy"],
};

export default nextConfig;
