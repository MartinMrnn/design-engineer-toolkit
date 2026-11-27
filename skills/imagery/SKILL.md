---
name: imagery
description: The design studio's imagery method, usable on its own. Turns a brief into the visuals and the finish of a direction, or audits the imagery of an existing page, through six decisions - level, source, treatment, finish, icons, proof. Grounded in a measure of real sites and checked by a script, imagery.js. Use for choosing or treating photos, illustrations, 3D or generative visuals, shadows, glass, gradients, grain and textures, icons, image loading, text over images, or an imagery review.
---

# Imagery

A good face and a good palette, applied alone, give a flat page. The visuals and their finish give it character. Give a project real visuals and one finish worthy of its direction, and never commit its faults: **generic shapes standing in for an image, the image cliché, effects without a role, and too much**.

This skill decides where visuals come from, how they are treated, the finish (shadows, glass, gradients, grain, depth) and icons. `colour` decides how colour behaves on them; `layout` where they sit and their radii; `type` the type set as an image; `motion` how video, WebGL, Rive and Lottie move; `components` the names of icon-only buttons and focus; `ux` the facts they must not invent.

## Two entries
- **A brief** gives an imagery system: inside a design-studio project (a folder with `design/decisions.md`), the `--shadow-*` tokens and the assets in `design/directions/<a|b>/` and a `## Imagery · <direction>` entry in `design/decisions.md`; otherwise, the conversation.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. What only the client has is written `[à fournir : what]`, never faked.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names a `check.js` measure (`script …`), `imagery audit` (this skill's `imagery.js`), or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. Used alone, check these rules by hand and list what you could not verify. Some rules live in the references; they count the same.

## The six decisions, in order

### 1 · Level
How much the imagery carries, read in the direction: the brief, then the colour, type and layout entries. Read `references/level.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `level-1` · Every imagery entry states its level and one gesture in a sentence, the same idea as the colour, type and layout gestures | a gesture that cannot be stated does not exist, and gestures pulling apart read as too much | heuristic | Studio | critic phase 2 · blocking |
| `level-2` · The imagery carries the direction's risk: a bold direction never gets generic images | stock pictures and stand-in shapes make bold colour and type collapse | heuristic | Studio | imagery audit + critic phases 2, 3 · blocking |
| `level-3` · An imagery cliché appears only with a project reason written on the entry's `Kept on purpose` line | clichés are what make generated sites look alike | heuristic | Studio | critic phases 2, 3 · blocking |
| `level-4` · Competitors only show what is overused; examples come only from the brief and the inspirations | following competitors produces the generic look | heuristic | Studio | critic phase 2 |

### 2 · Source
Real files first; Claude finds, treats and codes well, and draws badly. Read `references/source.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `source-1` · No generic decorative shape stands in for an image: no circle, blob or glow drawn to fill a space | the flat, generated look; none of 35 measured gallery sites does it | heuristic | Studio | imagery audit + critic phases 2, 3 · blocking |
| `source-2` · Never present a stock person, place or object as the client's own team, premises, product or customers | it is a false fact about the client | heuristic | Studio | critic phases 2, 3, 4 · blocking |
| `source-3` · Take visuals in this order: the user's or client's files, free libraries, a coded visual, type as the image | real material carries the project's truth; each later step must earn its place | heuristic | Studio | critic phase 2 |
| `source-4` · A coded visual is drawn from a real material of the project, its photos, words, data or sound, and says the gesture's idea | a generative piece with no source is decoration with extra steps | heuristic | Studio | critic phases 2, 3 |

### 3 · Treatment
One hand for every image. Read `references/treatment.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `treatment-1` · One treatment for every image: the same light, colour temperature and crop logic | images from several sources look like a collage of strangers | heuristic | Nelson renders, Studio | critic phases 2, 3 |
| `treatment-2` · Each crop keeps its focal point whole at every width, through `object-position` or a narrower crop for phones | a centred crop cuts heads and products on a phone | heuristic | Studio | critic phase 4 |
| `treatment-3` · Illustrations come from one hand and one style; 3D from one material and one light, matched to the page | mixed styles read as a kit, not a brand | heuristic | Nelson renders, Studio | critic phases 2, 3 |
| `treatment-5` · Text is not presented as an image, except a logo or where that presentation is essential | text in an image cannot be resized, restyled or read by everyone | standard (WCAG 1.4.5) | W3C | critic phases 2, 3, 4 · blocking |

### 4 · Finish
One finish dominates: depth, matter or light, the one that says the idea. Read `references/finish.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `finish-1` · The direction names one dominant finish, depth, matter or light, that says the gesture's idea; the other two stay functional | two finishes at full strength fight, and the page reads as too much | heuristic | Studio | critic phase 2 · blocking |
| `finish-2` · An effect only with its role: a shadow when something floats, glass when text crosses moving or busy content, a gradient for light, material or the brand, grain for matter or against banding | effects added by habit are the generic look | heuristic | Studio, Krehel UI | imagery audit + critic phases 2, 3 |
| `finish-3` · Shadows share one light from above, in two layers or more: black at low alpha on a neutral ground, the ground's hue on a coloured one | mixed lights look broken and grey on a colour looks dirty; 86 of 90 measured layers fall straight down | heuristic | Comeau shadows, Krehel UI, Vercel, Studio | imagery audit + critic phases 3, 4 |
| `finish-4` · Shadows form an elevation scale of `--shadow-*` tokens: higher means more offset and blur, less opacity; a dark ground uses a light ring or a lighter surface | a scale keeps depth consistent, and a dark shadow vanishes on a dark ground | heuristic | Comeau shadows, Krehel UI, Krehel shadows, Salaja, Tailwind | imagery audit + critic phases 3, 4 |
| `finish-5` · Glass never sits on glass, and has a solid fallback under `prefers-reduced-transparency` | stacked translucency collapses legibility, and some people ask for less transparency | heuristic | Kowalski | imagery audit + critic phase 4 |

### 5 · Icons
An icon speeds understanding or is not there. Read `references/icons.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `icon-1` · An icon appears only where it speeds understanding: options, states, actions known by their symbol, wayfinding | an icon in front of every heading is noise | heuristic | Studio | critic phases 2, 3 |
| `icon-2` · One library, SVG in `currentColor`, its stroke matched to the weight of the text beside it, sized 1em to 1.25em | mixed libraries look assembled, and a thin icon beside bold text looks weak | heuristic | Krehel UI, Vercel | critic phases 3, 4 |
| `icon-3` · An icon needed to understand the content has a contrast of at least 3:1 against the colours next to it | a faint icon that carries meaning is lost for people with low vision | standard (WCAG 1.4.11) | W3C | critic phases 3, 4 · blocking |

### 6 · Proof
Images that read, load and hold. Read `references/media.md` and `references/measures.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-1` · Text over an image, video or gradient has a contrast of at least 4.5:1 with what is behind it, 3:1 when large | text that is not read is not there | standard (WCAG 1.4.3) | W3C | imagery audit + critic phases 2, 3, 4 · blocking |
| `proof-2` · Every image that carries content has a text alternative that serves the same purpose; a decorative one is hidden from assistive technology | people who cannot see the image get its content, or nothing that misleads | standard (WCAG 1.1.1) | W3C | script axe + critic phases 3, 4 · blocking |
| `proof-3` · Moving content that starts on its own, lasts more than 5 s and sits beside other content can be paused, stopped or hidden | motion beside text keeps pulling attention away | standard (WCAG 2.2.2) | W3C | critic phases 3, 4 · blocking |
| `proof-4` · Every image reserves its space before it loads: `width` and `height`, or `aspect-ratio` | a jump moves the text being read | heuristic | Vercel | imagery audit + critic phase 4 |

## The imagery entry

```markdown
## Imagery · Direction A
Level: assertive, the layout's level.
Gesture: one beam of projector light across real film stills, the same idea as the colour, type and layout gestures.
Overused in the sector: <one line> (never an example), or `not looked` when you could not look.
Kept on purpose: none, or <a cliché>, because <the project's reason>.
Visuals: <kind> from <source>: <what they show>; `[à fournir : …]` for what only the client has.
Treatment: <light, temperature, crop logic, the treatment>, in one sentence.
Finish: <depth|matter|light>, <how>, <discreet|visible|the gesture>; `--shadow-sm` to `--shadow-lg` for what floats.
Icons: <library>, <stroke> beside <weight> text, or none.
Assets: <file> · <what it shows> · <source> · <author> · <licence>, one line each.
Proof: `imagery.js` audit passes, or `not yet` before there is a page.
```

## The audit

```markdown
## Imagery audit · <page>
Script: <pass or fail, in one line>
### Level · Source · Treatment · Finish · Icons · Proof (one heading each)
1. <blocking|to fix|suggestion> · <the defect> · evidence: <selector, width or measure> · rule: `<id>`
### Set aside
### Outside this skill
### Not seen
```

**Blocking:** a broken `blocking` rule or a WCAG A or AA failure. **To fix:** another broken rule, with no stated reason. **Suggestion:** an improvement no rule demands, with `rule: none`. A defect that breaks several rules cites them all and keeps the highest severity. Number the defects across headings; a heading with no defect says `none`. `Set aside` lists script findings judged false, each with why. Without an imagery entry, `level-1` to `level-4` and `finish-1` go under `Not seen`, and a cliché is a suggestion that cites `level-3`.

## Commands
Open the page, then call `browser_run_code_unsafe` with `{ "filename": "<this skill's folder>/scripts/imagery.js" }`, or pass the file's content as `code` if the path is refused. With reduced motion, at 1440 and 390 px, it reports the first screen's share of visuals, empty decorative shapes, shadows, glass, gradients, textures, images unsized, blurry, soft, heavy or lazy in the first screen, and the contrast of every text over a visual on its worst 5 % of pixels. Read `references/measures.md` before judging its findings. Only a text over a visual under its ratio (WCAG 1.4.3) sets `pass` to false.

## References
- `references/level.md`: levels, one idea in four voices, imagery clichés. For decision 1.
- `references/source.md`: the decision tree, what Claude does well, libraries and licences, honesty, briefs, the asset list. For decision 2.
- `references/treatment.md`: one treatment, crops, recipes, illustration and 3D, the outline of captures. For decision 3.
- `references/finish.md`: depth, matter, light; shadows and their tokens, glass, gradients, texture. For decision 4.
- `references/icons.md`: when an icon helps, libraries, stroke, size and colour. For decision 5.
- `references/media.md`: text over visuals, formats, loading, video, WebGL. For decision 6.
- `references/measures.md`: what 35 and 20 real sites do, reading `imagery.js`. For decision 6 and audits.
- `references/sources.md`: every source and its licence. Not needed during a project.
