# Patterns: which one, with which tool, and its keys

A role is a promise (`pattern-1`): `role="tab"` tells a screen reader user that arrow keys move between tabs. Nothing in the browser makes that true; the code must. "No ARIA is better than bad ARIA" (APG): when the keys cannot be built, use plainer markup that promises less.

## The tool, in order (`pattern-2`)

```text
Is there a native element that does it?
├─ yes → use it: <button>, <a>, <details>/<summary>, <dialog> with showModal(), popover, <select>, <input type="checkbox">
└─ no → does the stack have a headless library that does it?
        ├─ yes → use it, styled with the tokens; its need goes on the `Tools` line of the components entry (inside the studio a dependency is Ask first; used alone, name it in your answer)
        └─ no → build the APG pattern by hand, with its whole key map below
```

Kowalski's picks, for a React stack: Base UI for unstyled primitives (dialog, popover, menu, select, tabs, tooltip), Sonner for toasts, Vaul for drawers, cmdk for command menus. A `div`-based dropdown with hand-written focus handling is the sign one of these was needed. Other stacks have their own headless libraries; the rule is the same: tested, unstyled, and needed.

## Key maps
What each pattern must answer. Tab moves between patterns; arrow keys move inside a composite.

| Pattern | Markup | Keys |
|---|---|---|
| Disclosure (and a navigation dropdown) | `<button aria-expanded aria-controls>` and the region | Enter and Space toggle; focus stays on the button; Escape closes when it overlays the page, and focus returns to the button |
| Dialog, modal | `<dialog>` opened with `showModal()`, named by its heading through `aria-labelledby` | focus moves inside on open; Tab and Shift+Tab stay inside; Escape closes; focus returns to the trigger |
| Drawer, full-screen menu | a modal dialog that slides | as a dialog; `overscroll-behavior: contain` on its scroller |
| Menu button (menu of actions) | `<button aria-haspopup="menu" aria-expanded>`, `role="menu"`, `role="menuitem"` | Enter, Space or Down open and focus the first item; Up the last; arrows move; Home and End; typing jumps to an item; Escape closes and returns focus; Tab closes and moves on |
| Tabs | `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"` | one Tab stop on the selected tab; Left and Right move (Up and Down when vertical), wrapping; Home and End; Tab goes into the panel |
| Combobox | an `<input role="combobox" aria-expanded aria-controls aria-activedescendant>` and a `listbox` | typing filters; Down opens and moves; Enter accepts; Escape closes, then clears; focus never leaves the input |
| Listbox, radio group | `role="listbox"` and `option`, or `<fieldset>` of radios | one Tab stop; arrows move the selection; Space selects in a multi-select list |
| Switch | `<button role="switch" aria-checked>`, or a checkbox | Space toggles (and Enter on a button); takes effect at once |
| Toggle button | `<button aria-pressed>` | Enter and Space toggle |
| Tooltip | `role="tooltip"` referenced by `aria-describedby` | shows on hover and focus; Escape hides it; stays while hovered |
| Toggletip | a `<button>` that writes its text into a `role="status"` beside it | Enter and Space show; Escape or a click elsewhere hides |
| Toast | text written into a region present at load (`role="status"`; `role="alert"` for an urgent error) | never takes focus; one with an action or an error stays until dismissed; timers pause while hovered or the tab is hidden |

The first focus in a dialog: its first control; a static element at its start (`tabindex="-1"`) when its content is long enough that focusing the first control would scroll its start away; the least destructive action when the dialog confirms something that cannot be undone. After closing, focus goes back to the trigger, or to the nearest logical place if the trigger is gone (`focus-6`).

A navigation menu is a disclosure while the page stays visible beside it; once it covers the whole screen (the usual phone menu), it is a modal dialog, with its focus held and a way to close it. A modal layer makes the rest inert (`pattern-3`): `showModal()` does it; a custom overlay sets `inert` on the page behind it, rendered outside the overlay. A disclosure is not modal: focus stays on its button and the page stays reachable.

## Details that make patterns feel right
- A tooltip in a group opens after a short delay; the next ones open at once, without animation (Kowalski, Vercel).
- A frequently used menu opens on press (`pointerdown`), and a nested menu forgives the diagonal path toward its submenu (`pattern-8`).
- Clicking a label focuses its field; an icon inside a field's border focuses the field when clicked.
- Toggles and switches take effect at once, without a confirmation step.
- Enter in a single-line field submits its form: fields live in a `<form>`.
- Text inside a control is not selectable on press (`user-select: none` on its label), and `touch-action: manipulation` stops the double-tap zoom on controls.
- Tabs are for views of the same thing, where tabs are expected (`pattern-7`); a short page of sections is a list of anchor links. Activate a tab on focus only when its panel shows at once; otherwise on Enter or Space.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `pattern-5` · A tooltip carries a short supplement, never a control or something needed; what is needed is a toggletip or text on the page | a tooltip cannot be reached on touch, and its content vanishes | heuristic | Pickering, Freiberg, Vercel | critic phase 4 |
| `pattern-6` · A drag has a single-pointer alternative | not everyone can hold and move | standard (WCAG 2.5.7) | W3C | critic phase 4 · blocking |
| `pattern-7` · Tabs only where tabs are expected, activated on focus only when panels show without delay | a list of links is simpler, and a slow panel on every arrow key blocks the way | heuristic | APG, Pickering | critic phase 4 |
| `pattern-8` · A menu used many times a day opens on press, and a nested menu forgives the pointer's diagonal | waiting for the release costs time, and a diagonal path should not close the submenu | heuristic | Freiberg | critic phase 4 |
