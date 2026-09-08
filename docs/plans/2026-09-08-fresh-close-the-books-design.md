# /fresh re-lead: close the books (design, 2026-09-08)

Branch `landing-v3-personality` in `sylph-product-page`. Approved by Ben 2026-09-08 after the brainstorming pass.

## Who the page speaks to

Whoever holds the month-end pile at a company of ten to a few hundred people: the owner, office manager or
bookkeeper who closes the month personally, and the in-house controller who wants control and an audit trail.
Second person, plain words, no finance jargon beyond "close the books". Voice register and claim guardrails:
`landing-v3/voice.md` and the landing memory.

## What changes (re-lead plus one beat)

1. **Hero, white.** H1 "Your expenses close themselves." Lede: every card charge finds its receipt, gets checked
   and coded, lands on the report; you see the exceptions, not the pile; at month end the journal is ready and
   posts to QuickBooks Online. The mono line under the buttons carries the reassurance: no policy document needed,
   bring one or answer a dozen questions and Sylph writes the policy and the rules. Clip, objects and landing strip
   unchanged; the strip window is titled "Month end". The slogan moves to the footer.
2. **Bento, band.** Head "From the card charge to the closed month." Tile order follows the close: receipts, cards,
   review queue; the record ("The month, closed": PDF, XLSX, journal CSV, QuickBooks Online chips) beside policy
   ("Policy, written or built"); verdicts, currency, booking. Captions rewritten. Motion, Flip and per-tile
   choreography untouched. The receipt journey's three anchors (hero clip, receipts tile, record tile) keep their
   order on the page.
3. **New chapter "Start", white, after the bento.** Head "Start without a policy document." One lede sentence. Two
   cards: "Answer a dozen questions" (a small builder panel: one answer lands, the rule it becomes appears under it,
   Sylph writes the policy the team reads) and "Or bring the PDF you have" (policy object plus rule rows, every rule
   quotes its sentence, approve once). One closing line: either way the same rules check every charge from then on.
   Placed after the bento so the receipt journey does not cross it.
4. **How it runs.** Station one relabelled "Your policy, written or built". Otherwise unchanged.
5. **In build, night.** Unchanged.
6. **Close, mint.** "See your month close." Lede: bring last month's card statement, with or without a policy;
   thirty minutes, your charges, real verdicts.
7. **Nav** Product, Policy, In build. **Footer** tagline "Expenses run on air."
8. **Type.** Familjen Grotesk only. The `?face` switch, the Onest load and the `[data-face]` CSS go; the page is
   static again.
9. **Metadata.** Title "Sylph: expenses that close themselves"; description in the same voice; JSON-LD updated.

## Product truth behind each claim (checked 2026-09-08)

- "Answer a dozen questions", "Sylph writes the policy and the rules": the app's Policy Builder, Quick mode ("the
  dozen questions most policies answer: caps, cabin class, receipts, alcohol"), writes the policy document and
  compiles rules; onboarding offers "Build your policy with Sylph" beside "Upload an existing policy".
- "Coded", "the journal is ready": `services/coding_stage.py`; `GET /v1/finance/batches/{id}/journal` emits a GL
  journal CSV with an Account column per line from `category_gl_map`; payroll and AP files from the same batch.
- "Posts to QuickBooks Online": Ben's decision 2026-09-08 to state it as shipped because the connector will be done
  before the page goes live. Today the connector is merged on `main` but not deployed and Intuit's assessment is
  pending. The claim lives behind one constant (`QBO_LIVE` in `sample-data.ts`) so it can be pulled in one edit.
- No time claims, no metrics, no logos, no dashes, sample chips on every panel with numbers.

## Gates

typecheck, lint (no new findings; `main` already carries 11 in the v5 tree), vitest, build; screenshots at 1440 and
390; reduced motion still complete; console clean; zero horizontal overflow; dash sweep and claims audit; the
ai-slop-check, hierarchy-rhythm-review and web-interface-guidelines passes with findings fixed or recorded.
