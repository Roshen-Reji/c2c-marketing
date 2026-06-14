import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/C2C',
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
  
  // Redirects block removed to fix ERR_TOO_MANY_REDIRECTS
};

export default nextConfig;