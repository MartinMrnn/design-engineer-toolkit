# Missions and returns

## Mission (you to an agent)
Keep missions short: the agent's skill holds the method.

```text
Step: <id · name>
Mode: interview | produce | resume
Skill directory: <plugin root>/skills/<skill>
Charter skill: <plugin root>/skills/charter
Project: <absolute path of the project folder>
Preview: http://127.0.0.1:<port>/
Charter: design/charter/project/ (at C2, your branch: design/branches/<id>/project/)
Inputs: <paths>
Expected outputs: <paths>
Constraints: <angle, scope>
Decisions to respect: <the entries of design/decisions.md this step builds on, in the user's words; for an option step, the options already discarded>
Done when: <the step's "Done when", copied from steps.md; you check the criteria about the critic, the publication and the user>
```

A mission starts a new agent for its step. Resume an agent only within its step: with the user's answers, for round 2, or for the chosen C2 instance to write `design/direction.md`.

To resume with the user's answers:

```text
Mode: resume
Answers from the user, word for word:
1. <answer>
2. <answer>
Now produce.
```

To resume after a rejection (round 2):

```text
Mode: resume
Round 2. The critic rejected the work. Read its report, design/reviews/<step>-<item>-<round>.md (only the block of option <id> when it reviews several), fix every problem listed there, self-check once, then report.
```

To ask for fixes the user approved on accepted work (for example "approved, with the fixes"):

```text
Mode: resume
The user approved the work, word for word: "<answer>". Fix problems <numbers, or "all"> of design/reviews/<step>-<item>-<round>.md (block option <id>), self-check once, then report.
Also, from the user: <a decision about a critic's question, word for word, or "nothing">
```

The problems live in the report file: name the file, never copy them. The maker reads the exact words, and the conversation does not carry them twice.

## Comparison mission (C2, "choose for me")
Launch a new art director, never one of the three that made the directions.

```text
Step: C2 · Art directions · comparison
Mode: produce
Skill directory: <plugin root>/skills/art-direction
Charter skill: <plugin root>/skills/charter
Project: <absolute path of the project folder>
Preview: http://127.0.0.1:<port>/
Inputs: the three branches design/branches/a/project/, b/, c/ (their Showcase and component cards, with preview URLs), the board design/board/index.html, design/charter/project/01-context.md, design/charter/project/07-visual-intent.md, the critic's last C2 report (design/reviews/C2-directions-<round>.md), the taste file
Expected outputs: none (a REPORT only)
Constraints: you made none of these directions; build nothing and change no file; recommend only a direction the critic accepted
Done when: the REPORT recommends one direction, or a mix and its base, with a justification linked to the brief, the intent and the critic's report
```

## Critic mission

```text
Step: <id · name> · <item> · round 1
Mode: produce
Skill directory: <plugin root>/skills/critique
Charter skill: <plugin root>/skills/charter
Project: <absolute path of the project folder>
Review: <each file with its preview URL>
Report: design/reviews/<step>-<item>-1.md
References: design/charter/project/ (README.md first, then the sections the step needs), design/ux/research.md (B2)
Check: design/reviews/<step>-<item>-check.txt (the output of charter.py check)
Compare with (D1, E1): <the approved Mockup and Motion cards, as design/decisions.md records them>
Deviations (D1, E1): design/deviations.md
Accepted check issues (E1): <the checks.js issues the user accepted, or "none">
Taste file: ~/.claude/design-studio/taste.md
```

`<item>` names what is reviewed, so that no report overwrites another: `wireframes` (B2), `directions` (C2), `home` then each other page or `pages` (C3), `motion` (C4), each page type (D1), `site` (E1).

Never include the maker's report.

For round 2, resume the round-1 critic with SendMessage (its agent ID):

```text
Mode: resume
Round 2. The maker fixed the problems of your round-1 report. Check each of them and anything the fixes broke, nothing else.
Report: design/reviews/<step>-<item>-2.md
```

If that critic cannot be resumed (for example in a later session), launch a new one with the critic mission, `round 2`, `Mode: resume`, the round-2 report path, and one more line: `Round-1 report: design/reviews/<step>-<item>-1.md`.

When the user answers "defect" to the critic's question, resume the critic:

```text
Mode: resume
Answer from the user to your question, word for word: <answer>
Rewrite design/reviews/<step>-<item>-<round>.md with that point scored as a defect.
```

## Returns (an agent to you)
- In interview mode: a `QUESTIONS` block, with at most 3 questions, 2 to 4 options each, the recommendation first; or `QUESTIONS · <agent> · <step> · none`.
- Otherwise: a `REPORT` block of at most 15 lines, with the files produced, points to watch and at most one question.
- The critic returns its report: verdict, scores, problems, checks, question.

## Asking an agent's questions
Use AskUserQuestion with:
- `header`: the agent's name ("UX", "Art director", "Frontend" or "Critic");
- each question and its options exactly as the agent wrote them, the recommended option first and marked "(Recommended)";
- up to 3 questions per call.

The user can always answer in their own words ("Other"), including "choose for me".

When a question is about a page, its preview link is in your message just before the call. A critic's "Intended or a defect?" waits until the user has chosen, and is asked only when it concerns what the user kept.
