# Colour intent (A1)

The lead asks about colour during the A1 interview, inside the existing rounds: no extra round. The answers become one line of `01-context.md`, **Colour intent**, which the art director starts from at C1 and C2.

## The questions
Ask them in the user's language, in plain words.

1. **What should the site make people feel?** Three words. Feelings or qualities ("calm, precise, warm"), not colours. If the user answers with colours, ask what those colours should make people feel.
2. **Does the project already have a visual identity, a logo or colours in use?** If yes: which ones (hex values, a logo file, a link to a page that uses them), and how binding they are:
   - **keep**: the colours stay as they are;
   - **may evolve**: they are a starting point the studio may adjust;
   - **free**: they exist, but the studio is not bound by them.
3. **Any colours to avoid, and why?** A competitor's colour, a colour with a bad association for this audience, a personal dislike. The reason matters: it tells the art director how wide the exclusion is.

"No idea yet" is a fine answer to any of them. Do not push the user to invent an answer.

## The line in `01-context.md`
One line of the context list, with its bold label, three parts in this order: the three words first, then `; existing identity: …; avoid: …`.

```text
- **Colour intent**: <three words>; existing identity: <colours or logo, then keep | may evolve | free, or none>; avoid: <colours and why, or nothing>
```

Examples:

```text
- **Colour intent**: calm, precise, warm; existing identity: logo in #1f3a5f (may evolve); avoid: bright red (reads as an alert in their sector)
- **Colour intent**: no idea yet; existing identity: none; avoid: nothing
```

The charter's board header reads the text before the first `;` as the three words, so keep the semicolons as shown, put no `;` or full stop inside the three words, and keep the three words first. The words stay the user's own, in their language; the label `**Colour intent**` stays as written even when the other headings of `01-context.md` are translated, because the board looks for it.

## Rules
- **Never invent an identity.** If the user has no logo or colours, write `none`. Do not deduce brand colours from a name, a sector or a competitor.
- Record what the user said, not your interpretation of it. Three words chosen by the user are worth more than three better words chosen by you.
- An existing identity marked **keep** is a constraint, not a suggestion: the art director builds around it and says so in `08-colour.md`.
- The three words describe a feeling to aim for. **Empirical finding**: what a colour makes people feel depends on its lightness, chroma and hue together, on the person and on the context (`meaning.md`). So the words guide the choices and the argument; they do not map to fixed colours.
- **Design heuristic**: asking for feelings before colours keeps the conversation on the site's purpose rather than on personal taste in hues. Leave it if the user arrives with a clear colour brief.
- No competitor colour analysis at A1. The studio runs one only if the user asks for it later.
