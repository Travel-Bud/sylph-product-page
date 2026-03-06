import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
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
  title: "Sylph AI - Smart Corporate Travel & Expense Management",
  description:
    "AI-native corporate travel management with policy guardrails and smart insights. Expenses run on air.",
  other: {
    "theme-color": "#0a0f1a",
    "color-scheme": "dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased bg-[#0a0f1a] text-white">
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
