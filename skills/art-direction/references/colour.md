# Colour

## Building a palette
Start from the intent: what should a visitor feel in the first second? Decide the colour logic before the colours:
- **ground**: the background family (light, dark or tinted);
- **ink**: the text colours, with enough contrast;
- **accent**: one or two colours, and where they are allowed (only on actions? only in one section? only in photos?);
- **neutrals**: lines, muted text and surfaces, all with the same temperature.

Write the logic in one sentence on the tile, for example "the accent only appears on what you can click".

## Contrast (WCAG 2.x)
- Body text: at least 4.5:1 against its background.
- Large text (24 px and more, or 19 px bold) and interface parts that carry meaning (input borders, focus rings, icons): at least 3:1.
- Check every text and background pair you use. Run this with `browser_run_code_unsafe` (as `code`), replacing the pairs with yours (six-digit hex values):

```js
async (page) => page.evaluate(() => {
  const lum = (hex) => {
    const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
  };
  return { 'ink on ground': ratio('#1a1a1a', '#f5f1ea'), 'accent on ground': ratio('#b4532a', '#f5f1ea') };
})
```

A pair under its threshold changes before it reaches a mockup.

## Colour that means something
- Where the B2 plan has choices or states (available, full, selected, sold out, error, success), give each its colour role, drawn from the palette, and keep it the same everywhere. Name them by meaning: `--color-selected`, `--color-unavailable`, `--color-error`.
- Never let colour carry a meaning alone: pair it with a word, an icon or a shape, for people who do not see the difference.
- A palette of two colours can be striking, but check that the interface still tells options, states and actions apart. If it cannot, add a cue (an icon, a pattern, a weight) rather than a stray colour.

## Tokens
Name colours by role, not by hue: `--color-ground`, `--color-ink`, `--color-ink-muted`, `--color-accent`, `--color-line`. Hues may change; roles stay.
