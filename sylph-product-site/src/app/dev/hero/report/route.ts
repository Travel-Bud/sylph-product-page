import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Dev-only harness beacon for /dev/hero. Cross-browser runs (Safari/Firefox)
 * can't be read via automation on this machine, so the lab's ?ab=1 auto-run
 * POSTs its pixel-diff result here and the session reads the file. Gated
 * exactly like the lab page.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_HERO_LAB !== "1") {
    return new Response("not found", { status: 404 });
  }
  const url = new URL(req.url);
  const line = `${url.searchParams.toString()}\n`;
  await appendFile(join(tmpdir(), "hero-ab-report.log"), line);
  return new Response("ok");
}
