# Typography

## Sources (free)
- **Google Fonts** (fonts.google.com). Load with a `css2` link, for example `https://fonts.googleapis.com/css2?family=Family+Name:wght@400;700&display=swap`. Most families are under the SIL Open Font License (OFL), free for commercial use.
- **Fontsource** (fontsource.org): the same open families and more, self-hostable. Load from jsDelivr with a pinned version, for example `https://cdn.jsdelivr.net/npm/@fontsource-variable/<family>@<version>/index.css`.
- Check each family's licence on its page and note it in your proposal's Sources list (family, source, licence); at D1 the approved ones go into `design/kit/media.md`. Never use a font whose licence you have not checked.

## Choosing
- Start from the intent, not from a favourite. Decide what the type must say: authority, warmth, precision, craft, energy.
- A pairing needs a reason: a contrast of voices (a display face for headlines, a text face for reading), or one family with enough range (widths, weights, optical sizes).
- Look beyond the families seen on most generated sites (the usual geometric and neo-grotesque sans). Use them only when the intent calls for them, and say why.
- Test the pairing on the real headline and real body copy, at both widths.

## Scale
- A modular scale (ratio between 1.2 and 1.5) with fluid sizes: `clamp(min, preferred, max)`.
- Body text: 16 to 20 px, line height 1.4 to 1.6, 45 to 75 characters per line.
- Large headlines: tighter line height (1.0 to 1.15), slightly negative tracking, `text-wrap: balance`.
- Small labels: positive tracking, never under 12 px.

## Tokens
Name type tokens by role: `--font-display`, `--font-text`, `--text-sm` to `--text-4xl`, `--leading-tight`, `--leading-body`, `--tracking-tight`.
