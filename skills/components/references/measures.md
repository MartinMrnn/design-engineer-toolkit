# Measures: what real sites do, and how to read `components.js`

## What 23 home pages do
Measured on 2026-11-28: 9 products and design engineers' sites (Linear, Vercel, Raycast, Stripe, Resend, jakub.kr, emilkowal.ski, rauno.me, raphaelsalaja.com) and 14 brand sites from siteofsites.co. At 1440 × 900, 25 Tab stops each; at 390 × 844, the targets and the menu button. One capture on one day.

| What | Products (9) | Brand sites (14) |
|---|---|---|
| Focus drawn as an outline by the site | 6 (width 1–4 px, offset mostly 2–4 px) | 3, plus 2 dashed |
| Browser's default ring left | 1 | 7 |
| Focus as a `box-shadow` | 1 (Resend), and part of Raycast | 0 |
| Another change only (colour, underline) | 0 | 2 |
| Skip link first in the Tab order | 0 | 0 |
| `role=menu` or `menubar` in a navigation | 1 (Vercel) | 0 |
| Mobile menu with `aria-expanded`, closed by Escape, focus back on the button | 3 of 4 found (Linear, Vercel, Stripe; Resend did not open with Enter) | 1 of 6 found (Plnty); amitch drops focus on `body`; 4 have no `aria-expanded` |
| Targets at 390 px under 44 px (box) | most: Linear 84 of 90, Vercel 88 of 92, Stripe 142 of 187; medians 21–37 px | varies with how few controls there are |

What it means for the rules: a drawn outline is what careful products do (`focus-1`); a skip link is not what anyone ships first, so it is kept for long headers (`focus-5`); 44 px everywhere is not practice, 44 px on main touch actions is (`ux behaviour-15`); menus that forget `aria-expanded` and Escape are a brand-site habit, which `components.js` now opens.

## Reading `components.js`

| Field | What it says | How to judge it |
|---|---|---|
| `focus.kinds` | how many Tab stops show a drawn outline, the browser's default, a box-shadow, another change, nothing | `none` is `check.js`'s `focus-visible`; `default` and `box-shadow` break `focus-1` unless a reason is written |
| `focus.rings` | each drawn ring, its width, offset and contrast on its ground | `focus-contrast` under 3:1 fails `focus-2` |
| `focus.unmeasured` | rings over an image, a video or a gradient | check them by eye (`focus-3`) |
| `overlays` | each trigger opened with Enter: `aria-expanded` before and after, focus after opening, whether a modal lets Tab out, Escape, where focus lands | see the issues below |
| `bypass` | `main`, a skip link first, the headings, the stops before `main` | the issue is raised only with no `main`, no skip link and no headings; `before` over 5 without a skip link breaks `focus-5` |
| `live` | status, alert and live regions present at load | 0 on a page with forms or async actions breaks `state-2` |

Issues: `focus-contrast` (`focus-2`) and `label-in-name` (`element-4`) fail. The others are evidence: `overlay-state` (it opened without `aria-expanded`, `element-2`), `overlay-escape` (an overlay Escape leaves open, `ux path-2`), `overlay-focus` (focus on `body` after Escape, `focus-6`), `overlay-leak` (Tab leaves an open modal, `pattern-3`), `menu-role` (`element-6`), `tabindex` (`focus-7`), `disabled-submit` (`ux behaviour-6`), `bypass` (`focus-4`).

## Readings to check before believing
- **A two-part indicator.** A ring under 3:1 can pass 1.4.11 when the focus also changes something else at 3:1 (a fill, a thick underline). Look at it before calling it a failure; set it aside with what you saw.
- **The ground.** The ground is read at a point just outside the ring, through the backgrounds down to the first opaque one. An image laid beside the element by absolute positioning, or a canvas behind the page, can be missed: when the ring sits on a picture, trust your eyes over the number.
- **Label in name.** A combobox or a select shows its value, not its label, and is skipped. A name and a visible text that contain one another pass, so extra visible words (a badge, a signature) do not fail; a name that drops a visible word (visible "Send message", name "Send") passes too and is left to the critic.
- **Slow menus.** After Enter and after Escape the script waits at least 600 ms and until the reading stops changing (2.5 s at most). A menu that animates longer can still read as open; open it by hand before judging.
- **Escape on a disclosure.** `overlay-escape` is raised only for what overlays the page (a positioned panel, a popover, a modal). An inline disclosure that ignores Escape is not a fault. A panel that closes on Escape only while focus is inside it is reported, because the script presses Escape with focus where Enter left it; open it by hand before judging.
- **What it does not open.** Menus that open on hover only, custom widgets' arrow keys, triggers past the first twelve per width, links that navigate. Check them by hand in the finishing pass.
