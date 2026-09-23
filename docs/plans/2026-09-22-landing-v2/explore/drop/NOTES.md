# Same path (/explore/drop)

**Idea.** The policy as a physical board: six gates (the match, then five rules) with doors, pushers, ramps and two rails. Drop one of Priya's receipts and each gate it touches lights and names its rule. It lands in Cleared (files into the report), Needs a note (to Dana) or Blocked. Dropped again, it rides a dashed ghost of its last path and gets stamped "Same path". "Ten times" stacks ten in one bin. "Pour in the team's week" runs all 20 sample rows while the gates tally what they caught.

**Built.** Scripted kinematics plus fixed-step springs, no randomness (`engine.ts`, `machine.ts`). A scheduler holds charges in single file by reserving doors. Four scenes (policy compiled, the match, same answer, month end) and a close. Reduced motion shows the settled board. Walked at 390, 768, 1024, 1280, 1512 and 1920 (2026-09-23). Sound goes through `v2-sides/sound.ts` with a nav toggle. gen-image spend: $0.

**To ship.** Real policy rules in place of the six fixed gates. An ear check of the sound: gate clicks are booked, but headless capture can't hear them.

**Unfinished.** Resizing mid-drop settles everything at once. The pour takes about 12s.
