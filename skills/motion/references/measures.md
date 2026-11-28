# Measures: what real sites do, and reading `motion.js`

One capture on 2026-11-27. Reference points, never quotas.

## What 23 home pages do
9 products and design-engineer sites (Linear, Vercel, Raycast, Stripe, Resend, jakub.kr, emilkowal.ski, rauno.me, raphaelsalaja.com) and 14 recent brand sites from siteofsites.co, at 1440 × 900, once with motion and once with reduced motion, scrolled to the end with the wheel.

| Measure | Result |
|---|---|
| Interface transitions | products hold their median at 100–300 ms (Linear 100, Vercel 100, Resend 150, Stripe 300); 5 of 14 brand sites reach 400–500 ms on links and buttons |
| Curves | products write their own `cubic-bezier` (Vercel 128 of 129 transitions, Stripe 181 of 191); among the most frequent, Kowalski's `0.23, 1, 0.32, 1` and the drawer curve `0.32, 0.72, 0, 1`. `ease-in`: 19 declarations across the 23 sites |
| Reveals on scroll | counted once per outermost hidden block, with `motion.js`: among products only Resend (11 % of its blocks below the first screen); among the 9 brand sites whose window scrolled, 3 reveal more than 10 % (Odyssée 18 %, Jungle Jungle 26 %, btay 48 %). 5 brand sites do not scroll the window (WebGL, or a container of their own) and were not seen |
| Smooth-scroll takeover | Lenis active on 7 of 14 brand sites, on no product |
| Libraries | GSAP on 7 brand sites, Motion on 3 sites, WebGL on 7; products mostly CSS |
| Modern CSS | `linear()` springs on Vercel and Raycast; `animation-timeline` on 6 sites; `@starting-style` on 4 |
| Reduced motion | every product writes rules for it, yet only 5 of 9 stand still when asked: Raycast keeps a fade-up entrance and its illustrations, Stripe and Resend a decorative loop, rauno.me its entrances. 5 of 14 brand sites stand still; the others keep tickers, openings, scroll scenes or Lenis |

The products feel fast because they keep the interface short and on their own curves, and leave the scroll alone. The brand sites that feel slow add the same three habits: long hovers, fade-ups and a scroll takeover. Reduced motion is the part almost everyone gets partly wrong, careful products included: check it on every page.

Limits: one day; durations, curves and libraries come from a first script, reveals, takeovers and reduced motion from `motion.js` itself; dialogs were not opened.

## Reading `motion.js`

| Field | What it says | How to judge it |
|---|---|---|
| `transitions` | each interface element's longest transition: `n`, `median`, `curves` by class; the lists `over300`, `all`, `easeIn` (on any of its properties) and `layout` (width, height, top, left, margin, padding…) | `over300` breaks `timing-1` unless it is not interface (a large entrance); `all` and `layout` break `proof-3` (a measured height excepted); `easeIn` breaks `easing-1`. A `curves.ease` count with no custom curve suggests `easing-2`. A small `n` on a site built with a builder (`generator`) means its interface moves by script: say it under `Not seen` |
| `entrances` | keyframes, `@starting-style` rules or running animations that start at a uniform scale 0 (a line drawn with `scaleX(0)` is not one) | breaks `choreography-5` |
| `hover` | `:hover` rules that move something outside a `(hover: hover)` query | breaks `proof-4` |
| `reveals` | blocks below the first screen hidden at load (faded, moved away or clipped) and shown after scrolling, each counted once at its outermost hidden block: `below`, `hidden`, `shown`, `share`, and `lost`, faded blocks never shown | a share above a few percent without a brief asking for it is the fade-up cliché (`level-3`); a `lost` block is content nobody sees (`choreography-4`), unless it is a slide waiting its turn in a carousel |
| `scroll` | `takeover` (Lenis), `smooth`, `timelines` (scroll-driven animations), `pinned` (sticky sections held inside a taller parent), GSAP `triggers` with `scrub` and `pin`, and `depth`, how far the window scrolled | a takeover needs `Kept on purpose` (`choreography-8`); `smooth` alone is fine for anchors. A `depth` of `0 of …` means the page scrolls inside its own container: reveals and loops out of view were not seen, say so under `Not seen` |
| `loops` | what keeps moving at rest, CSS or script alike (boxes and transforms read 600 ms apart over the whole page): in view at load (`running`), or out of view at the top or the end (`offscreen`) | `offscreen` breaks `proof-5`; a loop beside content needs imagery's `proof-3` pause. A slow opening still playing shows here too: judge it with `timing-4` |
| `reduced` | under reduced motion: what moves as the page loads or at rest (`moving`), animations that move, what moves as the page scrolls (`scrolled`: a scrubbed scene, or an animation that plays as it comes into view), blocks that still slide in, a takeover still active; spinners and progress bars left out | each one breaks `proof-2`, except an element that follows the scroll position one for one (a progress bar, a minimap): set it aside, with why |
| `issues` | one per element that still moves under reduced motion, rule `proof-2`; an element with no class is named after its nearest named ancestor (`svg.logo circle`) | the only kind; sets `pass` to false |

The script loads the page again twice: anything typed into it is lost. It does not see flashes, how motion feels, cross-origin style sheets, menus and dialogs once opened, motion set off by a hover or a key, content hidden when JavaScript is off, or pages that scroll inside their own container. A carousel moving on a timer under reduced motion is a true finding, not noise.
