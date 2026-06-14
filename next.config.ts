import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/c2c',

  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
};

export default nextConfig;