---
name: mockup-build
description: Build method of the design studio's frontend developer. Turns the charter (tokens, components, mockup and motion cards) into a complete static mockup site (HTML, CSS, JS, no framework) that looks and moves like the approved design at 1440 px and 390 px. Preloaded into the frontend agent.
---

# Mockup build

You build `site/`, the high-fidelity static mockup the user sends to their client. It must look and move exactly like the approved design. It is not a production site: no framework, no build step, no CMS, no SEO work. If the client accepts, the user takes it further.

You work on D1 (the build) and on the fixes asked at E1. You never change the design: if something cannot be built as approved, build the closest faithful version and record the deviation (see Deviations).

## Inputs
- `design/decisions.md`: what was approved. It wins over anything else.
- The charter, `design/charter/project/`: `README.md` first; the `Mockup<Page>` cards (the approved layout of every page) and the `Motion` card (the approved motion); `tokens.css`, `components/bundle.css` and each component's `README.md`; `12-motion.md`, `13-rules.md` and `14-sources.md`.
- `design/deviations.md`: the deviations already recorded; `design/decisions.md` says which ones the user approved.

## Interview (D1)
One round, at most 3 questions: what must be interactive (menu, tabs, accordion, slider, a simulated form, filters) and what can stay visual. Recommend the smallest set that makes the mockup convincing to the client.

## Structure
```text
site/
  index.html, <page>.html …     one file per page in scope
  404.html                      from the MockupNotFound card (static hosts serve it for missing pages)
  legal.html                    one simple page in the site's layout: the legal sections the brief plans
                                (#legal-notice, and #terms or #privacy), each holding [to provide: …]
  assets/css/tokens.css         from charter.py export site/assets, unchanged
  assets/css/components.css     the charter's components, from the same export, unchanged
  assets/css/main.css
  assets/js/main.js
  assets/fonts/, assets/img/    the charter's fonts and media, from the same export
  CREDITS.md                    media and fonts with source and licence, from the charter's 14-sources.md
```
- No templating: the header and footer are copied into each page.
- Relative links only, so the folder works from a local server or on any static host.
- Navigation lists only the pages in scope. Every link goes to a page in scope, `legal.html`, an anchor or a real external URL; never `href="#"`. The footer links to the sections of `legal.html`.
- Each page has a favicon: the client's if provided, otherwise `<link rel="icon" href="data:,">`.

## Building
1. Set up `site/` and run `charter.py export site/assets` (the charter skill's script).
2. Build the home page from its `MockupHome` card: reuse its markup and the charter's `ds-` classes, move page-specific styles to `main.css`, and keep every value a token.
3. Add the approved motion (`references/motion.md`) and the agreed interactions.
4. Self-check once (`references/self-check.md`).
5. Report. The lead sends the page to the critic, then to the user.
6. After approval, build the next page type the same way. Pages that share a layout are one page type. Build `404.html` and `legal.html` with the last page type.

## Rules
- Only tokens: no raw colour, font, size, spacing, radius, duration or easing outside `tokens.css` and `components.css`.
- Semantic HTML: `header`, `nav`, `main`, `footer`; one `h1` per page; `button` for actions, `a` for navigation; `alt` on images; `label` on form fields; `lang` on `html` in the language of the site's copy.
- A visible focus style on every interactive element, as the charter's components draw it.
- Responsive from 390 to 1440 px; check 768 px too. Nothing overflows horizontally.
- The opening hero fills the first screen: `min-height: var(--hero-min-height)` (with the header's height taken off when the header is not over the hero), sizes inside it scaled with the viewport as the mockup does, and never a fixed `height` that would cut content on a short screen. The next section does not show at 1440 × 900 or 390 × 844.
- The mobile navigation is built as the mockup shows it; its keyboard order follows its visual order.
- Images: `width` and `height` set, `loading="lazy"` below the first screen, exported at twice their displayed width.
- Icons: the inline SVG of each Hugeicons icon the mockups use (`stroke="currentColor"`), sized with the icon tokens, `aria-hidden="true"` next to a visible label, or an `aria-label` on an icon-only button. No icon font in `site/`.
- Facts stay as the mockup cards have them, `[to provide: …]` included.
- Libraries only from a CDN with a pinned version, and only when the approved motion needs them.

## Deviations
A deviation is a difference a visitor could see between the approved mockup or motion and `site/`. Record each one you cannot avoid as a row of `design/deviations.md`: page, element, the difference, and its justification (why the approved version cannot be built). Never record a taste choice or an improvement: those are not yours to make. A recorded deviation is not accepted until the user approves it: the critic judges it first. A refused one is fixed, and its row removed.

## E1 fixes
The lead gives you the path of the critic's report and which problems to fix; read them there. Fix each one, self-check the pages you touched, and report what you fixed. What you cannot fix and differs from the approved design goes in `design/deviations.md`.
