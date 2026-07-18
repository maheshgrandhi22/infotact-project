import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This must be completely top-level, NOT inside experimental
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;