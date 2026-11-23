# States

The ideal case is where a design starts and where most generated interfaces stop. For each element that shows data or takes an action, decide what happens in every state that can occur.

## Which states apply

| Element | Empty | Loading | Error | Success | Limit |
|---|---|---|---|---|---|
| List or search | no item, no result | yes | could not load | — | very long list, very long item |
| Form | — | while sending | field error, send error | sent | long values, pasted text |
| Action | — | beyond 1 s | refused, failed | done | double click |
| Media | no image | yes | failed to load | — | odd ratio, very large file |
| Text from data | missing field | — | — | — | very long, one letter |
| Page | — | — | 404 | — | long words, translated text |

A plan names the states that apply and says what each one does, in a line. A state that cannot occur is left out.

## What each state must do
- **Empty** is often the first thing a new user sees. Say why it is empty and offer the first action. Distinguish "nothing yet" from "no result for this search".
- **Loading** shows only when the wait is perceptible. Keep the page's structure in place, and never block the whole page for one part.
- **Error** says what failed, keeps what the user entered, and offers a retry or another way.
- **Success** confirms what happened and gives the next step. It is the last thing people remember of the task, so it is never a dead end.
- **Limit** is what real data does to a design made with tidy examples.

## The worst data
Try these before calling a state done:

- a very long name, and a one-letter name;
- a long unbreakable string: an email, a URL, a reference;
- a missing field, a missing image;
- zero, exactly one (plural forms), and thousands of items;
- a very large number, a negative one;
- non-Latin text, a right-to-left language, emoji;
- a very old date, a date in the future.

## Broken → fixed

```text
Broken: a list that renders an empty box when there are no results.
Fixed:  "No result for 'contrat'. Check the spelling or see all documents."

Broken: one failed widget turns the whole dashboard into an error page.
Fixed:  that widget says it could not load and offers a retry; the rest works.

Broken: "Thank you!" and nothing else after a booking.
Fixed:  what was booked, when, what happens next, how to change it.
```

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `states-2` · Empty explains why and offers the first action | an empty screen looks broken and leaves people with nothing to do | heuristic | Freiberg, Vercel, Studio | critic phases 2, 4 |
| `states-3` · Loading keeps the structure and appears only when the wait is perceptible | a stable page keeps people oriented, and a loader that only flashes by distracts them | heuristic | Salaja, Nielsen | critic phase 4 |
| `states-4` · Error says what failed, keeps the user's work and offers a retry | an error people can recover from is an inconvenience, not a loss | heuristic | Nielsen, Studio | critic phases 2, 4 |
| `states-5` · Success confirms what happened and gives the next step | the end of a task weighs heavily in how it is remembered | heuristic | Laws of UX, Salaja | critic phases 2, 4 |
| `states-6` · Hold under worst data: very long, one letter, missing, huge, non-Latin, missing image | real content breaks what tidy examples never test | heuristic | Kowalski, Vercel | critic phase 4 |
| `states-7` · A long list has a strategy: filter, search or pagination | beyond a screen or two, people need a way to find rather than scroll | heuristic | Studio | critic phases 2, 4 |
| `states-8` · One part failing never breaks the whole page | content should survive a failed script or request | heuristic | Coursey, Studio | critic phase 4 |
