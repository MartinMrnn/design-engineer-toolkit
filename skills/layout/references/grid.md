# Grid: aligning, and choosing a structure

Two different things share the word grid. The **alignment grid** gives the page a few shared edges. The **structure of a section** is how many things sit side by side. The first is set once per direction; the second is chosen per section, from what the section says.

## The alignment grid
- **Columns.** Twelve on a wide screen divide into halves, thirds and quarters. Fewer when the content is simple. On a phone, one column of content inside the margins.
- **Tokens.** The number of columns as `--grid-columns`. Maximum widths in Tailwind's `--container-*` namespace, named for their use: `--container-page`, `--container-prose`. The gutter as `--spacing-gutter`, the side margin as `--spacing-margin`, fluid from 16 px on a phone to 64 px or more on a wide screen (`space.md`).
- **Centred or stretched.** A centred container of a maximum width lets only the side margins grow on very wide screens. A stretched grid keeps its margins. Text never touches the edge.
- **Shared edges.** Pick a small set of edges and start every block on one. Typical stray edges: an icon 2 px off the text edge, one card padded unlike its neighbours, three left edges in one column.
- **A guide, not a prison.** The grid exists so that its breaks mean something.

```css
/* Content in the middle track; what bleeds takes the full row. */
.page {
  display: grid;
  grid-template-columns: 1fr min(var(--container-page), 100% - 2 * var(--spacing-margin)) 1fr;
}
.page > * { grid-column: 2; }
.page > .bleed { grid-column: 1 / -1; }
```

## The structure of a section

| Columns | To | Often | On a phone |
|---|---|---|---|
| 1 | focus on one message | the opening, a call to action, a strong statement | 1 |
| 2 | pair two things | text and image, a quote and a face, a title column beside cards | 1 |
| 3 or 4 | compare a few things | offers, services, fields of practice | stacked |
| 4 or more | browse rich content | works, a gallery, a programme | 2, stacked, or swiping |
| 5 to 6 | scan many small items | a catalogue, a list of dates | 2, or swiping |

- **Four things to compare** sit in one row of four or in two rows of two; both are comparisons.
- **Steps are a sequence**, not a comparison: three or four short steps may sit in one numbered row, longer ones read better as a numbered list.

- **Never more than six.** Past six, items become too small to read and too many to compare.
- **From three columns, more air.** Wider gutters and more space around the row, or it looks crowded.
- **Two can look like three.** A narrow column with the heading beside a wide column of cards reads as richer than three equal columns.
- **Measured** on 104 sections of 15 home pages: one column 33 %, two 31 %, three 16 %, four 14 %, five or six 6 %; never more than six (`measures.md`).

## Breaking the grid
A section may leave the grid on purpose (an image that bleeds, a staggered list, a headline that crosses the gutter), once or twice per page, for a reason written on the entry's `Kept on purpose` line. A stagger that is not written there reads as stray edges (`grid-1`). A break is the layout's gesture or serves it; elsewhere the grid holds, so the break is seen.

## Variation with a purpose
Readers predict. When every section has the same structure, the page tells them they have already seen it, and they stop. When the structure changes for no reason, they lose the thread. So **the structure changes when the message changes**: from one statement to a comparison, from a list to a testimony. Things of the same kind keep the same structure, so they are read as a set. On the measured pages, the same structure rarely runs for more than three sections in a row.

## Balance
Balance is stability, not symmetry: nothing should look as if it leans or is about to slide.
- **Diagonal:** a large block of text top left held by a strong image bottom right.
- **Asymmetric:** unequal parts made even by weight: a small dark image against a large light text block.
- **Symmetric:** centred, calm, and the easiest to make generic. Use it when the message is one thing.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `grid-5` · A composition is balanced, not symmetrical: no side looks heavier unless that is the point | a page that leans looks unfinished | heuristic | Self-Made Web Designer | critic phases 2, 3 |

## Broken and fixed

| Broken | Fixed |
|---|---|
| Six sections in a row of three cards each | The structure follows each message: one statement, one comparison, one testimony |
| Cards of three different widths in one row, by accident | One structure per kind of content |
| A five-column row with 4 px gutters | Four columns with a wide gutter, or a swiping row |
| Text set from 0 px on a phone | A side margin of at least 16 px |
