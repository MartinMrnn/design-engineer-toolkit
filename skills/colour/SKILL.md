---
name: colour
description: The design studio's colour method, usable on its own. Turns a brief into a palette, or audits the colour of an existing page, through six decisions - material, strategy, gesture, harmony, roles, proof. Works in OKLCH with shadcn token names and a measuring script, colour.py. Use for palettes, colour harmony, contrast, light and dark themes, colour tokens, or a colour review.
---

# Colour

Give a project colour that belongs to it and never commits a fault of taste: **a generic look, too much colour, or a bad pairing**. No ratio does this. Decide where colour lives, make one memorable choice, then prove the result.

## What this skill decides
Colour: where it lives, which colours, their roles and their measures. `ux` decides structure and behaviour, `layout` visual grouping, `type` typography. `imagery` makes images, textures and effects; this skill decides how colour works with them.

## Two entries
- **A brief** gives a palette: inside a design-studio project (a folder with `design/decisions.md`), `design/directions/<a|b>/tokens.css` and a `## Colour · <direction>` entry in `design/decisions.md`; otherwise, the conversation.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. A fact you do not have, such as a brand colour, is written `[à fournir : what]`, never guessed.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names a `check.js` measure, a `colour.py` command, or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. It does not turn a heuristic into a proven law. Used alone, check these rules by hand and list what you could not verify.

## The six decisions
Take them in order: each one constrains the next.

### 1 · Material
What the colour must work with: the subject, the inspirations, the images, the textures, the ground, any brand colour. Then a quick look at 3 to 5 sites of the sector, only to list what is overused. Read `references/material.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `material-1` · Competitors only show what is overused; examples come only from the brief and the inspirations | competitors are often poor models, and following them produces the generic look | heuristic | Studio | critic phase 2 · blocking |
| `material-2` · Read the subject, images and ground before choosing a colour | a palette chosen alone has to be forced onto the real page | heuristic | Studio | critic phase 2 |
| `material-3` · An existing brand hue stays recognisable: derive variants for screen and contrast, state any concern, never replace it | the brand belongs to the client, and a problem can be solved around it | heuristic | Studio | critic phase 2 |

### 2 · Strategy
Where colour lives. This replaces fixed ratios such as 60-30-10. Read `references/strategies.md`.

| Strategy | Where colour lives | Reference point | Often fits |
|---|---|---|---|
| **Signal** | A neutral interface, one rare accent on actions and states | 0.7 to 2.1 % of colour in the interface | products, tools |
| **Monochrome** | Ink and ground, almost no colour | 0 to 1 % | personal sites, type-led brands |
| **Content** | Images carry the colour, the interface recedes | images cover 61 to 80 % of the page | shops, showcases, portfolios |
| **Surfaces** | Large fields or gradients are the identity | colour covers 8 to 22 % of the page | brands to recognise at a glance |

These points come from 17 home pages measured once. They are never quotas.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `strategy-1` · Every palette names its strategy | without it, nothing says how much colour is too much | heuristic | Studio | critic phase 2 · blocking |
| `strategy-2` · Leaving a strategy's reference point takes a stated reason | a departure should be a decision, not a drift | heuristic | Studio | critic phase 2 |

### 3 · Gesture
By default, a restrained base and **one** memorable colour decision: a ground the sector never uses, a very rare accent, a tinted neutral. One gesture avoids the generic look without shouting.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `gesture-1` · Every palette states its one colour gesture in a sentence | a gesture that cannot be stated does not exist | heuristic | Studio | critic phase 2 · blocking |
| `gesture-2` · A framework default stays only if it was chosen; if a competitor's logo would fit the page, the palette is generic | defaults are what makes sites look alike | heuristic | Studio | critic phase 2 |

### 4 · Harmony
Settle lightness and chroma, then hues. `colour.py harmony` gives candidates to judge on the real page. Read `references/harmony.md`, and `references/oklch.md` for scales, gamut and gradients.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `harmony-1` · Settle lightness and chroma before hue | they shape much of a colour's effect, and hue depends on them | heuristic | Wilms & Oberfeld 2018, Studio | critic phase 2 |
| `harmony-2` · Close hues for surfaces, an opposed hue reserved for the accent | in lab pairs, similar hues read as more harmonious, while a figure gains from hue contrast with its ground | empirical finding | Schloss & Palmer 2011 | critic phase 2 |
| `harmony-3` · Several hues keep a coherent lightness and relative chroma | otherwise one hue looks louder than the others by accident | heuristic | Krehel OKLCH | colour harmony + critic phase 2 |
| `harmony-4` · No text in a saturated colour on its complement | the edges seem to vibrate and reading tires | heuristic | Studio | critic phases 2, 4 |
| `harmony-5` · Neutrals share the palette's temperature, or are truly neutral by choice | a stray tint in the greys makes the accent look wrong | heuristic | Linear, Studio | critic phase 2 |

### 5 · Roles
Give every colour a job with its shadcn name, on one chosen theme. A second theme is made only on request. Read `references/themes.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `roles-1` · Every colour has a role, with its shadcn name | a named role survives a change of hue, and `palette` can find its pairs | heuristic | shadcn | colour palette + critic phase 2 |
| `roles-2` · The accent keeps one job | an accent used everywhere stops pointing at anything | heuristic | Studio | critic phases 2, 4 |
| `roles-3` · One theme is chosen; a second is built by roles, never inverted | an inverted palette loses its hierarchy and its contrast | heuristic | Studio | critic phases 2, 4 |

### 6 · Proof
Measure before showing. Read `references/measures.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-1` · Text meets 4.5:1 against its background, or 3:1 when large; logos and purely decorative text are exempt | low-contrast text cannot be read by many people | standard (WCAG 1.4.3) | W3C | script axe + colour palette · blocking |
| `proof-2` · The parts of controls and graphics needed to understand them meet 3:1 against adjacent colours | a control that cannot be seen cannot be used | standard (WCAG 1.4.11) | W3C | colour palette + critic phases 2, 4 · blocking |
| `proof-3` · Colour is never the only visual means of conveying information, an action or a state | some people cannot tell those colours apart | standard (WCAG 1.4.1) | W3C | critic phases 2, 4 · blocking |
| `proof-4` · The hierarchy survives in greyscale | if it depends on hue alone, it is weaker than it looks | heuristic | Studio | critic phase 2 |
| `proof-5` · States stay distinct under colour-vision deficiency | an error and a success must not merge | heuristic | Machado 2009, Birch 2012 | colour cvd + critic phase 2 |

## The palette entry

```markdown
## Colour · Direction A
Material: what the subject, images and ground ask for.
Overused in the sector: navy and gold (never an example).
Strategy: Signal.
Gesture: a warm paper ground where the sector uses white.
Harmony: ink and ground at hue 80, accent opposed at hue 255.
Theme: light, because the site is read in long sessions.
Proof: `colour.py palette` passes; greyscale hierarchy holds.
```

## The audit

```markdown
## Colour audit · <page>
### Material · Strategy · Gesture · Harmony · Roles · Proof (one heading each)
1. <blocking|to fix|suggestion> · <the defect> · evidence: <selector, values or ratio> · rule: `<id>`
### Outside this skill
### Not seen
<what could not be checked, such as text over images>
```

**Blocking:** a broken `blocking` rule or a WCAG A or AA failure. **To fix:** another broken rule. **Suggestion:** an improvement no rule demands, with `rule: none`. A choice stated in the brief or in `decisions.md` is not a defect against a heuristic: note it.

## Commands
`python3 <this skill's folder>/scripts/colour.py <command>`. Add `--json` for unrounded values. Errors print as `colour: …` and exit 1.

| Command | What it gives |
|---|---|
| `palette <tokens.css> [--theme name]` | Every colour in OKLCH, the contrast of its pairs, state distances, what could not be measured |
| `harmony <colour>` | Analogous, complementary, split-complementary and triadic candidates, with no verdict |
| `contrast <text> <ground> [--large] [--non-text]` | One WCAG 2.2 ratio, pass or fail |
| `convert <colour>…` | hex, `oklch()`, `oklab()`, `lch()`, `lab()` |
| `ramp <colour> --steps n` | A lightness scale at one hue |
| `cvd <colour>…` | Colours under three deficiencies, and the distance of every pair |
| `dominant <image.png> [--match tokens.css]` | The colours seen in a capture, by area, optionally matched to tokens |

## References
- `references/strategies.md`: the four strategies, how to choose, why not 60-30-10. For decision 2.
- `references/material.md`: subject, images, textures, ground, competitors, brand colours. For decision 1.
- `references/harmony.md`: pairings, wheel schemes, what studies found. For decision 4.
- `references/oklch.md`: OKLCH, scales, gamut and P3, gradients. When building colours.
- `references/themes.md`: shadcn roles, step scales, light and dark. For decision 5.
- `references/measures.md`: WCAG, colour-vision deficiency, reading each command. For decision 6 and audits.
- `references/meaning.md`: emotion and culture, with their limits. When a colour's meaning is argued.
- `references/sources.md`: every source and its licence. Not needed during a project.
