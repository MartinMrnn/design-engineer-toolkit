# Missions and returns

## Mission (you to an agent)
Keep missions short: the agent's skill holds the method.

```text
Step: <id · name>
Mode: interview | produce | resume
Skill directory: <plugin root>/skills/<skill>
Charter skill: <plugin root>/skills/charter
Colour skill: <plugin root>/skills/colour (art director and critic only)
Project: <absolute path of the project folder>
Conversation language: <from CLAUDE.md>
Preview: http://127.0.0.1:<port>/
Charter: design/charter/project/ (at C2, your branch: design/branches/<id>/project/)
Inputs: <paths>
Expected outputs: <paths>
Constraints: <scope; at C2, round 2, the direction's specimen, design/specimens/<id>/, with its idea.md>
Decisions to respect: <the entries of design/decisions.md this step builds on, in the user's words; for an option step, the options already discarded>
Done when: <the step's "Done when", copied from steps.md; you check the criteria about the critic, the publication and the user>
```

At C2, round 1, one art director gets the four idea cards of the `Ideas:` line of the C1 entry in `design/decisions.md` (the specimen mission below); round 2, each art director gets its kept specimen and its card. `Colour skill:` goes in the art director's and the critic's missions only; leave the line out of the UX designer's. The art director's skills are preloaded, so the line gives it the folder of `colour.py`; the critic reads only the colour skill's `references/measures.md`.

A mission starts a new agent for its step. Resume an agent only within its step: with the user's answers, for round 2, at C1 for the idea cards once B1 is approved, at C2 for the critic's phase 2, or, at C2, for the base instance to complete the direction in the merged charter.

To resume the C1 art director for the idea cards:

```text
Mode: resume
B1 is approved. Read design/charter/project/02-intent.md to 05-voice-and-wording.md, then write the four idea cards and the part Ideas of 07-visual-intent.md (art-direction skill, C1 step 7), and report.
```

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

## Structural proposal (C2 and later, UX)
When the user approves a change of structure an art director proposed (`design/decisions.md`, in the user's words), launch a new UX designer to write it. The art director never edits `06-structure.md`.

```text
Step: B2 · Structure · amendment
Mode: amend
Skill directory: <plugin root>/skills/ux-design
Charter skill: <plugin root>/skills/charter
Project: <absolute path of the project folder>
Conversation language: <from CLAUDE.md>
Inputs: design/charter/project/06-structure.md, design/decisions.md (the approved proposal)
Expected outputs: design/charter/project/06-structure.md, amended
Decisions to respect: <the proposal as the user approved it, word for word>
Done when: 06-structure.md holds the change and nothing else changed; every section still traces to an intent; charter.py check --step B2 passes
```

## Specimen mission (C2, round 1)
One art director builds the four specimens: two per run, since its turn limit counts per run.

```text
Step: C2 · Specimens
Mode: produce
Skill directory: <plugin root>/skills/art-direction
Charter skill: <plugin root>/skills/charter
Colour skill: <plugin root>/skills/colour
Project: <absolute path of the project folder>
Conversation language: <from CLAUDE.md>
Preview: http://127.0.0.1:<port>/
Inputs: design/ideas/a.md to d.md, the critic's last review of the cards (design/reviews/C1-ideas-<round>.md), design/charter/project/ (06-structure.md for the situations and the copy, 07-visual-intent.md), design/inspiration/ and its captures, the taste file
Expected outputs: design/specimens/a/ and b/ in this run; c/ and d/ when resumed
Constraints: specimens a and b now, then report; the idea's text never inside index.html
Decisions to respect: <the C1 and B2 entries of design/decisions.md, in the user's words>
Done when: <the specimens part of the C2 "Done when", for the two specimens of this run>
```

To resume it for the other two:

```text
Mode: resume
Now specimens c and d, the same way. Then report on the four.
```

## Comparison mission (C2, "choose for me")
Launch a new art director, never one that made the specimens or the directions compared.

```text
Step: C2 · Art directions · comparison
Mode: produce
Skill directory: <plugin root>/skills/art-direction
Charter skill: <plugin root>/skills/charter
Colour skill: <plugin root>/skills/colour
Project: <absolute path of the project folder>
Conversation language: <from CLAUDE.md>
Preview: http://127.0.0.1:<port>/
Inputs: round 1, the four specimens design/specimens/<id>/ (index.html with its preview URL, idea.md) and their board; round 2, the branches design/branches/<id>/project/ (their Showcase and component cards, with preview URLs) and the board design/board/index.html; design/charter/project/01-context.md, design/charter/project/07-visual-intent.md, the critic's last report of the round (design/reviews/C2-specimens-<round>.md or C2-directions-<round>.md), the taste file
Expected outputs: none (a REPORT only)
Constraints: you made none of these; build nothing and change no file; recommend only what the critic accepted
Done when: the REPORT recommends, round 1, the one or two specimens to keep, round 2, one direction, with a justification linked to the brief, the intent and the critic's report
```

## Fix mission (E1, frontend)
After the E1 review, launch a new frontend developer for the fixes the user wants.

```text
Step: E1 · Final review · fixes
Mode: produce
Skill directory: <plugin root>/skills/mockup-build
Charter skill: <plugin root>/skills/charter
Project: <absolute path of the project folder>
Conversation language: <from CLAUDE.md>
Preview: http://127.0.0.1:<port>/
Critic report: design/reviews/E1-site-<round>.md
Fix: problems <numbers, or "all"> of that report
Decisions to respect: <the user's words on each problem kept or dropped>
Done when: each listed problem is fixed, or recorded in design/deviations.md with its justification; the pages touched pass the self-check
```

## Critic mission

```text
Step: <id · name> · <item> · round 1
Phase: <at C2: blind; otherwise leave the line out>
Mode: produce
Skill directory: <plugin root>/skills/critique
Charter skill: <plugin root>/skills/charter
Colour skill: <plugin root>/skills/colour
Project: <absolute path of the project folder>
Conversation language: <from CLAUDE.md>
Review: <each file with its preview URL>
Report: design/reviews/<step>-<item>-1.md
References: design/charter/project/ (README.md first, then the sections the step needs), design/specimens/ (C2, round 1), design/branches/<id>/project/ (C2, round 2, the branches), design/ux/research.md (B2)
Check: design/reviews/<step>-<item>-check.txt (the output of charter.py check)
Compare with (D1, E1): <the approved Mockup and Motion cards, as design/decisions.md records them>
Deviations (D1, E1): design/deviations.md
Accepted check issues (E1): <the checks.js issues the user accepted, or "none">
Taste file: ~/.claude/design-studio/taste.md
```

At C1, the critic's item is `ideas`: `Review:` lists the idea cards, with no preview link, and `References:` the charter's `01-context.md` to `05-voice-and-wording.md` and `07-visual-intent.md`.

At C2, phase 1 is blind: `Review:` gives the preview links, `References:` the branches without `design/ideas/`, and nothing in the mission names or quotes an idea. When the critic reports "phase 1 written", resume it for phase 2:

```text
Mode: resume
Phase: with idea
Your blind reading stays as written. The idea cards: <for each specimen or branch, its id and design/ideas/<id>.md, or design/specimens/<id>/idea.md for a direction>. Complete the report.
```

`<item>` names what is reviewed, so that no report overwrites another: `ideas` (C1), `structure` (B2), `specimens` then `directions` (C2), `home` then each other page or `pages` (C3), `motion` (C4), each page type (D1), `site` (E1).

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
- each question and its options exactly as the agent wrote them, in the conversation's language (translate them faithfully if they arrive in another), the recommended option first and marked as recommended in that language ("(Recommandé)" in French);
- up to 3 questions per call.

The user can always answer in their own words ("Other"), including "choose for me".

When a question is about a page, its preview link is in your message just before the call. A critic's "Intended or a defect?" waits until the user has chosen, and is asked only when it concerns what the user kept.
