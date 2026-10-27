# The charter's contract

The charter is one Claude Design System Artifact per project. Its files live in `design/charter/project/`; a C2 branch's in `design/branches/<id>/project/`. This contract fixes every name, so that the three C2 directions can be compared line by line and the build never depends on which direction was chosen. `charter.py check --step <id>` enforces it; `contract.json` holds the same rules as data.

## What each step adds

| Step | Files | Who |
|---|---|---|
| A1 | `README.md` (summary and how to use the charter), `01-context.md` | lead |
| B1 | `02-intent.md`, `03-story.md`, `04-positioning.md`, `05-voice-and-wording.md` | ux |
| B2 | `06-structure.md`; a `Wireframe<Page>` card per page in scope and for the 404 (`WireframeNotFound`) | ux |
| C1 | `07-visual-intent.md` | art director |
| C2 | `tokens.json` and `tokens.css`; `08-colour.md` to `14-sources.md` (`12-motion.md` holds the motion intent in one sentence); the rules of `README.md`; `components/bundle.css`; the base components; `Cover`; `Showcase` | the three art directors in their branches, then the merge |
| C3 | a `Mockup<Page>` card per page in scope and for the 404 (`MockupNotFound`); every new component; `14-sources.md` updated | art director |
| C4 | the `duration` and `easing` families; `12-motion.md` completed; the `Motion` card; `charter.py freeze` passes | art director |
| D1, E1 | nothing: the build reads the charter | frontend developer |

A file is done when its `<!-- charter: … -->` comment is replaced by what the comment asks for. Headings and text are in the language of the site's copy; file names never change.

## Sections

| File | Content |
|---|---|
| `README.md` | Two or three sentences on the client, the site and its visitor; how to use the charter; from C2, the essential rules, naming tokens and components ("Body copy in `body`, `ink` on `ground`"). No title: the page shows the system's name. |
| `01-context.md` | Client, goal, priority visitor, main action, scope, supporting pages, new site or redesign, available content, tone, deadline, language, constraints, material received. Unknown facts: `[to provide: what]`. |
| `02-intent.md` | What the site must make the priority visitor think, feel and do. |
| `03-story.md` | The story the site tells, in 4 to 7 beats, each carried by a page or section. |
| `04-positioning.md` | Where the client stands against the sites studied; the chosen key messages, each linked to a finding. |
| `05-voice-and-wording.md` | Tone in three words, person, casing, words to use and avoid, five real examples (headline, call to action, error, confirmation, 404 line). |
| `06-structure.md` | Sitemap with supporting pages, intents per page, sections and their roles, the main path, what was left out, the mobile plan. |
| `07-visual-intent.md` | Keep (traced to references), Avoid, Keywords. |
| `08-colour.md` | The colour logic in one sentence; roles; the meaning of states, never told by colour alone. |
| `09-type.md` | The pairing and why; the scale; rules (measure, wrapping, numerals). |
| `10-shape-and-space.md` | The shape logic in one sentence; the spacing rhythm; the grid; the opening hero. |
| `11-imagery-and-icons.md` | The image treatment, shown on real images; the icon set and style. |
| `12-motion.md` | At C2, the motion intent in one sentence. At C4, every animation: element, role (guide, respond or emphasise), trigger, duration token, easing token, what reduced motion shows. |
| `13-rules.md` | Always; Never; where a page may depart from a rule and why; taken from other directions (after a mix). |
| `14-sources.md` | One table, Asset · Used on · Source URL · Author · Licence · Status, for every font, image and icon set in use. |

## Tokens (`tokens.json`)

The Design System type's grammar, narrowed:
- Every family except `type` is `{"tokens": [{"name", "value", "usage"}, …]}`: a list, never a name-to-value map.
- Only the names below. A missing name, or any other, fails `check`.
- Every token has a `usage` note saying where it is used.
- Colours are `#rgb`, `#rrggbb`, or an alias `{other-colour}`. No named colours, `var()`, `rgb()` or `color-mix()`. One theme, `light`, unless `01-context.md` asks for a dark one; then each colour gives a value per theme, the light one first.
- A text colour (`ink`, `ink-muted`, `on-accent`, `on-accent-2`, `ink-inverse`) names the grounds it reads on, as `token` names, in its usage note: "Body copy on `ground` and `ground-raised`." `check` measures each pair in every theme against 4.5:1, and `focus-ring` against `ground` and `ground-raised` at 3:1.
- `spacing` and `radius` are lengths: `px`, `rem`, `em`, `%` or `0`. Other families hold plain CSS values (`100svh`, `68ch`, `500ms`, `cubic-bezier(0.22, 1, 0.36, 1)`), without `var()` or `url()`.

| Family | Names | Due |
|---|---|---|
| `color` | required: `ground`, `ground-raised`, `ink`, `ink-muted`, `line`, `accent`, `on-accent`, `focus-ring`, `state-selected`, `state-unavailable`, `state-error`, `state-success`; optional: `accent-2`, `on-accent-2`, `ground-inverse`, `ink-inverse` | C2 |
| `type.families` | `display`, `text`; optional `mono` | C2 |
| `type.groups` | Display: `display-xl`, `display-l` · Headings: `h1`, `h2`, `h3` · Text: `body-l`, `body`, `body-s`, `caption` · UI: `label`, `button` | C2 |
| `spacing` | `space-1`, `space-2`, `space-3`, `space-4`, `space-5`, `space-6`, `space-7`, `space-8` | C2 |
| `radius` | `radius-s`, `radius-m`, `radius-l`, `radius-full` | C2 |
| `shadow` | `shadow-1`, `shadow-2` (`none` allowed) | C2 |
| `layout` | `container-max`, `measure`, `hero-min-height`, `icon-s`, `icon-m`, `target-min` | C2 |
| `duration` | `duration-fast`, `duration-base`, `duration-slow` | C4 |
| `easing` | `ease-out`, `ease-in-out` | C4 |

Fonts: a file in `fonts/`, listed in `type.fonts` as `{"family", "file", "weight", "style"}`; or a Google-hosted family, named in `type.families` and loaded by an `@import` on the first line of `components/bundle.css`.

`tokens.css` is compiled by `charter.py css`. Never edit it.

## Components

- HTML and CSS only. `components/bundle.js` holds no component: `charter.py init` and `branch` write it so that the type runs previews live (their scripts and their relative files load); never edit it. Styles live in `components/bundle.css`. Classes start with `ds-`. Previews show states with `is-hover`, `is-focus` and `is-active` (styled like `:hover`, `:focus-visible` and `:active`) and the real `:disabled`.
- Each component has `components/<Name>/preview.html` (one component, every state, real copy) and `components/<Name>/README.md` (first sentence: what it is for; then what the page provides, when to use it, do and don't).
- The base set, at C2, with these states:
  - `Button`: primary and secondary; default, hover, focus, active, disabled.
  - `Link`: inline and standalone; default, hover, focus.
  - `Card`: default, hover.
  - `Field`: label and help; focus; error; disabled.
  - `Nav`: desktop; the mobile pattern of `06-structure.md`, closed and open.
- Every component added later (footer, mobile menu sheet, form, gallery…) follows the same pattern, with a PascalCase name.

## Cards

Every `preview.html` starts with the type's marker on line 1, then a small complete HTML document. Every card except the wireframes links the charter's stylesheets itself, so it renders the same on the local preview server and in the Artifact:

```html
<!-- @dsCard group="Actions" height=160 -->
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Button</title>
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../bundle.css">
</head>
<body>
…
</body>
</html>
```

| Card | Marker on line 1 | Step |
|---|---|---|
| Base components | `group="Actions"` (Button, Link), `group="Content"` (Card), `group="Forms"` (Field), `group="Navigation"` (Nav); `height=` to fit | C2 |
| `Cover` | `height=288`, no group; its folder holds only `preview.html` | C2, last |
| `Wireframe<Page>` | `group="Wireframes" page width=1440 height=<page height>` | B2 |
| `Showcase` | `group="Pages" page width=1440 height=900` | C2 |
| `Mockup<Page>` | `group="Pages" page width=1440 height=<page height>` | C3 |
| `Motion` | `group="Pages" page width=1440 height=<page height>` | C4 |

Page cards get a 390 px copy, `<Name>Mobile`, written by `charter.py cards` (its line 2 says it is generated). Never edit a copy: edit its card and run `cards` again; `check` reports a copy that is out of date. A copy drawn by hand instead (no generated line) is kept. Page names are PascalCase: `Home`, `Coffees`, `NotFound` for the 404.

Local preview URL of a card: `<preview>/design/charter/project/components/<Name>/preview.html` (a branch: `<preview>/design/branches/<id>/project/components/<Name>/preview.html`).

## Media and icons

- Images shown in cards are files in `media/` (WebP or JPEG, at most 512 KB each, exported at twice their displayed width), linked `../../media/<file>`.
- Icons are SVG files in `assets/Icons/`, with a `README.md` naming each icon and its ink. In cards and pages, draw them inline (`stroke="currentColor"`).
- A logo the user provided goes in `assets/Logos/`, with a `README.md`.
- Files under `assets/` are uploaded when the charter is published (`publishing.md`).

## Values

Every value in a card or in `components/bundle.css` is a token: `var(--name)` or a type class (`.h1`, `.body`…). `charter.py freeze` lists the exceptions. Allowed: `0`, `1px` hairlines, percentages, unitless numbers, and the conditions of `@media` and `@container` rules (`var()` cannot go there); the values inside those rules are tokens like any other. Wireframes, the Cover and the generated `…Mobile` copies are exempt; a mobile card drawn by hand is not.
