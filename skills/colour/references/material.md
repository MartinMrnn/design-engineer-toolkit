# Material: what the colour works with

A colour is never chosen alone. Before any value, read what it will sit next to, under and over.

## The subject
What the project is, for whom, in what mood. Ask for feelings before colours: "calm, precise, warm" says more than "blue". If the user has no answer, work from the brief and the inspirations, and do not push them to invent one.

A trade does not dictate a hue. The colour everyone expects in a sector is often what makes a site generic. A surprising colour is not a fault when it is well executed.

## Examples come from the brief and the inspirations
The only models are what the user supplied: the brief, `design/inspiration/` and its `board.md`. Read their lightness, their chroma and the way they distribute colour. Do not lift their exact values.

## Competitors: a list of what to avoid
A quick look at 3 to 5 sites of the sector, for one purpose: naming what is overused.

1. Open them and note the two or three colour habits they share.
2. Write one line: `Overused in the sector: navy and gold on stock photos.`
3. Stop there. Take no value, no pairing and no idea from them. They are **never** examples, even when one looks good.

If the web is not available, write `Overused in the sector: not checked`.

## Images
With photos or video, the palette follows them, not the reverse.

- Read the captures with `colour.py dominant <image.png>`: their main colours, and whether they are warm or cool, light or dark, muted or vivid.
- A colour from an image is a starting point. Move it to a calmer lightness and chroma before it becomes a token.
- Images from different sources rarely share a colour cast. Report it to `imagery` rather than forcing the palette to fit all of them.

## Textures and effects
`imagery` makes glass, grain, gradients and light. Colour decides how they behave:

- Glass and transparency: what shows through changes the colour and its contrast. Judge the worst background it will pass over.
- Grain and noise lower the legibility of small text. Keep text on the calmest area.
- Gradients: see `oklch.md`.

## Text over images and gradients
The WCAG thresholds still apply, and no script measures them here. Find the lightest or busiest area under the text. Add a scrim, a solid panel or a different position until it reads there. The critic checks it by eye.

## The ground
The same colour changes with what surrounds it (Albers 1963). A grey looks warmer on a cool ground and cooler on a warm one. A saturated accent that works on white can look harsh on near-black. Always judge a colour on its real ground, at its real size.

## An existing brand colour
- Keep the hue recognisable, even if you would not have chosen it.
- Derive what the screen needs: a darker version for text, a lighter one for a tint (`ramp`).
- If it fails as text, keep it for surfaces and large shapes, with a `--x-foreground` that passes.
- If it is a real problem, say so in the palette entry. Never replace it on your own.
- If the user has not given the exact value, write `[à fournir : brand colour]`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `material-4` · A trade never dictates a hue | the expected colour is what makes a site interchangeable | heuristic | Studio | critic phase 2 |
| `material-5` · With images, read them before setting the palette | a palette chosen first ends up fighting the photos | heuristic | Studio | colour dominant + critic phase 2 |
| `material-6` · Text over an image or gradient is judged on its worst area | an average hides the spot where it stops being legible | heuristic | Studio | critic phases 2, 4 |
| `material-7` · Judge every colour on its real ground, at its real size | a colour changes with its neighbours | heuristic | Albers 1963 | critic phase 2 |
