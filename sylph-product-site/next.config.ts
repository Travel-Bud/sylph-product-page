import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 80] },
  async redirects() {
    return [
      {
        source: "/privacy",
        destination: "https://legal.januslabsinc.com/sylph/v1/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
