# Finishing: one pass per built page

The finishing pass is the maker's last look at a page of the build (phase 4), after the scripts and before the critic. It tries the page the way real people and real conditions will, fixes what breaks, and stops. One pass only.

## 0 · The scripts are clean
Inside the studio, `check.js`, `components.js`, `layout.js` and `motion.js` report nothing on the page, or only findings set aside with a reason. Used alone, `components.js` is the only script: run axe-core on the page as well, or check by hand the rules it would cover (`element-2`, `element-3`, `element-5`: names, roles, labels). The pass starts from there.

## 1 · The assistive walk (`finish-2`, `finish-3`)
1. **Keyboard**, from the address bar: Tab through the whole page, then Shift+Tab back. Open every menu, dialog, disclosure and tab with Enter or Space, move inside with the arrows its pattern promises (`patterns.md`), close it with Escape. At each stop: the ring shows, nothing hides it, focus goes where `focus.md` says.
2. **Finger**, at 390 × 844 with touch: a context made for it (`const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })`, then `page.tap` on its page; a page without `hasTouch` refuses `tap`). Every action reachable without hover, main actions easy to hit, nothing that needs two fingers or a drag without another way.
3. **Mouse**: hover, press, a click between two targets lands on one of them, a click on a label focuses its field.
4. **The accessibility tree**, read once with `browser_snapshot`: every control has a name that says what it does, the right role, and its state (`expanded`, `pressed`, `checked`, `selected`, `disabled`). The snapshot does not show `aria-busy` or `aria-invalid`: read those from the attributes while the state is on.

## 2 · The worst realistic data (`finish-1`)
Demo data is chosen to look good. Replace it, through the same door the real data comes in (the content file, the fixture, the props, the API stub), never by editing the markup, with what real people produce. A static page has no other door: change its text in a copy of the page, and throw the copy away. Kowalski's `break-ui` method: plausible or the real limit of the field, never random strings; one dataset that breaks many things at once.

| What | Try |
|---|---|
| Names | a long compound name, a one-letter name, a name with accents and apostrophes, one in another script |
| Text from data | a title three times the demo's length, a word that does not break (an address, a reference number), an empty optional field |
| Numbers | 0, 1 (singular), 1 284, a price with cents, a negative balance, a figure in the millions |
| Lists | empty, one item, many (does it page, scroll, or push the footer away?) |
| Media | a missing image, a portrait image where a landscape one was expected, a very small one |
| Time | today, a date far away, a time across midnight |
| Language | the longest translation the site ships; a right-to-left text if the site has one |

Report what broke before fixing it: some breaks are decisions (wrap or truncate? hide an empty field or say it is missing?) that may need the user.

## 3 · The hard conditions (`finish-4`, `finish-5`)
Each one in Playwright, through `browser_run_code_unsafe`:

| Condition | How | What must hold |
|---|---|---|
| Slow network | `await page.route('**/*', async (r) => { await new Promise((s) => setTimeout(s, 2000)); await r.continue(); })` | the loading state `ux` planned shows, after its delay (`state-6`) |
| Failed request | `await page.route('**/api/**', (r) => r.abort())` | the error state shows, says what to do, keeps what was typed (`ux behaviour` rules) |
| Double press | `await page.dblclick('<the submit button>')` | one request, one result (`state-1`) |
| Forced colours | `await page.emulateMedia({ forcedColors: 'active' })` | every control, its boundary and the focus ring stay visible |
| JavaScript off | a context with `javaScriptEnabled: false` | the content is there; links work; nothing waits on a script to appear (`motion choreography-4`) |

Remove the routes after each test (`page.unroute('**/*')`). A page that fetches and submits nothing skips the first three rows; say so in its report.

## 4 · What remains
Fix what the pass found. What cannot be fixed now (a decision for the user, a limit of the stack) is written as a deviation in `design/decisions.md`, with its reason. Then hand the page to the critic.

## Rules

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `finish-4` · A slow network, a failed request and a double press give the states `ux` planned | the happy path is the one that needs design the least | heuristic | Studio, Vercel | critic phase 4 |
| `finish-5` · Forced colours keep the focus and every control visible; with JavaScript off, the content is there | some people force their colours, and scripts fail | heuristic | Soueidan, Krehel accessibility, Studio | critic phase 4 |
