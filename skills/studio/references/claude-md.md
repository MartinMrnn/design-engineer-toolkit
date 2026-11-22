# [Project] · design-studio project

This folder is a design-studio project: the front surface of a web product, designed then built with its director. Run `/design-studio:studio` to resume it; it reads this file, `design/decisions.md` and the repository's open milestone.

## Facts
- Language of our conversation: [the language of the user's first message; every message, issue, milestone and decision uses it]
- Language of the site's copy: [language]
- Repository (private): [URL]
- Preview: [http://127.0.0.1:4321/, from phase 2]

## Map
```
CLAUDE.md
design/
├── spec.md          real goal, needs, stack and its reasons, scope, criteria
├── decisions.md     every dated decision, what was set aside, deviations
├── inspiration/     the user's files + board.md by the researcher
├── content.md       the page plan with real copy
├── directions/      a/ and b/ (tokens + home page) + compare.html
├── tokens.css       the chosen direction, completed
└── maquette/        key pages with motion
src/                 the build, in the chosen stack
```

Sources of truth:
- `design/decisions.md` wins over anything else.
- `design/content.md` is the only source of content; `design/tokens.css` the only source of visual values.
- `design/maquette/` is frozen once approved.
- `design/inspiration/` holds the user's files: never edit or delete them.

## Always / Ask first / Never

| Always | Ask first | Never |
|---|---|---|
| Run the check script after each increment | Create the project repository | Push to a public repository, or change its visibility, without consent |
| Commit, and close the issue with the commit | Add a dependency | Delete or edit the user's files in `design/inspiration/` |
| Post the critic's verdict as a comment on its issue | Pass a phase gate | Ship placeholder text |
| | Anything published outside the project repository | Write back-end code |

## Rules
- No back end: the project ends at the front surface.
- Take a reference's principles, never reproduce an existing site (layout, visuals, copy).
- No UI library imposed; no dependency without its need written in `design/spec.md`.
- Never invent a fact (name, figure, address, review, award): write `[à fournir]` where it goes and ask the user. The check script blocks it, so it never ships.
