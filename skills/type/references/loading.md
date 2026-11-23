# Loading: fonts that arrive well

## Host them yourself
Self-host in **WOFF2**. It needs no third-party request, the files stay under the project's control, and nothing about the visitor is sent to a font service. Keep the licence file next to the fonts when the licence asks for it.

```
public/fonts/
├── face-variable.woff2
└── OFL.txt
```

If the project already uses a font host and the brief does not change it, keep it and mention it.

## Declare them

```css
@font-face {
  font-family: "Face";
  src: url("/fonts/face-variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

- **`font-display: swap`** shows the text at once in the fallback. About half of sites use it (Web Almanac 2025).
- **`font-display: optional`** suits a secondary face that is not worth a visible change.
- Avoid `block` for text: it leaves the page blank while the font loads.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the **one or two** files seen first, usually the headline and the body. Preloading everything slows the page.

## Load only what is used
- List the weights and styles the roles use. Load those, and nothing else.
- One or two weights: static files can be smaller. Several weights, or an optical axis: a variable font usually wins.
- Subset to the project's languages when the licence allows it. Keep the accents, typographic punctuation and figures. Check with the board afterwards.

## No faux styles
If a family has no bold or italic, the browser fakes one and distorts the letters. `type.js` lists them in `fauxBold`.

| Broken | Fixed |
|---|---|
| `font-weight: 700` with only a 400 file | Load the 700, or use a weight the family has |
| `font-style: italic` with no italic file | Load the italic, or emphasise with weight |
| `font-synthesis: none` on the whole body | Only on a verified element, and only the longhand needed |
| `font-variation-settings: "wght" 650` | `font-weight: 650`, which still works on the fallback |

## A fallback that does not jump
When the font arrives, the text must not move. Declare a local face adjusted to the real one:

```css
@font-face {
  font-family: "Face Fallback";
  src: local("Arial");
  size-adjust: 104%;
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
:root { --font-sans: "Face", "Face Fallback", system-ui, sans-serif; }
```

The values depend on the face: compute them from its metrics, or use the tool of your framework, such as `next/font`. Check by comparing the page with and without the font.
