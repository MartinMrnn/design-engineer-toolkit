# Hierarchy

Hierarchy decides what is seen first, second and third. The `ux` plan already ranks each view: what must be seen, what helps decide, what can wait (`thread-4`). Layout makes that ranking visible, mostly by **taking away**.

## One focal point per screen
Each screen-height of the page has one thing the eye lands on first: the "must be seen" of the plan. Everything else on that screen supports it. When two things fight for attention, the eye has no start and the page reads as too much.

**Measured.** On the first screens of 15 home pages, 9 have no filled button at all and none has more than two.

## Emphasis by subtraction
To make one thing stand out, lower the rest before raising it. Raising everything in turn ends in shouting.
- **Tools, used together:** size, weight, colour and contrast (owned by `type` and `colour`), space, position.
- **Lower secondary text:** a quieter colour or a smaller role rather than a louder headline.
- **Labels last:** a value that speaks for itself needs no label (`hello@studio.fr` needs no "Email:").
- **The heading level is not the look.** An `h2` can look small and a paragraph large; the document order stays correct.

## Actions
- One **filled** action per view: the main action of the plan.
- Secondary actions are quieter: outlined, or text with an underline.
- More than three secondary actions in one place go behind a menu.

## Controls look like controls
What can be clicked looks clickable, the same way everywhere: a shape, a border, an underline, or a fixed place such as a toolbar. Nothing else looks like that: a badge shaped like the buttons beside it collects dead clicks.

## The six visual laws
`ux` names these laws and hands them to this skill. Each is a finding about perception, with its limits, turned here into one rule.

| Law | What people do | Rule |
|---|---|---|
| Proximity | read things near each other as related | `space-2` |
| Similarity | read things that look alike as one group with one behaviour | `hierarchy-5` |
| Common Region | read things inside one boundary as a group | `space-3` |
| Uniform Connectedness | read things joined by a line or frame as more related than near ones | `hierarchy-6` |
| Prägnanz | read a shape in its simplest form | `shape-2` |
| Von Restorff | remember the one item that differs | `hierarchy-1` |

The laws come from Gestalt psychology (Wertheimer 1923, von Restorff 1933) and later work (Palmer 1992, Palmer & Rock 1994), reviewed by Wagemans and colleagues (2012). They describe tendencies measured in experiments, not guarantees for every page.

## Visual order and source order
`order`, `flex-direction: row-reverse`, `column-reverse` and grid placement change what is seen, not what is read: screen readers and the Tab key follow the source. Where the order carries meaning (steps, a ranking, a sentence split in two), the source must be in the right order. An image and a text swapped from side to side do not change the meaning; a reordered list of steps does. `layout.js` lists the reordered containers, and the critic judges each one.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `hierarchy-6` · Lines, frames and connectors join only what is related | people read connected things as more related than near ones | heuristic | Palmer & Rock 1994, Salaja | critic phase 3 |

## Broken and fixed

| Broken | Fixed |
|---|---|
| A bold headline, a bright badge, a large image and two filled buttons on one screen | One focal point; the others lowered |
| The secondary text made bolder to "balance" a bold title | The title alone carries the weight |
| "Price: 120 €" under a heading "Price" | "120 €", sized as the value it is |
| A blue underlined word that is not a link | Emphasis that does not look like a control |
| Steps 3, 1, 2 on screen because of grid placement | The source in reading order |
