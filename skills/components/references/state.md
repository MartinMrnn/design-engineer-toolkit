# State: what the control is doing, said to everyone

`ux` decides what feedback an action gets and when (`ux behaviour-3`, `behaviour-4`); `motion` decides how the change moves (`motion choreography-7`). This file builds the control so the change is correct, focusable and heard.

## A control through idle, working, done and failed
Hairline UI's status button carries its job in place instead of swapping a spinner for a toast elsewhere. Built so everyone follows it:

```html
<button type="submit" class="save" data-state="idle"><span class="label">Enregistrer</span></button>
<p role="status" class="visually-hidden" id="save-status"></p>
```

```js
async function save(button, status) {
  if (button.getAttribute('aria-busy') === 'true') return;        // repeat presses do nothing
  button.setAttribute('aria-busy', 'true');
  button.setAttribute('aria-disabled', 'true');                   // still focusable, still in its place
  button.dataset.state = 'working';
  setLabel(button, 'Enregistrement…');
  try {
    await send();
    button.dataset.state = 'done';
    setLabel(button, 'Enregistré');
    status.textContent = 'Modifications enregistrées.';
  } catch {
    button.dataset.state = 'failed';
    setLabel(button, 'Réessayer');
    status.textContent = 'Échec de l’enregistrement. Réessayez.';
  } finally {
    button.removeAttribute('aria-busy');
    button.removeAttribute('aria-disabled');
  }
}
```

- **Focus stays** (`state-1`): `disabled` would drop the focus to `body` and take the button out of the Tab order mid-task. `aria-disabled` and `aria-busy` say it is working; the script ignores presses until it is done. `ux behaviour-6` keeps submit enabled until the send itself.
- **The label may change** (Hairline, `motion choreography-7`): "Enregistrer" → "Enregistrement…" → "Enregistré" or "Réessayer". The width does not jump: `motion` morphs it, or the button keeps the width of its longest label. The done state returns to idle after a moment, or stays when it means something lasting.
- **The result is spoken** by the status region (`state-2`), not by the label change: screen readers announce a change of name on a focused button unevenly. The region is in the page from the start, empty, outside the button; writing into it makes screen readers say it once, without moving focus (`ux behaviour-17`, WCAG 4.1.3).
- **A failure says so in words** and offers the action again; red alone is not enough (`colour proof-3`).
- **Reduced motion** keeps every state and drops the movement.

## Live regions
| Region | For | Never |
|---|---|---|
| `role="status"` (polite) | results, counts, a toast, a saved form | an error the user must act on at once |
| `role="alert"` (assertive) | an urgent error not tied to a field | success, progress, anything frequent |
| `aria-describedby` on a field | the error or hint of that field | a page-wide message |

Render the region empty at load and write its text later; a region added together with its text is often not read. Write the same message twice in a row by clearing it first.

## Toggles
A toggle changes its state or its label, never both (`state-3`). A mute button keeps "Son" and turns `aria-pressed="true"`; a play button changes "Lecture" to "Pause" and has no pressed state. Both at once say "Pause, pressed": the opposite of what happened. A setting that is on or off is a switch (`role="switch"` and `aria-checked`) or a checkbox, and takes effect at once.

## Disabled
`disabled` is for what is truly unavailable (`state-4`), and the reason is written beside it ("Disponible à partir de 2 articles"), because a disabled control leaves the Tab order, cannot be hovered, and cannot carry a tooltip. When the control must stay discoverable (a menu item, a tab, a toolbar button), use `aria-disabled="true"`, style it, and ignore its presses. Never both attributes on one element.

## Errors and loading
A field in error has `aria-invalid="true"` and `aria-describedby` pointing at its message; on submit, focus goes to the first field in error (`state-5`, building `ux behaviour-7`). A loading sign waits 150 to 300 ms before showing and stays 300 to 500 ms once shown, so a fast answer shows no flash (`state-6`); labels of running states and of actions that open a next step end with an ellipsis: "Enregistrement…", "Renommer…".

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `state-4` · `disabled` only for what is truly unavailable, with its reason in text beside it; `aria-disabled` when it must stay discoverable | a disabled control leaves the Tab order and cannot explain itself | heuristic | APG, Krehel accessibility, Freiberg | components audit + critic phase 4 |
| `state-5` · A field in error takes `aria-invalid` and `aria-describedby` pointing at its message; the first one in error takes focus | the error must be found and heard where it is | heuristic | Krehel accessibility | critic phase 4 |
| `state-6` · A loading sign waits 150 to 300 ms before it shows and stays 300 to 500 ms once shown; running labels end with an ellipsis | a spinner that flashes reads as a glitch | heuristic | Vercel | critic phase 4 |
