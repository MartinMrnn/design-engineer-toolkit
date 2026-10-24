# Imagery

## Sources (free)
- **Unsplash** (unsplash.com) and **Pexels** (pexels.com): free to use, including commercially, under their own licences. Credit the photographer anyway.
- Skip images marked "Unsplash+": they come under a separate subscription licence that only the subscriber may use, not under the free Unsplash License. Their files are usually served from plus.unsplash.com.
- Size images through the URL rather than downloading huge files: Unsplash accepts `?w=1600&q=80`, Pexels `?auto=compress&w=1600`.
- Note every asset in your proposal's Sources list: what it shows, URL, author, licence. At D1, the assets of the approved files go into `design/kit/media.md`; those of rejected proposals stay out.

## Choosing
- Pick images that carry the intent: light, place, material, people, scale. One strong image beats many weak ones.
- Keep one treatment across the site: same light, same colour temperature, same cropping logic.
- When an image stands for something real the client must provide (their team, their premises, their products), mark it as a placeholder: `alt="[to provide: photo of the team]"`, and list it as "to replace" in the Sources list.
- Never present stock people as the client's real team or customers.

## Treatment in CSS
- Cropping: `object-fit: cover` with a chosen `object-position`.
- Duotone or tint: a colour layer with `mix-blend-mode`, or a CSS `filter`.
- Grain, only when the direction calls for physical matter (`references/defaults.md`): a small SVG `feTurbulence` filter as an overlay, at low opacity, or better a real scan.
- Always set `width` and `height` (or `aspect-ratio`), so the layout does not jump.
- Export images at twice their displayed width, so they stay sharp on high-density screens.

## Icons
Icons help the brain understand when words alone make a choice slow: options to pick (sizes, methods, categories), states (full, sold out, done), actions people know by their symbol (close, menu, search, back), and wayfinding (address, hours, phone). They are never decoration: no icon in front of every heading, no icon grid standing in for content (`references/defaults.md`).
- **Library: Hugeicons, free set** (hugeicons.com): free for personal and commercial use, no attribution required. Use one style for the whole site (stroke rounded by default) and match its stroke to the weight of the text face.
- **In proposals and mockups**: the free icon font is quickest: `<link rel="stylesheet" href="https://cdn.hugeicons.com/font/hgi-stroke-rounded.css">`, then one `<i>` per icon with the class names given in the quick start (docs.hugeicons.com/icons-for-web/quick-start). Check each icon's name on hugeicons.com.
- **In `site/`**: inline the SVG of each icon used (copied from its page on hugeicons.com), with `stroke="currentColor"`, so the mockup does not depend on the icon font.
- An icon sits next to a visible label, unless its meaning is universal (close, menu, search); then it gets an `aria-label` on its button. Decorative icons next to a label get `aria-hidden="true"`.
- Size icons with tokens (`--icon-s`, `--icon-m`), aligned optically with the text they accompany.
- List Hugeicons once in the Sources list and in `design/kit/media.md` (source, licence).
