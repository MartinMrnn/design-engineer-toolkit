# Faces: finding one without the reflex

This file holds **no list of recommended fonts**, on purpose: any such list becomes the next default and ages. It holds a method and places to search.

## The method

1. **Describe the form.** Not adjectives tied to a cliché ("luxury", "tech") but what the letters should do: wide or condensed, high or low contrast, sharp or soft terminals, large or small x-height, geometric, humanist, grotesque, slab, flared, monospaced, how far from neutral. Derive it from the level, the brief and the inspirations.
2. **Name what is overused**, in general and in the sector. See below.
3. **Search the sources** below for that form, on the web, today. Do not start from a name you remember. If a name comes to mind first, treat it as suspect and check it against step 2.
4. **Keep 3 to 5 candidates** that truly differ. Three versions of the same grotesque are one candidate. A candidate is a complete proposal: the headline face **with the text face it would go with**, or alone if it can do both. The user then chooses a pairing, not half of one.
5. **Read each licence on the font's own page**, with the three questions below. Note the licence and its link. No page read, no candidate.
6. **Build the board** from `assets/board.html`, with the real headline, real text and real figures, in the direction's colours and each face's real weight, then run `type.js`. On the board, fonts may load from their foundry's URL or a CDN; self-hosting starts with the chosen face.
7. **Remove** what fails: a missing accent, a missing weight, faux bold, a face that did not load, a licence that does not fit.
8. **If more than three remain, keep the three whose forms differ most** (width, x-height, weight, construction), and name the others so the user can ask for them. Never remove one because you find it less beautiful.
9. **Show the user these two or three** on a capture, and let them choose. Say what you see, and say that your eye on letterforms is limited. The user's eye decides.

Without the real headline, ask for it or mark it `[à fournir : le titre]`: a face judged on a pangram tells little. Without web access, say so and stop at the described form rather than filling the gap from memory.

## Where to search
Licences as read on 2026-11-24. They can change, and most vary per font: **the font's own page is what counts**.

| Source | What it is | Licence as read |
|---|---|---|
| Fontshare | Free fonts from the Indian Type Foundry | ITF Free Font License 2.0 for its own fonts, with strong limits (below); SIL OFL for the open ones |
| Collletttivo | Open-source foundry | SIL OFL for all its fonts |
| The League of Moveable Type | Open-source foundry | Open Font License |
| Open Foundry | Curated showcase of open-source fonts | Varies per font; follow its link to each project |
| Uncut | Curated catalogue of contemporary fonts | Announced free for commercial use; each font belongs to its creator, so check each one |
| Velvetyne | French libre foundry | Its site showed only a notice on 2026-11-24. Without a licence you can read, leave the font out |
| Fontsource | Open fonts packaged for self-hosting | Shown on each font's page |
| Google Fonts | Large directory | SIL OFL for most, Apache for some. Its most used families are the overused ones |
| Bunny Fonts | Privacy-minded host compatible with Google Fonts | Varies per font, shown on its page |

**Radical** headlines are more often found at the small foundries than in the large directories.

## What the licence must allow
"Free for commercial use" is not enough for a studio working for a client. Answer three questions on the licence text:

1. **Whose site is it?** May the font serve a client's site, and who must be the licensee?
2. **Who handles the files?** May a designer or an agency receive them and put them online?
3. **May the files be changed?** Subsetting and converting to WOFF2 are modifications.

| Licence | Client's site | Files handled by the studio | Subset or convert |
|---|---|---|---|
| SIL OFL | Yes | Yes | Yes; a Reserved Font Name may require renaming the modified file |
| ITF FFL 2.0 (read on 2026-11-24) | Yes, if **the client** is the licensee | **No**: the client downloads its own copy from Fontshare | **No** |

With an ITF FFL face, write in the entry: `The client downloads <face> from Fontshare; files served unchanged`. If that cannot work for the project, prefer an OFL face.

## Paid faces
Free for web use by default. A paid face enters only if the brief asks for it or the client already holds a licence. Then note who holds it and for what use. Never use a trial or a personal-use licence on a client's site.

## Overused faces
Never proposed by default (`face-1`):

- **By use on the web:** Roboto (about 10 to 10.7 % of pages), Poppins (5.8 to 6.0), Open Sans (5.0 to 5.6), Montserrat (3.3 to 3.9), from the Web Almanac 2025.
- **By reflex in generated interfaces:** Inter, which is only 1.4 to 1.5 % of the web but the usual default of tech sites and AI tools.
- **By cliché:** a face picked for an adjective, such as Playfair Display for "luxury".
- **In the sector:** what your quick look at competitors found.

They are not bad faces. Inter is excellent, and several of the best design engineers use it or a derivative. The fault is choosing it **by reflex**. One stays if:

- the brand already imposes it;
- or a reason specific to this project is written, such as `Inter: a dense tool, with tabular figures and many small sizes`.

"It is clean" or "it is safe" is not a reason.

## Reading the board
`type.js` gives, per candidate:

| Measure | What it tells |
|---|---|
| `xHeight` | Share of the em taken by lowercase, for the text face at 16 px. A high value reads larger and suits small sizes |
| `capHeight` | Height of capitals, to compare with `xHeight` |
| `avgWidth` | How wide the text runs. It changes the characters per line |
| `display` | The same three for the headline face at 96 px, in its real weight. An optical axis can change them a lot |
| `weights` | The weights declared. `100 900` means a variable range |
| `missing` | Characters of the language it lacks, in the weights set. Anything here removes the candidate, unless the text never uses them. A missing `U+202F` alone is no reason: use a plain non-breaking space |
| `fauxBold` | A bold set with no real bold face. Change the weight or load the face |
| `loaded` | `false` means the file failed. Fix it or remove the candidate |

These numbers remove bad candidates. They never pick the good one.
