import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import { lettering } from "@/components/custom/lab/comic/fonts";
import { ComicPage } from "@/components/custom/lab/comic/comic";
import { Director } from "@/components/custom/lab/comic/director";
import "@/components/custom/lab/comic/comic.css";

/* Explore direction "Drawn" (2026-09-22): the Two sides cast as protagonists of a graphic novel. */
export const metadata: Metadata = {
  title: "Sylph: Drawn",
  description: "Priya spends it, Dana closes the books, and one Sushi Kanda charge passes panel to panel. Nothing to chase at month end.",
};

export default function ComicRoute() {
  return (
    <main className={`cx ${siteFonts} ${lettering.variable}`} id="main">
      <ComicPage />
      <Director />
    </main>
  );
}
