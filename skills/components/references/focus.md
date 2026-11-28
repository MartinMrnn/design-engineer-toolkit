# Focus: how it shows, and where it goes

## The ring
One rule for the whole site, in the base styles (`focus-1`):

```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

- `:focus-visible`, not `:focus`: the keyboard gets the ring, a mouse click on a button does not; fields always show it.
- An outline, not a `box-shadow`: it follows `border-radius` (Safari 16.4 and later), stays visible in forced colours where box-shadows vanish, and takes no layout space. The user chose it on a live demo against the browser default and a box-shadow ring; 6 of 9 measured products draw theirs.
- `--ring` is `colour`'s token, already checked at 3:1 by `palette` (`colour proof-2`). `components.js` measures the ring as drawn (`focus-2`): on its real ground, at its real offset.
- Never `outline: none` without this rule in its place. A component may draw its focus differently (a field's border turning `--ring`), as long as it keeps 3:1 and is at least as visible.
- A group lights up with `:focus-within` when the focus is inside it: a search field with its button inside one border.
- A card whose heading link covers it shows its ring on the card: `.card:has(a:focus-visible) { outline: 2px solid var(--ring); outline-offset: 2px; }`, and none on the link.

## Other grounds
A section on a dark or coloured ground sets its own `--ring` (`focus-3`), checked the same way. Over an image or a video, no single colour is safe: give the ring a second tone, the outline in `--ring` and a halo in `--background` drawn just outside it (`box-shadow: 0 0 0 4px var(--background)` with `outline-offset: 0`). The halo may vanish in forced colours; the outline stays.

```css
.band { --ring: oklch(0.86 0.09 160); }
.over-image :focus-visible { outline-offset: 0; box-shadow: 0 0 0 4px var(--background); }
```

Forced colours (Windows contrast themes) replace colours with the system's: the outline survives and takes the system colour. Leave `forced-color-adjust` alone unless a control disappears, and check it in the finishing pass.

## Skipping repeated blocks
WCAG 2.4.1 asks for a way to skip what repeats on every page (`focus-4`). Landmarks (`header`, `nav`, `main`, `footer`) and real headings do it for assistive technology. A skip link helps the sighted keyboard user, and is worth it when more than five stops come before `main` (`focus-5`); none of 23 measured home pages has one first. It is the first focusable element, hidden until focused, and points at `main`.

```html
<a class="skip-link" href="#main">Aller au contenu</a>
```

```css
.skip-link { position: absolute; inset-inline-start: -999px; }
.skip-link:focus { inset-inline-start: 16px; inset-block-start: 16px; }
```

## Where focus goes
- **It never lands on `body`** (`focus-6`). When what holds the focus disappears (a closed dialog, a deleted row, a list filtered away), focus goes to the trigger, the next row, or the list's heading.
- **A route change** in a single-page app moves focus to the new view's `h1` (with `tabindex="-1"`) and updates `document.title`.
- **Order** follows the reading order (`ux behaviour-11`). Fix the DOM order rather than the Tab order: `tabindex` is `0` to join it, `-1` to receive focus from a script, never positive (`focus-7`).
- **Composites** (tabs, toolbars, radio groups, listboxes, grids) are one Tab stop: the active item has `tabindex="0"`, the others `-1`, and arrow keys move both (roving tabindex). A combobox keeps focus in its field and points at the active option with `aria-activedescendant`.
- **Sticky content** never hides the focused element (`layout proof-9`): `scroll-padding-top` the height of the header.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `focus-5` · Landmarks and headings first; a skip link, first in the Tab order, when more than five stops come before `main` | landmarks meet the criterion, and none of 23 measured sites has a skip link; a long header still costs a keyboard user many presses | heuristic | Studio, Vercel, Krehel accessibility | components audit + critic phase 4 |
| `focus-6` · Focus never lands on `body`: when what holds it disappears it goes to the trigger or the nearest logical place; a route change moves it to the new view's `h1` | a lost focus sends the keyboard user back to the top | heuristic | APG, Krehel accessibility | components audit + critic phase 4 |
| `focus-7` · `tabindex` is `0` or `-1`, never positive; a composite widget is one Tab stop with arrow keys inside | a positive value reorders the whole page; a long composite makes Tab a chore | heuristic | APG, Krehel accessibility | components audit + critic phase 4 |
