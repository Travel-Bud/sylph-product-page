import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import "@/components/custom/site/lab/desk/desk.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll } from "@/components/custom/site";
import { DeskScene } from "@/components/custom/site/lab/desk/desk-scene";

const TITLE = "Sylph desk prototype";
const DESCRIPTION =
  "Landing v3 direction board: one continuous desk the camera travels across, with product surfaces rising where they belong.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function DeskLabPage() {
  return (
    <main className={`site ${siteFonts}`} id="main">
      <a href="#desk" className="skip">
        Skip to content
      </a>
      <SmoothScroll>
        <SiteNav />
        <DeskScene />
        <SiteFooter sampleNote />
      </SmoothScroll>
    </main>
  );
}
