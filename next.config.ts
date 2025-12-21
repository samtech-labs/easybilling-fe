import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.211.55.5"],
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
