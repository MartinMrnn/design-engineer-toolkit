# Measures

What each colour measure is for, what it is not, and how to read `colour.py`'s output. Each claim carries its kind: **Standard**, **Empirical finding** or **Design heuristic**. The critic reads this file.

## WCAG 2.2 contrast: the requirement
- **Standard**: the contrast ratio is (L1 + 0.05) / (L2 + 0.05), where L1 and L2 are the relative luminances of the lighter and the darker colour (WCAG 2.2 definitions). It runs from 1:1 to 21:1.
- **Standard**: SC 1.4.3 Contrast (Minimum), level AA: text needs at least **4.5:1** against its background. **Large-scale text** needs at least **3:1**. Large-scale means at least 18 point, or 14 point bold; with 1 pt = 4/3 CSS px, that is 24 px, or 18.67 px bold.
- **Standard**: SC 1.4.11 Non-text Contrast, level AA: the parts of interface components and graphics needed to understand them need at least **3:1** against the colours next to them. This includes input borders, icons that carry meaning, and the focus ring.
- **Standard**: SC 1.4.6 Contrast (Enhanced), level AAA: 7:1 for text, 4.5:1 for large-scale text. `colour.py` reports it; the studio does not require it.
- **Standard**: thresholds are compared **unrounded**. A ratio of 4.499:1 does not meet 4.5:1, even though it displays as 4.50 at two decimals (W3C, Understanding SC 1.4.3, informative). `colour.py` and `charter.py check` share one WCAG module and decide on the unrounded value. Their figures show two decimals, and a third when two would hide a failure.
- A required pair under its threshold is a defect. It changes before it reaches a card.

### Reading `contrast`
`contrast <text> <ground>` prints the ratio, the required threshold with its success criterion and pass or FAIL, and the AAA threshold marked "reported, not required". Add `--large` for large-scale text, `--non-text` for interface parts and graphics. Colours are `#rgb` or `#rrggbb`. The ratio is symmetric: the order of the two colours only labels the output.

### Reading `palette`
`palette <tokens.json>` reads the charter's tokens (aliases and themes resolved by the charter's own code) and prints, for each theme:
1. every colour token with its hex and OKLCH;
2. every contrast pair the contract requires, the same list `charter.py check` uses: each text token of the contract (`ink`, `ink-muted`, `on-accent`…) on each ground its usage note names, at 4.5:1, then each `on-surface-n` on its `surface-n`, at 4.5:1, then the focus ring on each ground of the contract, at 3:1; with the ratio, the threshold and pass or fail;
3. when the palette has tones or surfaces, the contrast between neighbouring tones (`tone-1` with `tone-2`, and so on) and between each surface and `ground`, as information with no verdict;
4. the CVD distances of the `state-*` colours (below);
5. the line "Emotion indicators are not available in this version."

A FAIL in part 2 is a defect. Part 3 and part 4 are information, not verdicts.

- **Standard**: an `on-surface-n` on its `surface-n` is text, so it needs 4.5:1, compared unrounded (SC 1.4.3), like every text pair. It is required whenever the surface exists. The focus ring on a surface takes that `on-surface-*` colour, so it clears the 3:1 of SC 1.4.11 by construction.
- **Design heuristic**: the neighbouring-tone and surface-vs-ground contrasts show whether a rhythm of tones or surfaces reads as distinct layers. Two neighbouring tones close to 1:1 may blur into one; a surface very close to `ground` may not read as a panel. That can be the intent (a subtle tone-on-tone): there is no threshold, and no pass or fail.

## APCA: not built
- **APCA is not built** in this version of the studio.
- What it is: the Accessible Perceptual Contrast Algorithm, a contrast model from the WCAG 3 working drafts. It takes polarity (dark on light or light on dark) and text size into account. **Standard**: it is not part of WCAG 2.2, and WCAG 2.2's ratio stays the requirement.
- Why it is not built: its reference code, apca-w3, is not under an open-source licence. Its rights are reserved; its grant covers web content only; commercial use needs a signed licence; ports must keep the code and constants unchanged; and the name APCA is a trademark reserved for implementations kept in sync. That licence is not compatible with shipping a port of it in this MIT plugin.
- For a manual check, use the official calculator: https://apcacontrast.com. Read its result as information beside the WCAG 2.2 ratio, never in place of it.

## Colour-vision deficiency: a diagnosis
- **Empirical finding**: `cvd` simulates protanopia, deuteranopia and tritanopia with the model of Machado, Oliveira & Fernandes (2009), at severity 1.0 (dichromacy). The model's matrices work on linear-light sRGB; each result is clamped into the displayable range, and `cvd` marks with `*` a colour the clamping changed. A simulation approximates what a person with that deficiency may see; real vision varies from person to person.
- `cvd <colour>…` prints each colour under the three deficiencies, then every pair with its OKLab distance in normal vision and under each deficiency, the closest pair first, and the deficiency in which the pair is closest.
- **There is no universal threshold.** A small distance does not fail a palette, and the output sets no limit under which a pair is flagged. Read the pairs from the closest, and ask of each one question: does this pair carry a meaning, and if so, is there a cue other than colour?

## Never colour alone
- **Standard**: SC 1.4.1 Use of Color, level A: colour is never the only visual means of conveying information, indicating an action, prompting a response or distinguishing an element. A state or a link carries a word, an icon, a shape, an underline or a weight as well.
- No measure replaces this check: a pair can be far apart in every simulation and still fail 1.4.1 if colour is its only cue.

## Reading `convert` and `ramp`
- `convert` prints each colour as hex, `oklch()`, `oklab()` (D65), `lch()` and `lab()` (CIELAB D50), ready to paste into CSS. OKLab and OKLCH show 4 decimals (hue 2), CIELAB 2; a grey's hue is `none`. `--json` gives the unrounded values. See `perception.md`.
- `ramp <colour> --steps n` prints n colours at the input's OKLCH hue and chroma, lightness from 0.97 to 0.25, and marks the steps where chroma was reduced to fit sRGB. **Design heuristic**: the even spacing is a starting point; the conversion and the gamut mapping are **Standard** (CSS Color 4).

## Reading `dominant`
`dominant <image.png>` measures an image, not a design. Its first line says so: "Colours seen in this image, by share of pixels. Not the tokens of a design system." For the design's colours, `palette` on `tokens.json` stays the source of truth.

What it reads: 8-bit, non-interlaced PNG; pixels taken as sRGB, colour profiles ignored. On macOS, `sips -s format png in.jpg --out out.png` converts a JPEG.

The output, in order:
1. **The limits that apply**: photos dominate unless excluded; gradients and anti-aliasing create in-between colours; resizing blends neighbours; the result depends on k; profiles are ignored.
2. **What was analysed**: the analysed pixels are the 100 % of every share. Pixels outside `--crop`, inside `--exclude` or fully transparent are counted apart. Partly transparent pixels are composited over `--over` (white by default).
3. **By area**: k colours (k-means in OKLab, k = 5 by default, deterministic), with share, pixel count and OKLCH.
4. **Accents**: a second pass on the most chromatic colours (chroma at least 0.04), taken in descending chroma until about a tenth of the analysed pixels, so that a small vivid colour is not averaged away. A colour that alone covers more than a tenth of the analysed pixels (a bin of the image, or a colour of the grouped selection) is a surface, already in the area list, and is left out. The output states the share the accents actually cover. Their shares are of all analysed pixels, and an accent is often already part of an area colour.
5. **With `--match tokens.json`**: each pixel goes to its nearest colour token if their OKLab distance is at most d (`--max-distance`, default 0.05; **Design heuristic**, above the 0.02 just-noticeable difference to absorb anti-aliasing). Otherwise it is **unassigned**.

How to read the match:
- Token shares and the unassigned share add up to 100 % of the analysed pixels. Unassigned pixels are never moved to a token.
- **A large unassigned share is a finding**: photos, illustrations, or colours that are not tokens. The output lists the main unassigned colours with their nearest token and distance. Exclude photo areas (`--exclude x,y,w,h`) to measure the interface alone.
- **The close-token warning** lists every pair of tokens closer to each other than d. Neighbouring tokens often are: on a warm off-white ground, `ground` and a white `ground-raised` can be about 0.04 apart, under the 0.05 default. The capture cannot tell them apart reliably.
- **Ambiguous pixels** are those whose second-nearest token is also within d. Token pairs between d and 2d apart can still produce ambiguous pixels (a pixel halfway between them is within d of both); they show in the ambiguity list, not in the close-pair warning. Each counts once, for its nearest token, and the output gives the ambiguous share per pair: the two shares of that pair may swap. When the warning names a pair, either lower `--max-distance` under their distance (for 0.04, try 0.03) and run again, or read the two shares together as one surface.
- Tokens with the same value (an alias, or `ink` and `focus-ring` both `#1a1a1a`) are one colour listed with all their names; the share is never split between them.
- Exact ties go to the token listed first in `tokens.json`, so the result is reproducible.
- `--theme` picks the theme whose colours are matched (the first by default).

What it is for: on a Showcase capture, how much of the opening each role really covers (the visible hierarchy) and how much the accent takes.

### Reading the surface and tone shares
- With `--match`, the `surface-*` and `tone-*` tokens get their shares like any other token. Read their sum next to the accent share: it is how much of the capture the strategy's colour actually covers.
- **Design heuristic**: a dominant strategy should show a large coloured share (Colour surfaces, Flood and tone-on-tone, or any direction for a *dominant* appetite); a Signal or Content-carries-the-colour direction a small one, with the colour on the actions or in the unassigned photo pixels. This is information for the art director and the critic: there is no threshold, and a share never passes or fails a direction.
- A surface aliased to a tone or to the accent has the same value, so it is one colour listed with all its names: its share counts once.
- Neighbouring tones are often closer than d: read the close-token warning, and read their shares together when it names them. On a moodboard capture, colours seen in the references, to read for their character, not to copy as tokens. For a reference website, read the interface colours from its computed styles rather than from pixels.
