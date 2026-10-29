---
name: colour
description: The design studio's colour method and its measuring script, colour.py. How to build a palette from the project's intent, give every colour a role, measure contrast and colour-vision deficiency, and argue each choice with the kind of knowledge it rests on. Preloaded into the art director.
---

# Colour

Colour is decided inside a direction, together with type, imagery and light. The goal is a palette that is intentional, argued and measured: you can say why each colour is there, and the measures that apply to it pass.

## Three kinds of knowledge
Every claim in this skill and its references carries one of three labels. Weigh it accordingly.

| Label | What it covers | How you use it |
|---|---|---|
| **Standard** | A definition or requirement from a standards body, with an exact formula: WCAG 2.2 contrast, sRGB, CIE colorimetry, CSS Color 4 (OKLab, OKLCH, `lab()`, gamut mapping) | As a requirement, or as an exact computation. A failing required pair is a defect |
| **Empirical finding** | A result of a published study, true for its observers, stimuli and conditions | As evidence that informs a choice, stated with its scope ("in this study…"). Never as a promise of what a visitor will feel |
| **Design heuristic** | A practitioners' rule of thumb, with no claim to proof | As a starting point you may leave whenever the project justifies it. Say why you leave it |

Never turn a heuristic into a rule, or a finding into a guarantee.

## The method
The order below is a way of working, not a law. Every step leaves a written trace.

1. **Intent and context.** Start from the `Colour intent` line of `01-context.md`: three words for what the site must make people feel, the existing identity and how binding it is, the appetite (how present colour should be), the colours to avoid. Read it with the site's purpose, its audience, its content (photos or not, how much text) and the direction under way.
2. **Existing identity, only if there is one.** A logo or colours already in use are inputs, as binding as A1 recorded: keep, may evolve, or free. If there is none, build from the intent alone. Never invent or impose an identity.
3. **Choose a strategy.** *Design heuristic.* Decide how colour occupies the page before choosing hues: Signal, Colour surfaces, Flood and tone-on-tone, Vivid pair on neutral, Primaries on white or black, or Content carries the colour; never ranked, and two may combine, one leading (`references/composition.md`). The appetite of the `Colour intent` line (discreet, present, dominant) narrows the choice. At C2 the three directions differ in strategy by default. `08-colour.md` names it on its `Strategy:` line.
4. **Character, then hue.** *Design heuristic.* First settle lightness and chroma (OKLCH L and C): a light or dark ground, muted or vivid accents, the contrast range. They shape much of the felt effect (*Empirical finding*, Wilms & Oberfeld 2018, with hue and interactions mattering too). Then choose hues: hue has its own effects, so this is not a formality. Start from a hue when the project does (a brand colour, a moodboard built on one colour).
5. **Roles and hierarchy.** Give every colour a role with the contract's tokens (ground, ink, accent, line, focus ring, states, and the surfaces and tones the strategy needs). Then decide which surfaces dominate, how visible the accents are, and what draws the eye first, for this type of site and this strategy (`references/composition.md`). Inside Signal, 60-30-10 and "one salient colour" are reference points, never quotas.
6. **Meaning is built in the site.** A colour comes to mean what the site keeps pairing it with: the accent on every action becomes "you can act here". Shared associations exist, with their scope (`references/meaning.md`). No table turns a hue into a fixed meaning.
7. **Measure** with `colour.py` before the palette reaches a card: the contrast pairs the contract requires, the state colours under colour-vision deficiency, the OKLCH values (`references/measures.md`).
8. **Argue.** `08-colour.md` says why these colours. Link each choice to the intent, the context, the existing identity, the hierarchy or a measure, and name the kind of knowledge it rests on. "Because it looks good" is not a reason.

## Roles and states
- The colour logic fits in one sentence in `08-colour.md`, for example "the accent only appears on what you can click".
- Colours are named by role, never by hue, with the charter contract's names: `var(--ground)`, `var(--ground-raised)`, `var(--ink)`, `var(--ink-muted)`, `var(--line)`, `var(--accent)`, `var(--on-accent)`, `var(--focus-ring)`, and the states `var(--state-selected)`, `var(--state-unavailable)`, `var(--state-error)`, `var(--state-success)`. Optional: `var(--accent-2)` and `var(--on-accent-2)`, the surfaces `var(--surface-1)` to `-3` with `var(--on-surface-1)` to `-3`, the tones `var(--tone-1)` to `-7`. Hues may change; roles stay. Never invent another name.
- Text never sits directly on a tone: only on a surface that aliases it, with its `on-surface-*`. On a surface, the focus ring takes that `on-surface-*` colour (the `.ds-surface-n` class in `components/bundle.css`).
- Where the B2 plan has choices or states, each gets its state colour, the same everywhere, and a word, an icon or a shape as well (WCAG 2.2, 1.4.1).
- A two-colour palette can be striking. Check that options, states and actions still read apart; if not, add a cue (an icon, a pattern, a weight) rather than a stray colour.

## Commands
Run from the project folder: `python3 "<colour skill directory>/scripts/colour.py" <command>`. The colour skill directory is the `Colour skill:` of your mission; without one, it is the `colour` folder next to the charter skill directory. Every command takes `--json` (unrounded values). Errors print as `colour: …` and exit 1.

| Command | What it gives | When |
|---|---|---|
| `contrast <text> <ground> [--large] [--non-text]` | WCAG 2.2 ratio, pass or fail against 4.5:1, or 3:1 for large text (`--large`) and interface parts (`--non-text`); AAA reported, not required | Any single pair you are unsure of, before you write it into `tokens.json` |
| `convert <colour>…` | hex, `oklch()`, `oklab()` (D65) and `lab()`, `lch()` (CIELAB D50), ready to paste into CSS | To read a colour's lightness and chroma, or to state values in OKLCH |
| `ramp <colour> --steps n` | A lightness ramp at the colour's OKLCH hue and chroma, brought into sRGB | To find a lighter or darker version of a role colour at the same hue; with `--steps 7`, a source for `tone-1` (lightest) to `tone-7` |
| `cvd <colour>…` | Each colour under protanopia, deuteranopia and tritanopia; every pair's OKLab distance, closest first | To check state colours, or any colours that must read apart |
| `dominant <image.png> [--match tokens.json]` | The colours seen in a PNG capture, by area and as accents; with `--match`, each token's share of the pixels (surfaces and tones included) and the unassigned share | C1: the moodboard captures. C2: the Showcase capture, to see the visible hierarchy and how much the strategy's colour covers. Never as a design's tokens |
| `palette <tokens.json>` | The charter's palette: OKLCH of every colour token, every required contrast pair with pass or fail, CVD distances of the state colours | On your branch before you publish it; after any colour change |

`palette` and `charter.py check` share one WCAG module, so they never disagree on a contrast. For a reference website, read its interface colours from its styles (computed colours of body, headings, links, buttons in Playwright) rather than from pixels.

## What not to do
- Justify a palette by hue-wheel geometry alone (complementary, triadic…).
- Interpolate or build ramps in HSL: its lightness is not perceived lightness (`references/perception.md`).
- Let a colour carry information or a state alone.
- Pick colours from a "generator" that draws from fixed lists.
- Present an indicator or a CVD distance as a verdict, or round a ratio up to a pass.
- Analyse competitors' colours unless the user asks for it.

## References
- `references/intent.md`: the A1 colour questions and the `Colour intent` line (read by the lead).
- `references/perception.md`: OKLab and OKLCH, lightness and chroma, why HSL misleads, gamut.
- `references/measures.md`: WCAG 2.2, why APCA is not built, CVD simulation, how to read each command's output (read by the critic).
- `references/composition.md`: the six colour strategies and how to choose one, the rules for surfaces and tones, roles, hierarchy by type of site, Albers.
- `references/meaning.md`: what studies found on colour and emotion, with their scope.
- `references/sources.md`: every source, its link and licence.
