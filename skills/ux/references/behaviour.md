# Behaviour

How the interface answers. This file says what must happen, never what it looks like: `components` builds it, `motion` animates it.

## What feedback for this action?

```text
How long will people wait?
├─ under 0.1 s → the result alone: it feels instant
├─ 0.1 to 1 s → the result: the delay is noticed, the train of thought holds
├─ 1 to 10 s → a sign that the system is working
└─ over 10 s → progress, how much is left, a way to cancel
```

Is the action safe and likely to succeed? Then update at once, and if the server refuses, roll back and say why.

## Undo, confirm or neither?

```text
Can the action be reversed?
├─ yes, at no cost (a toggle, a filter) → do it at once
├─ yes, for a while (archive, delete to a bin) → do it, offer undo
└─ no (permanent deletion, payment, sending) → confirm, naming what will be lost
```

A confirmation on every action gets clicked without being read. Keep it for what cannot be undone.

## Forms
- **Submit stays enabled.** A disabled button explains nothing, and a keyboard cannot reach it. Validate on submit, show the error on its field, move focus to the first error. Disable the button only while sending, to avoid a double submission.
- **Keep what was typed**, always, including after an error or a failed send.
- **Be liberal in what you accept**: spaces in a phone number, several date formats. Normalise it yourself. If a value is ambiguous, ask rather than guess.

## Broken → fixed

```text
Broken: a save with no sign of life; the user clicks three times.
Fixed:  the button shows it is saving, then the result; a second click does nothing.

Broken: "Delete" removes the item at once, for good.
Fixed:  the item is removed and "Undo" is offered for a few seconds.

Broken: the form empties after a server error.
Fixed:  the form stays filled, the error says what to do, focus goes to it.
```

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `behaviour-3` · Match feedback to the wait: instant, then a sign of activity, then progress and a way to leave | silence during a wait reads as failure | heuristic | Nielsen | critic phase 4 |
| `behaviour-4` · Aim to respond within 400 ms; when an action is safe, update at once and roll back with an explanation | a fast answer keeps people in their task | heuristic | Laws of UX, Salaja, Freiberg | critic phase 4 |
| `behaviour-5` · Prefer undo; confirm only what is irreversible, such as leaving with unsaved work | undo protects without interrupting | heuristic | Nielsen, Vercel | critic phases 2, 4 |
| `behaviour-6` · Submit stays enabled and is disabled only while sending | a disabled button hides why and blocks the keyboard | heuristic | Vercel, Freiberg | critic phase 4 |
| `behaviour-7` · An input error names the field and describes the problem in text | people must find the error and understand it without relying on sight | standard (WCAG 3.3.1) | W3C | critic phase 4 · blocking |
| `behaviour-8` · Within a process, never ask again for what was already entered | retyping costs effort and excludes people with memory difficulties | standard (WCAG 3.3.7) | W3C | critic phase 4 · blocking |
| `behaviour-9` · Accept messy input and normalise it; allow paste; Enter submits | the system should carry formatting, not the person | heuristic | Laws of UX, Salaja, Vercel, Freiberg | critic phase 4 |
| `behaviour-10` · Fields about the user declare their purpose | browsers and assistive tools can then fill them in | standard (WCAG 1.3.5) | W3C | critic phase 4 · blocking |
| `behaviour-11` · Focus moves in an order that preserves meaning | a jumping focus makes a page impossible to follow by keyboard | standard (WCAG 2.4.3) | W3C | critic phase 4 · blocking |
| `behaviour-12` · Keyboard focus is visible | without it, keyboard users do not know where they are | standard (WCAG 2.4.7) | W3C | script focus-visible · blocking |
| `behaviour-13` · The keyboard is never trapped | a trap leaves keyboard users unable to go on | standard (WCAG 2.1.2) | W3C | critic phase 4 · blocking |
| `behaviour-14` · Targets are at least 24 px, except where the criterion allows | small targets exclude people with limited motor control | standard (WCAG 2.5.8) | W3C | script axe · blocking |
| `behaviour-15` · Aim for 44 px on main touch actions; nothing depends on hover | fingers are imprecise, and touch screens have no hover | heuristic | Krehel, Freiberg, Fitts 1954 | critic phase 4 |
| `behaviour-16` · A path or multi-finger gesture has a single-pointer alternative | not everyone can perform a gesture | standard (WCAG 2.5.1) | W3C | critic phase 4 · blocking |
| `behaviour-17` · A status change is announced without moving focus | screen reader users must learn the result of what they did | standard (WCAG 4.1.3) | W3C | critic phase 4 · blocking |
| `behaviour-18` · Forgive near misses: no dead gaps between adjacent targets | a click that lands between two items should not be lost | heuristic | Freiberg | critic phase 4 |
| `behaviour-19` · Changing a field never changes the context by surprise | an unexpected jump disorients and can lose work | standard (WCAG 3.2.2) | W3C | critic phase 4 · blocking |
