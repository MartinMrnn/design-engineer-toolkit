# Scoring grid

Score each assessed criterion from 1 to 5. Use the anchors below; between two anchors, use 2 or 4. A 3 means "good enough to show the user", not "average".

## Relevance
- **1**: ignores the brief. Wrong visitor, main action missing or buried, content outside the scope.
- **3**: answers the brief. The main action is findable within a few seconds. Some copy is generic.
- **5**: every section serves the priority visitor, in an order that makes sense to them. The main action is obvious at every step. The copy could only belong to this client.

## Distinctiveness
- **1**: could be any site. Template layout, default font pairing, stock look, nothing traceable to the moodboard; or it repeats a past direction from the taste file.
- **3**: at least one strong choice clearly comes from the moodboard or the brief (a type treatment, a colour logic, a layout idea). The rest is competent but expected.
- **5**: most choices trace back to the project. It has a point of view a visitor would remember, and it stays readable.

## Consistency
- **1**: contradicts the approved intent or direction (wrong palette, wrong mood, an "avoid" item used), or uses values outside the charter's tokens.
- **3**: follows the direction with small drifts: a stray colour, an off-scale size, a restyled component.
- **5**: every value comes from the tokens; the work feels made by one hand; nothing contradicts the charter's `07-visual-intent.md` or `13-rules.md`.

## Craft
- **1**: visible errors. Misalignment, uneven spacing, body text under 4.5:1 contrast, orphan words in headlines, broken states, overflow.
- **3**: clean at both widths. Minor rhythm or spacing issues. The main interactive elements have their states.
- **5**: precise typographic hierarchy, steady rhythm, optical alignment, every state designed, details that reward a second look.

## Usability
- **1**: hard to read or use. Unclear navigation, small touch targets, keyboard traps, content hidden without motion.
- **3**: clear navigation, readable on mobile, reachable with the keyboard, readable with reduced motion.
- **5**: effortless at both widths. Designed focus states, motion that never delays reading, nothing that depends on hover.

## Calibration with the taste file
Read the user's taste file before scoring distinctiveness and craft.
- Something from "What I dislike" that appears without a reason from the brief is a defect.
- Work that repeats an entry of "Directions already made" scores 2 at most on distinctiveness.
- "What I like" is not a checklist: do not raise a score because a liked element appears.

## Colour
- Judge colour inside the criteria above, never as a sixth one: against the colour intent of `01-context.md`, the project's context, the existing identity when there is one (as binding as the brief recorded), the coherence of the direction and the visible hierarchy.
- A required WCAG pair under its threshold (`colour.py palette`, or `charter.py check`) is a craft defect: text under 4.5:1 is the anchor of craft 1. Any other number is an indicator: an OKLCH figure, a share of the first screen, a CVD distance. Never lower a score for an indicator that is not a requirement; use it to question a claim or a choice.
- Report any claim of "Why these colours" that the measures contradict, with the command and the figure.
- Strategy, C2: score whether the composition puts the colour to work as the direction's `Strategy:` line says (a "surfaces" direction with colour only on buttons lowers distinctiveness and consistency), and whether the three strategies are distinct. The strategy and the surface, tone and accent shares are measures, and measures are evidence, not verdicts.
- Strategy, C3 to E1: the chosen strategy applied consistently across the pages (consistency).
- Colour-vision deficiency, C3 to E1: when two state colours come close under a simulation, the finding is "check that this state has a non-colour cue". It is a usability finding about the cue, not a pass or fail on the distance.

## Sketches at C2, completed components at C3
- At C2 a branch is a sketch. Score what it holds (tokens, palette, type, shape, imagery, the home opening, Button and Card); never lower a score for the components or the long-form sections it leaves for after the choice.
- At C3, round 1, the components completed at C2 count: a missing or invisible focus state, a state under its contrast or a drift from the chosen sketch lowers craft or usability.
