import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/C2C',
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
  
  // Redirect absolute root (/) to the basePath (/C2C)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/C2C',
        basePath: false, // This tells Next.js to match the absolute root, ignoring basePath
        permanent: false,
      },
    ];
  },
};

export default nextConfig;