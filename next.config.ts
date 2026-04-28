import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed "standalone" output — Z.ai hosting may not support it
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
