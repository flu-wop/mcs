import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-api.printify.com",
      },
      {
        protocol: "https",
        hostname: "images.printify.com",
      },
      {
        // Printify stores some re-uploaded/custom mockup images on S3 directly
        // instead of their usual images-api.printify.com CDN. Wildcarding the
        // region in case other buckets/regions show up the same way later.
        protocol: "https",
        hostname: "pfy-prod-products-mockup-media.s3.*.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/book/richie", destination: "/book/rich", permanent: true },
      { source: "/contact/richie", destination: "/book/rich", permanent: true },
    ]
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }]
  },
}

export default nextConfig
