# Measures: what real sites do, and how to read `layout.js`

## What real sites do
15 home pages measured once on 2026-11-24, at 1440 × 900 and 390 × 844, with reduced motion; fixed and sticky elements left out.
- **Products** built by the design engineers the user follows: Vercel, Next.js, shadcn/ui, Linear, Stripe, Raycast.
- **Brand sites**, the latest entries of the siteinspire gallery that day: Stripe Press, Berry, KOLFEST, MOXIE Theatre, Atera, the Josef & Anni Albers Foundation, Maison Intègre, Royal Sites Ireland, Collective Gallery.

| What | Result |
|---|---|
| Columns per section at 1440 (104 sections) | 1: 33 %, 2: 31 %, 3: 16 %, 4: 14 %, 5 or 6: 6 %; never more than 6 |
| Most columns per site | 2 to 6, median 4 |
| Rows of 3 or more items on a phone (74) | stacked 50 %, swiping 43 %, two per line 5 % |
| Headings closer to what follows (163) | 83 %; at least twice as close 71 %; median ratio 5 |
| Gap between sections | median 279 px at 1440, 180 px at 390 |
| Distinct spacing values covering 90 % of uses | 6 to 20, median 12 |
| First screen filled at 1440 | 10 of 13 readable pages: every brand site; not Next.js, shadcn, Stripe |
| Filled buttons on the first screen | none on 9 sites, two at most |
| Radii besides the pill | brand sites 0 or 1; products 3 to 14 |
| Nested surfaces with an even inset | concentric 13 of 14 |
| Breakpoints | 7 sites at Tailwind's presets (640, 768, 1024), 8 at values of their own |
| Container queries | 6 sites, all products but one |
| Side margin at 390 | 16 to 28 px, 16 px on 6 sites |
| Same structure in a row | 1 to 3 sections, once 5 (a list of events) |

**Limits.** One capture on one day. The section finder fails on pages built as one long section (Stripe Press, Atera, Collective Gallery), and Atera showed no text to the script. Columns count flex and grid rows only. These are reference points, **never quotas and never examples to copy**.

## WCAG

| Criterion | Level | What it asks | Checked by |
|---|---|---|---|
| 1.3.2 Meaningful Sequence | A | When the order of content affects its meaning, a correct reading order can be determined from the code | `layout.js` lists reordered containers; the critic judges |
| 1.4.10 Reflow | AA | Content can be shown at 320 CSS px wide without loss of information or function and without scrolling in two directions, except parts that need a two-dimensional layout | `check.js` (`reflow`), then the critic |
| 2.4.11 Focus Not Obscured (Minimum) | AA | A component that receives keyboard focus is not entirely hidden by content the author added | `layout.js`, then the critic |
| 1.4.4 Resize Text | AA | Owned by `type` | `type.js` |
| 2.4.3 Focus Order, 2.5.8 Target Size | A, AA | Owned by `ux` | `check.js`, the critic |

## Reading `layout.js`
- **`pass`** is false only for `focus-obscured` (WCAG 2.4.11). Everything else is evidence for the agent and the critic.
- **`sections`**: columns at 1440 and on a phone (`phone`), counting only boxes wholly on screen and leaving out decorative layers. More than 6 breaks `grid-2`; 3 or more on a phone deserves a look under `proof-4`.
- **`proximity`**: `n` judgements over the five widths, `closer` the good ones, and `faults`, the headings not closer to what they introduce, with both gaps and the widths. Each fault breaks `space-2` unless the critic sees a reason. An image or a short kicker on top of a heading counts as part of it. Not judged: a heading whose next content is more than four times its size away (often a CSS background the script cannot see), and a heading set beside its content, as in a heading column; check those by eye.
- **`crushed`**: per width, text of three lines or more under 12 characters per line, or two lines under 6. Most lines break `proof-2`; a short caption may not, and the critic judges. Large titles (32 px and up) and text with forced line breaks are left out.
- **`sideways`**: the widths at which the page scrolls sideways, evidence for `proof-1` when `check.js` is not run.
- **`spacing`**: `distinct` values, `for90`, how many cover 90 % of uses, and the most used. Compare `for90` with the scale's steps; with no scale, with the 6 to 20 measured on real sites (`space-1`). Boxes sized by padding for their aspect ratio inflate it.
- **`radii`**: values and nested surfaces. `same` or `other` breaks `shape-3`; more than three values besides the pill breaks `shape-2`.
- **`firstScreen`**: `fills`, `h1Whole` (null when there is no visible `h1`; it may be the site's name) and `filled`, at 1440 and 390, for `proof-5` and `hierarchy-3`. `fills` is judged against the entry's `First screen` line, never alone.
- **`reordered`**: containers whose children show in another order than the source, for `hierarchy-7`. Children stacked on top of each other are left out.

It does not see: menus and dialogs once opened, CSS columns or floats used as columns, `::before` and `::after` content, content behind a hover, short screens, the peek of a swiping row, whether a reordering changes the meaning, or whether the composition is good.
