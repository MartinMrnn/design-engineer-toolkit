# Changelog

## 0.3.0 · unreleased · the charter

- **One charter per project.** The project's single reference is a native Claude Design System on claude.ai, created at kickoff and enriched at every step: context, intent, story, positioning, voice and wording, structure and wireframes, tokens, components and rules, the approved mockups and motion. The lead publishes it after every step; you can browse, share and edit it.
- **Product first.** B1 becomes Product: after the research, the UX designer writes the intent, the story, the positioning with your key messages, and the voice and wording every page then follows.
- **Comparable directions.** At C2, three art directors each build a complete design system as a branch of the charter, on one contract: the same token names, sections, components and copy. Only the design differs, and a published board compares them row by row. The chosen direction, or a mix, is merged back into the charter.
- **No more handoff kit.** The charter is the kit. At the end of C4, `charter.py freeze` checks that every value of the mockups is a token, and the build starts from `charter.py export`. Nine steps instead of ten.
- **A contract, checked by a script.** `charter.py check` validates the charter at every step: sections due, token names and grammar, text contrast in every theme, components and cards.
- **Requires Claude Code signed in to claude.ai.** v0.3 does not resume a project started with v0.2; finish it with v0.2.

## 0.2.0 · 2026-10-24 · first public release

- **A studio of agents.** A project lead runs ten steps with acceptance criteria, from kickoff to final review, and hands the work to a UX designer, an art director, a frontend developer and an independent critic. It relays every agent's questions word for word and logs every decision.
- **Design before you code.** Structure, copy, art direction, layouts and motion are proposed as HTML pages and chosen by you before the mockup is built: three art directions in parallel, two or three layouts, two or three motion personalities, side by side on a comparison board. "Choose for me" works at every step; at C2, an independent art director compares the three directions.
- **UX first, and the UI serves it.** The UX designer works from visitor intents to needs, path and structure, keeps a "left out" list, and decides a mobile plan with its navigation pattern. The art direction names the job of every visual choice, with references for layout, spacing, hierarchy, shape, the opening hero and mobile composition, and one list of generic defaults (status dots, badges, feature grids, effects without a role) to justify or leave out.
- **Icons and meaningful colour.** Icons from the free Hugeicons set where they help understanding; colour roles for states, never colour alone.
- **An independent critic.** It never sees the maker's reasoning, scores each step on relevance, distinctiveness, consistency, craft and usability, and runs the capture and check scripts (console errors, overflow, broken images and links, axe accessibility, reduced motion). Unavoidable deviations from the approved design are listed, judged and approved by you one by one.
- **A mockup you can send.** `site/`: static HTML, CSS and JS that looks and moves like the approved design at 1440 px and 390 px, with an opening hero that fills the first screen, a 404 page, a legal page and the credits of every image and font.
- **A smooth session.** Every question about a page comes with its preview link; nothing decided is asked again; the ten steps stay in the task list; the preview server is checked before an agent opens a page.
- **Lean runs.** One new agent per step, a second review round only on an option you keep, one agent in the browser at a time, fixes passed as the path of the critic's report, and facts measured in the page rather than read from screenshots.
- **Your taste file**, shared across projects, so the studio leans on what you like, avoids what you dislike and never repeats a past direction.
