# Element: the right element, its name and its target

## Button or link?

```text
What happens when it is pressed?
├─ the visitor goes somewhere (another page, a section, a file) → <a href>
├─ something happens here (open, send, toggle, delete) → <button type="button">, or type="submit" in a form
├─ a field takes a value → <input>, <select> or <textarea>, with its <label>
└─ something opens over the page → <button> that opens <dialog>, popover or a disclosure
```

A "button" that navigates is a styled link, and a "link" that acts is a styled button. A link keeps what people expect of links: open in a new tab, copy the address, the middle click. A `div` or `span` with a click handler has none of this (`element-1`): no focus, no Enter or Space, no role, no name. `check.js` reports a pointer cursor nothing can focus (`keyboard`).

When a native element cannot be used at all, the full replacement is `role="button"`, `tabindex="0"`, Enter and Space handled, and a name: more code than the native element, which is why it is the last resort.

## Names
Every control has a name that says what it does (`element-2`), and it contains the words on screen (`element-4`): a voice control user says "Send", so a button showing "Send" is not named "Submit message". Start the name with the visible text when more is needed: "Rechercher" can be named "Rechercher une pièce détachée".

The name comes, in order of preference:
1. from visible text inside the control;
2. from visible text elsewhere, through `aria-labelledby`;
3. from `aria-label`, invisible and easy to forget in a translation;
4. never from `title` alone, or a placeholder.

An icon-only control is named on the control itself, not on its icon (`element-5`): visually hidden text inside it, or `aria-label`; the icon is `aria-hidden="true"` (and `focusable="false"` on an inline SVG). Which icon to draw is `imagery`'s decision.

```css
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```

Structure that is seen is in the markup (`element-3`): a label tied to its field (`for` and `id`, or wrapping), a list for what reads as a list, headings for what reads as headings, `th` with `scope` in a table, a `fieldset` and `legend` around radio buttons.

## Navigation is not a menu
Site navigation is a `<nav>` with a list of links; a submenu is a disclosure: a `<button aria-expanded>` that shows a list of links (`element-6`). ARIA menu roles (`menu`, `menubar`, `menuitem`) promise an application menu: arrow keys, typeahead, no Tab inside, and links that stop being announced as links. Keep them for menus of actions (a "More" menu of commands in an app), built as the menu button pattern of `patterns.md`.

## The target is bigger than the drawing
`ux behaviour-14` sets 24 px (WCAG 2.5.8) and `ux behaviour-15` 44 px for the main touch actions. Build them without changing the drawing (`element-7`): a pseudo-element on the button, or on the `<label>` around a checkbox (never on the `<input>`, which draws no pseudo-elements), extends the area to the size needed, without covering a neighbour.

```css
.icon-button { position: relative; }
.icon-button::after { content: ""; position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; width: 44px; height: 44px; }
```

Where the element can afford the size, give it `min-width` and `min-height` instead. A label and its checkbox are one target: no gap between them that catches nothing (`ux behaviour-18`).

## Cards and layers
A card that leads somewhere has one link, in its heading; the link's `::after` is stretched over the card (`element-8`). The name stays short (the heading), the text stays selectable, and a second link inside the card stays reachable above it with `position: relative; z-index: 1`. Wrapping the whole card in a link gives it a name made of every word inside.

A decorative layer over controls (a glow, a gradient, a grain, a full-bleed `::after`) takes `pointer-events: none` (`element-9`); otherwise the control under it looks live and does nothing. A backdrop that closes a dialog on click is a control, not decoration.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `element-6` · Site navigation is a list of links, its submenus disclosures; ARIA menu roles only for menus of actions | a menu role promises arrow keys and hides that the items are links | heuristic | Pickering, APG | components audit + critic phase 4 |
| `element-7` · The hit area grows, not the drawing: a pseudo-element on the button or the label brings it to the size `ux behaviour-14` and `behaviour-15` set, without covering another target | the target can be easy to hit and still look as the direction drew it | heuristic | Krehel accessibility, Freiberg | critic phase 4 |
| `element-8` · A whole card is clickable through its heading link's `::after` stretched over it, never a link wrapping the card | one link with a short name, and the text inside stays selectable | heuristic | Pickering | critic phase 4 |
| `element-9` · A decorative layer over controls takes `pointer-events: none` | a glow that catches the click makes a live control dead | heuristic | Freiberg, Krehel accessibility | critic phase 4 |

## Broken → fixed

```text
Broken: <div class="btn" onclick="book()">Réserver</div>
Fixed:  <button type="button" class="btn">Réserver</button>

Broken: <button aria-label="Submit">Envoyer</button>; a voice user says "Envoyer" and nothing happens.
Fixed:  <button>Envoyer</button>, or aria-label="Envoyer la demande".

Broken: <a href="/atelier" class="card"> wraps a heading, a paragraph and a price; the link is read as all of it.
Fixed:  the heading's link carries the name; its ::after covers the card.
```
