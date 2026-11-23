# Phase 1 · Framing and vision

The user decides: **the vision**.

## Briefing covers
Intent, real goal, needs, stack, scope (pages, interactions, level of experience), inspirations.
- Thin input (a few lines, no moodboard) is normal: your hypotheses fill the gaps, the researcher builds more of the moodboard, and the bar does not move.
- Ask the scope: it changes the time, never the bar.
- Derive the stack from the needs (a static site needs no framework); every dependency gets its need.
- An unknown fact is never invented: it becomes `[à fournir]` in the spec's "Unknown facts".
- The user's files in the folder (images, PDFs, notes) go to `design/inspiration/`: move them, never edit them. Links go to `design/inspiration/links.md`, one line each on what the user likes about it.

## Setup, after the user's "ok"
1. **Ask first:** "I create the private repository `<account>/<name>` with the 4 phase milestones?" Propose a short kebab-case name.
2. Write `design/decisions.md` from `references/decisions.md`, with the approved briefing as its first entry. It comes first: the guard-rail hooks act only in a folder that has it.
3. Create it:
   ```bash
   git init -b main        # if the folder is not a repository yet
   gh repo create <name> --private --source . --remote origin
   for t in "1 · <Framing and vision>" "2 · <Design>" "3 · <Mockup>" "4 · <Build>"; do
     gh api repos/{owner}/{repo}/milestones -f title="$t" --jq .number
   done
   ```
   Milestone names are in the conversation's language; keep the `<n> · ` prefix, the studio finds the phase by it.
4. Write `CLAUDE.md` from `references/claude-md.md` (if one exists, ask before changing it) and a `.gitignore` (`.DS_Store`, `node_modules/`, `.playwright-mcp/`: the browser's files and the critic's contact sheets).
5. Commit "Set up the project" and `git push -u origin main`.
6. Create the phase's issues in milestone 1.

## Issues
1. **The spec** · What: `design/spec.md` from `references/spec.md`, filled from the briefing. Done when: every section is filled; every dependency has its need (C8); every unknown fact is listed as `[à fournir]`.
2. **The moodboard** · What: launch the researcher (`design-studio:researcher`) with the issue and the files (`design/spec.md`, `design/decisions.md`, the folder `design/inspiration/`); it writes `design/inspiration/board.md`. Show the board in the conversation: the user keeps or drops each reference; write their answer in its Sort column (kept, or dropped with their reason, in the board's language). If the critic fails it, launch the researcher again with the verdict. Done when: every reference names the trait of the user's input it extends (C9); none is left "to sort"; the user's files are untouched.

## Reads / writes
Reads the user's input. Writes `CLAUDE.md`, `design/spec.md`, `design/inspiration/`, `design/decisions.md`, the repository and its 4 milestones.

## Critic's lens
Every board reference anchored to a trait of the input; the stack justified by a need.

## Gate
Present the vision in a few lines: the real goal, the scope, the stack, the three strongest traits of the moodboard, from `board.md`. The user approves it or sends it back.
