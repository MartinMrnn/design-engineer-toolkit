# Finish: depth, matter or light

The finish is what makes a page feel made of something. There are three, and a direction chooses **one** to dominate: the one that says its idea. The two others stay functional: a shadow where something floats, nothing more.

| Finish | What it is | Its tools | Discreet → the gesture |
|---|---|---|---|
| **Depth** | Planes in front of and behind each other | Layered subjects, blur and fade to recede, elevation shadows, glass over moving content | One subject over a softened plane → a frame built of several real layers |
| **Matter** | The surface exists: paper, print, film, stone | A real scan or grain, a print screen, an ink edge | A faint grain on large surfaces → the texture is the image |
| **Light** | A source you can place | One direction of light, layered glows, a beam, a gradient that is light | A soft fall-off on the hero → a beam across the page |

Write it on the entry: `Finish: matter, a paper grain on the large surfaces, visible; shadows --shadow-sm to --shadow-lg for menus and dialogs only`.

A glow drawn for the light finish is allowed when it comes from the stated source and sits behind or on a real visual. It never stands in for the image (`source-1`). `imagery.js` lists it under `shapes`; the critic sets it aside when the entry names it.

## Shadows
A shadow says that something floats above the page: a menu, a dialog, a dragged item, a raised card. On 20 measured home pages, 11 of 14 brand sites use no shadow at all; their depth comes from the images. Products use them for interface.

What the measure says, and what to keep:
- **One light, from above.** 86 of 90 shadow layers fall straight down (horizontal offset 0). Comeau's slanted light works too, if every shadow shares it.
- **Layers.** Two or more layers, a tight one for contact and a wide one for ambient light (Comeau, Vercel, Salaja).
- **Colour from the ground.** On a neutral ground, black at low alpha (Linear, Krehel). On a coloured ground, the ground's hue at a lower lightness and chroma, or the shadow looks dirty (Comeau, Vercel).
- **A scale.** Higher means a larger offset, a larger blur and a lower opacity (Comeau).

```css
:root {
  --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.06);
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04);
  --shadow-md: 0 2px 4px oklch(0 0 0 / 0.06), 0 8px 16px oklch(0 0 0 / 0.05);
  --shadow-lg: 0 4px 8px oklch(0 0 0 / 0.05), 0 16px 32px oklch(0 0 0 / 0.05), 0 32px 64px oklch(0 0 0 / 0.04);
}
```

The names follow Tailwind's `--shadow-*` theme, so `shadow-md` works as a class. On a coloured section, redefine them with the section's hue, for example `oklch(0.35 0.06 40 / 0.12)` on a warm ground.

- **A ring instead of a border** (Krehel): `0 0 0 1px oklch(0 0 0 / 0.06)` as the first layer reads as an edge that adapts to any ground and to images. Keep a `border: 1px solid transparent` under it: forced-colours mode drops shadows and draws the border.
- **Dark grounds.** A dark shadow vanishes. Use a 1 px ring of white at low alpha, or a surface a step lighter than its ground.
- Animating a shadow is `motion`'s; animate a pseudo-element's opacity, not `box-shadow` (Salaja).

## Glass
Glass keeps text readable over moving or busy content: a header over a scrolling page, a panel over a video. Without such content behind it, it is a cliché.
- Never glass on glass (Kowalski): legibility collapses.
- A solid fallback for people who ask for less transparency, and for browsers without it:

```css
.glass { background: oklch(1 0 0 / 0.7); backdrop-filter: blur(16px) saturate(1.4); }
@media (prefers-reduced-transparency: reduce) { .glass { background: var(--background); backdrop-filter: none; } }
@supports not (backdrop-filter: blur(1px)) { .glass { background: var(--background); } }
```

- Judge the text on the worst content that will pass behind it (`colour`, `material.md`).
- Blur costs: keep it modest, and avoid many glass layers on one screen.

## Gradients
A gradient is light, a material or the brand; never a default background.
- **Banding.** Smooth gradients show steps on many screens. Nelson removed it with 2 % monochrome noise at 50 % grey, blended in overlay; Kowalski eases the stops. Vercel notes that a mask fading to a dark colour bands, and an image avoids it.

## Matter: texture and grain
- **Micro and macro** (Doron Studio): the fine grain of a paper is the matter you want; its large stains and uneven light are not. Keep only the fine detail.
- **Balance at mid grey.** A texture brought to an average of 50 % grey (a high-pass filter on a scan) and blended in overlay adds matter without darkening or washing out the design.
- A real scan or a print logic beats a generic noise filter. Use it on large surfaces; keep it away from small text.

```css
.matter { position: relative; isolation: isolate; }
.matter::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: url(paper-grain.png) 0 0 / 300px; mix-blend-mode: overlay; opacity: 0.5; }
```

## Depth
From Rauno Freiberg's "Designing Depth":
- Compose with layers. A frame "dirtied" with a foreground object tells more than a clean head-on view.
- Blur a plane to push it back; fade an edge so a container feels endless.
- Build the layers from the project's own subjects, not decoration around them.
- Under an overlay, dim or blur the page: it says that only the overlay acts.

## Light
- One source, placed: the warm side and the shaded side follow it.
- Layered glows rather than one flat one: several soft shapes of different size and opacity, lighter at the centre (Framer University's Figma lesson). Volumetric rays give atmosphere (Nelson), only when the idea is light.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `finish-6` · A texture comes from a real scan or a print logic, is balanced around mid grey so it changes no exposure, and stays off small text | an unbalanced texture darkens or washes out the page, and grain under small text strains the eye | heuristic | Doron Studio, Nelson renders, Studio | imagery audit + critic phases 2, 3 |
| `finish-7` · A gradient comes from the direction, light, material or the brand, and never bands: eased stops or about 2 % noise | a default gradient is a cliché, and banding shows steps | heuristic | Nelson renders, Kowalski, Vercel | imagery audit + critic phase 3 |
| `finish-8` · Depth is built from layers of the project's own subjects, the far ones blurred or faded; an overlay dims or blurs what is behind it | real layers tell more than decoration, and a dimmed page says only the overlay acts | heuristic | Freiberg depth | critic phases 2, 3 |
