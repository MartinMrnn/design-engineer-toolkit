# Words

Content is the interface. It is written first, in the site's language, and it decides the structure rather than filling it.

## Write from facts
**The competitor test.** Read every headline and action and ask: could a competitor publish this unchanged? If so, rewrite it with something only this client can say: a fact, a place, a method, a number, a name.

**Never invent** names, figures, prices, dates, addresses, awards, reviews, quotes, team members or client logos. Without the fact, write `[à fournir : what]`.

## Voice
- The words customers use, not the trade's internal vocabulary or marketing language.
- Short sentences, active verbs. Say what happens and who does it.
- Follow the language's own conventions. Title Case is an English habit; a French site does not capitalise every word.
- No exclamation marks in interface copy.

## Broken → fixed

| Where | Broken | Fixed |
|---|---|---|
| Headline | Your trusted partner | Family law in Lyon, from the first meeting to the judgement |
| Button | Get started | Book a first call |
| Link | Click here | See the fees |
| Field error | Invalid input | Enter a date like 14/03/2027 |
| Send error | Something went wrong | Your message was not sent. Check your connection and try again; your text is kept |
| Empty state | No data | No invoices yet. Create the first one to send it to a client |
| Confirmation | Success! | Request sent. You will get a reply by email |
| Destructive | Are you sure? OK / Cancel | Delete this invoice? It cannot be recovered. Delete invoice / Keep it |

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `words-3` · A headline says what, for whom, where or how | a concrete headline does the work a slogan only promises | heuristic | Studio | critic phase 2 |
| `words-4` · If a competitor could publish it unchanged, rewrite it with a fact of this client | interchangeable copy gives no reason to choose this one | heuristic | Studio | critic phase 2 |
| `words-5` · Use the visitor's words, never internal jargon | people understand an interface through what they already know | heuristic | Nielsen | critic phase 2 |
| `words-6` · One idea per sentence, verbs rather than nouns | people scan, and dense sentences lose them | heuristic | Studio | critic phase 2 |
| `words-7` · No empty superlatives | "best-in-class" or "seamless" says nothing and costs trust | heuristic | Studio | critic phase 2 |
| `words-8` · A link says where it leads, by its text or its context | people and screen readers decide from the link alone | standard (WCAG 2.4.4) | W3C | critic phases 2, 4 · blocking |
| `words-9` · An input error suggests the fix when it is known | naming a problem without a way out leaves people stuck | standard (WCAG 3.3.3) | W3C | critic phases 2, 4 · blocking |
| `words-10` · An empty state says why it is empty and what to do | an empty screen looks broken and offers no next step | heuristic | Freiberg, Studio | critic phases 2, 4 |
| `words-11` · A confirmation says what happened and what comes next | people need to know it worked and whether to wait for something | heuristic | Studio | critic phases 2, 4 |
| `words-12` · A control with the same function keeps the same name across pages | a changed name reads as a different function | standard (WCAG 3.2.4) | W3C | critic phases 2, 4 · blocking |
| `words-13` · Copy follows the site's language and its conventions | a translated habit reads as careless | heuristic | Studio | critic phase 2 |
| `words-14` · A field that needs input has a label or instructions | people must know what is expected before they type | standard (WCAG 3.3.2) | W3C | script axe + critic phase 4 · blocking |
| `words-15` · Chunk what must be held in memory; never cap what stays visible | memory is short, but what stays on screen need not be remembered | empirical finding | Miller 1956, Cowan 2001 | critic phase 2 |
