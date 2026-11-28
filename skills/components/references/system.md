# System: what becomes a component, and how it holds its state

A component is a promise that the same thing behaves the same way everywhere. Make that promise only when it is true, and keep it in one place.

## The third repetition
Count the uses (`system-1`). Two cards in a section stay two copies; the third time the same structure does the same job with the same states, it becomes a component. Two things that look alike but do different jobs (a tag you click to filter, a badge that only labels) stay apart: sharing their code would tie two decisions together.

- **In the mockup** (static HTML, phase 3): the shared style goes in `design/maquette/components.css`, under a class named after the component (`.service-card`), and the markup is copied identical in each page. The `## Components` entry lists it with its uses. A difference between copies is either a variant (an attribute) or a mistake.
- **In the build** (phase 4): one component of the stack per abstracted pattern, its variants as props that become attributes. The markup of the frozen mockup is the specification, not something to paste.

## Three layers that never mix
| Layer | Holds | Example |
|---|---|---|
| Structure | the element and its ARIA state | `<button aria-expanded="false" aria-controls="hours">Horaires</button>` |
| Behaviour | a script that flips attributes and moves focus, nothing else | `button.setAttribute('aria-expanded', String(open))` |
| Style | CSS that reads the attributes and the tokens | `[aria-expanded="true"] .chevron { rotate: 180deg; }` |

State lives in the attribute assistive technology reads (`system-2`): `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-current`, `aria-invalid`, `aria-busy`, or the native `open`, `checked`, `disabled`. When ARIA has no word for it (a loading step, an orientation), use `data-state="working"`. Never a parallel `.is-open` class: the class and the attribute drift apart, and the page then shows one thing and says another.

Variants are attributes too: `data-variant="quiet"`, `data-size="sm"`. In a Tailwind stack, Kowalski's picks build them with `cva` (variants with a typed API) and `clsx` (conditional classes).

## Values from the tokens
Every colour, radius, space, duration and curve comes from `tokens.css` (`system-3`): `var(--primary)`, `var(--radius)`, `var(--spacing-gutter)`, `var(--duration-press)`, `var(--ease-out)`. `check.js` reports a value written by hand from phase 3 (`token`). A component that needs a value the tokens lack asks for a token; it does not invent one.

Components carry no gesture of their own (`system-4`). The direction's gesture already lives in its colour, type, layout, imagery and motion; the controls let it through. A press scales as `motion` says, a ring takes `--ring`, a corner takes `--radius`.

## Broken → fixed

```text
Broken: a script adds `.open` to the menu and forgets `aria-expanded`; a screen reader hears "collapsed" on an open menu.
Fixed:  the script sets `aria-expanded="true"`; the CSS shows the panel with `[aria-expanded="true"] + .panel`.

Broken: the fourth service card is copied from the third with its padding changed by hand.
Fixed:  the card is a component since its third use; the fourth one is `data-size="wide"`.
```
