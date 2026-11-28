# Purpose: should it move at all?

The question comes before any curve or duration, and its answer is often no. Kowalski's framework asks it in order; a request that fails the gate gets no animation, and that is a result, not a dodge.

## The gate, in order
1. **How often is it seen?**

| Frequency | Examples | Motion |
|---|---|---|
| Many times a day | a shortcut, a command menu, a list moved through with arrows, a tab used constantly, typing | none, or 150 ms of opacity or colour at most |
| Tens of times a day | hovers, row actions, a filter | small and fast, or none |
| Now and then | a dialog, a drawer, a toast, a menu on a site seen once | the standard motion of `timing.md` |
| Rarely, or once | a first visit, a success, an empty state, an explanation | room for delight, still never holding the page |

2. **Is it a repeated keyboard action?** A shortcut, arrow keys through a list or a menu, a command palette: then it does not animate (`purpose-3`). A keyboard user repeats these far more often than a mouse user, and keyboard input already feels mechanical: motion on top reads as waiting. A button pressed with Enter or Space is not one of them: it moves exactly as when it is clicked.
3. **Name its purpose**, in one of these words:
   - **feedback**: the interface heard the press, the hover, the drop;
   - **origin**: where something came from or goes (a popup from its trigger, a toast leaving the way it came);
   - **state**: a change is made legible (sending, sent, failed);
   - **continuity**: content that would otherwise jump is bridged (a list closing a gap, a height that changes);
   - **explanation**: how something works, shown (a product demo, a first run);
   - **delight**: only on a rare moment.
   If none fits, nothing moves (`purpose-1`).
4. **Is it something being read or acted on?** Prices, figures, tables, form fields stay still (`purpose-6`). Decoration that follows the cursor belongs on a showcase, never on a working screen.

## Menus opened often
A context menu, a command menu or a select used all day opens at once and may fade out as it closes (`purpose-4`). A site's navigation menu, opened once per visit, may animate both ways within `timing.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `purpose-5` · Motion is never the only cue: each animated change leaves a static one, a colour, an icon or a label | someone who misses or turns off the motion still sees the change | heuristic | Krehel motion | critic phases 3, 4 |
| `purpose-6` · What the visitor is reading or acting on (prices, figures, forms, tables) does not move for style | moving data is harder to read and to trust | heuristic | Kowalski | critic phases 3, 4 |

## Broken and fixed

| Broken | Fixed |
|---|---|
| A command menu that scales in over 200 ms | Opens at once; fades out in 120 ms after a choice |
| Arrow keys through search results slide the highlight | The highlight jumps; the mouse hover may fade it in 100 ms |
| A price that counts up from 0 on every visit | The price is there; a count-up only for a figure that is the story, once |
| "Saved" shown only by a check that animates and vanishes | The check stays, with the word "Saved" |
