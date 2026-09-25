import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 80] },
  async redirects() {
    return [
      // the /fresh preview was promoted to the root on 2026-09-08; the lab boards stay under /fresh/lab
      { source: "/fresh", destination: "/", permanent: true },
      { source: "/fresh/demo", destination: "/demo", permanent: true },
      { source: "/fresh/pricing", destination: "/pricing", permanent: true },
      // the 2026-09-22 V2 exploration: direction C ("Two sides") was promoted to the root; the others live in git history
      { source: "/v2", destination: "/", permanent: false },
      { source: "/v2/sides", destination: "/", permanent: false },
      { source: "/v2/ledger", destination: "/", permanent: false },
      // the 2026-09-22 /lab directions were retired on 2026-09-25 for /mock (their code is in git history)
      { source: "/lab", destination: "/mock", permanent: false },
      { source: "/lab/:path*", destination: "/mock", permanent: false },
      {
        source: "/privacy",
        destination: "https://legal.januslabsinc.com/sylph/v1/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
