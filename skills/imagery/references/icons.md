# Icons

An icon helps when words alone make a choice slow. It is never decoration.

## Where an icon helps
- **Options to pick**: sizes, methods, categories.
- **States**: full, sold out, done, error.
- **Actions known by their symbol**: close, menu, search, back, play.
- **Wayfinding**: address, hours, phone.

Not in front of every heading, not as a grid standing in for content, never an emoji or a sparkle in their place.

## One library

| Library | Licence | Character |
|---|---|---|
| Lucide (lucide.dev) | ISC; the icons taken from Feather under MIT | Even stroke, rounded ends, close to Feather |
| Phosphor (phosphoricons.com) | MIT | Six weights from thin to fill, a duotone variant |
| Tabler (tabler.io/icons) | MIT | Even stroke, a large set |

Choose by the type: a stroke and corner that match its weight and terminals. One library on a page; mixed libraries look assembled. No icon font: inline SVG or a component that renders one.

## Stroke, size, colour
Krehel's table, in rendered pixels, for the text beside the icon:

| Text beside it | Stroke |
|---|---|
| Regular (400), 14 to 16 px | 1.5 px |
| Medium or semibold (500 to 600) | 2 px |
| Bold (700), or an icon standing alone | 2.5 px |

- A 24 px icon drawn at 16 px thins its stroke: use the library's absolute stroke option, or `vector-effect: non-scaling-stroke`.
- Size inline icons at 1em to 1.25em of the text, so they scale together.
- Draw with `currentColor`; hover, selected and disabled come from colour and opacity in CSS. Outline by default, filled for the active state.
- Check each icon at its smallest size; a detailed glyph turns to mush at 16 px.

## Access
- An icon beside a visible label is hidden from assistive technology: `aria-hidden="true"`.
- An icon-only button needs a name; `components` decides how.
- An icon needed to understand the content reaches 3:1 against what touches it (`icon-3`).
