# Themes: roles, scales, light and dark

## The roles
`tokens.css` uses the shadcn names. Each surface is paired with a `-foreground` for what sits on it, which is how `colour.py palette` finds the pairs to measure.

| Token | Job |
|---|---|
| `--background`, `--foreground` | the page and its text |
| `--card`, `--card-foreground` | raised surfaces |
| `--popover`, `--popover-foreground` | menus and floating panels |
| `--primary`, `--primary-foreground` | **the accent of this skill**: main actions |
| `--secondary`, `--secondary-foreground` | secondary actions |
| `--muted`, `--muted-foreground` | quiet surfaces and secondary text |
| `--accent`, `--accent-foreground` | **in shadcn, a hover or highlight background**, not the brand accent |
| `--destructive`, `--success`, `--warning`, `--info` | states, each with a word or an icon too |
| `--border`, `--input` | separators and field borders |
| `--ring` | the focus indicator |

Only the roles the project needs exist. Add a project role with the same pattern: `--highlight` and `--highlight-foreground`.

```css
:root {
  --background: oklch(0.975 0.012 85);
  --foreground: oklch(0.24 0.02 60);
  --card: oklch(0.99 0.006 85);
  --card-foreground: var(--foreground);
  --primary: oklch(0.42 0.11 255);
  --primary-foreground: oklch(0.985 0.005 85);
  --muted: oklch(0.93 0.014 85);
  --muted-foreground: oklch(0.46 0.02 70);
  --border: oklch(0.87 0.016 85);
  --ring: var(--primary);
}
```

## Scales whose steps have a job
A scale from 50 to 900 says nothing about use. Radix Colors gives each of its 12 steps a job, a useful model when a project needs a full scale:

| Steps | Job |
|---|---|
| 1, 2 | page and subtle backgrounds |
| 3, 4, 5 | component backgrounds: normal, hover, pressed or selected |
| 6, 7, 8 | borders: subtle, interactive, strong and focus |
| 9, 10 | solid colour: normal, hover |
| 11, 12 | text: low contrast, high contrast |

Radix states its text guarantee in APCA, which is not the studio's standard. Always measure the pairs in WCAG 2.2 with `palette`.

## One theme
Choose the theme that serves the site best, light or dark, and do it well. Say why in the palette entry. A second theme is made only when the brief or the user asks for it.

## Building a second theme
Rebuild it by roles, never by inverting values.

- Keep the hues. Lower the chroma of large surfaces: saturation looks stronger on dark.
- Dark grounds are rarely pure black. Elevation goes **lighter**, because shadows disappear on dark.
- Move the accent's lightness until it reads on the new ground, and give it its own `--primary-foreground`.
- Redefine only what changes under `.dark` or `[data-theme="dark"]`. A theme inherits the rest.
- Run `palette` on both themes. A pair that passes in one can fail in the other.

To avoid a flash of the wrong theme, set it before first paint: an inline script in `<head>`, or a class rendered by the server. In Next.js, `next-themes` does this.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `roles-4` · Every surface that holds text has its `-foreground` | the pair is then explicit and measured | heuristic | shadcn | colour palette + critic phase 2 |
| `roles-5` · The brand accent is `--primary`; `--accent` stays a hover or highlight background | the same word means two things, and confusing them breaks shadcn components | heuristic | shadcn | critic phases 2, 4 |
| `roles-6` · On a dark theme, higher surfaces are lighter | shadows no longer show the elevation | heuristic | Linear, Studio | critic phases 2, 4 |
| `roles-7` · A site with two themes never flashes the wrong one on load | a flash of light in a dark theme is jarring | heuristic | next-themes | critic phase 4 |
