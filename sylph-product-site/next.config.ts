import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 80] },
  async redirects() {
    return [
      // the /fresh preview was promoted to the root on 2026-09-08
      { source: "/fresh", destination: "/", permanent: true },
      { source: "/fresh/demo", destination: "/demo", permanent: true },
      { source: "/fresh/pricing", destination: "/pricing", permanent: true },
      // the 2026-09-22 V2 exploration: direction C ("Two sides") was promoted to the root; the others live in git history
      { source: "/v2", destination: "/", permanent: false },
      { source: "/v2/sides", destination: "/", permanent: false },
      { source: "/v2/ledger", destination: "/", permanent: false },
      // the /lab directions (retired 2026-09-25) and the /mock mockups (retired 2026-09-30) live in git history
      { source: "/lab", destination: "/", permanent: false },
      { source: "/lab/:path*", destination: "/", permanent: false },
      { source: "/mock", destination: "/", permanent: false },
      { source: "/mock/:path*", destination: "/", permanent: false },
      // the /fresh/lab boards and the /launching-soon page (retired 2026-09-30) live in git history
      { source: "/fresh/lab/:path*", destination: "/", permanent: false },
      { source: "/launching-soon", destination: "/", permanent: false },
      {
        source: "/privacy",
        destination: "https://legal.januslabsinc.com/sylph/v1/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
