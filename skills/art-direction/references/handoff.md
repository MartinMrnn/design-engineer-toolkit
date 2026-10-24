# The handoff kit

The kit is what the frontend developer builds from. Everything in it comes from the approved mockups and motion; nothing new is designed here.

## design/kit/tokens.css
One `:root` block, grouped and commented by family. The values below show the expected names; replace each one with the approved value:

```css
/* Fonts: paste the approved @import or <link> lines here, as a comment. */
:root {
  /* Colour, by role */
  --color-ground: #f5f1ea;
  --color-ink: #1a1a1a;
  --color-ink-muted: #5c5750;
  --color-accent: #b4532a;
  --color-line: #d9d2c7;
  /* Type */
  --font-display: "Display Family", serif;
  --font-text: "Text Family", sans-serif;
  --text-sm: clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --text-4xl: clamp(3rem, 2rem + 5vw, 6rem);
  --leading-tight: 1.05;
  --leading-body: 1.55;
  --tracking-tight: -0.02em;
  /* Space */
  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px;
  --space-5: 40px; --space-6: 64px; --space-7: 120px;
  /* Shape */
  --radius-s: 4px;
  --radius-m: 12px;
  /* Icons, when the mockups use them */
  --icon-s: 18px;
  --icon-m: 24px;
  /* Layout */
  --hero-min-height: 100svh;
  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 180ms;
  --duration-base: 500ms;
  --duration-slow: 900ms;
}
```

Every value used in the approved mockups and motion exists here, and nothing else.

## design/kit/components.html
One page that shows every component used in the mockups, each with its states: default, hover, focus, active, and disabled, error or empty where they apply. Use real copy. Typical components: navigation (desktop and the mobile pattern of the B2 plan, open and closed), buttons, links, cards or list items, form fields and choices with their icons, footer with its legal links, the 404 page's content, and any signature component. Show the icons used, with their names.

## design/kit/media.md
One table for the images, videos and fonts of the approved mockups and motion, built from their Sources lists. Assets of rejected proposals stay out:

| Asset | Used on | Source URL | Author | Licence | Status |
|---|---|---|---|---|---|
| Opening photo | home | https://unsplash.com/photos/… | name | Unsplash License | final |
| Team photo | about | — | — | — | to replace |
| Display Family | all pages | https://fonts.google.com/specimen/… | foundry | OFL | final |
| Icons (Hugeicons free, stroke rounded) | coffees, footer | https://hugeicons.com | Hugeicons | free, commercial use, no attribution | final |
