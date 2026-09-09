import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 80] },
  async redirects() {
    return [
      // the /fresh preview was promoted to the root on 2026-09-08; the lab boards stay under /fresh/lab
      { source: "/fresh", destination: "/", permanent: true },
      { source: "/fresh/demo", destination: "/demo", permanent: true },
      { source: "/fresh/pricing", destination: "/pricing", permanent: true },
      {
        source: "/privacy",
        destination: "https://legal.januslabsinc.com/sylph/v1/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
