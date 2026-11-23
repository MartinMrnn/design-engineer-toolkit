# Measures

What each colour measure is for, what it is not, and how to read `colour.py`'s output. Each claim carries its kind: **Standard**, **Empirical finding** or **Heuristic**. The critic reads this file.

## WCAG 2.2 contrast: the requirement
- **Standard**: the contrast ratio is (L1 + 0.05) / (L2 + 0.05), where L1 and L2 are the relative luminances of the lighter and the darker colour. It runs from 1:1 to 21:1.
- **Standard**: SC 1.4.3 Contrast (Minimum), level AA: text needs at least **4.5:1** against its background. **Large-scale text** needs at least **3:1**. Large-scale means at least 18 point, or 14 point bold; with 1 pt = 4/3 CSS px, that is 24 px, or 18.67 px bold. Logos, inactive controls and purely decorative text are exempt.
- **Standard**: SC 1.4.11 Non-text Contrast, level AA: the parts of interface components and graphics needed to understand them need at least **3:1** against adjacent colours. This can include input borders, meaningful icons and the focus indicator.
- **Standard**: SC 1.4.6 Contrast (Enhanced), level AAA: 7:1 for text, 4.5:1 for large-scale text. `colour.py` reports it; the studio does not require it.
- Thresholds are compared **unrounded** (W3C, Understanding SC 1.4.3). A ratio of 4.499:1 does not meet 4.5:1. The figures show two decimals, and a third when two would hide a failure.

### Reading `contrast`
`contrast <text> <ground>` prints the ratio, the required threshold with its criterion and pass or FAIL, and the AAA threshold marked "reported, not required". Add `--large` for large-scale text, `--non-text` for interface parts and graphics. Colours are `#rgb` or `#rrggbb`.

### Reading `palette`
`palette <tokens.css>` reads the custom properties of `:root` and `html`, and the themes in `.dark`, `.light`, `[data-theme="x"]` and `@media (prefers-color-scheme: …)`. A theme inherits what it does not redefine. For each theme it prints:

1. every colour with its hex and OKLCH, noting a colour mapped into sRGB or a transparent one composited over `--background`;
2. the contrast of each pair the names declare: `--foreground` on `--background`, each `--x-foreground` on `--x`, `--muted-foreground` also on `--background` and `--card`, all at 4.5:1, then `--ring` on `--background` at 3:1;
3. what it could **not measure**: values such as `rgb()`, `hsl()`, `color-mix()` or a colour name. Write them in hex or OKLCH;
4. the colour-vision distances of `--destructive`, `--success`, `--warning` and `--info`.

A FAIL is a defect, but it does not stop the script: it exits 0 so that every failure shows at once. Part 4 is a diagnosis, not a verdict. `palette` assumes normal-size text and does not know what sits over an image. A pair it cannot see, such as text on a gradient, stays with the critic.

## APCA: not built
- APCA is a contrast model from the WCAG 3 working drafts. It takes polarity and text size into account. **Standard**: it is not part of WCAG 2.2, whose ratio stays the requirement.
- Its reference code, apca-w3, is not under an open-source licence: its rights are reserved, commercial use needs a signed licence, and the name is a trademark. That rules out shipping a port in this MIT plugin.
- Some references quote APCA figures, among them Radix Colors and Jakub Krehel's skill. Never use them as thresholds here. For a manual check, the official calculator is https://apcacontrast.com.

## Colour-vision deficiency: a diagnosis
- **Empirical finding**: red-green deficiency affects about 8 % of men and 0.4 % of women of European descent, and fewer men in several other populations (Birch 2012).
- **Empirical finding**: `cvd` simulates protanopia, deuteranopia and tritanopia with the model of Machado, Oliveira & Fernandes (2009), at severity 1.0. A simulation approximates what a person may see; real vision varies.
- `cvd <colour>…` prints each colour under the three deficiencies, then every pair with its OKLab distance, the closest first.
- **There is no universal threshold.** Read the pairs from the closest, and ask of each: does this pair carry a meaning, and if so, is there a cue other than colour?

## Never colour alone
- **Standard**: SC 1.4.1 Use of Color, level A: colour is never the only visual means of conveying information, indicating an action, prompting a response or distinguishing an element.
- A state or a link carries a word, an icon, a shape, an underline or a weight as well. A pair can be far apart in every simulation and still fail 1.4.1.

## The greyscale test
**Heuristic.** Look at the page in greyscale, for example with a `filter: grayscale(1)` on `html` in the browser's tools. If the main action and the hierarchy disappear, they depended on hue alone.

## Reading `harmony`
`harmony <colour>` prints the input's OKLCH and its share of the maximum sRGB chroma, then each scheme's candidates with their turn in degrees, hex and OKLCH. It keeps lightness and share of chroma. A grey has no hue: use `ramp`. Candidates carry no verdict.

## Reading `convert` and `ramp`
- `convert` prints each colour as hex, `oklch()`, `oklab()` (D65), `lch()` and `lab()` (CIELAB D50), ready to paste into CSS. A grey's hue is `none`.
- `ramp <colour> --steps n` prints n colours at the input's OKLCH hue and chroma, lightness from 0.97 to 0.25, and marks the steps where chroma was reduced to fit sRGB. **Heuristic**: the even spacing is a starting point.

## Reading `dominant`
`dominant <image.png>` measures an image, not a design. For the design's colours, `palette` on `tokens.css` stays the source of truth.

It reads 8-bit, non-interlaced PNG, with pixels taken as sRGB and colour profiles ignored. On macOS, `sips -s format png in.jpg --out out.png` converts a JPEG.

The output, in order:
1. **The limits that apply**: photos dominate unless excluded, gradients and anti-aliasing create in-between colours, resizing blends neighbours, the result depends on k.
2. **What was analysed**: the analysed pixels are the 100 % of every share. Pixels outside `--crop`, inside `--exclude` or fully transparent are counted apart.
3. **By area**: k colours (k-means in OKLab, k = 5 by default, deterministic), with share, pixel count and OKLCH.
4. **Accents**: a second pass on the most chromatic colours, up to about a tenth of the pixels, so that a small vivid colour is not averaged away.
5. **With `--match tokens.css`**: each pixel goes to its nearest colour token if their OKLab distance is at most `--max-distance` (default 0.05, a heuristic). Otherwise it is **unassigned**.

How to read the match:
- Token shares and the unassigned share add up to 100 %. **A large unassigned share is a finding**: photos, illustrations, or colours that are not tokens. Exclude photo areas (`--exclude x,y,w,h`) to measure the interface alone.
- The close-token warning lists tokens closer to each other than the distance: the capture cannot tell them apart reliably. Lower `--max-distance` under their distance, or read their shares together.
- Tokens with the same value are one colour listed with all their names.
- `--theme` picks the theme whose colours are matched (the first by default).

What it is for: seeing how much of a page each role really covers, to compare with the chosen strategy, and reading the character of an inspiration. Never copy its colours as tokens. For a reference website, read the interface colours from its computed styles rather than from pixels.
