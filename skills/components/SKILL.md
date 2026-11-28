---
name: components
description: The design studio's components method, usable on its own. Builds the controls of a page, or audits them, through six decisions - system, element, pattern, focus, state, finish - and runs the finishing pass on every built page. Built on the WAI-ARIA Authoring Practices, Inclusive Components and Emil Kowalski's picks, checked by a script, components.js, that opens menus and dialogs by keyboard and measures the focus ring. Use for semantic HTML, buttons and links, menus, dialogs, disclosures, tabs, tooltips, toggles, focus styles, hit areas, keyboard support, ARIA, live regions, loading and error states of controls, when to make a component, choosing a headless library, the finishing pass, or a components review.
---

# Components

A control works for everyone before it looks like anything: it is the right element, it answers every key its role promises, its focus shows, and its state is heard as well as seen. Give a project components that hold, and never commit their faults: **a `div` that acts as a button, a role without its keys, a focus you cannot see or that gets lost, a state only the eye can read, and a page tried only with its best data**.

Components carry no gesture of their own: their look comes from the direction's tokens. `ux` decides what an interaction does (`references/behaviour.md` there); this skill builds it without restating it. `layout` keeps focus hidden under sticky content (`layout proof-9`); `colour` the contrast of controls and `--ring`; `motion` how a state change moves (`motion choreography-7`) and the press; `imagery` the icons.

## Two entries
- **A page to build** (phases 3 and 4): its components, built by these rules. In phase 3, a `## Components` entry in `design/decisions.md`; in phase 4, the finishing pass on every page (`references/finishing.md`). Otherwise, the conversation.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. Examples here use invented trades; take yours from the brief.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names a `check.js` measure (`script …`), `components audit` (this skill's `components.js`), or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. Used alone, check these rules by hand and list what you could not verify. Some rules live in the references; they count the same.

## The six decisions, in order

### 1 · System
What becomes a component, and how it holds its state. Read `references/system.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `system-1` · A pattern becomes a component at its third repetition; until then it is copied | made too early, it fixes the wrong shape; too late, the copies drift | heuristic | Studio | critic phases 3, 4 |
| `system-2` · State lives in the element's ARIA attribute (`aria-expanded`, `aria-pressed`, `aria-current`, `aria-invalid`), or `data-state` when ARIA has none, and the CSS styles that attribute, never a parallel class | what is styled is then what assistive technology hears; a class and an attribute drift apart | heuristic | Studio | critic phase 4 |
| `system-3` · A component takes every colour, radius, space, duration and curve from the tokens; its variants are attributes, not copies | one source of values keeps the direction whole | heuristic | Studio, shadcn | script token + critic phases 3, 4 |
| `system-4` · A component carries no gesture of its own: its look comes from the direction's tokens | the gesture is the direction's; a control that adds its own pulls the page apart | heuristic | Studio | critic phases 3, 4 |

### 2 · Element
The right element, its name and its target. Read `references/element.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `element-1` · The native element first: `<button>` for an action, `<a href>` for a destination, `<label>` for a field, `<dialog>`, `<details>` or `popover` for what opens; never a `div` or `span` with a click handler | the native element brings focus, keys, name and state for free; a rebuilt one forgets some | heuristic | APG, Krehel accessibility, Vercel | script keyboard + critic phase 4 · blocking |
| `element-2` · Every control exposes its name, its role and its state to assistive technology | a screen reader can only say what the markup says | standard (WCAG 4.1.2) | W3C | script axe + components audit + critic phase 4 · blocking |
| `element-3` · Structure that is seen is in the markup: a label tied to its field, lists, headings, table headers | otherwise the relationships exist only for those who see them | standard (WCAG 1.3.1) | W3C | script axe + critic phase 4 · blocking |
| `element-4` · A control's accessible name contains its visible label | voice control users say what they see | standard (WCAG 2.5.3) | W3C | components audit · blocking |
| `element-5` · An icon-only control is named on the control (visually hidden text or `aria-label`), its icon hidden | the name belongs to what is pressed, not to a picture inside it | heuristic | Soueidan, Krehel accessibility, Vercel | script axe + critic phase 4 |

### 3 · Pattern
Which pattern, with which tool, and its keys. Read `references/patterns.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `pattern-1` · A role is a promise: a widget built by hand implements its pattern's whole key map from `references/patterns.md` | a role without its keys tells a screen reader user about something that is not there | heuristic | APG | components audit + critic phase 4 · blocking |
| `pattern-2` · The tool, in order: the native element; then the stack's headless library, its need written; then the APG pattern by hand | the platform and a tested library carry the hard cases; every dependency is weight to keep | heuristic | Kowalski, APG, Studio | critic phase 4 |
| `pattern-3` · A modal layer (dialog, full-screen menu, drawer) moves focus inside, keeps it there and makes the rest inert; a disclosure leaves focus on its button | the keyboard must stay where the eye is | heuristic | APG, Krehel accessibility | components audit + critic phase 4 |
| `pattern-4` · Content that appears on hover or focus can be dismissed without moving the pointer or focus, can be hovered, and stays until dismissed or no longer relevant | a tooltip that covers or flees cannot be read | standard (WCAG 1.4.13) | W3C | critic phases 3, 4 · blocking |

### 4 · Focus
How focus shows and where it goes. Read `references/focus.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `focus-1` · Focus is drawn on `:focus-visible` as `outline: 2px solid var(--ring)` with `outline-offset: 2px`; never `outline: none` without it | an outline follows the radius and survives forced colours, and its colour is designed; measured products draw theirs | heuristic | Studio, Soueidan, Krehel accessibility | components audit + critic phase 4 |
| `focus-2` · The focus indicator keeps 3:1 against the colours next to it | a ring that melts into its ground does not show where focus is | standard (WCAG 1.4.11) | W3C | components audit · blocking |
| `focus-3` · A section on another ground sets its own `--ring`; over an image, the ring takes a second tone | one ring colour cannot contrast with every ground | heuristic | Soueidan, Studio | components audit + critic phase 4 |
| `focus-4` · A way exists to skip the blocks repeated on every page | a keyboard user should not tab through the header on every page | standard (WCAG 2.4.1) | W3C | components audit + critic phase 4 · blocking |

### 5 · State
What the control is doing, said to everyone. Read `references/state.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `state-1` · A control at work keeps its place and its focus: `aria-disabled` and `aria-busy` while it works, repeat presses ignored, never `disabled` under the user's finger | a control that turns `disabled` drops focus, and the user loses their place | heuristic | Hairline, APG, Krehel accessibility | critic phase 4 |
| `state-2` · A result is spoken by a `role=status` region present and empty from the start, outside the control; `role=alert` only for an urgent error | a region added with its text is often not read; an alert interrupts | heuristic | Pickering, Krehel accessibility, Hairline | components audit + critic phase 4 |
| `state-3` · A toggle changes its state (`aria-pressed`, `role=switch`) or its label, never both | both at once say the opposite of what happened | heuristic | Pickering | critic phase 4 |

### 6 · Finish
The finishing pass: once per built page, after the scripts, before the critic. Read `references/finishing.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `finish-1` · The page holds the worst realistic data: long names, empty and single lists, missing images, extreme numbers, fed through the same boundary as the real data | demo data is chosen to look good; real data is not | heuristic | Kowalski | critic phase 4 · blocking |
| `finish-2` · Every interaction works by keyboard, then by finger at 390 px, then by mouse | each walk finds what the others hide | heuristic | Studio, Krehel accessibility | components audit + critic phase 4 |
| `finish-3` · The accessibility tree, read once, gives every control a name, a role and a state that say what it does | the tree is what a screen reader reads | heuristic | Krehel accessibility, APG | critic phase 4 |

## The components entry (phase 3)

```markdown
## Components · Mockup
Abstracted: <component>, 3 uses (<pages or sections>); one line each, or `none yet`.
Tools: native only; or <library> for <component>, because <need>.
Focus: `--ring` <value>; <section>: `--ring` <value> on its ground.
Kept on purpose: none, or <a heuristic left>, because <the project's reason>.
Proof: `components.js` passes on every page, or `not yet`.
```

## The audit

```markdown
## Components audit · <page>
Script: <pass or fail, in one line>
### System · Element · Pattern · Focus · State · Finish (one heading each)
1. <blocking|to fix|suggestion> · <the defect> · evidence: <selector, key pressed or measure> · rule: `<id>`
### Set aside
### Outside this skill
### Not seen
```

**Blocking:** a broken `blocking` rule or a WCAG A or AA failure. **To fix:** another broken rule, with no stated reason. **Suggestion:** an improvement no rule demands, with `rule: none`. Write one defect per change a developer would make; one that breaks several rules cites them all, keeps the highest severity, and goes under the heading of that rule. Cite another skill's rule with its skill: `ux path-2`. Number the defects across headings; a heading with no defect says `none`. `Set aside` lists script findings judged false, each with why. Open by hand what the script cannot: custom widgets' arrow keys, hover-only menus, the worst data, a slow network.

## Commands
Open the page, then call `browser_run_code_unsafe` with `{ "filename": "<this skill's folder>/scripts/components.js" }`, or pass the file's content as `code` if the path is refused. It loads the page with reduced motion, walks the focus at 1440 × 900 (indicator kind, width, offset, contrast on a flat ground), reads names that leave out their visible label, menu roles in a navigation, positive `tabindex`, disabled submits and the ways to skip blocks, then at 1440 and 390 opens every trigger with Enter, Tabs inside what is modal, and presses Escape. Read `references/measures.md` before judging its findings. Only `focus-contrast` (`focus-2`) and `label-in-name` (`element-4`) set `pass` to false.

## References
- `references/system.md`: the third repetition, state in attributes, tokens, mockup and build. For decision 1.
- `references/element.md`: button or link, names, hit areas, cards, decorative layers. For decision 2.
- `references/patterns.md`: the tool tree, Kowalski's picks, key maps of each pattern. For decision 3.
- `references/focus.md`: the ring in CSS, grounds, forced colours, skipping blocks, focus after removal, tabindex. For decision 4.
- `references/state.md`: a control through idle, working, done and failed; live regions, toggles, disabled, errors, loading. For decision 5.
- `references/finishing.md`: the finishing pass in order, the worst data, the hard conditions. For decision 6.
- `references/measures.md`: what 23 real sites do, reading `components.js`. For decisions 2 to 4 and audits.
- `references/sources.md`: every source and its licence. Not needed during a project.
