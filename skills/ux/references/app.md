# App: the task path

An app is used to get something done, often again and again. Its unit is the **state**: every time the user faces a new set of actions, that is a new state. A page is a state; so is an open menu or dialog, because it offers new actions and needs a way out.

## Map the task
1. **Name the main task** and how often it is repeated. A daily task and a yearly one need opposite designs.
2. **Write the states** from start to finish. For each: what it shows, its actions, where each action leads, its way out.
3. **Walk the flow** without the happy path: nothing yet, a wrong entry, a failure, a change of mind.
4. **Cut steps** on the frequent path. Move rare or expert options out of its way.

## Page, panel or dialog?

```text
Will people share it, bookmark it or come back to it?
├─ yes → a page, with its own URL
└─ no → must they keep seeing what is behind it?
        ├─ yes → a panel beside the content
        └─ no → must they answer before anything else?
                ├─ yes → a dialog
                └─ no → inline, in place
```

## Broken → fixed

```text
Broken
  Settings: 24 options on one screen, no defaults.
  Filters are lost on reload.
  A tour of 7 steps explains the interface on first visit.

Fixed
  The 3 settings most people change, with defaults; the rest under "Advanced".
  Filters live in the URL, so a view can be shared and reopened.
  Each feature explains itself the first time it is useful.
```

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `goal-5` · Name the main task and how often it is repeated before any structure | frequency decides what must be fast and what may take a step more | heuristic | Studio | critic phase 2 |
| `path-8` · Model the task as states; each says where you are, what you can do and how to leave | a user who cannot tell these three things is lost | heuristic | UXMD, Nielsen | critic phases 2, 4 |
| `path-9` · The URL carries the state worth sharing or returning to: filters, tabs, pagination | a view that cannot be linked or reloaded is lost work | heuristic | Vercel | critic phase 4 |
| `path-10` · Frequent actions take the fewest steps; shortcuts serve experts without burdening novices | a small part of the product carries most of the use | heuristic | Nielsen, Laws of UX | critic phase 2 |
| `path-11` · Teach in context, at the moment of use: people start without reading | manuals and tours are skipped, a hint at the right moment is not | heuristic | Laws of UX, Nelson | critic phase 2 |
| `path-12` · Absorb complexity with good defaults rather than settings | some complexity cannot be removed, so the system should carry it | heuristic | Laws of UX, Salaja | critic phase 2 |
| `path-13` · A long task shows its progress and can be resumed | people need to see how far they are and must not lose their place | heuristic | Laws of UX, Salaja | critic phases 2, 4 |
| `path-14` · Show recent items and options rather than asking people to remember them | recognising is easier than recalling | heuristic | Nielsen, Nelson | critic phase 2 |
| `path-15` · Sort, group and offer a default; reveal advanced options on demand | decisions slow as options multiply, and hiding what people came for is worse | heuristic | Laws of UX, Salaja | critic phase 2 |
| `path-16` · Navigation stays within reach and shows the current place | people move between tasks and must keep their bearings | heuristic | Nelson, Nielsen | critic phases 2, 4 |
