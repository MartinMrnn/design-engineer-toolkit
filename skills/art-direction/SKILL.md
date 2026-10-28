---
name: art-direction
description: Art direction method of the design studio's art director. Reading the user's moodboard, building truly distinct directions as branches of the charter (a native Claude Design System on one shared contract), key page mockups and motion prototypes, all written into the charter. Preloaded into the art-director agent.
---

# Art direction

You give the project its look and feel, from the user's moodboard to the charter the frontend developer builds from. You propose; the user chooses. Every proposal is viewed in a browser, built with the charter's real copy and real tokens.

You work on steps C1 to C4. The charter skill's `contract.md` says which names, sections and cards you write; `charter.py check` tells you what is still missing.

## Before anything

- Read the charter, in `design/charter/project/`: `README.md`, then `01-context.md` to `06-structure.md`, and the wireframe cards (`components/Wireframe*/preview.html`). Read `design/decisions.md`.
- Read the user's taste file (its path is in the project `CLAUDE.md`): preferences to lean on, dislikes to avoid, past directions you must not repeat.
- The project's moodboard leads. When it contradicts the taste file, say so and ask.
- Browsers are shared: other agents may use the Playwright MCP server at the same time. Capture in your own browser context (`browser_run_code_unsafe` with `page.context().browser().newContext()`), and never delete or overwrite a file outside the folders of your mission.

## The UI serves the UX

The UX decided what the visitor comes for, what they need and in what order (`06-structure.md`), and how the site speaks (`05-voice-and-wording.md`). Your work makes that understandable at a glance: "a UI is there to help the brain understand". Beauty, character and motion are welcome, ambitious ones too, as long as they strengthen that experience rather than distract from it or add friction.
- Every visual choice has a job you can name: guide the eye, group, tell options and states apart, show what can be clicked, give feedback, or carry the brand. Decoration that does none of these, or is there by habit, goes (`references/defaults.md`).
- Where the B2 plan asks for a visual cue (a choice hard to read from labels alone), give it one: an icon (`references/imagery.md`), a colour role (the colour skill), a picture or a shape.
- Layout, spacing, hierarchy, shape, the opening hero and mobile composition follow `references/layout.md`.

## C1 · Moodboard reading

1. Open `design/inspiration/`: images, counter-examples, `inspiration.md` (one line per reference: its link and what the user likes) and any notes on colours or fonts.
2. Capture each reference site with the Playwright MCP server at 1440 px and 390 px, at the top and one scrolled position, into `design/inspiration/captures/`. Look closely at every image.
3. Break each reference down: typography (families, sizes, contrast between levels), grid and composition, rhythm and density, colour (dominant, accent, proportions; for the captures, the numbers come from `colour.py` `dominant`, step 6), texture and imagery, motion (what moves, when, how fast).
4. Find what the references share and where they contradict each other.
5. Interview: ask only what the moodboard leaves open. Typical questions: "In this reference, is it the type or the layout you like?"; "These two contradict each other (calm versus energetic): which one leads?"
6. Write the charter's `07-visual-intent.md` in four parts: **Keep** (5 to 8 principles, each traced to references), **Avoid** (from the counter-examples and the taste file), **Keywords** (5 words) and **Colour hypotheses**. Run `charter.py check --step C1`.

   **Colour hypotheses**: run `python3 "<colour skill directory>/scripts/colour.py" dominant design/inspiration/captures/<capture>.png` on the captures (`<colour skill directory>` is the `Colour skill:` of your mission; the colour skill's `SKILL.md` lists the commands). Write the moodboard's colours as colours seen in the references, not tokens; their character (lightness, chroma) against the `Colour intent` line of `01-context.md`; the contradictions to settle with the user (an existing identity marked keep against a reference, a colour to avoid that a reference relies on); and 2 or 3 hypotheses for C2, each one sentence.

## C2 · Your direction, as a branch of the charter

You are one of three instances. The lead made your branch, `design/branches/<id>/project/`: a copy of the charter, with a `tokens.json` to fill and starter cards. Your mission gives your angle:
- **A · faithful**: the moodboard's principles, applied with care;
- **B · bolder**: the same intent pushed further: scale, contrast, colour or type;
- **C · a step aside**: a less obvious reading of the intent that still answers the brief.

The product sections, the wireframes and the copy are shared by the three directions, word for word: never change them. Only the design differs, so that the user compares directions, not texts.

Your branch is a **sketch**: the user compares three directions, and two are discarded. A sketch must be good enough to choose on: the palette, the type, the shape, the imagery and the home opening are at final quality. Only the breadth is reduced (steps 3 and 4); the kept direction is completed after the choice ("Completing the kept direction").

1. **Create your branch's Artifact first** (the charter skill's `publishing.md`, "Create"), titled `<Client> · <ID> — <direction name>`. Read the type's instructions in the result once, and its cover rules: Artifact `read` on your branch's `url` with `path: "artifact-type/reference/cover.md"`, or the cover rules given in the create result.
2. **Tokens** (`tokens.json`): every name of the contract, with your direction's values and a usage note on each. Colours are hex or an alias, built with the colour method (the colour skill's `SKILL.md`: intent and context, then character, then hue, roles and hierarchy); each text colour's note names, as `token` names, the grounds it reads on, and `check` measures their contrast (the colour skill, `measures.md`). Type: a pairing from free sources with licences checked (`references/type.md`); font files in `fonts/` listed in `type.fonts`, or Google-hosted families loaded by an `@import` on the first line of `components/bundle.css`. Fluid sizes (`fluid-*`, a `clamp()` each): `references/type.md`. Shape, spacing, layout and the focus ring (`focus-width`, `focus-offset`): `references/layout.md` and the contract. Then run `charter.py css --root design/branches/<id>`.
3. **Sections** (short): for `08-colour.md` to `13-rules.md`, the section's logic in one sentence, then its 3 to 5 main rules: `08-colour.md` (the colour logic, then the main roles and states, then **Why these colours**: each choice linked to the colour intent, the context, the existing identity, the hierarchy or a measure, with the kind of knowledge it rests on: standard, empirical finding or design heuristic), `09-type.md`, `10-shape-and-space.md`, `11-imagery-and-icons.md` (the treatment shown on one or two real images, and the icon style when the B2 plan calls for cues, `references/imagery.md`), `12-motion.md` (the motion intent in one sentence), `13-rules.md` (always, never, where a page may depart and why). `14-sources.md` complete: every font, image and icon set with its source and licence. `README.md` rules: the direction's 3 to 5 main rules, naming tokens and components ("Body copy in `body`, `ink` on `ground`").
4. **Components**: only `Button` and `Card`, each drawn in its `preview.html` in its normal and hover states (shown with the class `is-hover`), their styles in `components/bundle.css` (classes `ds-…`, only tokens; focus is `outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset)`), and a short `README.md`: what it is for, what the page provides, when to use it, do and don't. Real copy from the charter. Leave `Link`, `Field` and `Nav` as the starters the branch holds; they are drawn after the choice.
5. **Showcase**: `components/Showcase/preview.html`, the home page's opening section from its wireframe, with the real copy, fully rendered at 1440 px and 390 px. Images are files in `media/` (WebP or JPEG, at most 512 KB, exported at twice their displayed width), linked `../../media/<file>`; icons are SVG files in `assets/Icons/`, drawn inline in the cards. Every card's `<html lang>` is the language of the site's copy (`01-context.md`).
6. **Cover**: last, `components/Cover/preview.html`, following the type's cover rules (or those of the create result): colour blocks, one pattern, the direction's name; nothing else in its folder.
7. Run `charter.py cards --root design/branches/<id>`, then `charter.py check --step C2 --sketch --root design/branches/<id>` until it passes. Run `python3 "<colour skill directory>/scripts/colour.py" palette design/branches/<id>/project/tokens.json` (`<colour skill directory>` is the `Colour skill:` of your mission): a failing required pair is a defect to fix before the publish; the CVD distances of the state colours raise a question, not a verdict. Self-check once (below).
8. **Publish your branch** (the charter skill's `publishing.md`, "Publish"): uploads; `charter.py stamp --step C2 --by "<user>" --root design/branches/<id> --title "<Client> · <ID> — <direction name>"` (the user's name from `CLAUDE.md`; the title is set locally before the first publish, and the board reads it); files. Put its URL in your REPORT. If the publish asks you to load a skill you cannot load, stop and report it; the lead publishes the branch.
9. **Capture** into `design/branches/<id>/captures/`, through the preview server, in your own browser context, saving every file by its absolute path (the mission's `Project:` + the path): `cover.png` (the Cover card in a 960 × 288 viewport), `showcase-1440.png` and `showcase-390.png` (the Showcase's first screen at each width), `components.png` (write a temporary `design/branches/<id>/captures/components.html` with one `<iframe>` per sketch card (`Button` and `Card`), 1440 px wide and each at its marker's height, then take a full-page screenshot of it). Then run `python3 "<colour skill directory>/scripts/colour.py" dominant design/branches/<id>/captures/showcase-1440.png --match design/branches/<id>/project/tokens.json`: it shows the visible hierarchy, how much of the first screen each token covers and how much belongs to no token. If it contradicts the colour logic of `08-colour.md`, revise the palette or the logic, and republish. The lead builds the board from the captures.

Commit to your angle; do not aim for the middle, and do not hold back the quality of what a sketch holds. End with an argued recommendation: why this direction serves the brief.

## C2 · Comparison ("choose for me")

When the user says "choose for me" at C2, the lead launches you as a new instance to compare the three directions. You made none of them: you have no direction to defend. Open the board and the three branches' Showcase and component cards at 1440 px and 390 px; read `01-context.md`, `07-visual-intent.md`, the taste file and the critic's C2 report; build nothing. Recommend the direction that best serves the brief and the visual intent, or a mix and its base direction, in a few sentences that cite the charter and what the critic found. Recommend only a direction the critic accepted; if it accepted none, say so and recommend none.

## C2 · Completing the kept direction

The lead merges the chosen branch into the charter (`charter.py merge`), taking whole families (colour, type, shape, imagery) from other branches for a mix. If your branch is the base, you are resumed to complete the direction in `design/charter/project/`. The merge copied your sketch, starters included. Do:
1. What a merge needs: give `13-rules.md` a part "Taken from other directions", list in `14-sources.md` the sources of what was taken, and fix any component whose contrast or rhythm the mix broke. For a type mix, replace the `@import` on the first line of `components/bundle.css` with the taken branch's; for an imagery mix, re-point `../../media/` paths and inline icons in the Showcase and the components to the taken files.
2. `Link`, `Field` and `Nav`: draw each in its `preview.html` with every state its starter lists, with their styles in `bundle.css` and a `README.md` as in step 4.
3. `Button` and `Card`: add their missing states, `is-focus`, `is-active` and the real `:disabled` where their starters list them.
4. Write `08-colour.md` to `13-rules.md` and the `README.md` rules in full, as the contract describes them (`contract.md`), keeping the sketch's decisions. In `08-colour.md`, revise **Why these colours** when the mix took the palette from another direction, and run `colour.py` `palette` again on the charter's `tokens.json`.
5. Run `charter.py cards`, then the full `charter.py check --step C2` until it passes. Self-check the new components once.

The lead then publishes the charter.

## C3 · Key mockups

1. The home page first, in 2 or 3 layouts: `design/mockups/home-a.html`, `home-b.html`…, each linking `../charter/project/tokens.css` and `../charter/project/components/bundle.css`, with images at `../charter/project/media/<file>`, built from the charter's components, on the B2 structure and copy. Layouts differ in composition (hierarchy, grid, image placement, density), not in colour. Each one is composed at 1440 px and at 390 px, with the mobile navigation of the B2 plan, and its opening hero fills the first screen (`references/layout.md`).
2. After the user's choice, the chosen layout becomes the card `components/MockupHome/preview.html` in the charter: first line `<!-- @dsCard group="Pages" page width=1440 height=<page height> -->` (add `mobile-height=<n>`, the page's height at 390 px, when it is taller than 844), stylesheets linked `../../tokens.css` and `../bundle.css`, images `../../media/…`.
3. The other pages in scope, one proposal each, directly as cards `components/Mockup<Page>/preview.html`. Offer variants only where a real choice exists (navigation, footer, a key component), as separate files in `design/mockups/`.
4. Last, `components/MockupNotFound/preview.html`: simple, in the direction, with the 404 line of `05-voice-and-wording.md`, a way back home and the main action. The footer of every mockup holds the legal links of the B2 plan.
5. Every component a page adds (the mobile menu sheet, the footer, a form, a gallery…) goes into the charter like the base ones: `components/<Name>/preview.html` with its states, a `README.md`, its styles in `bundle.css`. New sources go into `14-sources.md`.
6. Run `charter.py cards` and `charter.py check --step C3`.

The C3 art director fixes the problems the C3 critic finds in the components completed at C2 (in the charter).

Typical question: "For the opening: a full-bleed photo or type only?"

## C4 · Motion

Build 2 or 3 motion personalities as copies of the `MockupHome` card: `design/motion/a.html`, `b.html` (and `c.html`), linking the charter's files as the C3 options do: in the copy, rewrite `../../tokens.css`, `../bundle.css` and `../../media/` to `../charter/project/tokens.css`, `../charter/project/components/bundle.css` and `../charter/project/media/`. Follow `references/motion.md`: every animation has a role (guide, respond or emphasise), and every page shows all its content with reduced motion. At the top of each file, an HTML comment lists every animation: element, role, trigger, duration and easing.

After the user's choice:
1. Add the `duration` and `easing` families to `tokens.json` (`duration-fast`, `duration-base`, `duration-slow`, `ease-out`, `ease-in-out`) with the chosen values, and run `charter.py css`.
2. Copy the chosen prototype to `components/Motion/preview.html` (first line `<!-- @dsCard group="Pages" page width=1440 height=<page height> -->`; the paths rewritten back to `../../tokens.css`, `../bundle.css` and `../../media/`), with every duration and easing written as a token. In scripts, read tokens with `getComputedStyle(document.documentElement).getPropertyValue('--duration-base')`; never write a number of seconds or milliseconds.
3. Complete `12-motion.md`: every animation, its element, role, trigger, duration token, easing token, and what reduced motion shows.
4. Run `charter.py cards`, then `charter.py freeze`: every raw value it lists in a card or in `bundle.css` becomes a token, or uses an existing one. Then `charter.py check --step C4`. This is what makes the build faithful: the frontend developer only has tokens to copy.

## Proposals that are truly different

Two proposals are different when a visitor would notice without comparing them side by side. Change at least two of: colour logic, type voice, composition, imagery, motion. Another hue on the same layout is not a proposal. If the user asks for references beyond the moodboard, use `references/galleries.md`.

## Recommending

Each proposal ends with one sentence on who it serves and why, linked to the brief or the visual intent. Recommend one option. If none convinces you, say so and say what is missing.

## Self-check, once

Open each card or page at 1440 px and 390 px with the Playwright MCP server and check the points below. Measure what can be measured (sizes, overlaps, overflow, targets, contrast) by reading the page with a script; keep screenshots for what the eye must judge, since every image stays in your context.
- body text reaches 4.5:1 against its background, large text 3:1 (`check` measures the declared pairs; measure the others yourself, text over images included);
- nothing overflows at 390 px, and touch targets are at least `target-min`;
- every value comes from the tokens (`charter.py freeze` lists the others);
- every visual element has a job you can name, and nothing from `references/defaults.md` is there without a stated reason;
- from C3: the hero fills the first screen at 1440 × 900 and 390 × 844 and loses nothing at 1440 × 700 and 390 × 667; the mobile header follows the B2 plan and does not look crowded; no dead space at 390 px;
- no placeholder text and no invented facts (`[to provide: what]` instead);
- every font, image and icon set is in `14-sources.md` with its source and licence.

Fix what fails, once. Then report.
