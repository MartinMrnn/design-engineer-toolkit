# Phase 4 · Build

The user decides: **the build**.

## Briefing covers
The stack (confirmed from `design/spec.md`; any new dependency is Ask first and gets its need), the states (empty, loading, error, success, long and missing content), the interactions (forms, menus, dialogs). Read all of `design/` first.

## Issues
One per page · What: the page in `src/`, in the chosen stack, from the frozen mockup, with all its states and the finishing pass (`/design-studio:components`). Done when: the check script reports nothing; the page matches the mockup or its differences are deviations in `decisions.md`; every state exists.

The build is the base of the live site, not a throwaway (C8): no copy of the mockup's markup without its structure.

## Reads / writes
Reads all of `design/`. Writes `src/`; build deviations go to `design/decisions.md`.

## Skills
`/design-studio:type`, `layout`, `motion`, `components`.

## Critic's lens
Fidelity to the frozen mockup, the finishing pass, the states.

## Gate
The build. After the user approves it there is no next phase: going live (hosting, back end, domain) happens outside the plugin.
