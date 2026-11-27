# Media: images that load, read and hold

## Text over a visual
Text over a photo, a video, a canvas or a gradient must reach 4.5:1, or 3:1 when large, against what is behind it. Not against the average: against the worst place under the letters. `imagery.js` hides the text, captures its box and keeps the worst 5 % of pixels.

When it fails, in this order:
1. Move the text to the calm area of the image, or crop the image so the calm area is under the text.
2. A scrim: a gradient from the ground colour at 60 to 80 % to transparent, under the text only.
3. A solid panel behind the text.
4. A different image.

A text shadow alone rarely fixes it on a busy image.

## Formats and sizes
- Photos in AVIF or WebP with a JPEG fallback through `<picture>`; drawings and icons in SVG.
- `srcset` and `sizes` so each screen gets about twice the pixels it shows: sharp on dense screens, not heavier than needed.
- Library photos are sized through their URL (`source.md`).

## Space and loading
- `width` and `height` on every `<img>`, or an `aspect-ratio`, so nothing jumps when it loads.
- The image of the first screen: `fetchpriority="high"`, never `loading="lazy"`.
- The rest: `loading="lazy"` and `decoding="async"`.

```html
<img src="still-1600.avif" srcset="still-800.avif 800w, still-1600.avif 1600w, still-2400.avif 2400w"
     sizes="100vw" width="2400" height="1350" fetchpriority="high" alt="The hunter's boat drifting at night.">
```

## Video
- A loop is a video, not a GIF: `<video autoplay muted loop playsinline poster="…">`, much lighter.
- If it plays more than 5 s beside other content, a visible pause control (`proof-3`).
- Under reduced motion, show the poster.
- A video with speech needs captions (WCAG 1.2.2).

## WebGL and canvas
- A still image in place of the canvas when WebGL is missing or under reduced motion.
- Pause when off screen (`IntersectionObserver`) and when the tab is hidden.
- Keep the original image, with its `alt`, in the page: the canvas is the treatment, not the content.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-5` · A raster image is sharp at 2x and no heavier than 3x, through `srcset` and `sizes` | under 2x it blurs on most screens; over 3x it costs load time for nothing | heuristic | Studio | imagery audit + critic phase 4 |
| `proof-6` · The first-screen image loads at once with priority; the others load lazily | a lazy first image delays the page's largest paint, and eager images below cost data | heuristic | Vercel | imagery audit + critic phase 4 |
| `proof-7` · WebGL and video have a still fallback, honour reduced motion and stop when off screen | not every device runs them, and a hidden animation still drains the battery | heuristic | Vercel, Kowalski | critic phase 4 |
