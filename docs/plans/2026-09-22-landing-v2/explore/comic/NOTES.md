# Drawn (/explore/comic)

**Idea.** Priya and Dana as the leads of a graphic novel. One Sushi Kanda charge crosses nine panels: Priya's Denver night on a dark page, a hard cut to the paper of Dana's morning, month end, then a back-cover close. The product appears only as screens in the story (her phone, his queue, the report). The charge crosses each gutter as a paper ticket whose state changes.

**Built.** The sale is lettered over the splash panel. Five new clay scenes are gpt-image-2 edits of the cast renders (about $1.75). GSAP drives:
- panel wipes and cuts in reading order
- scroll cameras: push, pan, pull (pans on the 390 strip)
- the phone exchange, the typed cab note, the queue filing itself
- Approve: a tap, or Dana taps it if you scroll on. The close-up answers after.

Reduced motion shows the settled story. Approve is the only sound, behind the toggle.

**To ship.** An art pass on consistency (the office differs between morning and month end), an OG image, a copy review and tuning between 761 and 1100 px.

**Note.** The CSS build drops `translate` beside `transform` in one rule; the page uses one transform.
