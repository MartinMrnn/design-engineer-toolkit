---
name: layout
description: The design studio's layout method, usable on its own. Turns a brief into a layout system, or audits the layout of an existing page, through six decisions - level, grid, space, hierarchy, shape, proof. Grounded in a measure of real sites and checked by a script, layout.js. Use for grids, section structure, spacing scales, visual hierarchy, radii, optical alignment, responsive layouts, or a layout review.
---

# Layout

Give a project a layout that guides attention and is worthy of its direction, one that never commits a fault: **the template seen everywhere, too much at once, spacing that lies about what belongs together, or a component crushed on a small screen**. Layout is where the `ux` plan becomes visible: what must be seen is seen first.

This skill decides the grid, the structure of sections, spacing, visual hierarchy, shapes and responsive composition. `ux` decides the plan, the main action and what must be seen; `type` faces, sizes and line length; `colour` contrast and the accent; `imagery` shadows and effects; `motion` layout animation; `components` hit areas and focus styles.

## Two entries
- **A brief** gives a layout system: inside a design-studio project (a folder with `design/decisions.md`), the layout tokens in `design/directions/<a|b>/tokens.css` and a `## Layout · <direction>` entry in `design/decisions.md`; otherwise, the conversation.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. A fact you do not have, such as the real list of services, is written `[à fournir : what]`, never guessed.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names a `check.js` measure (`script …`), `layout audit` (this skill's `layout.js`), or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. It does not turn a heuristic into a proven law. Used alone, check these rules by hand and list what you could not verify. A few rules live in the references; they count the same as those here.

## The six decisions, in order

### 1 · Level
How much risk the layout carries, read in the direction: the brief, then the colour and type entries. Read `references/level.md`.

| Level | The layout | Often fits |
|---|---|---|
| **Restrained** | A strict grid, a calm rhythm, generous space | tools, products, reading sites |
| **Assertive** | Asymmetry, one or two deliberate breaks of the grid | brands, portfolios, shops |
| **Radical** | Editorial or poster composition: extreme scale, overlaps, bleeds | showcases, events, culture |

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `level-1` · Every layout states its level and its one gesture in a sentence, and the gesture says the same idea as the colour and type gestures | a gesture that cannot be stated does not exist, and gestures pulling apart read as too much | heuristic | Studio | critic phase 2 · blocking |
| `level-2` · The layout carries the direction's risk; a bold direction never gets a template layout | a centred hero and three equal cards make bold colour and type collapse | heuristic | Studio | critic phases 2, 3 · blocking |
| `level-3` · An overused pattern appears only with a project reason written in the layout entry | overused patterns are what make generated sites look alike | heuristic | Studio | critic phases 2, 3 · blocking |
| `level-4` · Competitors only show what is overused; examples come only from the brief and the inspirations | following competitors produces the generic look | heuristic | Studio | critic phase 2 |

### 2 · Grid
A grid aligns; each section's message decides how many things sit side by side. Read `references/grid.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `grid-1` · Columns, gutter, side margins and maximum width are tokens, and every block starts on a shared edge | a few shared edges make a page look made by one hand | heuristic | Krehel layout, Vercel | critic phases 2, 3 |
| `grid-2` · A section's columns follow its purpose: one to focus, two to pair, three or four to compare, four or more to browse; never more than six | the number of columns tells the visitor how to read the section | heuristic | Self-Made Web Designer, Studio | layout audit + critic phases 2, 3 |
| `grid-3` · A section breaks the grid only on purpose, once or twice per page, with the reason written | a break draws the eye only where the rest holds | heuristic | Self-Made Web Designer, Studio | critic phases 2, 3 |
| `grid-4` · The structure changes when the message changes, and things of the same kind keep one structure | a repeated structure bores, a change without reason confuses | heuristic | Self-Made Web Designer, Studio | critic phase 2 |

### 3 · Space
Space says what belongs together. Read `references/space.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `space-1` · One spacing scale, as tokens; every margin, padding and gap comes from it | values chosen one by one drift, and the rhythm with them | heuristic | Refactoring UI, Every Layout, Salaja | script token + layout audit + critic phase 3 |
| `space-2` · Space tells the truth: the gap between groups is at least twice the gap within, and a heading, a label or a price sits closer to what it belongs to than to anything else | people read nearness as belonging, so a wrong gap groups the wrong things | heuristic | Wertheimer 1923, Krehel layout | layout audit + critic phases 2, 3, 4 · blocking |
| `space-3` · Group with space first, a shared background second, a line last | every frame and line adds noise, and boxing everything seals the page into blocks | heuristic | Palmer 1992, Krehel layout, Refactoring UI | critic phases 2, 3 |
| `space-4` · Large gaps shrink on a phone, fluid or by steps; small gaps inside a component stay fixed | a desktop gap wastes a phone screen, while parts of one item must stay together | heuristic | Utopia space, Studio | critic phase 4 |

### 4 · Hierarchy
The `ux` plan ranks what must be seen; layout shows it, mostly by taking away. Read `references/hierarchy.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `hierarchy-1` · Each screen has one focal point, the plan's "must be seen", and nothing competes with it | when everything stands out nothing does, and the eye has no start | heuristic | von Restorff 1933, Refactoring UI, Studio | critic phases 2, 3, 4 · blocking |
| `hierarchy-2` · Emphasis by subtraction: lower the rest before raising one thing | raising everything in turn ends in shouting | heuristic | Refactoring UI | critic phases 2, 3 |
| `hierarchy-3` · One filled action per screen; the others are quieter | two filled buttons split the decision | heuristic | Krehel layout, Studio | layout audit + critic phases 2, 3 |
| `hierarchy-4` · What can be clicked looks clickable, alike everywhere, and nothing else does | a control styled as text is missed, a badge shaped as a button gets dead clicks | heuristic | Krehel layout | critic phases 3, 4 |
| `hierarchy-5` · Things with the same function look the same | people read look-alikes as one group with one behaviour | heuristic | Wertheimer 1923, Salaja | critic phases 3, 4 |
| `hierarchy-7` · When the order of content carries meaning, the reading order in the source is correct | screen readers and the keyboard follow the source, not the screen | standard (WCAG 1.3.2) | W3C | layout audit + critic phases 3, 4 · blocking |

### 5 · Shape
Corners and silhouettes follow one logic. Read `references/shape.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `shape-1` · The direction states its shape logic in one sentence: which radii, on what, and why | shapes without a logic look assembled from several kits | heuristic | Studio | critic phase 2 |
| `shape-2` · At most three radii, derived from `--radius` (0 in a square direction), plus the pill if the logic uses it | few simple forms are read at once; many radii read as noise | heuristic | Wertheimer 1923, shadcn, Studio | layout audit + critic phases 2, 3 |
| `shape-3` · A rounded surface inside another with an even inset has outer radius = inner radius + inset | with equal radii the corners bulge at different distances | heuristic | Krehel UI, Salaja | layout audit + critic phase 4 |
| `shape-4` · Align by eye where geometry looks off: less padding on an icon's side, a play triangle moved to its point | the eye judges mass, not boxes | heuristic | Krehel UI, Vercel | critic phase 4 |

### 6 · Proof
Every screen from 320 px up, composed rather than shrunk. Read `references/responsive.md` and `references/measures.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-1` · Content can be shown at 320 CSS px wide without loss of information or function and without requiring scrolling in two directions, except parts that need two dimensions | people who zoom to 400 % read on a 320 px wide viewport | standard (WCAG 1.4.10) | W3C | script reflow + critic phase 4 · blocking |
| `proof-2` · A component is never crushed: it wraps, stacks or changes form before its content gets too narrow | a column of one word per line reads as broken | heuristic | Every Layout, Krehel layout | layout audit + script text-overflow + critic phases 3, 4 · blocking |
| `proof-3` · Breakpoints sit where the content breaks, and a component adapts to its container, not to the device | device widths keep changing, and a component's room depends on where it is placed | heuristic | Krehel layout, Every Layout | critic phase 4 |
| `proof-4` · The phone layout is composed: what is compared or must be read stacks; what is browsed may swipe, the next item peeking by at least 16 px | a long stack loses the rhythm, and a row with no peek looks complete and is never swiped | heuristic | Krehel layout, Self-Made Web Designer, Studio | layout audit + critic phases 2, 3 |
| `proof-5` · The headline, its supporting line and the main action fit in the first screen at 1440 × 900 and 390 × 844, and the opening grows rather than cuts its content | the first screen is the only one every visitor sees | heuristic | Studio | layout audit + critic phases 2, 3 |
| `proof-9` · A focused element is never entirely hidden by content the author added, such as a sticky header or a banner | a keyboard user must see where they are | standard (WCAG 2.4.11) | W3C | layout audit + critic phase 4 · blocking |

## The layout entry

```markdown
## Layout · Direction A
Level: assertive, the type's level.
Gesture: one image bleeding off the right edge, the same idea as the colour's and the type's gestures.
Overused in the sector: <one line> (never an example), or `not looked` when you could not look.
Kept on purpose: none, or <an overused pattern, a grid break, lines>, because <the project's reason>.
Grid: `--grid-columns` 12, `--spacing-gutter`, `--spacing-margin` 16 to 64 px, `--container-page`.
First screen: full, or a hint of what follows, because <reason>.
Sections: Opening 1 · Services 3 (stacked on a phone: compared) · Works 4 (swiping: browsed) · Contact 1.
Space: `--spacing` 0.25rem; `--spacing-section` 72 to 160 px.
Shape: "<one sentence>"; the radii kept (`--radius: 0` when square), and the pill if used.
Proof: `layout.js` audit passes, or `not yet` before there is a page.
```

## The audit

```markdown
## Layout audit · <page>
Script: <pass or fail, in one line>
### Level · Grid · Space · Hierarchy · Shape · Proof (one heading each)
1. <blocking|to fix|suggestion> · <the defect> · evidence: <selector, width or measure> · rule: `<id>`
### Set aside
### Outside this skill
### Not seen
```

**Blocking:** a broken `blocking` rule or a WCAG A or AA failure. **To fix:** another broken rule, with no stated reason. **Suggestion:** an improvement no rule demands, with `rule: none`. A defect that breaks several rules cites them all and keeps the highest severity. Number the defects across headings; a heading with no defect says `none`. `Set aside` lists script findings judged false, each with why. Without a layout entry, `level-1` to `level-4`, `grid-3` and `shape-1` go under `Not seen`, and an overused pattern is a suggestion that cites `level-3`.

## Commands
Open the page, then call `browser_run_code_unsafe` with `{ "filename": "<this skill's folder>/scripts/layout.js" }`, or pass the file's content as `code` if the path is refused. It resizes the page from 1440 to 320 px and reports columns per section, headings not closer to their content, crushed text, sideways scrolling, spacing values, radii and nested surfaces, the first screen and reordered containers. Read `references/measures.md` before judging its findings. Only a focused element entirely hidden by a fixed or sticky element (WCAG 2.4.11) sets `pass` to false.

## References
- `references/level.md`: levels, gestures, one idea in three voices, overused patterns. For decision 1.
- `references/grid.md`: the alignment grid, structures by purpose, breaks, variation, balance. For decision 2.
- `references/space.md`: the scale and its tokens, proximity, regions and lines, dead space. For decision 3.
- `references/hierarchy.md`: focal point, subtraction, actions, the six visual laws, source order. For decision 4.
- `references/shape.md`: shape logic, radii tokens, nested radii, optical alignment. For decision 5.
- `references/responsive.md`: intrinsic components, breakpoints, the phone, the first screen, sticky chrome. For decision 6.
- `references/measures.md`: what 15 real sites do, WCAG, reading `layout.js`. For decision 6 and audits.
- `references/sources.md`: every source and its licence. Not needed during a project.
