# Setting: the details of reading

## Measure
**60 to 85 real characters per line** for reading text on a wide screen, spaces included. Leaving this range takes a written reason.

On a phone, the screen decides: at 390 px, 16 to 18 px text holds about 40 to 55 characters. Keep the text size and normal margins, and never shrink the text to reach 60. `type.js` reports this line in `measure.phone`, with no verdict.

Why not the classic 45 to 75:

- Dyson and Kipping (1998): lines of 100 characters were read faster than lines of 25 with the same comprehension, yet readers judged 55 easiest and the long lines hardest. Speed and comfort do not point the same way.
- On the eight reading pages measured for this skill, the median is **86 characters**, from 72 to 109, and seven are above 75.
- WCAG 1.4.8 (level AAA, not required here) asks for at most 80.

**`ch` is not a character.** It is the width of the `0`, wider than the average letter. `65ch` usually holds 80 to 90 characters. Set the width in `rem` or `ch`, then **count with `type.js`**, because each face runs differently.

```css
.prose { max-width: 34rem; } /* then check measure.median in the audit */
```

Lock the width and let the margins move. Interface text, such as a card or a label, is not reading text: this range does not apply to it.

## Alignment
- Reading text aligns to the start.
- Centre only short blocks: a hero title, up to three or four lines, a quotation.
- If titles align left, their subtitles do too.
- `justify` only in an editorial layout, with `hyphens: auto` and the right `lang`.

## Wrapping

| Text | Use |
|---|---|
| Titles and short descriptions | `text-wrap: balance` (Chromium stops at 6 lines) |
| Paragraphs, captions, list items | `text-wrap: pretty` |
| Code, preformatted text | Neither |
| Labels and badges | `white-space: nowrap` |
| Long words, links, ids | `overflow-wrap: break-word` |

A truncated text needs a way back to the whole text.

## Figures
- Changing values, prices, timers and table columns: `font-variant-numeric: tabular-nums`.
- Figures in prose stay proportional. If the face has them, `oldstyle-nums` blends into the text.
- `slashed-zero` where `0` and `O` can be confused, such as codes.
- Use the properties rather than `font-feature-settings`. Keep raw tags for features with no property, such as `"ss01"`.

## Punctuation

| Instead of | Use |
|---|---|
| `"text"` in English | “text” |
| `"texte"` in French | « texte », with non-breaking spaces inside |
| `...` | … |
| `-` in a range | – (`2010–2026`) |
| `--` for an aside | — in English, – in French |
| `'` | ’ |
| `10 km`, `12 %` | a non-breaking space before the unit |

In French, a narrow non-breaking space (`&#8239;`) goes before `;`, `!` and `?`, and a non-breaking space before `:`. Code keeps straight quotes. Set `lang` on the page so that the browser hyphenates and quotes correctly.

In a title, tie a short word (`à`, `de`, `le`, `et`) to the next one with a non-breaking space, so it is not left alone at the end of a line.

Store text in natural case and set capitals with `text-transform`.

## Rendering
- `-webkit-font-smoothing: antialiased` once, on the root. Seven of the nine sites measured do it. It only affects macOS.
- `font-optical-sizing` stays at `auto`.
- Links: `text-underline-offset` and `text-decoration-thickness: from-font` keep the line off the descenders. Never `text-decoration-skip-ink: none`.
- A weight must not change on hover. To signal a state, change colour or underline instead.
- Text stays selectable. `user-select: none` belongs on drag surfaces only.
