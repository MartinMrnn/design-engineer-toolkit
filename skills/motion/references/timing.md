# Timing: fast enough to feel instant, long enough to be read

The curve decides the shape of a motion; the duration decides whether it belongs in the product at all (Salaja). The more often a motion is seen, the shorter it is.

## Durations by size
The sources agree on small things and spread on large ones. The studio's column is the one to use.

| Element | Kowalski | Krehel | Salaja | Studio |
|---|---|---|---|---|
| Press, hover | 100–160 ms | 150 (press) | ~100 (hover), 120–180 | **100–160** |
| Tooltip, small popover | 125–200 | 150 | — | **125–200** |
| Menu, dropdown, select | 150–250 | 250 | 180 | **150–250** |
| Dialog, drawer, sheet | 200–500 | 350–450 | 300 (sheet) | **200–300** |
| Toast | 400 (Sonner) | — | 240 | **200–300** |
| Page change | — | — | 400 | **200–300, or none** |

The 300 ms ceiling for the interface (`timing-1`) is the user's choice after trying 200, 300 and 450 ms side by side, and what the measure shows: products hold their median at 100 to 300 ms, while five brand sites that reach 400–500 ms feel slower on every link. `check.js` reports any transition over 300 ms on what a visitor hovers, presses or opens (`transition-duration`).

- A page change is seen at every navigation, so it stays interface: 300 ms at most, even in a radical direction. A radical direction carries its idea through what moves in those 300 ms (a shared element that morphs from one page to the next), not through length.
- Nothing that must be seen moving lasts under about 100 ms; under that it reads as a jump.
- When a motion feels slow, shorten it before touching the curve.
- A big jump within the range takes the longer end; a small one the shorter end. A container that resizes by a few pixels and by half the screen should not take the same time.

## Exits
An exit lasts 60 to 75 % of its entry (`timing-3`): a menu opening in 200 ms closes in about 140, a dialog opening in 280 closes in about 200. It leaves the way it came: a drawer that slid from the right goes back to the right, a popup shrinks toward its trigger. When several things leave together, they go at once, without a reverse stagger. Where motion says nothing, an element may simply disappear.

## Moments seen once
An opening, a first run, an explanation or a success is seen once per visit, and may run longer as part of the message. Each move stays under about 600 ms, the whole moment around a second, and the page is usable from the first frame.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `timing-4` · A moment seen once per visit (an opening, a first run, an explanation) may run past 300 ms, each move under about 600 ms, and never holds back reading, scrolling or a click | it is part of the message, but a page that waits for its show loses people | heuristic | Kowalski, Salaja timing, Studio | critic phases 3, 4 |
| `timing-5` · Durations and curves come from the motion tokens, never written by hand | one source keeps every motion in the same family | heuristic | Tailwind, Studio | critic phases 3, 4 |

## The motion tokens
In `tokens.css`, beside the colour and type tokens. Tailwind has no duration namespace; `--default-transition-duration` points its utilities to the base one.

```css
:root {
  --duration-press: 140ms;
  --duration-small: 180ms;
  --duration-menu: 200ms;
  --duration-dialog: 260ms;
  --duration-page: 240ms;
  --duration-moment: 600ms;
  --default-transition-duration: var(--duration-small);
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-colour: ease;
}
```

Keep these names, add one only for an element the table does not cover, and write it in the entry. An exit takes its entry token times 0.7: `calc(var(--duration-dialog) * 0.7)`. Curves and springs, and how long a spring really lasts, are in `easing.md`.

## Check it slowed down
Speed hides flaws. Replay each motion at five to ten times its duration (the browser's animation panel, or a temporary multiplier on the tokens) and look for two states overlapping, a wrong origin, properties out of step, an abrupt stop. To time a motion you admire, record it and count frames: at 60 fps, 12 frames are 200 ms.
