# Easing: the shape of a motion

## The tree
Kowalski's decision tree, in order:

1. **Does it enter or leave?** Ease-out: it starts fast, so the interface answers at once, and it lands softly.
2. **Does it move or change shape while staying on screen?** Ease-in-out: it speeds up and slows down like something carried.
3. **Is it a colour or a hover tint?** `ease`.
4. **Does it show time passing?** Linear: a progress bar, a loader, a hold-to-confirm fill, a ticker. Nowhere else: spatial motion at a constant speed looks mechanical.
5. **Anything else:** ease-out.

**Never ease-in on the interface** (`easing-1`). It starts slowly, and the first frames are the ones the eye watches most: a menu on ease-in feels later than the same menu on ease-out at the same duration.

Salaja and Comeau put ease-in on exits, so that what leaves accelerates away. The studio does not: the user compared both on a dialog and chose ease-out, and with ease-out on both sides one rule holds everywhere. The exit is simply shorter (`timing-3`).

## Curves as tokens
The browser's keywords are too soft to feel intended (`easing-2`). Products in the measure write their own curves; two of the most frequent are Kowalski's.

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* entries, exits, state changes */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* movement on screen */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* sheets and drawers, from Ionic */
}
```

A direction may tune these for its voice (a calm direction a softer ease-out), as long as every motion takes them from the tokens. For another shape, take a stronger variant from a curve library rather than drawing one by hand.

## Springs, for what has weight
An ease is a fixed path over a fixed time. A spring is a simulation pulled toward a target: it keeps the speed it has when interrupted, and it takes the velocity of a hand that throws it. Salaja's test: **can it be picked up, does it slide, settle, snap or come back?** Then a spring (`easing-3`): a drawer or sheet, a dragged card returning, a toggle's knob, a tab indicator, a container that morphs. If it fades, changes colour or swaps its content, an ease. A spring on opacity looks wrong: its overshoot is clipped at 1 or flashes.

Set a spring by **duration and bounce**, not stiffness and damping: easier to reason about and to keep consistent. The bounce follows the level (`easing-4`):

| Level | Bounce | Feel |
|---|---|---|
| Restrained | 0 | settles without passing the target (Krehel's default) |
| Assertive | 0.1–0.15 | a hint of weight |
| Radical | up to 0.2 | playful, never wobbly |

A drag-to-dismiss or a playful toggle may take the top of its level's range. Smaller objects read alive with a little more bounce than large ones.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `easing-5` · In CSS, a spring is a generated `linear()` kept in a token with a `cubic-bezier` fallback; a gesture that must keep its velocity uses a spring library | `linear()` needs no dependency, but a CSS transition cannot carry the speed of a throw | heuristic | Comeau springs, Salaja spring | critic phase 4 |

## A spring in CSS
`linear()` draws any curve through a list of points, values over 1 included, so it can hold a spring sampled ahead of time (Comeau). About 40 to 60 points look convincing. Generate them, never type them: this function samples a spring set by bounce, over a duration the transition then states.

```js
// Samples a spring (bounce 0 to 0.3) into a CSS linear() easing.
const spring = (bounce, points = 50) => {
  const zeta = 1 - bounce;
  const w = 2 * Math.PI;
  const stops = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * 1.4;
    const x = zeta >= 1
      ? 1 - Math.exp(-w * t) * (1 + w * t)
      : 1 - Math.exp(-zeta * w * t) * (Math.cos(w * Math.sqrt(1 - zeta ** 2) * t) + (zeta / Math.sqrt(1 - zeta ** 2)) * Math.sin(w * Math.sqrt(1 - zeta ** 2) * t));
    stops.push(i === points ? 1 : +x.toFixed(4));
  }
  return `linear(${stops.join(', ')})`;
};
```

Paste the result into the token, behind a fallback for browsers without `linear()`:

```css
:root { --ease-spring: var(--ease-out); }
@supports (transition-timing-function: linear(0, 1)) {
  :root { --ease-spring: linear(0, 0.0123, /* the generated stops */ 1); }
}
.card { transition: transform var(--duration-dialog) var(--ease-spring); }
```

Its limits: it is still time-based, and a CSS transition reversed mid-way shortens rather than keeping its speed. For a drag or a throw that must keep the hand's velocity, use a spring library (Motion), with its need written in the entry's `Tools` line.
