# Measures: what real sites do, and reading `motion.js`

One capture on 2026-11-27. Reference points, never quotas.

## What 23 home pages do
9 products and design-engineer sites (Linear, Vercel, Raycast, Stripe, Resend, jakub.kr, emilkowal.ski, rauno.me, raphaelsalaja.com) and 14 recent brand sites from siteofsites.co, at 1440 × 900, once with motion and once with reduced motion, scrolled to the end with the wheel.

| Measure | Result |
|---|---|
| Interface transitions | products hold their median at 100–300 ms (Linear 100, Vercel 100, Resend 150, Stripe 300); 5 of 14 brand sites reach 400–500 ms on links and buttons |
| Curves | products write their own `cubic-bezier` (Vercel 128 of 129 transitions, Stripe 181 of 191); among the most frequent, Kowalski's `0.23, 1, 0.32, 1` and the drawer curve `0.32, 0.72, 0, 1`. `ease-in`: 19 declarations across the 23 sites |
| Reveals on scroll | rare on products: Linear 1 of 185 blocks below the first screen, Vercel 0, Stripe 7 of 248, Resend the exception (57 of 304 hidden at load); 7 of 14 brand sites hide more than 10 % of their blocks at load, and on 4 of them more than 10 % appear as the page scrolls, up to 56 % (Jungle Jungle) |
| Smooth-scroll takeover | Lenis on 8 of 14 brand sites, on no product |
| Libraries | GSAP on 7 brand sites, Motion on 3 sites, WebGL on 7; products mostly CSS |
| Modern CSS | `linear()` springs on Vercel and Raycast; `animation-timeline` on 6 sites; `@starting-style` on 4 |
| Reduced motion | every product has rules for it; 8 of 14 brand sites have none, and 2 still move more than 20 boxes when asked not to |

The products feel fast because they keep the interface short and on their own curves, and leave the scroll alone. The brand sites that feel slow add the same three habits: long hovers, fade-ups and a scroll takeover.

Limits: one day; scroll-library reveals are seen through their effect, not their code; dialogs were not opened.

## Reading `motion.js`

| Field | What it says | How to judge it |
|---|---|---|
| `transitions` | each interface element's longest transition: `n`, `median`, `curves` by class, and the lists `over300`, `all`, `easeIn` | `over300` breaks `timing-1` unless it is not interface (a large entrance); `all` breaks `proof-3`; `easeIn` breaks `easing-1`. A `curves.ease` count with no custom curve suggests `easing-2` |
| `entrances` | keyframes, `@starting-style` rules or running animations that start at scale 0 | breaks `choreography-5` |
| `hover` | `:hover` rules that move something outside a `(hover: hover)` query | breaks `proof-4` |
| `reveals` | blocks below the first screen hidden at load and shown after scrolling: `below`, `hidden`, `shown`, `share` | a share above a few percent without a brief asking for it is the fade-up cliché (`level-3`); a hidden block never shown is lost content (`choreography-4`) |
| `scroll` | `takeover` (Lenis), `smooth`, `timelines` (scroll-driven animations), GSAP `triggers` with `scrub` and `pin`, and `depth`, how far the window scrolled | a takeover needs `Kept on purpose` (`choreography-8`); `smooth` alone is fine for anchors. A `depth` of `0 of …` means the page scrolls inside its own container: reveals and loops out of view were not seen, say so under `Not seen` |
| `loops` | infinite animations in the first screen (`running`), and those still running out of view (`offscreen`) | `offscreen` breaks `proof-5`; a loop beside content needs `imagery` `proof-3`'s pause |
| `reduced` | under reduced motion: boxes still moving, animations that move, blocks that still slide in, a takeover still active | each one breaks `proof-2` |
| `issues` | one per element that still moves under reduced motion, rule `proof-2`; an element with no class is named after its nearest named ancestor (`svg.logo circle`) | the only kind; sets `pass` to false |

The script reloads the page twice: anything typed into it is lost. It does not see flashes, how motion feels, cross-origin style sheets, menus and dialogs once opened, hovers driven by script, or pages that scroll inside their own container. A carousel moving on a timer under reduced motion is a true finding, not noise.
