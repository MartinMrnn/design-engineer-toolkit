---
name: ux
description: The design studio's UX method, usable on its own. Turns a brief into a narrative page plan, or audits an existing page, through six decisions - goal, path, thread, words, behaviour, states. Every rule has its reason, its kind of evidence, its source and its check. Use for page plans, user paths, information architecture, micro-copy, interaction behaviour, interface states, or a UX review.
---

# UX

Decide how a product works for the person using it, before anything is drawn: who arrives, what they came for, the path they follow, what they read, how the interface answers them, and what happens when things go wrong.

## What this skill decides
Structure, content and behaviour. **Never appearance**: no colour, type, shadow, border, decorative motion or CSS. `layout` owns visual grouping, `components` builds what is decided here, `motion` animates it.

## Two entries
- **A brief** gives a narrative plan: in `design/content.md` inside a design-studio project (a folder with `design/decisions.md`), in the conversation otherwise.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. A fact you do not have is written `[à fournir : what]`, never guessed.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names the `check.js` measure, or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. It does not turn a heuristic into a proven law. Used alone, without `check.js` or the critic, check these rules by hand and list what you could not verify.

## The six decisions
Take them in order: each one constrains the next.

### 1 · Goal
Who arrives, from where, with what question, and which single action counts? Writes `Goal`, `Arrives from` and `Main action`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `goal-1` · For every page, the plan or brief states who arrives, with what question, and the one action that counts | without a goal, nothing can be judged necessary or missing | heuristic | Studio | critic phase 2 · blocking |
| `goal-2` · A page serves one to three intents, in the visitor's words | a page written for everyone answers no one | heuristic | Studio | critic phase 2 |

### 2 · Path
The main path, step by step from arrival to the action, then the secondary paths. A showcase follows the visitor's questions (`references/showcase.md`). An app follows the task, as a flow of states (`references/app.md`).

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `path-1` · The main action exists and can be reached step by step from arrival | a page that cannot lead to its action fails its goal | heuristic | Studio | critic phases 2, 4 · blocking |
| `path-2` · Every page and state has a way back or out; an overlay closes with Escape and focus returns | people take wrong turns and must leave without damage | heuristic | Nielsen | critic phases 2, 4 |

### 3 · Thread
The page is one line of reasoning, not a stack of blocks. Each section answers the question the previous one left and raises the next. Hero, features or testimonials are not owed to any page.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `thread-1` · Each section answers a question the visitor really has | a section with no question exists for the template, not the visitor | heuristic | Studio | critic phase 2 · blocking |
| `thread-2` · Each section answers the question the previous one left | without it the page reads as a list of sealed blocks | heuristic | Studio | critic phase 2 · blocking |
| `thread-3` · If removing a section breaks nothing, remove it | what carries no argument only delays the action | heuristic | Studio | critic phase 2 |
| `thread-4` · Rank each view: what must be seen, what helps decide, what can wait. A test, not a template | attention goes to what serves the current goal, and the rest is missed | heuristic | Studio, Laws of UX | critic phase 2 |

### 4 · Words
Real content in the site's language. Read `references/words.md` before writing copy.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `words-1` · Never invent a fact, even one that is plausible for the trade; write `[à fournir : what]` | an invented fact in a client's mouth is a liability, a visible gap is honest | heuristic | Studio | critic phases 2, 3, 4 · blocking |
| `words-2` · A button names the action and its result | people should know what happens before they press | heuristic | Vercel, Studio | critic phases 2, 4 |

### 5 · Behaviour
What responds and when, what can be undone, what is forgiven, what works from the keyboard. Read `references/behaviour.md` when the page has more than plain links.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `behaviour-1` · Every action gets a visible response | without one, people repeat the action or give up | heuristic | Nielsen | critic phase 4 |
| `behaviour-2` · Every action works from the keyboard | some people cannot use a pointer | standard (WCAG 2.1.1) | W3C | script keyboard · blocking |

### 6 · States
Ideal, empty, loading, error, success and limit. Read `references/states.md` for what each must do and the worst data to try.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `states-1` · Every state that can happen is planned: ideal, empty, loading, error, success, limit | the ideal case is the one that needs design the least | heuristic | Studio | critic phases 2, 4 · blocking |

## The narrative plan

```markdown
## Accueil
Goal: someone whose bike broke down books a repair.
Arrives from: search, a map.
Main action: Réserver une réparation
Intents: « Peut-on m'aider ? », « Combien ça coûte ? »
Paths: main, Accueil → Réservation; secondary, Accueil → Tarifs → Réservation.
Objections: « Ça va me coûter trop cher », answered by the price list.
Priority: first the repairs and the action, then the steps, last the address.

1. « Cet atelier répare-t-il mon vélo ? »
   → Réparation de vélos à Nantes, de la crevaison à la révision complète.
   Leads to: « Comment ça se passe ? »
2. « Comment ça se passe ? »
   → Les 3 étapes, avec leurs délais.
   Leads to: « Combien ça coûte ? »

Behaviour: the form keeps what was typed after an error.
States: sent → says what happens next; send error → keeps the text, offers a retry.
To provide: each `[à fournir]` of the page, and what it blocks.
```

Keep these labels and write their values in the site's language. What all pages share (navigation, 404) goes first, in a `## Whole site` block. A missing fact that blocks the main path stays marked and listed, never filled: the plan can be approved, the page cannot ship until the fact is given. **An app screen** lists states instead of sections:

```markdown
## Invoices
Goal, Arrives from, Main action: as above.

### List
Shows: what the state displays.
Actions: New invoice → Editor; Open → Detail.
Way out: the main navigation.
```

## The audit
Read the references that match what the page contains. If the project has a brief or an approved plan, compare the page with them first. Write in the language of the conversation.

```markdown
## Audit · <page>
### Goal
1. <blocking|to fix|suggestion> · <the defect> · evidence: <quote or selector> · rule: `<id>`, or the file and section it departs from
### Path
### Thread
### Words
### Behaviour
### States
### Outside this skill
<defects seen that belong elsewhere, such as contrast, and which skill owns them>
### Not seen
<what could not be checked from what you were given>
```

- **Blocking:** a broken `blocking` rule, a WCAG A or AA failure even outside this skill, or a need of the brief left unmet.
- **To fix:** another broken rule, or a departure from the approved content.
- **Suggestion:** an improvement no rule demands, with `rule: none`.
- A defect that breaks several rules cites them all and keeps the highest severity. A section with no defect says `none`.
- A choice stated in the brief or in `decisions.md` is not a defect, even against a heuristic: note it. When approved content itself breaks a rule, report it at its severity and say that the fix needs whoever approved it.

## References
- `references/showcase.md`: building the thread of a showcase, trust, navigation. For sites that persuade.
- `references/app.md`: the task as a flow of states, repeated use. For SaaS and internal tools.
- `references/words.md`: real content and micro-copy, broken → fixed. Before writing copy.
- `references/behaviour.md`: feedback, undo, forms, keyboard, decision trees. When the page has more than plain links.
- `references/states.md`: the six states and the worst data. Before writing the `States` line.
- `references/laws.md`: the laws of UX, what each really says and how it gets misused. When a law is invoked or disputed.
- `references/sources.md`: every source and its licence. Not needed during a project.
