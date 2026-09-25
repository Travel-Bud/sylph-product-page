import type { Metadata } from "next";
import { UpgradedLanding } from "@/components/custom/mock/b/landing";
import { MockSwitch } from "@/components/custom/mock/shared/switch";

/* Mock B, "Two sides, upgraded" (docs/plans/2026-09-25-mock-b/NOTES.md), promoted to / on 2026-09-25.
   This route renders the same page with the mockup switcher. */
export const metadata: Metadata = {
  title: "Sylph: one charge, two people, nothing to chase (Two sides, upgraded)",
  description:
    "The person who spent it texts a receipt and gets an answer that names the rule. The person who closes the books sees only the exceptions. At month end the report is already there.",
};

export default function MockBPage() {
  return (
    <UpgradedLanding>
      <MockSwitch current="B" />
    </UpgradedLanding>
  );
}
