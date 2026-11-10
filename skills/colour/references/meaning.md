# Meaning: colour and emotion

What published studies found about colour and feeling, with the scope of each finding, and how meaning is built in a site. Each claim carries its kind: **Standard**, **Empirical finding** or **Design heuristic**.

How to use this file: a finding informs a choice and can be cited in `08-colour.md` with its scope ("in this study…"). It never promises what a visitor will feel. No study here tested websites: they used colour fields, colour patches or colour words.

## Lightness, chroma and hue together
- **Empirical finding**: Wilms & Oberfeld (2018, *Psychological Research* 82(5)) showed 62 observers fields of coloured LED light, varying hue, saturation and brightness in a full factorial design, and measured felt arousal and valence. More saturated and brighter colours raised arousal. Valence was highest for saturated, bright colours, and it also depended on hue. Several effects interacted: for example, the higher valence of blue appeared only at high saturation. Their conclusion: the emotional effect of a colour depends on all three dimensions and on their interactions, not on hue alone.
- Scope: one lab, one population of observers, large uniform light fields, no context, no content. A website's colours sit next to each other, under text and images, on many screens.
- **Design heuristic**: so "character before hue" (settle lightness and chroma, then pick hues) is a working order the studio uses, supported by this finding. It is not a law: hue had effects of its own in the same study.

## Shared associations, with variation
- **Empirical finding**: Jonauskaite et al. (2020, *Psychological Science*) asked 4,598 participants in 30 nations, in 22 languages, to associate 20 emotion concepts with 12 colour **terms** (words such as "red", not colour samples). Association patterns were largely shared: the average similarity between nations was r = .88. Nation still predicted the associations beyond that shared pattern, and nations closer in language or geography had more similar patterns.
- Scope: colour words, not displayed colours; an online questionnaire; the study measures associations, not felt emotion. A word like "red" covers many very different colours.
- So shared associations may be relied on as a tendency, while knowing the audience matters: a site for one country or one community can differ from the average.

## Liking follows what a colour evokes
- **Empirical finding**: Palmer & Schloss (2010, *PNAS*) proposed the ecological valence theory: people tend to like a colour to the degree that they like the things they associate with it (clear sky and clean water for many blues; spoiled food or waste for some dark yellows and browns). In their data, the average liking of the associated objects accounted for much of the average preference for each colour.
- Scope: average preferences of the participants tested, for isolated colour patches; individual preferences vary and shift with experience.
- **Design heuristic**: what a colour evokes in this audience, in this context, is a better guide than a colour's supposed universal meaning. A colour the site pairs with good things can come to be liked for them.

## Colour emotion scales (Ou et al. 2004)
- **Empirical finding**: Ou, Luo, Woodcock & Wright (2004, *Color Research & Application* 29), a study in three parts:
  - **Part I**: 31 observers (14 British, 17 Chinese) rated 20 colours on 10 emotion scales. The ratings reduced to three factors, colour activity, colour weight and colour heat. The authors modelled four scales (warm–cool, heavy–light, active–passive, hard–soft) from each colour's CIELAB values.
  - **Part II**: for a **two-colour** combination, the emotion rating was close to the **mean** of the ratings of its two colours. This additive rule did **not** hold for preference: liking a pair is not the mean of liking each colour.
  - **Part III**: preference for single colours was modelled from the three factors (R² = .67).
- Scope: a small sample from two cultures, patches seen under controlled conditions, pairs shown at equal areas. Nothing in these papers validates a mean over more than two colours, or a weighting by surface.
- **The equations are not included in this version.** Their verification on the printed papers is pending. Never compute, recall or guess the models' coefficients, and never present an emotion score for a palette. Use these findings in words only.

## Meaning is built in the site
- **Design heuristic**: a colour comes to mean what the site keeps pairing it with. If the accent is on every action and nowhere else, it soon reads as "you can act here". If it also decorates headings, it stops meaning anything. This is why the colour logic fits in one sentence and holds everywhere.
- **Standard**: whatever a colour comes to mean, it never carries information alone (WCAG 2.2, SC 1.4.1).
- There is no symbolism table in this skill. A table that maps a hue to a fixed meaning ("blue means trust") ignores lightness, chroma, context, culture and the site's own pairings, which the findings above show all matter.
- When `08-colour.md` uses a finding, it names the study and its scope; when it uses a heuristic, it says so.
