# [Project name] · design studio project

This folder is a design studio project. The deliverable is a high-fidelity static mockup in `site/`, sent to the client to validate the offer. It is not a production site.

## Facts
- Client: [one line]
- User: [the user's name, which signs the charter's changes]
- Pages in scope: [list], plus the supporting pages: 404, legal notice [, terms of sale] [, privacy policy]
- Language of the site's copy: [language]
- Preview: http://127.0.0.1:[port]/ (this folder, served by the preview server)
- Charter: [Artifact URL] (files: `design/charter/project/`)
- C2 branches: a [URL] · b [URL] · c [URL]
- C2 board: [URL]
- Taste file: ~/.claude/design-studio/taste.md

## Map
- `design/charter/project/`: the charter, the project's single reference. Read `README.md` first.
- `design/decisions.md`: every approved decision, in order. It wins over anything else.
- `design/inspiration/`: the user's moodboard and references
- `design/ux/`: research notes and captures
- `design/branches/`, `design/board/`: the three C2 directions and their comparison
- `design/mockups/`, `design/motion/`: the C3 and C4 options; the chosen ones are cards in the charter
- `design/deviations.md`: what `site/` could not build as approved, with the justification; the user approves or refuses each row
- `design/reviews/`: the critic's reports, captures, check outputs and check scripts
- `design/feedback.md`: feedback on the studio itself
- `site/`: the mockup

## Shared rules
- Never invent facts (names, figures, prices, reviews, awards, addresses): write `[to provide: what]`.
- Royalty-free media only, with source, licence and credit in the charter's `14-sources.md` (or your branch's).
- Every page works at 1440 px and 390 px.
- Every value comes from the charter's tokens.
- Agents work through files and through the lead, never with each other. Only the lead publishes the charter.
