---
name: charter
description: The design studio's charter, the project's single reference kept as a native Claude Design System: its contract (sections, token names, components, cards), the charter.py commands, and how agents read and write it. Preloaded into every studio agent; the lead also publishes it.
---

# The charter

The charter is the project's single reference: the product (context, intent, story, positioning, voice and wording), the structure and its wireframes, the visual direction (tokens, components, rules), and the approved mockups and motion. It is a native Claude Design System Artifact, kept as local files in `design/charter/project/` and published by the lead at the end of every step. The user browses it on claude.ai; agents work on the local files.

## Rules for every agent
- Read `design/charter/project/README.md` first, then the sections your step needs. Never read the Artifact page: the local files are the source.
- Write only the files your mission names, under `design/charter/project/`, or under your branch, `design/branches/<id>/project/`, at C2.
- Keep every name of the contract (`references/contract.md`): file names, token names, component and card names. Never invent a token name, a section or a base component.
- A file still holding a `<!-- charter: … -->` comment is not done: replace the comment with what it asks for.
- Every value in a card or in `components/bundle.css` is a token (`var(--name)` or a type class), except inside `@media` queries and 1px hairlines.
- Copy follows `05-voice-and-wording.md`. Missing facts are `[to provide: what]`.
- Only the lead publishes the charter. At C2, each art director publishes its own branch (`references/publishing.md`).

## Commands
Run from the project folder: `python3 "<charter skill directory>/scripts/charter.py" <command>`. Your mission gives the charter skill directory. `--root` defaults to `design/charter`; at C2 a branch is `--root design/branches/<id>`.

| Command | When |
|---|---|
| `init --title "<Client>"` | A1, once (the lead) |
| `check --step <id>` | before you report, on what you wrote; the lead runs it again before a publish |
| `css` | after any change to `tokens.json` |
| `cards` | after adding or changing a page card (`Wireframe…`, `Showcase`, `Mockup…`, `Motion`) |
| `branch a b c` | C2, the lead |
| `merge --base <x> [--take <family>:<y>]` | C2 after the choice, the lead; families: colour, type, shape, imagery |
| `board --url a=<url> …` | C2, the lead |
| `freeze` | end of C4, the art director |
| `export site/assets` | D1, the frontend developer |
| `assets`, then `record --file <path> --blob <url>` | before a publish, whoever publishes |
| `stamp --step <id> --by "<name>" [--remote <file>] [--title "<title>"]` | right before a publish, whoever publishes |

`check` prints one line per problem and exits 1 until the charter meets the contract for that step.

## References
- `references/contract.md`: what each step adds, every name, the cards and their markers.
- `references/contract.json`: the same rules as data, read by `charter.py`.
- `references/publishing.md`: creating, publishing and reading the Artifacts; refusals; uploads; the board.
