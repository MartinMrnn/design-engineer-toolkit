# Composition: roles and hierarchy

How colours share the page. Each claim carries its kind: **Standard**, **Empirical finding** or **Design heuristic**. Most of this file is heuristic: reference points to use when they help and to leave when the project calls for it.

## Roles first
Decide the colour logic before the colours, and write it in one sentence in `08-colour.md` ("the accent only appears on what you can click"). Then give every colour a role, with the charter contract's token names:
- **ground**: the background family, `var(--ground)`, and the raised surfaces, `var(--ground-raised)` (light, dark or tinted);
- **ink**: the text colours, `var(--ink)` and `var(--ink-muted)`, each with enough contrast on every ground its usage note names;
- **line**: rules, borders and dividers, `var(--line)`;
- **accent**: one or two colours, `var(--accent)` with its text colour `var(--on-accent)`, and a rule for where they are allowed (only on actions? only in one section? only in photos?);
- **focus**: `var(--focus-ring)`, visible on every ground;
- **states**, where the B2 plan has choices or states (available, full, selected, sold out, error, success): `var(--state-selected)`, `var(--state-unavailable)`, `var(--state-error)`, `var(--state-success)`, the same everywhere.

Hues may change from one direction to the next; roles stay. Never invent another token name.

- **Standard**: a state is never told by colour alone (WCAG 2.2, SC 1.4.1). Pair it with a word, an icon or a shape.
- **Standard**: text roles meet 4.5:1 on their grounds, the focus ring and meaningful interface parts 3:1 (`measures.md`).
- **Design heuristic**: neutrals (ground, line, muted ink) share one temperature, so they read as a family.
- **Design heuristic**: a palette of two colours can be striking. Check that options, states and actions still read apart; if not, add a cue (an icon, a pattern, a weight) rather than a stray colour.

## Hierarchy
Three questions, answered for this site:
1. **Which surfaces dominate?** The ground covers most of the screen; its lightness and chroma set the mood more than any accent.
2. **How visible are the accents?** An accent that appears everywhere stops pointing at anything.
3. **What draws the eye first?** Usually the most saturated or the most contrasted area. Make it the thing the visitor should see first.

`dominant --match tokens.json` on the Showcase capture shows what each role really covers: compare it with the hierarchy you meant.

**Design heuristic**: how the answers tend to change with the type of site. These are tendencies, not rules.
- **Editorial** (magazine, journal, long reading): a calm ground and a strong ink carry the page; colour comes from images and from a restrained accent on links and section marks.
- **Shop**: products and their photos carry the colour; the interface stays quiet so it does not compete with them, and the accent marks the actions that matter (add to basket, buy) and the states (sold out, selected).
- **Portfolio**: the work carries the colour; the frame recedes, or takes one confident colour that becomes the signature.
- **Tool** (app, dashboard, booking): colour is mostly functional: states, focus, selection, errors. A brand accent stays rare so that state colours keep their meaning.

## Proportions
- **Design heuristic**: 60-30-10 (about 60 % dominant colour, 30 % secondary, 10 % accent) is a reference point for balance. Use it when it helps; leave it when the project justifies it, and say why in `08-colour.md`. Never force the proportions.
- **Design heuristic**: "one salient colour": on a calm set, a single vivid colour reads as the signal. It works because salience is relative: two salient colours compete.
- Sites that rightly leave both: a **monochrome** site (one hue, or none, in many lightnesses); a **colour-saturated** site where large fields of colour are the identity; a **photographic** site where the images carry the colour and the interface stays neutral.

## Colour is relative
- **Design heuristic**: Josef Albers' *Interaction of Color* (1963) demonstrates that a colour looks different with its neighbours: the same grey reads lighter on black than on white, and one colour can be made to look like two. These are demonstrations, not measurements, but the lesson holds for every palette: judge a colour in place, next to the colours it will touch, never as a swatch alone.
- **Standard**: WCAG contrast is computed on a pair of colours, never on one, for the same reason: legibility depends on the neighbour.
- So look at the palette in a card (the Showcase), not only in a list of hex values.

## Harmony
- **Design heuristic**: hue-wheel schemes (complementary, analogous, triadic) are a weak justification on their own. The wheel is a convention: perceptual hue spacing is not a regular circle, and two colours a fixed angle apart can look unequal in lightness and chroma. Use a scheme as an idea, then judge the result in place and say what else supports it.
- Research on two-colour harmony exists, and its models are disputed for some pairs. The studio does not compute harmony; it argues a palette from the intent, the roles and the hierarchy.
