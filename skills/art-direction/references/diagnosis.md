# Diagnosis: finding the level at fault

When a composition does not work, the fix depends on where the fault lies. The art director and the critic read this file.

## The five levels
| Level | What it decides | Typical fault |
|---|---|---|
| **Intent** | What the visitor must feel, understand and do (`01-context.md`, `02-intent.md`) | A good-looking page that says something else than the brief |
| **Governing idea** | The sentence that links the product's subject to its form, and its manifestations (the idea card) | Choices right one by one that say nothing together |
| **Palette** | The hues and their character (OKLCH lightness and chroma) | An association that does not hold, whatever the distribution |
| **Distribution** | Which colour dominates, on which surfaces and components, in what proportion, next to what | Two touching surfaces at the same lightness; a saturated colour over a whole page |
| **Context** | How the language adapts to dense text, photos, states, mobile | An opening that works and components that fall flat |

Visual hierarchy is not a level: it is an outcome you observe. The UX ranks what matters (`06-structure.md`); the art direction chooses how to express each rank; the tests below show whether the result serves the ranks.

## The tests
Each changes one thing and keeps the rest. All are **Design heuristics**: practitioners' ways of seeing (the grey "value" check and the squint test come from painting and graphic design), not proofs.

| Test | What changes | What it shows | Level it points to |
|---|---|---|---|
| **Blind reading** | Nothing: someone who has not read the brief describes the page in three words | The intent perceived against the intent sought | Intent or idea |
| **Grey** | The hue is removed (a grey capture) | Whether the ranks hold by lightness alone; touching colours at the same lightness | Distribution (lightness) |
| **Blur** | The detail is removed (a blurred capture) | The masses: where the eye goes, which colour weighs too much | Distribution (proportion) |
| **Permutation** | Same palette, roles swapped | Whether another distribution of the same palette works better | Distribution rather than palette |
| **Transposition** | Same lightness and chroma, other hues | Whether the association of hues or their character is at fault | Palette |
| **Change of situation** | Same language, another situation (dense text, a form, 390 px) | Whether the language holds beyond the opening | Context |
| **Removal** | One element taken out (an accent, a texture, a colour) | Whether it carries the idea or decorates | Idea (simplify) |

A variant is a copy of the page with another set of token values, or the same page captured through a filter: the tokens are CSS variables, so a variant costs little.

## How to use them
- **Only to answer a question.** A test runs when the critic, the user or your self-check raises a question about a composition. Each variant states the question it answers; two or three variants per question at most. Never generate a batch of variants to pick a winner: the tests diagnose, they do not create. Creation works on the whole, through the idea; you interpret the results.
- **Top down.** A wrong intent is not fixed by tuning colours. But a lower fault can blur a higher reading: when the blind reading fails, run the grey and blur tests before you condemn the idea.
- **Where each result leads**: the intent misread → back to the idea, or to the product through the UX designer; the ranks blurred → the distribution; no permutation works → the palette; it holds in one situation only → a context rule; a fusion of content and form appears → a structural proposal, which the user approves and the UX designer writes (the art direction's `SKILL.md`).
- **Measures stay observations.** ΔL, a contrast ratio between two panels, the shares of `dominant --match`: each is information for the diagnosis, never a threshold (the colour skill's `measures.md`). Only the accessibility criteria that apply to a pair pass or fail.

## Accessibility in the diagnosis
A failing accessibility criterion is a fact, not a level of taste: it must be met. Diagnose it like any other fault, from the level that caused it. Light text failing on a vivid flood is a distribution question (the vivid colour as a surface with its `on-surface` ink, rather than as text), not a reason to grey the page. Look for another way to carry the idea before a generic fix, and record the two or three alternatives you tried (the art direction's `SKILL.md`, "Accessibility is a design constraint").
