# [Project name] · design studio project

This folder is a design studio project. The deliverable is a high-fidelity static mockup in `site/`, sent to the client to validate the offer. It is not a production site.

## Facts
- Client: [one line]
- Pages in scope: [list], plus the supporting pages: 404, legal notice [, terms of sale] [, privacy policy]
- Language of the site's copy: [language]
- Preview: http://127.0.0.1:[port]/ (this folder, served by the preview server)
- Taste file: ~/.claude/design-studio/taste.md

## Map
- `design/brief.md`: the approved brief
- `design/decisions.md`: every approved decision, in order. It wins over anything else.
- `design/inspiration/`: the user's moodboard and references
- `design/ux/`: research, sitemap, wireframes
- `design/intent.md`, `design/direction.md`: the approved art direction
- `design/mockups/`, `design/motion/`: approved layouts and motion
- `design/kit/`: tokens, components, media and licences
- `design/deviations.md`: what `site/` could not build as approved, with the justification; the user approves or refuses each row
- `design/reviews/`: the critic's reports, captures and check scripts
- `design/feedback.md`: feedback on the studio itself
- `site/`: the mockup

## Shared rules
- Never invent facts (names, figures, prices, reviews, awards, addresses): write `[to provide: what]`.
- Royalty-free media only, with source, licence and credit in each proposal's Sources list, then in `design/kit/media.md` for the approved ones.
- Every page works at 1440 px and 390 px.
- Agents work through files and through the lead, never with each other.
