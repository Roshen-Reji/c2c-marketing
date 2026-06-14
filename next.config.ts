import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/C2C',
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
};

export default nextConfig;