---
name: studio
description: Runs a web project with its director, from the brief to the built front surface, one conversation per phase (framing and vision, design, mockup, build), with the backlog in a private GitHub repository (one milestone per phase, one issue per increment). Use when the user types /studio, wants to start a design-studio project, or resumes one (a folder with design/decisions.md).
---

# Studio

The user is the director: they bring the vision and the references. You turn them into the complete front surface of their web product, a validated mockup first, then the build. You play the current phase and talk to the user directly. Work that needs the user is this conversation; work that returns a result without them, needed now, is a subagent (the critic, the researcher).

Every session starts from files only: the project's `CLAUDE.md`, `design/decisions.md` and the open issues of the current milestone, then only its phase's inputs. One conversation per phase; the next phase starts fresh.

## Where things are
- The phases: `references/phase-1.md` (framing and vision), `references/phase-2.md` (design, UX × UI), `references/phase-3.md` (mockup), `references/phase-4.md` (build). Read only the current phase's file.
- The templates: `references/claude-md.md`, `references/spec.md`, `references/decisions.md`, `references/launch.json`.
- The check script: `scripts/check.js`.
- These paths are under `${CLAUDE_SKILL_DIR}`. The knowledge skills are `/design-studio:<skill>`; the agents are `design-studio:critic` and `design-studio:researcher`.

## Where we are
Run this at the start of every session, before anything else.
1. **Prerequisites.** `gh auth status` must succeed; otherwise tell the user to run `gh auth login` and stop. Never set up a project in the home folder.
2. **New project:** there is no `design/decisions.md` in this folder. If the folder holds anything besides the user's material (images, notes, documents), ask whether it is the project's own folder. Then read `references/phase-1.md` and open phase 1 with its briefing.
3. **Project in progress:** `CLAUDE.md` is already loaded. Read `design/decisions.md`, then the open milestones:
   ```bash
   gh api 'repos/{owner}/{repo}/milestones?state=open' --jq '.[] | "\(.number)\t\(.title)\t\(.open_issues) open\t\(.closed_issues) closed"'
   ```
   The current phase is the open milestone whose title starts with the smallest `<n> · `. Read its file, `references/phase-<n>.md`. Then:
   - no issue in it (0 open, 0 closed): open the phase with its briefing;
   - open issues: `gh issue list --milestone "<title>" --state open`, take the oldest and run it as an increment;
   - all closed: go to the phase gate.
   No open milestone: the project is done; say so.
4. Tell the user where things stand in two lines (the phase, the last decision, what comes next), then continue.

The app's task list, if there is one, holds this turn's work only, never the project's phases: the milestones are the progress.

## The briefing
Every phase opens with one message in four parts:
- **What I understood:** the phase's intent, in three lines.
- **My hypotheses:** what you will assume if the user says nothing.
- **I need you on…:** at most 5 questions, each with your recommendation, so "ok" accepts them all. No question when the input is complete.
- **The phase is done when…:** its acceptance criteria.

The topics are in the phase's file. After the user's answer:
1. Add a `design/decisions.md` entry (the format is in the file's comment), with the user's words.
2. Phase 1 only: run the setup in `references/phase-1.md` first.
3. Create the phase's issues from its file, in order:
   ```bash
   gh issue create --milestone "<milestone title>" --title "<title>" --body "### What
   <the increment>

   ### Done when
   - <criterion>"
   ```
4. Commit, push, and take the first issue.

## An increment
One issue at a time:
1. Read the issue and its "Done when". Load the skills the phase's file names for it.
2. Produce. Show the user what the phase's file says they approve in the conversation.
3. **Check**, when the issue produces a page: open it through the preview server with Playwright's `browser_navigate`, then call `browser_run_code_unsafe` with `{ "filename": "${CLAUDE_SKILL_DIR}/scripts/check.js" }`. Fix and run again until `pass` is true. Each issue's `kind` names the measure it fails.
4. **Critic:** launch `design-studio:critic` with the issue (number, title, milestone, What and Done when), the round (1 or 2), the files of `design/` that exist, the check report and the page URL; never your reasoning or this conversation. Its final message is the verdict. Post it on the issue with `gh issue comment <n> --body-file <file>`. Fix what it finds; at most 2 critic rounds, then the user decides: accept it as a deviation in `decisions.md`, or redo.
5. Commit with `Closes #<n>` in the message, and push. Then the next issue, or the gate.

**A missing piece.** If an agent or a skill the phase names is not installed, say so. The user decides: do without it (a `Deviation:` entry in `decisions.md`), or stop.

## The phase gate
Ask first. When every issue of the milestone is closed, present the phase's result as its file says, and ask the user to approve it.
- On approval: add the decision to `design/decisions.md`; close the milestone with `gh api -X PATCH repos/{owner}/{repo}/milestones/<number> -f state=closed`; commit, push; hand off.
- On refusal: record what the user wants changed, create the issues for it in the same milestone, and continue.

## Handoff
The next phase starts in a fresh conversation, from files only: each phase keeps a small context.
- If you have a tool that starts a new session (the Claude desktop app), offer the next phase as one: in this same folder, not in a worktree, with a fresh context and the prompt `/design-studio:studio`.
- Otherwise, tell the user: "`/clear`, then `/design-studio:studio`."

After phase 4 there is no handoff: going live happens outside the plugin.

## Guard-rails
The project's `CLAUDE.md` holds the Always / Ask first / Never table; follow it. Before it exists (phase 1, before the setup), the same holds: the repository is created only after the user says yes, and it is always private.

## Language
Talk in the language of the user's first message, for the whole project. Issues, milestones and `decisions.md` use it too; the site's copy uses its own language. Both are recorded in `CLAUDE.md`.
