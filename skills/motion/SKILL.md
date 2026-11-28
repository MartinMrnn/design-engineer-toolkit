---
name: motion
description: The design studio's motion method, usable on its own. Turns a brief into the motion of a direction, or audits the motion of an existing page, through six decisions - level, purpose, timing, easing, choreography, proof. Built on Emil Kowalski's animation framework and a measure of 23 real sites, checked by a script, motion.js. Use for deciding whether something should animate, durations, easing curves and springs, exits, interruption, staggering and choreography, morphing and shared-element transitions, scroll-driven motion, page transitions, reduced motion, or a motion review.
---

# Motion

Motion first makes a site feel **harmonious, fast and fluid**; then, where the direction asks, it carries one memorable gesture. Give a project motion that serves it, and never commit its faults: **motion without a purpose, motion on what is used often, a slow interface, the motion cliché, and motion that ignores reduced motion**.

This skill decides whether something moves, why, for how long, on which curve or spring, in what order, with which tool, and what reduced motion shows. `ux` decides what an interaction does; `components` builds focus, hit areas, menus and dialogs; `layout` places things; `imagery` owns Rive and Lottie files, video and WebGL as media, and its own `proof-3` (WCAG 2.2.2); `type` owns the faces a text animation moves.

## Two entries
- **A brief** gives a motion system: inside a design-studio project (a folder with `design/decisions.md`), the motion tokens in `design/directions/<a|b>/tokens.css` and a `## Motion · <direction>` entry in `design/decisions.md`; otherwise, the conversation.
- **A page or site** gives an audit, in the conversation. Never edit what you audit.

Work from what the brief and the user give you. A choice they state wins over a heuristic, never over a standard. Scroll-driven motion is the user's call: done well when the brief asks for it, never added by habit.

## Three kinds of knowledge

| Kind | What it is | How to use it |
|---|---|---|
| **Standard** | A WCAG 2.2 A or AA requirement | A failure is a defect |
| **Empirical finding** | A published result, true for its participants and conditions | Evidence for a choice, never a guarantee |
| **Heuristic** | A practitioners' rule of thumb | A starting point. Leave it when the project justifies it, and say why |

`Checked by` names a `check.js` measure (`script …`), `motion audit` (this skill's `motion.js`), or the phases in which the critic verifies the rule. **`blocking`** is the studio's bar: the work does not ship while the rule is broken. Used alone, check these rules by hand and list what you could not verify. Some rules live in the references; they count the same.

## The six decisions, in order

### 1 · Level
How much the motion carries, read in the direction: the brief, then the colour, type, layout and imagery entries. Read `references/level.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `level-1` · Every motion entry states its level and one gesture in a sentence, the same idea as the colour, type, layout and imagery gestures | a gesture that cannot be stated does not exist, and gestures pulling apart read as too much | heuristic | Studio | critic phases 2, 3 · blocking |
| `level-2` · The motion carries the direction's level: restrained moves only what answers the visitor; assertive adds one choreographed moment; radical makes the motion the gesture | a bold page with generic motion collapses, and a calm one with a show turns noisy | heuristic | Studio | critic phases 2, 3 |
| `level-3` · A motion cliché appears only with a project reason on the entry's `Kept on purpose` line | fade-ups on scroll and scroll takeovers make generated sites feel alike; in the measure they belong to brand sites, almost never to products | heuristic | Studio | motion audit + critic phases 2, 3 · blocking |
| `level-4` · Competitors only show what is overused; examples come only from the brief and the inspirations | following competitors produces the generic look | heuristic | Studio | critic phase 2 |

### 2 · Purpose
Should it move at all? Ask first, before any curve. Read `references/purpose.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `purpose-1` · Every animation names its purpose: feedback, origin, state, continuity, explanation, or delight on a rare moment; without one, nothing moves | motion without a reason is noise the visitor pays for in time | heuristic | Kowalski, Freiberg interaction | critic phases 3, 4 · blocking |
| `purpose-2` · How often it is seen decides: what is used many times a day changes at once, or with 150 ms of opacity or colour; delight only on rare moments | motion that charms once slows every use after | heuristic | Kowalski, Krehel motion, Salaja timing, Freiberg interaction | critic phases 3, 4 |
| `purpose-3` · A repeated keyboard action never animates: shortcuts, arrow keys through a list or a menu, a command palette; a button pressed with Enter or Space moves as when clicked | it is repeated hundreds of times, and motion makes it feel late | heuristic | Kowalski, Freiberg interaction, Salaja | critic phase 4 |
| `purpose-4` · A menu opened many times a day animates only its exit | the opening must feel instant; the closing can soften | heuristic | Freiberg, Krehel motion, Salaja | critic phase 4 |

### 3 · Timing
Fast enough to feel instant, long enough to be read. Read `references/timing.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `timing-1` · An interface transition (hover, press, focus, menu, popover, dialog, drawer, toast) lasts at most 300 ms, delay included | past 300 ms the interface feels like it waits; measured products hold their median at 100 to 300 ms | heuristic | Kowalski, Salaja, Studio | script transition-duration + motion audit + critic phases 3, 4 |
| `timing-2` · Duration follows size: press and hover 100–160 ms, tooltips 125–200, menus 150–250, dialogs and drawers 200–300 | a small change that lasts feels slow, a large one that is quick feels like a jump | heuristic | Kowalski, Krehel motion, Salaja timing | motion audit + critic phases 3, 4 |
| `timing-3` · An exit lasts 60 to 75 % of its entry and leaves the way it came | the visitor has already decided; a matching path keeps the space readable | heuristic | Kowalski, Krehel motion, Salaja timing | critic phases 3, 4 |

### 4 · Easing
Kowalski's tree, and a spring for what has weight. Read `references/easing.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `easing-1` · Entries, exits and state changes take a strong ease-out; what moves on screen, ease-in-out; a colour change, ease; linear only for progress and constant loops; never ease-in | ease-out answers at once and lands softly; ease-in makes the first frames, the ones watched most, feel late | heuristic | Kowalski, Krehel motion | motion audit + critic phases 3, 4 |
| `easing-2` · Curves are tokens: movement takes the custom `--ease-out` and `--ease-in-out`, never a browser keyword; only colour keeps `ease`, as `--ease-colour` | the keywords are too weak to feel intended; measured products write their own curves | heuristic | Kowalski, Tailwind | motion audit + critic phase 3 |
| `easing-3` · What has weight takes a spring: a morph, a drawer, a dragged element returning, a toggle, an indicator; opacity and colour never do | a spring settles like an object and keeps the hand's speed; on opacity its overshoot flashes | heuristic | Salaja spring, Kowalski, Krehel motion | critic phases 3, 4 |
| `easing-4` · The bounce follows the level: 0 when restrained, 0.1 to 0.15 when assertive, up to 0.2 when radical, set by duration and bounce | a bounce says play; past 0.2 it wobbles | heuristic | Salaja spring, Kowalski, Krehel motion, Studio | critic phases 3, 4 |

### 5 · Choreography
What moves, in what order, and with which tool. Read `references/choreography.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `choreography-1` · Interface state changes use transitions, never keyframes | a transition turns back from where it is when interrupted; keyframes restart from zero | heuristic | Kowalski, Krehel motion, Freiberg interaction | critic phase 4 |
| `choreography-2` · One entrance per container: when a panel enters, its content is already there | two layers of entrance make the visitor wait twice | heuristic | Kowalski | critic phases 3, 4 |
| `choreography-3` · A stagger only on a rare moment, uneven, in order of importance: 30–80 ms between items in the interface, up to 100–150 ms on an opening | an even stagger ticks like a metronome, and on a menu it slows every use | heuristic | Kowalski, Krehel motion, Freiberg depth | critic phases 3, 4 |
| `choreography-4` · Nothing waits on motion: what is visible can be clicked, what is on screen at load starts in place, and no content stays hidden until an animation plays | content held back by a script is lost when the script is late or fails | heuristic | Kowalski, Studio | script hidden-under-reduced-motion + motion audit + critic phases 3, 4 |
| `choreography-5` · A popup grows from its trigger (`transform-origin` toward it) from a scale of 0.95 to 0.98, never from `scale(0)`; a centred dialog keeps the centre | the origin says where it came from; nothing real appears from nothing | heuristic | Kowalski, Krehel motion, Freiberg interaction | motion audit + critic phase 4 |
| `choreography-6` · A morph keeps one identity: the container carries the move, its contents crossfade with a light blur, and each pair shares one name | the eye follows one object instead of two crossing | heuristic | Kowalski, Krehel motion, Salaja | critic phases 3, 4 |
| `choreography-7` · A state change happens in place: a control morphs through idle, working, done and failed, and a changing label morphs its letters | the moment something worked is seen where it happened, not in a toast elsewhere | heuristic | Hairline, Kowalski | critic phases 3, 4 |
| `choreography-8` · Motion tied to scroll (reveals, scrubbed scenes, pinned sections) only when the brief asks; it follows native scroll, and a smooth-scroll library needs a `Kept on purpose` reason | taking over the scroll breaks the visitor's own speed; 7 of 14 measured brand sites do it, no product does | heuristic | Studio, Lenis | motion audit + critic phases 2, 3 |

### 6 · Proof
Motion that everyone can bear, and that holds. Read `references/proof.md` and `references/measures.md`.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `proof-1` · Nothing flashes more than three times in any one second, unless the flashing area stays under the threshold | flashes can trigger seizures | standard (WCAG 2.3.1) | W3C | critic phases 3, 4 · blocking |
| `proof-2` · Under `prefers-reduced-motion: reduce`, movement stops and the page shows its final state: no slide, scale, parallax, scroll scene or smooth scroll; fades of opacity and colour, spinners and progress bars may stay | motion makes some people dizzy or sick, and they asked their system for less | heuristic | Kowalski, Krehel motion, Comeau reduced motion, W3C | script reduced-motion + script hidden-under-reduced-motion + motion audit + critic phases 3, 4 · blocking |
| `proof-3` · Animate `transform`, `opacity`, `filter` and `clip-path`, named one by one; never `transition: all`, never `width`, `height`, `top` or `left`, except a measured height | these skip layout and stay smooth; `all` animates what nobody chose | heuristic | Kowalski, Krehel motion, Comeau transitions | motion audit + critic phase 4 |
| `proof-4` · A hover that moves something sits inside `@media (hover: hover) and (pointer: fine)` | a tap fires hover on touch screens and leaves the element stuck | heuristic | Kowalski, Freiberg | motion audit + critic phase 4 |
| `proof-5` · A loop stops when it leaves the screen; one that starts on its own and runs over 5 s beside content follows imagery's `proof-3` | a loop out of sight wastes battery, and one beside text keeps pulling attention | heuristic | Freiberg, W3C | motion audit + critic phases 3, 4 |

## The motion entry

```markdown
## Motion · Direction A
Level: assertive, the layout's level.
Gesture: <one sentence>, the same idea as the colour, type, layout and imagery gestures.
Overused in the sector: <one line> (never an example), or `not looked` when you could not look.
Kept on purpose: none, or <a cliché>, because <the project's reason>.
Tokens: `--duration-<name>` <values>; `--ease-out`, `--ease-colour`, and `--ease-in-out` if something moves on screen; `--ease-spring` <bounce>, or `no spring`.
Moments: <element> · <trigger> · <purpose> · <in> ms in, <out> ms out · <curve or spring> · reduced motion: <what shows>, one line each; `still: <what>, because <why>` for what stays still on purpose.
Tools: CSS only; CSS and a few lines of script for <what>; or <library> because <the need>.
Proof: `motion.js` audit passes, or `not yet` before there is a page.
```

## The audit

```markdown
## Motion audit · <page>
Script: <pass or fail, in one line>
### Level · Purpose · Timing · Easing · Choreography · Proof (one heading each)
1. <blocking|to fix|suggestion> · <the defect> · evidence: <selector, moment or measure> · rule: `<id>`
### Set aside
### Outside this skill
### Not seen
```

**Blocking:** a broken `blocking` rule or a WCAG A or AA failure. **To fix:** another broken rule, with no stated reason. **Suggestion:** an improvement no rule demands, with `rule: none`. Write one defect per change a developer would make; one that breaks several rules cites them all, keeps the highest severity, and goes under the heading of that rule. Cite another skill's rule with its skill: `imagery proof-3`. Number the defects across headings; a heading with no defect says `none`. `Set aside` lists script findings judged false, each with why. Without a motion entry, `level-1` to `level-4` go under `Not seen`, and a cliché or scroll-tied motion is a suggestion that cites `level-3` or `choreography-8`. Open what the script cannot: menus, dialogs, hovers, a press, an interruption mid-way, and the page slowed down.

## Commands
Open the page, then call `browser_run_code_unsafe` with `{ "filename": "<this skill's folder>/scripts/motion.js" }`, or pass the file's content as `code` if the path is refused. It loads the page again twice at 1440 × 900, with motion then with reduced motion, scrolls each to the end, and reports interface transitions (durations, curve classes, over 300 ms, `all`, ease-in, layout properties), entrances from `scale(0)`, ungated hovers, reveals on scroll, scroll takeovers, scroll-driven and pinned sections, what keeps moving at rest, and what still moves under reduced motion, CSS or script alike, at load, at rest and with the scroll. Read `references/measures.md` before judging its findings. Only movement under reduced motion (`proof-2`) sets `pass` to false.

## References
- `references/level.md`: levels, kinds of gesture, one idea in five voices, motion clichés. For decision 1.
- `references/purpose.md`: the gate in order, frequency, keyboard, menus, static cues, data that stays still. For decision 2.
- `references/timing.md`: durations by size and frequency, exits, moments seen once, the motion tokens. For decision 3.
- `references/easing.md`: the easing tree, curves as tokens, springs and their bounce, `linear()` springs. For decision 4.
- `references/choreography.md`: interruption, entrances, stagger, morphing, states in place, scroll, page transitions, tools. For decision 5.
- `references/proof.md`: flashes, reduced motion, properties, hover, loops, theme switch, checking by hand. For decision 6.
- `references/measures.md`: what 23 real sites do, reading `motion.js`. For decision 6 and audits.
- `references/sources.md`: every source and its licence. Not needed during a project.
