# Composition: strategies, roles and hierarchy

How colours occupy the page and share it. Each claim carries its kind: **Standard**, **Empirical finding** or **Design heuristic**. Most of this file is heuristic: reference points to use when they help and to leave when the project calls for it.

## Colour strategies
A palette is also a way of occupying the page. The same hues give a different site when they mark the actions, paint whole sections or fill the screen. A direction starts from its governing idea (its idea card, the art direction's `SKILL.md`), and the idea decides how colour occupies the page: which colour dominates, where, in what proportion, next to what. The strategies below are a **vocabulary to name that distribution**, not a slot to fill: the idea chooses one when one fits.

There are six strategies. Each is a **Design heuristic**: a way of working seen in practice, not a rule. They are **never ranked**: none is the safe default, and Signal is one option among six. A direction may combine two, and says which one leads ("Colour surfaces, led; Content carries the colour"). When one fits, `08-colour.md` names it on its `Strategy:` line and says where the colour goes on the page; a distribution none of the six describes is written in words instead.

### Choosing one
- **The idea leads.** The distribution follows from the idea and from the situations it must hold (the opening, a dense section, an interaction). Nobody assigns a strategy to a direction in advance, and directions differ by their ideas: two may use the same strategy.
- **The appetite** comes from the `Colour intent` line of `01-context.md` (`intent.md`): how present colour should be, *discreet*, *present* or *dominant*, as a **preference** (the default) or a **constraint** (when the user says so). A constraint binds every direction; a preference informs the ideas. Neither picks a strategy.
- **Design heuristic**: as tendencies, *discreet* sits well with Signal and Content carries the colour; *present* with Vivid pair on neutral, Primaries on white or black and Colour surfaces; *dominant* with Colour surfaces and Flood and tone-on-tone. Tendencies, not rules: an idea may argue otherwise, and says why.
- The site's content counts as much as the appetite: a strategy that needs colourful photos fails without them.

### What the blind tests taught about distribution
**Design heuristic**, from the studio's blind tests of 29 October 2026 (one judge, three briefs: a practical check, not a proof). Each is a question to ask of a distribution, never a threshold.
- **Neighbours need lightness, not only hue.** Two touching surfaces that differ in hue but hardly in lightness read as one block: clay `#f0d3bc` against sage `#d6e3cf` (ΔL 0.01546, contrast ratio 1.0677:1, `measures.md`) did. The grey test shows it.
- **The larger the area, the more its chroma weighs.** A pink `#FF61A6` (OKLCH C 0.2019) chosen on a swatch read as heavy over a whole page. A colour that is right as an accent may need less chroma as a surface; the blur test shows the masses.
- **An identity colour may stay a signature.** Keeping an identity does not mean making its colour the action colour: a logo orange kept as a rare third colour added a dimension, while the same orange on every action lost it. Permuting the roles shows the difference.

### Signal
**Design heuristic**. A neutral ground; one colour marks what you can act on, or what matters.
- **Tokens**: grounds (`ground`, `ground-raised`), `ink`, `accent` with `on-accent`.
- **Watch**: an accent that appears everywhere stops pointing at anything. The page can turn flat if nothing else carries the mood.
- **Seen on**: a booking tool or a product dashboard, where the eye must find the next action at once.
- **Design heuristic**: 60-30-10 (about 60 % dominant colour, 30 % secondary, 10 % accent) is a reference point for balance. Use it when it helps; leave it when the project justifies it, and say why in `08-colour.md`. Never force the proportions.
- **Design heuristic**: "one salient colour": on a calm set, a single vivid colour reads as the signal. It works because salience is relative: two salient colours compete.

### Colour surfaces
**Design heuristic**. Whole sections, panels or bands are painted. Neutral and coloured surfaces alternate, and the alternation gives the page its rhythm.
- **Tokens**: `surface-1` to `surface-3`, each with its text colour `on-surface-1` to `on-surface-3`; often a surface aliases the accent or a tone.
- **Watch**: text and focus on each surface (the rules below). The rhythm follows the content (one surface per kind of section, say), not decoration. Touching surfaces need a difference in lightness, not only in hue (below).
- **Seen on**: a pet-food brand that paints whole sections in one warm colour, as rounded panels alternating with grey ones, with photos laid on them.

### Flood and tone-on-tone
**Design heuristic**. One hue fills large areas, up to the whole screen; depth comes from several lightnesses of that hue rather than from other hues.
- **Tokens**: a coloured `ground`, `tone-1` to `tone-7`, and surfaces aliased to tones (`"surface-2": "{tone-3}"`) wherever text sits.
- **Watch**: neighbouring tones need enough difference to read as layers (`palette` lists their contrast ratio and ΔL, as information). Text only through a surface and its `on-surface-*`. The larger the flood, the more its chroma weighs (below).
- **Seen on**: a maker of craft supplies whose product page opens on a full screen of acid colour, then shows the product on a ground of its own hue at a few lightnesses.

### Vivid pair on neutral
**Design heuristic**. A quiet or textured neutral ground; two saturated colours, used small and rare, which strike because they are rare.
- **Tokens**: grounds, `accent` and `accent-2` with `on-accent` and `on-accent-2`.
- **Watch**: small coloured text must still reach 4.5:1. Two vivid colours compete if both are everywhere: give each a job (tags and links, say).
- **Seen on**: a design association whose pages sit on a grey, scan-lined ground, with small tags in violet and acid green.

### Primaries on white or black
**Design heuristic**. An extreme neutral ground, near-white or near-black; saturated primaries or complementaries for the brand and the content; soft tone-on-tone panels to group things.
- **Tokens**: grounds, `accent`, `accent-2`, `surface-*` for the soft panels.
- **Watch**: interface states (`state-*`) stay distinct from the content colours, or a yellow note and a "selected" state read alike. Actions often stay black or white.
- **Seen on**: a collaboration tool with a quiet interface, black actions and a yellow brand, whose colour lives in the content (notes, illustrations) and in pale tinted panels.

### Content carries the colour
**Design heuristic**. Photos or illustrations bring the colour; the interface stays quiet so they lead.
- **Tokens**: grounds, `ink`, a discreet `accent`.
- **Watch**: it needs real, colourful content. On a site without it, this strategy fails: the page is grey. Measure the interface with the photos excluded (`dominant --exclude`).
- **Seen on**: a photographer's portfolio, or a restaurant whose dishes fill the page.

## Surfaces and tones: the rules
The art director follows these whatever the strategy: they are the charter contract's rules, and `charter.py check` enforces them. All these tokens are optional: a palette that uses none of them is valid.
- **Standard**: each `on-surface-n` is a text colour, at least 4.5:1 on its own `surface-n`, compared unrounded (WCAG 2.2, SC 1.4.3). Its usage note names its surface in backticks ("Text and icons on `surface-2`."). `charter.py check` requires it whenever the surface exists.
- **Text never sits directly on a tone.** Tones carry no text. Text sits on a tone only through a surface that aliases it, `"surface-2": "{tone-3}"`, and its `on-surface-2`, so every text pair is checked. A usage note that names a tone as a text ground is reported.
- **Standard**: the focus ring stays visible on every surface, at 3:1 (SC 1.4.11). So on a surface, the focus ring takes that surface's `on-surface-*` colour: it reaches 4.5:1 there, so it clears 3:1 by construction.
- For each surface, a class in `components/bundle.css`: `.ds-surface-n { background: var(--surface-n); color: var(--on-surface-n); --focus-ring: var(--on-surface-n); }` (components draw focus with `var(--focus-ring)`, so re-pointing the token inside the surface makes every focus ring there use the surface's ink). `check` reports a `surface-n` without its class, and a class whose `surface-n` token is absent.
- Tones come as a full set: `tone-1` to `tone-7`, `tone-1` the lightest, OKLCH lightness strictly decreasing. Hue and chroma may drift on purpose. A source: `colour.py ramp <colour> --steps 7`, then adjust by eye in place.

## Roles first
Decide the colour logic before the colours, and write it in one sentence in `08-colour.md` ("the accent only appears on what you can click"). Then give every colour a role, with the charter contract's token names:
- **ground**: the background family, `var(--ground)`, and the raised surfaces, `var(--ground-raised)` (light, dark or tinted);
- **ink**: the text colours, `var(--ink)` and `var(--ink-muted)`, each with enough contrast on every ground its usage note names;
- **line**: rules, borders and dividers, `var(--line)`;
- **accent**: one or two colours, `var(--accent)` with its text colour `var(--on-accent)` (and `var(--accent-2)` with `var(--on-accent-2)`), and a rule for where they are allowed (only on actions? only in one section? only in photos?);
- **surfaces and tones**, when the strategy paints the page: `var(--surface-1)` to `var(--surface-3)` with `var(--on-surface-1)` to `var(--on-surface-3)`, and `var(--tone-1)` to `var(--tone-7)`;
- **focus**: `var(--focus-ring)`, visible on every ground;
- **states**, where the B2 plan has choices or states (available, full, selected, sold out, error, success): `var(--state-selected)`, `var(--state-unavailable)`, `var(--state-error)`, `var(--state-success)`, the same everywhere.

Hues may change from one direction to the next; roles stay. Never invent another token name.

- **Standard**: a state is never told by colour alone (WCAG 2.2, SC 1.4.1). Pair it with a word, an icon or a shape.
- **Standard**: text roles meet 4.5:1 on their grounds, the focus ring and meaningful interface parts 3:1 (`measures.md`).
- **Design heuristic**: neutrals (ground, line, muted ink) share one temperature, so they read as a family.
- **Design heuristic**: a palette of two colours can be striking. Check that options, states and actions still read apart; if not, add a cue (an icon, a pattern, a weight) rather than a stray colour.

## Hierarchy
Three questions, answered for this site and its strategy:
1. **Which surfaces dominate?** The ground, or the painted surfaces, cover most of the screen; their lightness and chroma set the mood more than any accent.
2. **How visible are the accents?** An accent that appears everywhere stops pointing at anything.
3. **What draws the eye first?** Usually the most saturated or the most contrasted area. Make it the thing the visitor should see first.

`dominant --match tokens.json` on the Showcase capture shows what each role really covers, surfaces and tones included: compare it with the hierarchy and the strategy you meant.

**Design heuristic**: how the answers tend to change with the type of site. These are tendencies, not rules, and any strategy can fit any type when the project argues it.
- **Editorial** (magazine, journal, long reading): a calm ground and a strong ink carry the page; colour comes from images and from a restrained accent on links and section marks.
- **Shop**: products and their photos carry the colour; the interface stays quiet so it does not compete with them, and the accent marks the actions that matter (add to basket, buy) and the states (sold out, selected).
- **Portfolio**: the work carries the colour; the frame recedes, or takes one confident colour that becomes the signature.
- **Tool** (app, dashboard, booking): colour is mostly functional: states, focus, selection, errors. A brand accent stays rare so that state colours keep their meaning.

## Colour is relative
- **Design heuristic**: Josef Albers' *Interaction of Color* (1963) demonstrates that a colour looks different with its neighbours: the same grey reads lighter on black than on white, and one colour can be made to look like two. These are demonstrations, not measurements, but the lesson holds for every palette: judge a colour in place, next to the colours it will touch, never as a swatch alone.
- **Standard**: WCAG contrast is computed on a pair of colours, never on one, for the same reason: legibility depends on the neighbour.
- So look at the palette in a card (the Showcase), composed for its strategy, not only in a list of hex values.

## Harmony
- **Design heuristic**: hue-wheel schemes (complementary, analogous, triadic) are a weak justification on their own. The wheel is a convention: perceptual hue spacing is not a regular circle, and two colours a fixed angle apart can look unequal in lightness and chroma. Use a scheme as an idea, then judge the result in place and say what else supports it.
- Research on two-colour harmony exists, and its models are disputed for some pairs. The studio does not compute harmony; it argues a palette from the intent, the strategy, the roles and the hierarchy.
