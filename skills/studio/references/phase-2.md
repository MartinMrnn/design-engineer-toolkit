# Phase 2 · Design, UX × UI

The user decides: **one direction, or a mix**.

## Briefing covers
The path (who arrives where, and what they must do), the content (what each page says, with which real facts), the atmosphere (what the moodboard asks for). Read `design/spec.md` and `design/inspiration/` first.

## Issues
UX and UI are one phase, in this order:
1. **The page plan** · What: `design/content.md`, every page in scope with its sections and its real copy, in the site's language. Show it in the conversation; the user skims and approves it there (no grey wireframes). Done when: every page and section traces to a need of the spec; the main path is written step by step; no invented fact.
2. **Direction A** and 3. **Direction B** · What: `design/directions/a/` and `b/`, each a `tokens.css` and a real home page built on `content.md`. They differ in composition, visuals and interaction, **never in content**, and are opposed on an axis you name (e.g. editorial vs. immersive). Done when: the check script reports nothing; the axis is named in the issue.
4. **The comparison** · What: `design/directions/compare.html` shows both side by side at 1440 and 390 px; the critic reviews in two passes (structure and path first, then visuals, against the aesthetic-usability effect); the user chooses one or a mix. Done when: the choice is in `decisions.md`.
5. **The tokens** · What: `design/tokens.css`, the chosen direction (or mix) completed: colour, type, spacing, radii, motion. Done when: every value the home page uses comes from it.

Before the first preview, copy `references/launch.json` to `.claude/launch.json` (desktop app: start `studio-preview`; elsewhere run its command in the background) and write the preview URL in `CLAUDE.md`. If port 4321 is taken, pick another in both files.

## Reads / writes
Reads `design/spec.md`, `design/inspiration/`. Writes `design/content.md`, `design/directions/`, `design/tokens.css`.

## Skills
`/design-studio:ux` for the page plan; `/design-studio:type`, `colour`, `layout`, `imagery` for the directions.

## Critic's lens
Structure and path first, then visuals: fidelity to the inspiration, hierarchy, two truly opposed directions.

## Gate
The chosen direction, completed in `tokens.css`, on the home page. The user approves it.
