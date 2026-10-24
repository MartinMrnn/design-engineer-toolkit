# The ten steps

Read a step's section before starting it. Copy its "Done when" into the mission as is: the agent meets the criteria about its own work, and you check those about the critic and the user before closing the step.

## A1 · Kickoff (you)
- **Inputs**: what the user knows about the client, the existing site, any creative material.
- **Interview**: 2 or 3 rounds of at most 3 questions, by theme: goal of the site, priority visitor, main action, available content (copy, photos, logo), scope of the mockup (which pages), deadline, new site or redesign, tone, language of the site's copy. Skip what the user's material already answers.
- **Material**: file everything the user gives. Images and counter-examples go in `design/inspiration/`; links, with one line on what they like about each, in `design/inspiration/inspiration.md`; colour or font ideas in `design/inspiration/notes.md`.
- **Outputs**: `design/brief.md`, `CLAUDE.md`, `.claude/launch.json`, `design/decisions.md`, `design/feedback.md`, `design/deviations.md`, `design/reviews/scripts/capture.js` and `checks.js`.
- **Supporting pages**: not a question. The brief always plans a 404 page and a legal notice, plus terms of sale when the site sells and a privacy policy when a form collects personal data. Ask only if the user's material leaves a doubt (does the site sell?).
- **Done when**: the brief fits on one page and states the goal, priority visitor, main action, scope, supporting pages, available content, deadline and tone; every unknown fact is `[to provide: …]`; every output exists; the user approves the brief.

## B1 · Research (ux)
- **Inputs**: `design/brief.md`.
- **Outputs**: `design/ux/research.md`, `design/ux/captures/`.
- **Done when**: every site studied has at least one capture and its findings; the file states what visitors expect and offers 2 or 3 key messages, each linked to a finding; the user picks the key messages.

## B2 · Structure and content (ux, critic)
- **Inputs**: brief, research, the chosen key messages.
- **Outputs**: `design/ux/sitemap.md`, `design/ux/wireframes/*.html`.
- **Critic**: relevance, usability.
- **Done when**: the sitemap matches the scope exactly, supporting pages included; each page states the visitor intents it serves, and every section and feature traces to one of them; the main path is written step by step; the mobile plan is decided (what the first screen shows at 390 px, the navigation pattern and why); the wireframes are designed at 1440 px and 390 px, with real copy and `[to provide: …]` for missing facts; the critic accepts them; the user approves the structure and the copy.

## C1 · Moodboard reading (art-director)
- **Before**: if `design/inspiration/` holds no references, ask the user for them now: images, sites with one line on what they like, counter-examples.
- **Inputs**: `design/inspiration/`, brief, wireframes, taste file.
- **Outputs**: `design/intent.md`, `design/inspiration/captures/`.
- **Done when**: every reference is analysed, with a capture; contradictions between references are settled with the user; the user approves the reading.

## C2 · Art directions (art-director ×3, critic)
- **Launch**: three art-director agents in one message, same inputs, angles A faithful, B bolder, C a step aside. No interview: they start from C1.
- **Inputs**: intent, brief, wireframes, taste file.
- **Outputs**: `design/directions/a/index.html`, `b/index.html`, `c/index.html`; you assemble `design/directions/board.html`.
- **Critic**: distinctiveness, consistency, craft, and whether the three are clearly distinct.
- **Done when**: each tile has its palette, type pairing, image treatment, buttons, links and cards with states, one rendered section, motion intent and recommendation; the three are clearly distinct; none repeats a past direction of the taste file; body text reaches 4.5:1 in every palette; the critic accepts each; the user chooses or mixes, or says "choose for me" and the independent comparison's recommendation is applied; the base instance writes `design/direction.md`.

## C3 · Key mockups (art-director, critic)
- **Inputs**: direction, wireframes, decisions.
- **Outputs**: `design/mockups/home-a.html`, `home-b.html`… then `design/mockups/<page>.html` and `design/mockups/404.html`; a board per choice.
- **Critic**: all five criteria.
- **Done when**: every page in scope, and the 404 page, has a mockup that works at 1440 px and 390 px using only the direction's tokens; the opening hero fills the first screen at 1440 × 900 and 390 × 844 without showing the next section, and loses nothing on shorter screens; the mobile navigation follows the B2 plan; the critic accepts; the user picks one layout per page.

## C4 · Motion (art-director, critic)
- **Inputs**: the approved home mockup, direction, intent.
- **Outputs**: `design/motion/a.html`, `b.html` (and `c.html`); a board.
- **Critic**: consistency, craft, usability.
- **Done when**: every animation states its role, duration and easing; the reduced-motion version keeps all content visible; the critic accepts; the user picks one personality.

## D1 · Handoff kit (art-director)
- **Outputs**: `design/kit/tokens.css`, `design/kit/components.html`, `design/kit/media.md`.
- **Done when**: every value in the approved mockups is a token; every component appears with its states; every asset has a source and a licence; the user has had a look.

## D2 · Mockup build (frontend, critic)
- **Interview**: what must be interactive and what can stay visual.
- **Inputs**: mockups, the chosen motion, direction, kit, decisions.
- **Outputs**: `site/`; a row in `design/deviations.md` for each deviation that cannot be avoided.
- **Order**: the home page first, then the critic, then the user; then each other page type the same way. Each mission covers one page type.
- **Critic**: consistency (fidelity to the mockup, and the justification of each deviation), craft, usability, per page type.
- **Supporting pages**: built with the last page type: `site/404.html` from its mockup, and `site/legal.html`, one simple page in the same layout whose sections (legal notice, and terms or privacy when the brief plans them) hold `[to provide: …]`. The footer links point to its anchors.
- **Done when** (for the page type of the mission): its pages exist in `site/` and open through the preview server; only the kit's tokens are used; the agreed interactions work; the developer ran one comparison pass per page at 1440 px and 390 px; every visible difference is fixed or recorded in `design/deviations.md` with its justification; the critic accepts the page type; the user approves it and each of its deviations. D2 ends when every page in scope has been through this.

## E1 · Final review (critic, then frontend)
- **Critic**: all five criteria, plus `checks.js` on every page.
- **Done when**: no console errors; no horizontal overflow at 390 px; no broken images or empty links; no serious accessibility violation; reduced motion keeps every page readable; every criterion at 3 or above; every row of `design/deviations.md` is approved by the user; the user approves the final mockup.
- **Closing**: propose an update of the taste file (what the user liked and rejected, the direction used) and write it only with their consent; ask the three closing questions of `design/feedback.md`; tell the user that `site/` is ready to send, as a folder or on any static host.
