# Layout, spacing, hierarchy and shape

The UI makes the UX visible: it helps the brain understand what the page says and what can be done. Start every layout from `design/charter/project/06-structure.md`: the intents, the role of each section, what shows at once and what is revealed on demand, and the mobile plan.

## Hierarchy
- Each screen has one focal point and one main action. Decide the reading order of every section before styling it: what is seen first, second, third.
- Build hierarchy with size, weight, colour and space together, not with one alone.
- What can be clicked looks clickable, and alike everywhere. What cannot be clicked never looks like a button.

## Grid
- Pick a grid for the direction (columns, gutter, margins) and write it in the tokens. Sections follow it; a section may break it on purpose (an image that bleeds, a staggered list), once or twice per page, for a stated reason.
- Align to the grid optically, not only numerically: a big headline's first letter, a rounded image, an icon.

## Spacing
- One spacing scale in the tokens (for example 4, 8, 16, 24, 40, 64, 120 px). Every margin, padding and gap comes from it.
- Space shows what belongs together: tighter inside a group, wider between groups.
- Space is part of the composition, never its substitute. Dead space (a gap nothing explains, two paddings stacked, a card stretched taller than its content) is a defect. Measure it at 390 px, where it shows most.

## Shape
- Give shapes a logic, as for colour, in one sentence: which radii exist, on what, and why (for example "round means you can pick it up: buttons, tags, stickers; the page structure stays straight").
- Two or three radii at most, as tokens. Borders and silhouettes follow the same logic.

## The opening hero
- The hero fills the first screen: `min-height` of the viewport height (`100svh`, minus the header if the header is not over it), so the next section does not show above the fold, at 1440 × 900 as at 390 × 844.
- On shorter or taller screens it adapts instead of breaking: sizes inside the hero scale with the viewport (`clamp()` with `vh` or `svh` units), and on a short screen it grows taller rather than cutting its content. Check it at 1440 × 700 and 390 × 667 too.
- The headline, the supporting line and the main action are all on the first screen. Inner pages that open with an intro rather than a hero do not need to fill the screen: the B2 plan says which pages open with a hero.

## Mobile
- Compose the 390 px layout; do not just stack the desktop columns. Decide what moves, what shrinks, what is hidden behind a disclosure, and what stays within thumb reach.
- Draw the navigation pattern of the B2 mobile plan. The top of the screen never looks crowded: few items, room around them, nothing pressed against the edges, nothing wrapping onto a second row.
- Touch targets of at least 44 px, with at least 8 px between them.

## The design system is a shared language
Tokens and components make the pages feel made by one hand; they do not make every screen identical. A page may depart from a rule when that helps the visitor understand or act, and the charter's `13-rules.md` says where and why.
