# Measures: what real sites do, and reading `imagery.js`

Two captures on 2026-11-27. Reference points, never quotas.

## What 35 gallery sites show
The first page of siteofsites.co, classified by first screen: photos about half (often treated: scans, cut-outs, halftone, collages), illustration or drawing about a quarter, 3D about one in seven, a generative piece or type as the image for the rest. **Generic CSS shapes: none.**

## What 20 home pages do
6 products (Linear, Vercel, Raycast, Stripe, Resend, jakub.kr) and 14 recent brand sites from the same gallery, at 1440 × 900.

| Measure | Result |
|---|---|
| First screen | every brand site opens on a visual: photo or video 2, 3D 5 (one made of photos), illustration 3, generative 3, pixel graphics with type 1. With Stripe and Raycast, 5 of the 20 first screens are coded |
| Outer shadows | none on 11 of 14 brand sites; 1 to 28 distinct values on products |
| Shadow direction | horizontal offset 0 on 86 of 90 layers |
| Shadow colour | black at low alpha on neutral grounds (all of Linear); tinted on coloured or dark grounds (Raycast, Stripe, United Carriers) |
| Ring shadows instead of borders | 4 products, no brand site |
| 1 px outline on images | 2 sites: Raycast (18 of 41 images), Resend (1 of 7), on interface captures |
| Empty decorative shapes | 1 on Linear, 1 on Raycast, none elsewhere |
| Glass | Raycast 37 elements, Plnty 23, a few on five more sites |
| Grain | seen once (scan lines, The Design Society) |

Each coded first screen says the brand's idea: Stripe's gradient, Raycast's beam of light, Byotone's sound as particles, Aino's product drawn in characters.

## Reading `imagery.js`
| Field | What it means | What to do |
|---|---|---|
| `pass`, `issues` | `text-over-image`: a text over a visual under 4.5:1, or 3:1 when large, on its worst 5 % of pixels (WCAG 1.4.3) | Fix with `media.md`; it blocks |
| `visuals` | Share of the first screen covered by a visual, and its kinds | 0 % on a brand page with an assertive or radical level is worth a look (`level-2`) |
| `contrast` | The 20 lowest ratios measured, passing or not | A ratio just above its need will fail on another crop: give it margin |
| `shapes` | Empty round or blurred shapes, pseudo-elements included | Each is a `source-1` candidate. Set aside a glow the entry names as its light finish, or a shape that is a control's state |
| `shadows` | Distinct values, `mixed` lights, `lost` shadows on dark grounds | Many values: no scale (`finish-4`). `mixed`: two lights (`finish-3`), unless a bottom bar casts upward on purpose |
| `glass` | Count, blur, `nested`, `reducedTransparency` | `nested` breaks `finish-5`; `false` means no fallback was found in a readable style sheet |
| `gradients`, `textures` | How many, how large; noise, grain and blended layers | Judge against the entry's finish (`finish-2`, `finish-6`, `finish-7`) |
| `images` | `unsized`, `blurry` (under 1x), `soft` (under 2x), `heavy` (over 3x), `lazyFirst`, `outlined` | `proof-4` to `proof-6`, `treatment-4` |

## Known limits
- `unsized` also lists an image whose box has a fixed CSS height: no jump, so set it aside.
- `contrast` ignores text opacity and gradient-filled text, and a fixed header can fall inside a captured box. A video is judged on the frame captured.
- Style sheets from another origin cannot be read: `reducedTransparency` may be `false` while a rule exists.
- The script does not judge whether an image fits the project, or whether the finish is good. That is the critic's and the user's.
