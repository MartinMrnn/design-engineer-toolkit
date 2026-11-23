# Pairing: one family or two

## Decide

```
Does one family hold the level, the text and every role?
├─ yes → one family. Stop here.
└─ no → does the headline need a voice the text cannot have?
        ├─ yes → a headline face + a text face, with a stated role each.
        └─ no → one family, and put the gesture in scale, width or weight.
```

On the nine sites measured for this skill, all set their main text in one sans, and three add a small accent face (4 to 18 % of the characters). One family is the normal case. A third face needs a job the first two cannot do, such as code or data.

## What makes a good pair
- **A clear difference of voice.** Serif and sans is the usual case, but the real principle is a contrast the eye understands at once: display and text, wide and narrow, drawn and neutral, mono and proportional.
- **Something shared underneath.** A similar x-height, similar proportions, or a similar era and construction.
- **A job for each.** Write it: `Headline: <face>. Everything else: <face>.`

## Broken and fixed

| Broken | Why | Fixed |
|---|---|---|
| Two geometric sans | The difference is visible but has no meaning | One of them, in two weights |
| A display face in the paragraphs | It tires the eye | Display on a few words, a text face below |
| A second face used "here and there" | Nobody can tell its role | One stated role, or remove it |
| An expressive headline and an expressive text | Both shout | One voice, one quiet partner |
| A serif word that looks smaller in a sans title | Their x-heights differ | Even them with `font-size-adjust` |

## Evening out two faces
When two faces meet on one line, compare their `xHeight` on the board. A visible gap is corrected on the smaller one:

```css
.title em {
  font-family: var(--font-heading);
  font-size-adjust: 0.52; /* the x-height of the face around it */
}
```

## Tokens
Use the names of shadcn and Tailwind:

```css
:root {
  --font-sans: "Text Face", system-ui, sans-serif;
  --font-heading: "Headline Face", var(--font-sans);
  --font-mono: "Mono Face", ui-monospace, monospace;
}
```

With one family, `--font-heading` is `var(--font-sans)`. If the running text is a serif, name it `--font-serif` and set it on `body`, rather than putting a serif in `--font-sans`. Add `--font-mono` only if the project shows code or data.
