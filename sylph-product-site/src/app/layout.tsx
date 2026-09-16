import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "../fonts/Satoshi-VariableItalic.woff2", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
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
    <html lang="en" className={`${satoshi.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        <div className="relative min-h-screen">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
