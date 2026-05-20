import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "files.cdn.printful.com" },
      { hostname: "developers.printful.com" },
    ],
  },
};

export default nextConfig;
