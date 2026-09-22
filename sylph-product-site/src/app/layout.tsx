import type { Metadata } from "next";
import "./globals.css";

/* No faces here: each surface loads its own (the landing and marketing pages through their <main>,
   the pre-v3 routes through legacy-fonts.ts), so the root preloads nothing it does not use. */

/* Resolves the root social card (opengraph-image.jpg) to absolute URLs on every route, not only on /. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sylph-product.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sylph",
  description:
    "Corporate travel and expense management with policy guardrails",
  icons: {
    icon: [{ url: "/sylph-bird.svg", type: "image/svg+xml" }],
    apple: [{ url: "/sylph-bird.svg", type: "image/svg+xml" }],
  },
  other: {
    "theme-color": "#ffffff",
    "color-scheme": "light",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
