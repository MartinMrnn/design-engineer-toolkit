# The nine steps

Read a step's section before starting it. Copy its "Done when" into the mission as is: the agent meets the criteria about its own work, and you check those about the critic, the publication and the user before closing the step. Charter paths below are under `design/charter/project/`.

## A1 · Kickoff (you)
- **Inputs**: what the user knows about the client, the existing site, any creative material.
- **Interview**: 2 or 3 rounds of at most 3 questions, by theme: goal of the site, priority visitor, main action, available content (copy, photos, logo), scope of the mockup (which pages), deadline, new site or redesign, tone, language of the site's copy. The language of our conversation is not a question: it is the language of the user's first message. Skip what the user's material already answers. Ask the user's name if you do not know it (it signs the charter's changes).
- **Material**: file everything the user gives. Images and counter-examples go in `design/inspiration/`; links, with one line on what they like about each, in `design/inspiration/inspiration.md`; colour or font ideas in `design/inspiration/notes.md`. A logo goes in `assets/Logos/` of the charter as well.
- **Outputs**: the charter (`charter.py init`, then `README.md` and `01-context.md`) and its Artifact; `CLAUDE.md`; `.claude/launch.json`; `design/decisions.md`, `design/feedback.md`, `design/deviations.md`; `design/reviews/scripts/capture.js` and `checks.js`.
- **Order**: write `CLAUDE.md` first, with the user's name; then the charter's `README.md` and `01-context.md`; get the brief approved and record it in `design/decisions.md`; then create and publish the charter.
- **Supporting pages**: not a question. `01-context.md` always plans a 404 page and a legal notice, plus terms of sale when the site sells and a privacy policy when a form collects personal data. Ask only if the user's material leaves a doubt (does the site sell?).
- **Done when**: `01-context.md` fits on one page and states the goal, priority visitor, main action, scope, supporting pages, available content, deadline and tone; every unknown fact is `[to provide: …]`; `charter.py check --step A1` passes; the charter is published and its URL is in `CLAUDE.md`; every other output exists; the user approves the brief.

## B1 · Product (ux)
- **Inputs**: `README.md`, `01-context.md`.
- **Outputs**: `design/ux/research.md`, `design/ux/captures/`; then `02-intent.md`, `03-story.md`, `04-positioning.md`, `05-voice-and-wording.md`.
- **Order**: research first; its REPORT asks the user to pick the key messages; resumed with the choice, the UX designer writes the four product sections.
- **Done when**: every site studied has at least one capture and its findings; the research states what visitors expect and offers 2 or 3 key messages, each linked to a finding; the user picks the key messages; the four sections are written in the site's language, `04-positioning.md` links each chosen message to its finding and `05-voice-and-wording.md` holds five real examples; `charter.py check --step B1` passes; the user approves the product sections.

## B2 · Structure and content (ux, critic)
- **Inputs**: the charter up to `05-voice-and-wording.md`, the research.
- **Outputs**: `06-structure.md`; `components/Wireframe<Page>/preview.html` for every page in scope and `WireframeNotFound`; their `…Mobile` copies (`charter.py cards`).
- **Critic**: relevance, usability.
- **Done when**: the sitemap matches the scope exactly, supporting pages included; each page states the visitor intents it serves, and every section and feature traces to one of them; the main path is written step by step; the mobile plan is decided (what the first screen shows at 390 px, the navigation pattern and why); the wireframes are designed at 1440 px and 390 px, with real copy that follows `05-voice-and-wording.md` and `[to provide: …]` for missing facts; `charter.py check --step B2` passes; the critic accepts them; the user approves the structure and the copy.

## C1 · Moodboard reading (art-director)
- **Before**: if `design/inspiration/` holds no references, ask the user for them now: images, sites with one line on what they like, counter-examples.
- **Inputs**: `design/inspiration/`, the charter up to `06-structure.md` and its wireframe cards, the taste file.
- **Outputs**: `07-visual-intent.md`, `design/inspiration/captures/`.
- **Done when**: every reference is analysed, with a capture; contradictions between references are settled with the user; `charter.py check --step C1` passes; the user approves the reading.

## C2 · Directions (art-director ×3, critic)
- **Launch**: you run `charter.py branch a b c`, then launch three art-director agents in one message, same inputs, angles A faithful, B bolder, C a step aside. No interview: they start from C1.
- **Inputs**: the branch (a copy of the charter, `07-visual-intent.md` included), `design/inspiration/` and its captures, the taste file.
- **Outputs**: per branch, a sketch of the direction in `design/branches/<id>/project/` (every token; `08-colour.md` to `13-rules.md` short, `14-sources.md` complete; the rules of `README.md` short; `Button` and `Card` in their normal and hover states, `Link`, `Field` and `Nav` left as starters; `Cover`; `Showcase` complete), its Artifact, and `design/branches/<id>/captures/` (`cover.png`, `showcase-1440.png`, `showcase-390.png`, `components.png`, which frames Button and Card). Then you build and publish `design/board/`.
- **Critic**: distinctiveness, consistency, craft, and whether the three are clearly distinct.
- **Done when**: each branch passes `charter.py check --step C2 --sketch --root design/branches/<id>` and is published; the three are clearly distinct; none repeats a past direction of the taste file; the critic accepts each direction the user keeps (a rejected one is presented as rejected); after round 2 the art director republishes its branch, and the lead runs `board` again and republishes it; the board is published; the user chooses or mixes, or says "choose for me" and the independent comparison's recommendation is applied; `charter.py merge` is run; the base instance has completed the charter (`Link`, `Field`, `Nav`, the missing states of `Button` and `Card`, sections 08 to 13 and the `README.md` rules in full, `13-rules.md` and `14-sources.md` revised); `charter.py check --step C2` (the full check) passes on the charter; the charter is published; the branches are renamed.

## C3 · Key mockups (art-director, critic)
- **Inputs**: the charter (tokens, components, `06-structure.md`, wireframe cards), decisions.
- **Outputs**: the home options `design/mockups/home-a.html`, `home-b.html`… and a board; after the choice, `components/MockupHome/preview.html`, then `components/Mockup<Page>/preview.html` for every other page in scope and `components/MockupNotFound/preview.html`; every new component in the charter; `14-sources.md` updated.
- **Critic**: all five criteria, and the base components completed at C2 (states, focus visibility, contrast in every state).
- **Done when**: every page in scope, and the 404 page, has a mockup card that works at 1440 px and 390 px using only the charter's tokens and components; the opening hero fills the first screen at 1440 × 900 and 390 × 844 without showing the next section, and loses nothing on shorter screens; the mobile navigation follows the B2 plan; `charter.py check --step C3` passes; the critic accepts; the user picks one layout per page.

## C4 · Motion (art-director, critic)
- **Inputs**: the `MockupHome` card, the charter, `07-visual-intent.md`.
- **Outputs**: `design/motion/a.html`, `b.html` (and `c.html`) and a board; after the choice, the `duration` and `easing` tokens, the `Motion` card, `12-motion.md` completed.
- **Critic**: consistency, craft, usability.
- **Done when**: every animation states its role, duration and easing; the reduced-motion version keeps all content visible; the critic accepts; the user picks one personality; the chosen motion is in the charter as tokens, the `Motion` card and `12-motion.md`; `charter.py freeze` and `charter.py check --step C4` pass.

## D1 · Mockup build (frontend, critic)
- **Interview**: what must be interactive and what can stay visual.
- **Inputs**: the charter (tokens, components, `Mockup…` and `Motion` cards, `12-motion.md`, `13-rules.md`, `14-sources.md`), decisions.
- **Outputs**: `site/` (its `assets/css/tokens.css`, `components.css`, fonts and images from `charter.py export site/assets`); a row in `design/deviations.md` for each deviation that cannot be avoided.
- **Order**: the home page first, then the critic, then the user; then each other page type the same way. Each mission covers one page type.
- **Critic**: consistency (fidelity to the mockup card, and the justification of each deviation), craft, usability, per page type.
- **Supporting pages**: built with the last page type: `site/404.html` from its mockup, and `site/legal.html`, one simple page in the same layout whose sections (legal notice, and terms or privacy when `01-context.md` plans them) hold `[to provide: …]`. The footer links point to its anchors.
- **Done when** (for the page type of the mission): its pages exist in `site/` and open through the preview server; only the charter's tokens and components are used; the agreed interactions work; the developer ran one comparison pass per page at 1440 px and 390 px; every visible difference is fixed or recorded in `design/deviations.md` with its justification; the critic accepts the page type; the user approves it and each of its deviations. D1 ends when every page in scope has been through this.

## E1 · Final review (critic, then frontend)
- **Critic**: all five criteria, plus `checks.js` on every page.
- **Done when**: no console errors; no horizontal overflow at 390 px; no broken images or empty links; no serious accessibility violation; reduced motion keeps every page readable; every criterion at 3 or above; every row of `design/deviations.md` is approved by the user; `charter.py check --step E1` passes and the charter is published; the user approves the final mockup.
- **Closing**: propose an update of the taste file (what the user liked and rejected, the direction used and the charter's link) and write it only with their consent; ask the three closing questions of `design/feedback.md`; tell the user that `site/` is ready to send, as a folder or on any static host, and that the charter stays on claude.ai as the project's reference.
