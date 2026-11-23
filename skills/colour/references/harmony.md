# Harmony: which colours go together

Calculations and colour wheels give ideas. The real page decides.

## What a study found
Schloss & Palmer (2011) had 48 participants judge pairs of 32 colours, shown as a small square on a larger one. They separated three judgements.

- **Harmony of the pair** rises as the hues get closer.
- **Preference for the pair** also rises with hue similarity, and depends more on how much people like each colour and on the **lightness contrast** between them.
- **Preference for the small figure on its ground** rises as its hue moves *away* from the ground.

Pairs of strongly contrasting hues were generally judged neither preferable nor harmonious. Among the paint complements, only orange-blue beat the pairs next to it. Lighter figures on darker grounds and warmer figures on cooler grounds were slightly preferred, a small effect.

**Scope:** colour pairs in a lab, not whole pages. Evidence for a choice, never a guarantee.

**What we take from it:** close hues for the large surfaces, a clear lightness difference between them, and an opposed hue only for the small element that must stand out.

## The wheel schemes
`colour.py harmony <colour>` computes them in OKLCH at the same lightness and the same share of maximum chroma, so the candidates have comparable weight. Move their lightness afterwards to fit their role.

| Scheme | Hues | Good for | Watch for |
|---|---|---|---|
| **Monochrome** | one, with `ramp` | calm, premium, editorial | needs real lightness contrast or it goes flat |
| **Analogous** | ±30° | surfaces, gentle ranges | without a contrast of lightness, nothing stands out |
| **Complementary** | 180° | one accent on a calm set | at equal areas and equal chroma, the two fight |
| **Split-complementary** | ±150° | an accent and a discreet second colour | the second must stay clearly secondary |
| **Triadic** | ±120° | playful brands, illustration | three equal voices are too many: one leads |

Angles are a way to find candidates, never a justification. An OKLCH complement is also not a painter's complement.

## Neutrals
Neutrals cover most of a page, so they set its temperature more than the accent. Give ground, borders and muted text one shared slight hue, usually near the accent's or deliberately opposed to it, or keep them truly neutral by choice. Linear moved its default greys from a cool blue tint to a warmer, less saturated one, and warns that going too warm looks muddy.

## Common claims, corrected
- **"Hick's Law limits a palette to 3 to 5 colours."** Hick measured the time to choose among options, not the number of colours on a page. Restraint is a good heuristic, for other reasons.
- **"Warm colours advance, cool colours recede."** The depth effect (chromostereopsis) exists, but varies widely from person to person (Hayashi 2012). Do not rely on it for hierarchy. On dark themes, use lighter surfaces for elevation.
- **"Saturated colours vibrate because of the Helmholtz-Kohlrausch effect."** That effect is something else: at equal luminance, saturated colours can look brighter (Corney 2009). So two colours with a good ratio can still look unbalanced. Trust the ratio for legibility and your eye for balance.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `harmony-6` · A wheel scheme proposes candidates; it never justifies a palette | an angle says nothing about the result on the page | heuristic | Schloss & Palmer 2011, Studio | colour harmony + critic phase 2 |
| `harmony-7` · Paired colours differ clearly in lightness | in lab pairs, preference depended on lightness contrast | empirical finding | Schloss & Palmer 2011 | critic phase 2 |
| `harmony-8` · Every hue has a job, or it goes | each hue added weakens the accent | heuristic | Studio | critic phase 2 |

## Broken → fixed

- **Broken:** red text on a saturated green field. **Fixed:** near-white text on a deeper green.
- **Broken:** a complementary blue and orange at equal areas. **Fixed:** a blue-tinted page with orange only on the main action.
- **Broken:** cool grey borders on a warm cream ground. **Fixed:** borders at the ground's hue, darker.
- **Broken:** three accents at the same chroma. **Fixed:** one accent, the others reduced to tints.
