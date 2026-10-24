# Implementing motion

## Principles
- Reproduce the approved motion file; take durations and easings from the tokens.
- Content is visible without JavaScript. Hide elements for a reveal only once the script has run, with a class on `<html>` set in `<head>`:

```html
<script>document.documentElement.classList.add('js');</script>
```

```css
@media (prefers-reduced-motion: no-preference) {
  .js .reveal { opacity: 0; transform: translateY(16px); }
  .js .reveal.is-in {
    opacity: 1;
    transform: none;
    transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);
  }
}
```

```js
// First thing in main.js, before any library code: content never waits on a CDN.
// No negative bottom margin: an element at the very end of the page must still be revealed.
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }
}, { threshold: 0 });
// What is already on screen at load starts in its final state, without playing.
const inView = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
document.querySelectorAll('.reveal').forEach((el) => {
  if (inView(el)) { el.style.transition = 'none'; el.classList.add('is-in'); requestAnimationFrame(() => { el.style.transition = ''; }); }
  else io.observe(el);
});
```

- Observe each element, or each row of a grid, never the whole grid: an entrance plays when its own element comes into view. A stagger runs inside a row only.
- Animate `transform` and `opacity` only; never `top`, `left`, `width` or `height`.

## Reduced motion
- CSS: every animation sits inside `@media (prefers-reduced-motion: no-preference)`.
- JS: check once and skip the motion code:

```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

With reduced motion: no smooth scroll, no animation tied to scrolling, no staged opening. The page shows its final state.

## Libraries, only if the approved motion uses them

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.css">
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" defer></script>
<script src="assets/js/main.js" defer></script>
```

Connect Lenis to ScrollTrigger in `main.js`, after the reveal observer. `lenis` stays reachable so that menus and dialogs can stop it, and nothing breaks if a library did not load:

```js
let lenis = null;
if (!reduce && window.gsap && window.ScrollTrigger && window.Lenis) {
  gsap.registerPlugin(ScrollTrigger);
  lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
```

## Interactions
- Menus, dialogs and overlays open from the element that opened them, close with a visible button and the Escape key, return focus to that element, and lock scrolling underneath while open: `overflow: hidden` on `<html>`, plus `lenis?.stop()` on open and `lenis?.start()` on close, because Lenis scrolls the page from code. An overlay that scrolls itself gets `data-lenis-prevent`.
- A simulated form validates its fields, shows a success state and sends nothing. Say so in a comment in the code.
- Repeated feedback (hover, press) stays under 250 ms.
