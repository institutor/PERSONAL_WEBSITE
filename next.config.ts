import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // TEMP diagnostic
  output: "export",
  turbopack: {
    // A stray lockfile exists in the user profile directory; pin the root.
    root: __dirname,
  },
};

export default nextConfig;
