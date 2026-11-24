---
name: type
description: The design studio's typography method, usable on its own. Turns a brief into a type system, or audits the type of an existing page, through six decisions - voice, face, pairing, roles, setting, proof. Searches real foundries, compares candidates on the real text, and measures with a script, type.js. Use for choosing fonts, font pairing, type scales, fluid sizes, line length, font loading, or a typography review.
---

# Type

Give a project a typography worthy of its direction, one that never commits a fault of taste: **a generic face, too much, or a bad pairing**. A bold direction with a generic headline collapses. Set a restrained base, make one memorable gesture, and let a human eye choose the face.

This skill decides faces, type roles, text setting and font loading. `ux` decides structure, chunking and words, `layout` spacing and grouping, `colour` contrast, `components` control behaviour, `motion` text animation.

## Why agents choose fonts badly

| Bias | What goes wrong | What this skill does |
|---|---|---|
| Statistics | The most frequent faces come first | Overused faces are out by default (`face-1`) |
| Optical blindness | Names are tied to clichés; letterforms are not seen | Candidates are set on the real text and **the user chooses by eye** (`face-4`) |
| Technical safety | Old classics, because they surely work | `type.js` checks accents and weights, so a recent face is safe to try (`face-5`) |
| Trend lag | What was popular years ago | A live search of foundries, and **no list of fonts** in this skill (`face-2`) |

## Two entries
- **A brief** gives a type system: inside a design-studio project (a folder with `design/decisions.md`), `design/directions/<a|b>/tokens.css` and a `## Type · <direction>` entry in `design/decisions.md`; otherwise, the conversation.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. A fact you do not have, such as the real headline, is written `[à fournir : what]`, never guessed.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names a `check.js` measure (`script …`), a `type.js` mode (`type board`, `type audit`), or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. It does not turn a heuristic into a proven law. Used alone, check these rules by hand and list what you could not verify.

## The six decisions, in order

### 1 · Voice
How much risk the headline carries. Read it in the direction: its colour strategy and gesture, its components, the brief. Running text stays sober at every level. Read `references/voice.md`.

| Level | The headline | Often fits |
|---|---|---|
| **Restrained** | A fine neutral, set with care | tools, products, reading sites |
| **Assertive** | A face with a strong personality | brands, portfolios, editorial |
| **Radical** | Almost a logo: magazine, poster, 1980s graphics | showcases, events, bold brands |

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `voice-1` · Every type system states its level and its one typographic gesture in a sentence | a gesture that cannot be stated does not exist, and the level sets how far the face may go | heuristic | Studio | critic phase 2 · blocking |
| `voice-2` · The headline carries the same risk as the direction; a bold direction never gets a generic headline | a generic headline makes bold colours and components collapse | heuristic | Studio | critic phases 2, 4 · blocking |
| `voice-3` · One typographic gesture per direction | two gestures compete and the page reads as too much | heuristic | Studio | critic phase 2 |
| `voice-4` · Competitors only show what is overused; examples come only from the brief and the inspirations | following competitors produces the generic look | heuristic | Studio | critic phase 2 |

### 2 · Face
Describe the form you need, search, read the licence, set the candidates on the real text, and let the user choose. Read `references/faces.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `face-1` · An overused face is never proposed by default; it stays only if the brand imposes it or a project reason is written | the most frequent faces are what makes sites look alike | heuristic | Web Almanac 2025, Studio | critic phase 2 · blocking |
| `face-2` · Candidates come from a live search of foundries, from the form the brief calls for, never from memory | memory returns the most frequent and most dated faces | heuristic | Studio | critic phase 2 |
| `face-3` · Every candidate's licence is read on its own page and allows this project's use: the client's site, who handles the files, any subsetting; a paid face enters only if the brief asks or the client holds the licence | a font used without its licence is a legal risk for the client | heuristic | Studio | critic phase 2 · blocking |
| `face-4` · Three to five candidates, each a headline face with its text partner, are set on the real text; the user chooses among at most three | an agent does not judge letterforms reliably, and an eye does | heuristic | Studio | type board + critic phase 2 |
| `face-5` · The face covers the project's language and the weights used | a missing accent falls back to another face in the middle of a word | heuristic | Studio | type board |

### 3 · Pairing
One family is often enough. A second face must earn its place. Read `references/pairing.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `pairing-1` · One family, or two with a stated role each; never two close faces | two near-identical faces read as a mistake | heuristic | Krehel typography, Studio | critic phase 2 · blocking |
| `pairing-2` · Running text stays a sober text face at every level | a display face tires the eye over long text | heuristic | Studio | critic phases 2, 4 |
| `pairing-3` · Two faces on one line have compatible x-heights, or are evened with `font-size-adjust` | otherwise one looks smaller or louder by accident | heuristic | Studio | type board + critic phase 2 |

### 4 · Roles
A few named roles replace a long scale. A ratio is only a starting point. Read `references/roles.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `roles-1` · Four to six roles, and no size outside them | each extra size dilutes the hierarchy | heuristic | Krehel typography, Studio | type audit + critic phases 2, 4 · blocking |
| `roles-2` · Each role sets size, leading, weight and tracking together | a role is one decision instead of four | heuristic | Krehel typography | critic phase 2 |
| `roles-3` · Font sizes are in `rem` | text in `px` ignores the size the reader set in the browser | heuristic | Coursey rem, Krehel typography | type audit |
| `roles-4` · Only large titles are fluid, with a `clamp()` of `rem` and `vw` | running text has no reason to follow the viewport, and `vw` alone does not grow with zoom | heuristic | Utopia, W3C | type audit + critic phase 4 |
| `roles-5` · A fluid size keeps its maximum at most 2.5 times its minimum | within that ratio it always reaches 200 % at the browser's 500 % zoom | heuristic | Barvian 2023 | type audit |
| `roles-6` · Leading falls as size grows, and is unitless | large text at body leading falls apart, small text at title leading is cramped | heuristic | Krehel typography, Kowalski | type audit + critic phase 4 |
| `roles-7` · Tracking follows size: tighter on large titles, open on small capitals, zero on text, in `em` | one value for all sizes is wrong somewhere | heuristic | Kowalski, Krehel typography | critic phases 2, 4 |
| `roles-8` · No weight under 400 below 28 px | thin strokes vanish at small sizes | heuristic | Krehel typography, Freiberg | critic phases 2, 4 |

### 5 · Setting
The details of reading. Read `references/setting.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `setting-1` · On a wide screen, reading text holds 60 to 85 real characters per line; leaving this range takes a written reason | readers judge long lines hardest and very short lines are read slower | heuristic | Dyson & Kipping 1998, Studio | type audit + critic phases 2, 4 |
| `setting-2` · Reading text aligns to the start; only short blocks are centred | a steady edge lets the eye find the next line | heuristic | Krehel typography | critic phases 2, 4 |
| `setting-3` · `balance` on titles, `pretty` on paragraphs | it avoids uneven titles and a lone last word | heuristic | Krehel, Salaja | critic phase 4 |
| `setting-4` · Numbers that change use tabular figures | digits of different widths make the layout shift | heuristic | Freiberg, Krehel typography, Salaja | critic phase 4 |
| `setting-5` · Punctuation follows the language: real quotes, ellipsis and dashes, French spacing | keyboard stand-ins make a text look unfinished | heuristic | Vercel, Krehel typography | critic phase 4 |
| `setting-6` · Weight never changes on hover or selection | a new weight changes the text's width and shifts the layout | heuristic | Freiberg | critic phase 4 |

### 6 · Proof
Measure before showing. Read `references/loading.md` and `references/measures.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-1` · Text can be resized up to 200 % without loss of content or function; captions and images of text are exempt | people with low vision enlarge text to read it | standard (WCAG 1.4.4) | W3C | type audit + critic phases 2, 4 · blocking |
| `proof-2` · No content or function is lost when line, paragraph, letter and word spacing are raised to the WCAG values | some readers need more space between lines and letters | standard (WCAG 1.4.12) | W3C | type audit + critic phase 4 · blocking |
| `proof-3` · Text is real text, not an image of text, except logotypes and where a particular presentation is essential | an image of text cannot be restyled or enlarged cleanly | standard (WCAG 1.4.5) | W3C | critic phases 2, 4 · blocking |
| `proof-4` · Inputs are at least 16 px | iOS zooms the page into smaller fields | heuristic | Freiberg | script input-size |
| `proof-5` · Fonts are self-hosted in WOFF2 with `font-display`, and only the faces used are loaded | no third-party request, and less to download | heuristic | Krehel typography, Freiberg, Salaja | critic phase 4 |
| `proof-6` · Every bold or italic has a real face | a browser's faux style distorts the drawing | heuristic | Krehel typography, Salaja | type audit |
| `proof-7` · The fallback's metrics are matched to the face | the text does not jump when the font arrives | heuristic | Kowalski Agents | critic phase 4 |

## The type entry

```markdown
## Type · Direction A
Level: radical, because the colour takes a strong risk.
Gesture: a very wide headline, almost a logo.
Overused in the sector: thin luxury serifs (never an example).
Candidates: 3 to 5, each with its text partner, foundry and licence. Chosen by the user: <face>.
Pairing: <face> for titles, <face> for text, and why they fit.
Roles: display, title, heading, body, small.
Proof: `type.js` audit passes, or `not yet` before there is a page.
```

## The audit

```markdown
## Type audit · <page>
### Voice · Face · Pairing · Roles · Setting · Proof (one heading each)
1. <blocking|to fix|suggestion> · <the defect> · evidence: <selector or measure> · rule: `<id>`
### Outside this skill
### Not seen
```

**Blocking:** a broken `blocking` rule or a WCAG A or AA failure. **To fix:** another broken rule, with no stated reason. **Suggestion:** an improvement no rule demands, with `rule: none`. A defect that breaks several rules cites them all and keeps the highest severity. A heading with no defect says `none`. Without a type entry, `voice-1`, `face-2`, `face-3` and `face-4` go under `Not seen`, and an overused face is a suggestion.

## Commands
Open the page, then call `browser_run_code_unsafe` with `{ "filename": "<this skill's folder>/scripts/type.js" }`, or pass the file's content as `code` if the path is refused. A page with `[data-candidate]`, made from `assets/board.html`, gets a **board**: metrics, weights and missing characters per candidate. Any other page gets an **audit**: faces, sizes, weights, leading, characters per line, fluid sizes, faux styles, and WCAG 1.4.4 and 1.4.12, the only two that set `pass` to false.

## References
- `references/voice.md`: levels, gestures, matching the direction. For decision 1.
- `references/faces.md`: the search method, foundries, overused faces. For decision 2.
- `references/pairing.md`: one family or two, broken and fixed pairs. For decision 3.
- `references/roles.md`: starting roles, tokens, fluid sizes. For decision 4.
- `references/setting.md`: measure, wrapping, figures, punctuation. For decision 5.
- `references/loading.md`: hosting, formats, fallbacks. For decision 6.
- `references/measures.md`: what real sites do, WCAG, reading `type.js`. For decision 6 and audits.
- `references/sources.md`: every source and its licence. Not needed during a project.
