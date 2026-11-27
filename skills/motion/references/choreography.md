# Choreography: what moves, in what order, with which tool

Good choreography is mostly cutting moving parts and running the rest together. Order a sequence only when the order means something.

## Interruption
Interface state uses **transitions** (`choreography-1`): when the visitor reverses mid-way (hovers out, closes what is opening, clicks twice), a transition turns back from where it is; a keyframe animation restarts from zero and jumps. Keep keyframes for what plays once, through to its end: an opening, a loader. Test every animation by reversing it halfway.

## Cast the elements
Before any timing, give each moving element a role:

| Role | What it is | Treatment |
|---|---|---|
| Lead | the one thing to notice: the new view, the item acted on, the title | moves first and furthest |
| Support | what follows the lead: its text, its actions | shorter and smaller motion |
| Decoration | badges, dividers, background accents | fades only, or nothing |
| Static | everything else, containers whose content moves included | does not move |

Two leads mean a hierarchy problem motion cannot solve. Most groups shrink at this step: a panel with eight items is one move, the panel's.

- **Together**, by default: parts of one object, or of one moment, start together. An element that leaves frees its space at once, so its neighbours close the gap while it fades.
- **Overlap**, a stagger, when the order means something (reading order, cause and effect). Rauno Freiberg's "Designing Depth" compares it to a flock: slight differences in time and distance.
- **Sequence**, when both at once would collide: two dense views in a container that changes size both ways, or a layer that must be in place before the next appears. Start the second just before the first ends.
- **Carry**: when a child cannot be animated on its own, move its parent and let it come along.

**One entrance per container** (`choreography-2`). **Staggers** (`choreography-3`) stay on rare moments, uneven (the lead travels furthest, gaps that shrink read as organic), 30–80 ms between items in the interface, 100–150 ms on an opening; for a long list, only the first few, the rest with the last. Never on menus, lists or anything opened often.

## Nothing waits on motion
What is visible can be clicked; a delayed item never holds back a button the visitor is reaching for (`choreography-4`). What is on screen when the page loads starts in place; only the one opening moment of an assertive or radical direction plays there. Content is visible without JavaScript: hide an element for its entrance only once the script has run, for example with a `js` class set on `<html>` in the `<head>` and the hidden state written under `.js` and `prefers-reduced-motion: no-preference`.

## Origin and scale
A popup grows from its trigger: `transform-origin` toward it, or the variable a component library exposes for it (`choreography-5`). It enters from a scale of 0.95 to 0.98 with its opacity, never from `scale(0)`: nothing real appears from nothing. The larger the surface, the closer to 1 (a dialog from 0.98). A dialog centred on the screen has no trigger to grow from and keeps the centre. A press scales to about 0.97, never on a disabled control. Movement travels only far enough to show a direction: a few pixels for a text swap, 8 to 32 for a popup, up to most of its own size for a drawer.

## Morphing
An element that becomes another stays **one object** (`choreography-6`): the container carries the move (size, position, corner radius), its contents crossfade, and a light blur, 2 to 4 px, hides the moment two contents overlap. Each pair of elements shares one name: `view-transition-name` with the View Transitions API, or a `layoutId` in Motion; two unrelated elements with one name fly into each other. To animate a height that depends on content, measure an inner wrapper with a `ResizeObserver` and animate the outer one to that number, `overflow: hidden` while it moves, a fixed first height until the content mounts (Salaja, Krehel).

**States change in place** (`choreography-7`), the way Hairline UI's components do: a button carries its job through idle, working, done and failed instead of swapping a spinner for a toast somewhere else; a changing label morphs, the letters it keeps sliding into place and the new ones rising out of a blur; the moment it worked is marked where it happened; a failure shakes once, a few pixels, and offers the action again. Under reduced motion the state simply changes in place. Announcing the change to screen readers is `components`'.

## Scroll, when the brief asks
Scroll-driven motion is done only when the brief asks for it (`choreography-8`), and then done well:
- The page keeps its native scroll. A library that takes it over (Lenis) needs a `Kept on purpose` reason; it must stop while a dialog is open and never start under reduced motion.
- Prefer CSS first: `animation-timeline: view()` or `scroll()` for reveals and progress; GSAP's ScrollTrigger for a scene with several steps, scrubbed to the scroll position.
- A pinned section never traps the visitor: it ends within a short scroll, and everything in it is reachable without it.
- A reveal guides the eye to one thing; most content stays put.
- Under reduced motion: no scene, no pin, no smooth scroll; the final state.

## Page transitions
A change of page or view is a crossfade of 200 to 300 ms, or nothing; a shared element may morph across it (View Transitions API, `@view-transition { navigation: auto; }` between pages of one site). Forward and back move in opposite directions.

## Tools and media

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `choreography-9` · The lightest tool that works: CSS transition, `@starting-style`, CSS animation, the Web Animations API, then a library only with a written need (Motion for springs, gestures and shared layout; GSAP for scroll scenes) | every library is weight and a dependency to keep | heuristic | Kowalski, Motion, GSAP, Studio | critic phase 4 |
| `choreography-10` · Video, WebGL, Rive and Lottie move on the page's clock: their timing and curves say the same gesture as the rest | a canvas with its own rhythm reads as pasted on | heuristic | Studio | critic phases 3, 4 |

| Need | Tool |
|---|---|
| Hover, press, colour, a state set by a class or attribute | CSS transition |
| An element that animates as it appears, without script | `@starting-style` |
| A fixed motion that must stay smooth while the page is busy | CSS animation on `transform` and `opacity` |
| Control from script with CSS performance | the Web Animations API (`element.animate()`) |
| Springs that keep velocity, gestures, shared layout, exits in React | Motion |
| A scroll scene with several steps | GSAP with ScrollTrigger |

Every library is a dependency: Ask first, and its need goes on the entry's `Tools` line. GSAP is free for commercial sites under its own licence (see `sources.md`).

Rive and Lottie files are `imagery`'s assets; here they take their timing from the tokens, answer the visitor rather than loop for nothing, pause off screen, and show a still under reduced motion. Video and WebGL follow the same rules.
