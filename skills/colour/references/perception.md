# Perception and colour spaces

How `colour.py` describes a colour, and why the studio reasons in OKLCH rather than in HSL. Each claim carries its kind: **Standard**, **Empirical finding** or **Design heuristic**.

## sRGB and hex
- **Standard**: a hex colour on the web is an sRGB colour (CSS Color 4). Its three channels are gamma-encoded: they are not proportional to the light emitted. Physical computations (relative luminance, mixing light, CVD simulation) first convert to linear-light sRGB.
- **Standard**: sRGB's white point is D65, a standard daylight.

## OKLab and OKLCH
- **Standard**: OKLab is a colour space defined by Björn Ottosson (2020) and adopted by CSS Color 4 as `oklab()` and its polar form `oklch()`. Both are defined on D65 and need no chromatic adaptation from sRGB.
- **Standard**: in OKLCH, `L` is lightness from 0 (black) to 1 (white), `C` is chroma (0 for a grey; no sRGB colour goes above about 0.32, reached by pure magenta `#ff00ff`), and `H` is the hue angle in degrees. For a grey the hue is powerless: `colour.py` writes it `none`, as CSS does.
- **Empirical finding**: OKLab was fitted to perceptual data so that equal steps in L, and equal Euclidean distances, look roughly equal. It is a model: uniformity is approximate, and best for moderate differences under ordinary viewing.
- **Standard**: CSS Color 4 uses the Euclidean distance in OKLab (deltaEOK) for gamut mapping, with 0.02 as the just-noticeable difference. `cvd` and `dominant` report distances in the same unit.

## CSS `lab()` and `lch()`
- **Standard**: CSS `lab()` and `lch()` are CIELAB and its polar form on the **D50** white point, reached from sRGB (D65) through the Bradford chromatic adaptation that the CSS Color 4 sample code uses. `convert` prints them this way, so a value pastes into CSS as is.
- So the `L` of `lab()` and the `L` of `oklch()` are different numbers for the same colour: CIELAB L runs 0 to 100, OKLab L runs 0 to 1, and they follow different curves. Never mix them in one argument.

## Lightness and chroma
- **Standard**: perceived lightness (OKLab L) is not relative luminance (the WCAG quantity). Both rise together, but contrast ratios come from luminance, not from L.
- **Empirical finding**: lightness and chroma shape much of a colour's felt effect, and hue matters too, with interactions between the three (Wilms & Oberfeld 2018, `meaning.md`).
- **Design heuristic**: decide a palette's lightness and chroma (light or dark ground, muted or vivid accents, contrast range) before its hues. Leave this order when the project starts from a hue.
- **Design heuristic**: neutrals with a slight, shared hue (the same warm or cool tint in ground, line and muted ink) read as one family. Pure greys are a choice, not a default.

## Why HSL misleads
- **Standard**: HSL is a geometric rearrangement of sRGB, not a perceptual model. Its L is the mean of the largest and smallest channel.
- Consequences you can measure with `convert`: `#ffff00` and `#0000ff` both have HSL lightness 50 %, yet their OKLCH L are about 0.97 and 0.45. Equal HSL saturation does not give equal chroma, and equal hue steps do not look equally spaced.
- So a ramp or a gradient interpolated in HSL changes lightness unevenly and can pass through muddy or overbright steps. Build ramps in OKLCH (`ramp`) and interpolate in `oklab` or `oklch` (`color-mix(in oklch, …)`).

## Gamut and gamut mapping
- **Standard**: many OKLCH values have no sRGB equivalent, above all at high chroma near very light or very dark lightness. Such a colour is out of gamut.
- **Standard**: CSS Color 4 brings an out-of-gamut colour into sRGB by lowering its OKLCH chroma at constant lightness and hue (a binary search with a local clip, stopping within the 0.02 just-noticeable difference). `ramp` uses this mapping and marks each step where chroma was reduced.
- **Design heuristic**: `ramp` spreads lightness evenly from 0.97 to 0.25, leaving room for some chroma at both ends. It is a starting point; pick the steps your roles need.
- Wide-gamut screens (Display P3) can show more chroma than sRGB. The studio's tokens stay in sRGB hex, so the measures apply to what every screen shows.
