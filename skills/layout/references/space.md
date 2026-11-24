# Space

Space is the first tool of layout. It says what belongs together, what comes next, and what matters. A screen where space lies about the relations looks like a draft, whatever its colours and type.

## The scale
- **One base step.** `--spacing: 0.25rem`, Tailwind's base: component spacing is a multiple of it (`calc(var(--spacing) * 4)` is 16 px). In `rem`, so space grows with the reader's text size.
- **Steps that are not linear.** Small steps close together, large ones far apart, such as 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. A choice between 120 and 125 px is no choice; between 96 and 128 it is.
- **Named, fluid steps for the page.** Gutter, side margin and the gap between sections change with the screen: one value on a phone, another on a wide screen, linear between, written with `clamp()` in `rem` and `vw`. This is Utopia's method of fluid space steps and pairs.
- **Every value from the scale.** A multiple of a token, such as `calc(var(--spacing-gutter) * 2)`, is on the scale; a number written by hand is not. From phase 3, `check.js` reports spacing written by hand once the page links `tokens.css` (`script token`).

```css
:root {
  --spacing: 0.25rem;
  --spacing-gutter: clamp(1rem, 0.75rem + 1vw, 1.5rem);    /* 16 px on a phone, 24 px wide */
  --spacing-margin: clamp(1rem, -0.25rem + 5vw, 4rem);     /* 16 px to 64 px */
  --spacing-section: clamp(4.5rem, 2.5rem + 8vw, 10rem);   /* 72 px to 160 px */
}
```

**Measured.** On 15 home pages, 6 to 20 distinct values cover 90 % of all margins, paddings and gaps (median 12). The gap between sections has a median of 279 px at 1440 px and 180 px at 390 px: it shrinks on a phone and stays the largest gap of the page.

## Space tells the truth
People read nearness as belonging. So the gaps must rank the relations:

| Between | Starting point |
|---|---|
| Parts of one item: a label and its field, a price and its button, an icon and its word | 4 to 12 px |
| A heading and the content it introduces | 8 to 24 px, always less than the gap above the heading |
| Items of one group: the fields of a form, the cards of a row | 16 to 24 px |
| One group and the next | 32 to 64 px |
| Sections | 72 to 160 px, fluid or by steps |

- **At least twice.** The gap between groups is at least twice the gap within one.
- **A heading belongs to what follows.** It sits closer to the text it introduces than to the block before it. The same holds for a label and its field, a price and its button.
- **Measured.** Of 163 headings on the 15 pages, 83 % are closer to what follows, 71 % at least twice as close, and the median ratio is 5. `layout.js` lists the headings that are not.

## Space, then a region, then lines
Each tool only where the one before cannot carry the structure:
1. **Space**, by default.
2. **A shared region**, a background or a frame, where a group must read as one unit: a card that is one link, a selectable row, a form step. People see things inside one boundary as a group (Common Region).
3. **Lines**, for dense data where space costs too much: tables, long settings lists. A thin, quiet line, never added to a gap that already did the work.

Boxing everything is how a page becomes a stack of sealed blocks. Rules drawn as the direction's gesture, such as the columns of a printed programme, are a choice: write them on the entry's `Kept on purpose` line.

## Start generous
When unsure, give more space, then take some away. Crowding is harder to see than emptiness, and the user's taste rejects the too-full screen. You do not have to fill the whole width: a form or a text can stay narrow on a wide screen.

## Dead space
Space that nothing explains is a defect: two paddings stacked, a card stretched to the height of its tallest neighbour with a hole inside, a gap left by an element that is hidden on this screen. Look for it at 390 px, where it shows most.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `space-5` · Start with too much space, then remove it | crowding is harder to see than emptiness | heuristic | Refactoring UI | critic phase 2 |
| `space-6` · No dead space: a gap nothing explains, two paddings stacked, a box taller than its content | space that carries no meaning reads as a mistake | heuristic | Studio | critic phases 3, 4 |

## Broken and fixed

| Broken | Fixed |
|---|---|
| Every element 16 px from the next | 8 px inside a field group, 24 px between groups |
| A heading with 48 px below it and 16 px above | 16 px below, 48 px or more above |
| A line between every row of a short list, and a large gap too | The gap alone |
| A 160 px section gap kept on a phone | A fluid step that falls to about 72 px |
| Cards stretched to equal height with empty bottoms | `align-items: start`, or content that truly fills them |
