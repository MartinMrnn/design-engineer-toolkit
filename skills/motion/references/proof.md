# Proof: motion everyone can bear, and that holds

## Flashes
Nothing flashes more than three times in any one second (`proof-1`, WCAG 2.3.1, level A), unless the flashing area stays small: about a quarter of a 10-degree field of view, roughly 341 × 256 CSS pixels on a 1024 × 768 screen. Saturated red flashes count separately and are worse. Blinking cursors, strobing backgrounds, fast flickering glitch effects and rapid crossfades between light and dark are where it happens. `motion.js` does not measure it; check by eye, frame by frame.

## Reduced motion
`prefers-reduced-motion: reduce` is a person telling their system that motion makes them dizzy or sick; up to a third of adults over 40 have some vestibular trouble (figure cited by Comeau). Under it, **movement stops and the page shows its final state** (`proof-2`). WCAG 2.3.3, which asks that motion triggered by interaction can be turned off, is level AAA; the studio holds it as its own bar, and `check.js` already fails a page whose boxes still move.

| Stops | Becomes | Stays |
|---|---|---|
| parallax, scroll scenes, pinned sections | an instant jump instead of smooth scroll | a fade of opacity or colour |
| slides, scales, flips, morphs of position or size | a crossfade in place | spinners and progress bars |
| autoplaying loops, tickers, carousels | started paused, or a still | a focus ring, a hover tint |
| staggers and staged openings | everything shown together | a press shown by colour or opacity, not by scale |

How:
- **Motion is opt-in.** Write the base state without motion, and put transitions and animations inside `@media (prefers-reduced-motion: no-preference)`. Browsers that do not know the query then get no motion.
- Avoid the global reset that sets every duration to `0.01ms !important`: it also kills harmless fades, and some libraries speed up instead.
- In script, read `matchMedia('(prefers-reduced-motion: reduce)')` and listen for its change: springs, canvas, scroll and cursor motion stop at once. Motion has `MotionConfig reducedMotion="user"`; GSAP has `gsap.matchMedia()`; Lenis is simply not started.
- A choreography collapses rather than shortens: no delays, no travel, the group appears together. If the sequence is the explanation, jump between its steps.
- A server-rendered page cannot know the setting on its first render: start from the still state.

Moving content that starts on its own, runs over 5 s and sits beside other content needs a pause, stop or hide control (WCAG 2.2.2). That rule is `imagery`'s `proof-3`; it covers animated tickers and carousels as much as video.

## Properties
Animate `transform`, `opacity`, `filter` and `clip-path`, named one by one (`proof-3`): they skip layout and stay smooth while the page is busy. `transition: all` animates whatever changes next, including what nobody chose. `width`, `height`, `top`, `left`, `margin` and `padding` force layout on every frame; a height measured with a `ResizeObserver` is the one exception worth it. Heavy blur is costly, Safari most of all: keep it under about 20 px. Add `will-change`, naming the property, only after seeing a first-frame stutter or a 1–2 px shift, and only on what animates.

## Hover
A hover that moves something sits inside `@media (hover: hover) and (pointer: fine)` (`proof-4`): a tap on a touch screen fires the hover and leaves the element stuck. A colour change on hover may stay outside.

## Loops and theme
A loop stops when it leaves the screen (`proof-5`): an `IntersectionObserver` sets `animation-play-state: paused`, or pauses the video or canvas.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-6` · A theme switch fires no transition | every colour transition firing at once smears the switch | heuristic | Freiberg, Krehel motion | critic phase 4 |

Switch off transitions for the theme change, force a style flush, and switch them back on at the next frame.

## Checking by hand
What no script sees, check on the page: open the menus and dialogs, hover and press, reverse each motion halfway, replay it five to ten times slower, and imagine the fiftieth use of the day. Move through the page with the keyboard (Tab, Enter, the arrows) and watch what moves (`purpose-3`). Load it once with JavaScript off: every piece of content must show (`choreography-4`). Gestures (drag, swipe) are checked on a real touch device. On a site whose motion is driven by script (a builder such as Framer, a library), the browser's slow-motion panel does not slow it: record the screen and step through the frames instead.
