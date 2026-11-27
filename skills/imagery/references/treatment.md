# Treatment: one hand for every image

Images from different sources look like a collage of strangers. One treatment makes them one set: the same light, the same colour temperature, the same crop logic, the same hand.

## One treatment
- Write it in one sentence on the entry: `Treatment: cool daylight, close crops on texture, a light grain over every photo`.
- `colour` reads the images (`colour.py dominant`) and reports a cast that does not fit. Fix it here, on the images, rather than bending the palette to each one.
- Keep it when an image is added later: the treatment is a rule, not a filter applied once.

## Crop
- `object-fit: cover` with an `object-position` set on the focal point, never the default centre.
- On a phone, a wide image often loses its subject: use `<picture>` with a narrower crop for small screens.
- Check the crop at 1440, 768 and 390 px: a head, a product or a face must stay whole.

## Recipes
Each one works on a real image. None of them makes an image out of nothing.

```css
/* Duotone: the lights take the light colour, the shadows the dark one. */
.duotone { position: relative; isolation: isolate; background: var(--background); }
.duotone img { display: block; filter: grayscale(1) contrast(1.1); mix-blend-mode: multiply; }
.duotone::after { content: ""; position: absolute; inset: 0; background: var(--primary); mix-blend-mode: lighten; }

/* A dot screen over the image. A true halftone, dots sized by brightness, is drawn in a canvas. */
.halftone { position: relative; }
.halftone::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle, transparent 40%, var(--background) 42%) 0 0 / 6px 6px; mix-blend-mode: screen; }
```

- **Dither** and **ASCII**: draw the photo into a `<canvas>`, read its pixels, and redraw them as an ordered dither (a 4 × 4 Bayer matrix) or as characters by brightness. Keep the original as the `<img>` with its `alt` for people and search, and show the canvas over it.
- **Grain on a photo**: a texture layer balanced at mid grey (`finish.md`), the same on every image.

## Illustration and 3D
Lessons from Gavin Nelson's renders for Linear:
- One hand and one style for every illustration; mixed styles read as a kit.
- 3D in one material and one light; reflections behind text kept calm, or the text stops reading.
- To push an object back, lower its opacity rather than darken it: darker reads as a different material.
- Flatten a render until it sits with the page's other illustrations.
- Remove depth of field where it blurs what matters.

## The outline of an interface capture
Where a screenshot or a photo meets a ground of its own value, its edge disappears. Krehel's fix: a 1 px outline drawn inside the edge, pure black or white at low alpha, never a tinted grey, which shows as a coloured fringe. Skip transparent artwork such as logos and illustrations.

```css
:root { --image-outline: oklch(0 0 0 / 0.1); }
.dark { --image-outline: oklch(1 0 0 / 0.1); }
.capture { outline: 1px solid var(--image-outline); outline-offset: -1px; }
```

## Type as the image
Type set as the image stays live text: large, cropped, overlapping, but selectable and readable by everyone. A picture of text is allowed only for a logo (`treatment-5`).

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `treatment-4` · An interface capture, or a photo meeting a ground of its own value, gets a 1 px inset outline, black or white at 0.1, never a tinted grey | the edge disappears on a ground of the same value, and a tinted outline shows as a coloured fringe | heuristic | Krehel UI | imagery audit + critic phase 4 |
