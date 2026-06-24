import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@boundaryml/baml",
    "@boundaryml/baml-linux-x64-gnu",
  ],
};

export default nextConfig;
