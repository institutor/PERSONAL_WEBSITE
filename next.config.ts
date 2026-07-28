import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    // A stray lockfile exists in the user profile directory; pin the root.
    root: __dirname,
  },
};

export default nextConfig;
