# Shape

Shapes are corners, silhouettes and borders. Like colour, they need a logic, or the page looks assembled from several kits.

## The shape logic
State it in one sentence: which radii exist, on what, and why. For example: "round means it can be picked up: buttons and tags; the page structure stays straight". Or: "everything is square, like the printed programme". The logic follows the level: a restrained direction keeps one or two radii; a radical one may make a single shape its gesture.

**Measured.** The 9 brand sites use none or one radius besides the pill; the 6 product sites use 3 to 14.

## Radii as tokens
shadcn sets one base, `--radius`, and derives the others from it: `--radius-sm` (0.6 ×), `--radius-md` (0.8 ×), `--radius-lg` (1 ×), `--radius-xl` (1.4 ×), and larger. Keep three at most, plus the pill (`9999px`) if the logic uses one. A square direction sets `--radius: 0` and keeps the names, so components stay compatible. From phase 3, `check.js` reports radii written by hand (`script token`).

Few, simple forms are read at once (Prägnanz). A cut corner, a blob or a wavy edge is a gesture: once, on purpose, never as decoration everywhere.

## Nested radii
When a rounded surface sits inside another with an even inset, the curves are parallel only if

```
outer radius = inner radius + inset (+ the outer border width)
```

```css
.panel { padding: 0.5rem; border-radius: calc(var(--radius) + 0.5rem); }
.panel > .inner { border-radius: var(--radius); }
```

With the same radius on both, the corners bulge at different distances. Past about 24 px of inset, or with an uneven inset, the two are separate surfaces: each keeps its own token. **Measured:** 13 of 14 nested surfaces on the 15 pages are concentric. `layout.js` lists each nested pair as concentric, same or other.

## Optical alignment
Geometry is not what the eye sees. Adjust by eye, then by 1 or 2 px:
- **A button with an icon:** about 2 px less padding on the icon's side.
- **A play triangle:** moved toward its point, or it looks pushed back.
- **Asymmetric icons** (stars, arrows): fixed in the SVG, so no component needs an offset.
- **A large headline:** its first letter's side bearing can make it look indented against the text below; shift it until the edges look aligned.
- **Icon and text lockups:** the icon's visual centre on the text's x-height, not on the line box.

## Broken and fixed

| Broken | Fixed |
|---|---|
| 4, 6, 8, 12, 16 and 24 px radii on one page | `--radius` and `--radius-sm`, plus the pill |
| A 16 px card holding a 16 px image with 8 px of padding | A 24 px card, or an 8 px image |
| Square cards next to round buttons next to blob shapes, with no reason | One sentence of logic, followed |
| An arrow icon that looks off-centre, nudged in every button | The SVG fixed once |
