import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/',

  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
};

export default nextConfig;