# Responsive: components that are never crushed

Responsive is not the desktop page shrunk. Each screen is composed: what moves, what shrinks, what waits behind a disclosure, what stays within reach of the thumb. And each component carries its own way to adapt, so it never gets crushed wherever it is placed.

## Components that adapt to their own room
A component looks at the room it has, not at the device. It wraps, stacks or changes form **before** its content gets too narrow. Every Layout calls this intrinsic layout: sizes come from the content and its context, with few or no device breakpoints.

```css
/* Cards: as many columns as fit, each at least 16rem, one column below that. */
.cards {
  display: grid;
  gap: var(--spacing-gutter);
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
}

/* Media beside text; they stack once the text would get less than half the row. */
.split { display: flex; flex-wrap: wrap; gap: var(--spacing-gutter); }
.split > .media { flex: 1 1 20rem; }
.split > .text { flex: 999 1 0; min-width: 50%; }

/* A component that changes form with the width of its container. */
.card-list { container-type: inline-size; }
@container (width < 30rem) {
  .card { grid-template-columns: 1fr; }
}
```

`container-type: inline-size` needs a container with a definite width: on a shrink-to-fit box (a flex item with no width, an inline-block) it collapses to zero.

## Breakpoints from the content
Break where the layout stops fitting: where a column falls under a readable width, where a row of cards gets too narrow. Not at 768 px because a preset says so. **Measured:** 7 of 15 sites break at Tailwind's preset widths, 8 at values of their own (600, 720, 900, 960, 1100 px), and 6 use container queries.

## The phone layout
- **Compose it.** Decide for each section what moves, what shrinks, what hides behind a disclosure, and what stays within thumb reach. One column of content, two at most for small items.
- **Stack or swipe, by content.** What the visitor compares or must read entirely stacks: offers, steps, a lawyer's fields of practice. What is browsed may become a swiping row: products, screenings, works. **Measured:** rows of three or more items on a phone are stacked in 50 % of cases and swipe in 43 %.
- **A swiping row shows the next item** peeking at least 16 px past the edge (16 to 32 px is enough); a row that ends exactly at the edge looks complete and nobody swipes it. The row bleeds to the screen's edge while its first item starts on the margin. Its items stay reachable by keyboard, and nothing the visitor must see lives only in it.
- **The header stays light:** the name and a few links, with room around them; on a phone nothing wraps onto a second line. Its menus belong to `components`.

```css
.reel {
  display: flex;
  gap: var(--spacing-gutter);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-inline: var(--spacing-margin);
  scroll-padding-inline: var(--spacing-margin);
}
/* The item leaves a 24 px peek: 100 % + padding - gap - peek. */
.reel > * {
  flex: 0 0 min(calc(100% + var(--spacing-margin) - var(--spacing-gutter) - 1.5rem), 20rem);
  scroll-snap-align: start;
}
```

## The first screen
Two ways, chosen by the direction and written on the entry's `First screen` line. A full screen suits an opening that is an image or a statement; a hint suits a page whose answer starts just below.
- **A full first screen:** the opening fills the window, `min-height: 100svh` (minus the header if the header is not over it). Every measured brand site does this.
- **A hint of what follows:** the start of the next section shows, inviting the scroll. Next.js, shadcn and Stripe do this.

Either way, the headline, its supporting line and the main action are inside the first screen at 1440 × 900 and 390 × 844, and on a short screen (1440 × 700, 390 × 667) the opening grows taller rather than cutting its content; `layout.js` does not try short screens, so check them by eye. The headline is the page's main statement, whatever its tag: an `h1` holding the site's name is not it. Its size comes from `type`.

## Sticky chrome
- A sticky header needs `scroll-padding-block-start` set to its height, so an anchor or a focused field never lands under it.
- A cookie banner, a chat button or a sticky footer must never cover the whole of a focused element (WCAG 2.4.11). `layout.js` focuses every element at 1440 and 390 px and reports the ones hidden; on measured sites, cookie banners were the usual cause.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-6` · Boxes holding text take `min-height`, never a fixed height; grid tracks `minmax(0, 1fr)`; widths `100%`, never `100vw`; full-height panes `svh` or `dvh`, never `vh` | fixed sizes clip text in long languages and at zoom, `100vw` adds the scrollbar, `vh` ignores mobile toolbars | heuristic | Krehel layout | critic phase 4 |
| `proof-7` · The layout holds with the fullest and the emptiest real content | real names, titles and lists are longer or shorter than the mock-up's | heuristic | Self-Made Web Designer, Krehel layout | critic phases 3, 4 |
| `proof-8` · Side margins of at least 16 px on a phone; text and controls stay inside the margins and safe areas, while backgrounds, images and swiping rows may bleed | text against the edge looks cut, and curved screens and gesture zones hide it | heuristic | Krehel layout, Studio | critic phase 4 |

**Measured:** the side margin at 390 px is 16 to 28 px on the 15 pages, 16 px on six of them.

## Before you finish

| You see | Write instead |
|---|---|
| `width: 100vw` | `width: 100%` |
| `height: 100vh` on an opening or a pane | `min-height: 100svh`, or `100dvh` for a pane that must fit the toolbar |
| A fixed `height` on a box holding text | `min-height`, or `max-height` with `overflow-y: auto` |
| A `1fr` track or a flex child holding long words or a table | `minmax(0, 1fr)`, or `min-width: 0` on the flex child |
| A viewport media query inside a reusable component | A container query on its parent |
| A row of four or more columns with no wrap | `auto-fit` with a minimum, or a container query |
| A sticky header with no `scroll-padding-block-start` | Set it to the header's height |
| `env(safe-area-inset-*)` without `viewport-fit=cover` | Add it to the viewport meta, or the insets are 0 |
