# Motion

## Every animation has a role
- **guide**: shows where to look or where things go (a reveal that leads the eye, a transition between states);
- **respond**: confirms an action (hover, press, open, success);
- **emphasise**: marks a key moment of the brand, once or twice per page at most.
An animation without one of these roles is removed.

## Personalities
A personality is a consistent set of choices: easing family, range of durations, amount of movement, what moves. For example:
- **calm**: ease-out curves, 400 to 700 ms, short distances (8 to 16 px), opacity and gentle position;
- **fluid**: smooth scroll, progress tied to scrolling, longer eases (600 to 1000 ms), elements that follow each other;
- **theatrical**: strong entrances, masks and large changes of scale, a staged opening of 1.5 to 3 s, then calm.
Build each personality as a copy of the approved home mockup, so the user compares motion only.

## Durations
- Feedback (hover, press, focus): 120 to 250 ms.
- Reveals and transitions: 400 to 800 ms.
- A staged opening: 3 s at most, and scrolling works before it ends.
- Exits are faster than entrances.

## Reduced motion
With `prefers-reduced-motion: reduce`, every page shows its final state: no reveals, no smooth scroll, no staged opening. Content is never hidden while waiting for an animation.

## Tools
- CSS transitions and keyframes first.
- For motion tied to scrolling or long sequences: GSAP 3.15.0 with ScrollTrigger, from jsDelivr:
  `https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js` and `https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js`.
- Smooth scroll only when the personality needs it: Lenis 1.3.26,
  `https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js` and `https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.css`.
- Animate `transform` and `opacity` only.

## Where an entrance plays
An entrance plays when its element comes into view, element by element or row by row, so the visitor actually sees it. What is already on screen when the page loads starts in its final state; nothing waits in a half-animated pose, and nothing plays out of sight.

## Document it
At the top of each motion file, an HTML comment lists every animation: element, role, trigger, duration and easing.
