import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  // Hide the bottom-left Next.js badge in `next dev`. Errors still overlay.
  devIndicators: false,
};

export default nextConfig;
