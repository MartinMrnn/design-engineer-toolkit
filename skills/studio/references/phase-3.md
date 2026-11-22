# Phase 3 · Mockup

The user decides: **the mockup**.

## Briefing covers
The key pages (the ones that set a pattern the others repeat: often home, a listing, a detail, a form) and the motion (what moves, when, how much). Read `design/content.md`, `design/tokens.css` and `design/decisions.md` first.

## Issues
One per key page · What: `design/maquette/<page>.html`, built from `content.md` and `tokens.css` only, with its motion. Done when: the check script reports nothing, `token` included (every colour, radius and spacing comes from `tokens.css`); the page works at every width and in every declared theme; motion stops under reduced motion.

A component repeated a third time is abstracted into a shared one.

## Reads / writes
Reads `design/content.md`, `design/tokens.css`, `design/decisions.md`. Writes `design/maquette/`.

## Skills
`/design-studio:layout`, `imagery`, `motion`, `components`.

## Critic's lens
Fidelity to the chosen direction, motion rules, tokens.

## Gate
The whole mockup. Once the user approves it, `design/maquette/` is frozen: later changes are decisions or deviations in `decisions.md`.
