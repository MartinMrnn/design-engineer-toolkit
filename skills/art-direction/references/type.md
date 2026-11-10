# Typography

## Sources (free)
- **Google Fonts** (fonts.google.com). Load them with one `@import` on the first line of `components/bundle.css`, for example `@import url("https://fonts.googleapis.com/css2?family=Family+Name:wght@400;700&display=swap");`, and name the family in `type.families`. Most families are under the SIL Open Font License (OFL), free for commercial use.
- **Fontsource** (fontsource.org): the same open families and more, self-hosted. Download the font files (WOFF2) into `fonts/` and list each in `type.fonts` (`family`, `file`, `weight`, `style`); `charter.py css` writes their `@font-face`. Never link a font stylesheet from a card.
- Check each family's licence on its page and note it in `14-sources.md` (family, source, licence). Never use a font whose licence you have not checked.

## Choosing
- Start from the intent, not from a favourite. Decide what the type must say: authority, warmth, precision, craft, energy.
- A pairing needs a reason: a contrast of voices (a display face for headlines, a text face for reading), or one family with enough range (widths, weights, optical sizes).
- Look beyond the families seen on most generated sites (the usual geometric and neo-grotesque sans). Use them only when the intent calls for them, and say why.
- Test the pairing on the real headline and real body copy, at both widths.

## Scale
- A modular scale (ratio between 1.2 and 1.5). The type styles hold the sizes at 1440 px (`fontSize`): that is what the Design System page shows.
- Fluid sizes: where a size must follow the viewport (the opening headline, section titles), the `fluid` tokens hold a `clamp()` from the size at 390 px to the size at 1440 px, for example `clamp(2.5rem, 1.6rem + 3vw, 4rem)`. A card keeps the style's class and sets `font-size: var(--fluid-h1)` (`fluid-display-xl`, `fluid-display-l`, `fluid-h1`, `fluid-h2`).
- Body text: 16 to 20 px, line height 1.4 to 1.6, 45 to 75 characters per line.
- Large headlines: tighter line height (1.0 to 1.15), slightly negative tracking, `text-wrap: balance`.
- Small labels: positive tracking, never under 12 px.

## Tokens
Type follows the charter skill's `contract.md`: the families `var(--font-display)` and `var(--font-text)`; one class per style, `.display-xl`, `.display-l`, `.h1`, `.h2`, `.h3`, `.body-l`, `.body`, `.body-s`, `.caption`, `.label`, `.button` (size, line height, weight and tracking together); and `var(--fluid-*)` for the sizes that follow the viewport. Never invent another name.
