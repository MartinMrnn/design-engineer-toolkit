# Roles: a few sizes, each a complete decision

## Start from the roles
Four to six, named by use, each with its size, leading, weight and tracking. These starting values are to be adjusted on the real page, never kept by default.

| Role | Size | Leading | Weight | Tracking |
|---|---|---|---|---|
| `display` | fluid, by the level | 0.95 to 1.1 | by the face | -0.01 to -0.04em |
| `title` | 1.75 to 3rem | 1.1 to 1.2 | 500 to 600 | -0.01 to -0.02em |
| `heading` | 1.125 to 1.5rem | 1.25 to 1.35 | 500 to 600 | 0 to -0.01em |
| `body` | 1 to 1.125rem | 1.5 to 1.75 | 400 | 0 |
| `small` | 0.8125 to 0.875rem | 1.4 to 1.5 | 400 to 500 | 0 |
| `label` (optional) | 0.75 to 0.8125rem | 1.2 to 1.4 | 500 | 0.04 to 0.08em in capitals |

A ratio (1.2 to 1.5) can give a first set of sizes. Then move them by eye. On the sites measured, the home page uses **two sizes** in the median, and none visibly follows a modular scale. Hierarchy also comes from weight, colour and space.

**The contrast between title and text follows the level.** Discreet when restrained, spectacular when radical. A radical page may jump straight from a huge display to body text, with little in between.

## Tokens
Tailwind's theme names, so a role is one class:

```css
:root {
  --text-display: clamp(2.5rem, 1.333rem + 5.185vw, 6rem);
  --text-display--line-height: 1;
  --text-display--letter-spacing: -0.03em;
  --text-display--font-weight: 700;
  --text-body: 1rem;
  --text-body--line-height: 1.65;
}
```

## Sizes in rem
`rem` lets text follow the size the reader set in the browser. `px` does not. WCAG does not require `rem`, since browser zoom enlarges `px` too: this is a heuristic. Line-height stays unitless, letter-spacing in `em`.

## Fluid sizes
Only large titles need them. Running text keeps a fixed `rem` size, with at most one step at a breakpoint. On the 17 pages measured, only 2 had fluid sizes.

The Utopia method: two viewports, two sizes, one line between them.

```
slope     = (max size - min size) / (max viewport - min viewport)
intercept = min size - slope × min viewport
font-size: clamp(min, intercept + slope × 100vw, max)
```

From 40 px at 360 to 96 px at 1440: slope 56 / 1080 = 0.05185, intercept 40 - 18.67 = 21.33 px.

```css
font-size: clamp(2.5rem, 1.333rem + 5.185vw, 6rem);
```

### The 2.5 limit
Browser zoom enlarges `rem` and `px`, not `vw`. A fluid title can therefore stop growing before reaching 200 %, which fails WCAG 1.4.4. Barvian showed that with a **maximum at most 2.5 times the minimum**, the text always reaches 200 % at the browser's 500 % zoom.

- 96 px at most needs at least 40 px on small screens (ratio 2.4).
- 120 px needs 48 px. This favours short, massive radical headlines.
- Above 2.5, it is not automatically a failure, but `type.js` must pass at every width.

| Broken | Fixed |
|---|---|
| `font-size: 8vw` | `clamp(3rem, 1.5rem + 6vw, 7rem)` |
| `clamp(16px, 8vw, 128px)` | A minimum at least 0.4 of the maximum, in `rem` |
| Every size fluid | Only `display` and `title` |

## Leading
It falls as size grows. Below, a long line needs more leading, so the eye finds the next one.

- The sites measured set reading text at **1.63 to 1.87** (median 1.68), above the usual 1.4 to 1.5.
- A short description in an interface can stay at 1.4 to 1.5.
- Tight leading is for short text. A title that wraps to three lines or more needs to open up.

## Tracking
- Large titles: slightly tighter, more as size grows.
- Reading text: `0`. Never tighten small text.
- Capitals and small caps: open, about 0.05em.
- Always in `em`. Kerning stays on.

## Weights
- Few of them: usually 400 and one or two heavier. The sites measured stay at or under 600.
- No weight under 400 below 28 px.
- With a variable face, an intermediate weight (450, 550) can be finer than the jump from 400 to 500.
- Emphasis in an interface: weight rather than italic. Italic stays for citations and stress in prose.
