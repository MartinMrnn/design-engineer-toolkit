# Measures: what real sites do, and how to read `type.js`

## What the references do
17 pages from 9 sites of design engineers the user admires, measured once on 2026-11-23 at 1440 px. A size counts when it carries at least 0.5 % of the page's characters.

| Site | Main face | Accent | Sizes on home | Reading text (px / leading) | Characters per line |
|---|---|---|---|---|---|
| Puckett | Allo | none | 2 | 16 / 1.63 | 72 |
| Krehel | Inter | Berkeley Mono | 1 | 17 / 1.63 | 79 |
| Freiberg | name masked | none | 4 | 15 / 1.87 | 109 |
| Salaja | Allo, Inter | none | 1 | 14 / 1.71 | 80 |
| Kowalski | name masked | none | 1 | 16 / 1.65 | 85 |
| shadcn | Geist | none | 6 | 15 / 1.75 | 90 |
| Coursey | Söhne | Newsreader, Inter | 3 | 16 / 1.75 | 91 |
| Nelson | system sans | none | 1 | 15 / 1.65 | 87 |
| Floguo | Zalando Sans | JetBrains Mono, STIX Two | 5 | 15 / 1.5 | no long text |

What stands out:

- A sans for the main text on **9 of 9**. An accent face on 3 of 9.
- **Two sizes** on the home page in the median, one single size on 4 of 9.
- Nothing above weight 600, apart from a font's own specimen page.
- Reading leading from **1.63 to 1.87**, median 1.68.
- **86 characters** per line in the median, 7 of 8 above 75.
- Fluid sizes on only 2 of 17 pages.

**Limits.** These are personal, mostly text sites from one small community, not brands. Their restraint fits them and would be wrong for a bold storefront. One capture, few paragraphs on some pages, two face names hidden. Use them as reference points, **never as quotas or as examples to copy**.

## WCAG

| Criterion | Level | What it asks | Checked by |
|---|---|---|---|
| 1.4.4 Resize Text | AA | Text resizes to 200 % without assistive technology, with no loss of content or function; captions and images of text are excepted | `type.js` (size reached, text still on screen), then the critic |
| 1.4.12 Text Spacing | AA | Nothing is lost when line height is 1.5, paragraph spacing 2, letter spacing 0.12 and word spacing 0.16 times the font size | `type.js`, then the critic |
| 1.4.5 Images of Text | AA | Real text is used, except logotypes and where a presentation is essential | the critic |
| 1.4.3 Contrast | AA | Owned by `colour` | `check.js` |
| 1.4.8 Visual Presentation | AAA | At most 80 characters, among others. **Not required** by this skill | not checked |

A headline that is "almost a logo" stays **real text**. Only the actual logotype is exempt.

## Reading an audit

| Field | How to read it |
|---|---|
| `pass` | `false` only for a WCAG 1.4.4 or 1.4.12 failure, listed in `issues` |
| `faces` | Share of the characters per face. An unexpected one means a fallback or a stray font |
| `sizes` | Sizes carrying at least 0.5 % of the text. More than the roles means a drift (`roles-1`) |
| `weights`, `leading` | Compare with the roles |
| `measure` | Real characters per line of long text at 1440 px. `outside` lists what leaves 60 to 85. `phone` gives the same at 390 px, with no verdict |
| `followsRoot` | `false`: the main text ignores the browser's font size (`roles-3`) |
| `fluid` | Fluid texts with their size at 320 and 1440 px. A `ratio` above 2.5 deserves a look |
| `fauxBold` | Bold or italic with no real face (`proof-6`) |

## What the script does not see
- Whether a face is beautiful or fits: that is the user's eye and the critic.
- Text inside images, menus or dialogs once opened.
- Loss of content at zoom other than text leaving the screen: `check.js` covers reflow, the critic the rest.
- Text at a larger browser font size. Zoom is what 1.4.4 is tested with here.
- Text deliberately truncated with an ellipsis or a line clamp is not reported under 1.4.12. Check that it has a way back.
