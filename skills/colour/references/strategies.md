# Strategies: where colour lives

The first question about colour is not "which one?" but "where does it live?". The answer sets how much colour the page can hold before it becomes too much.

## Why not 60-30-10
60-30-10 is a rule of thumb from interior decoration. We found neither a precise origin nor a study testing it on interfaces. It also describes badly what good sites do:

| Site, home page | Main ground | Other greys | Colour | Images |
|---|---:|---:|---:|---:|
| Linear | 70 % | 8 % | 2 % | 20 % |
| Notion | 65 % | 2 % | 1 % | 32 % |
| Apple | 21 % | 1 % | 0 % | 77 % |
| Stripe | 32 % | 1 % | 22 % | 46 % |

Linear and Notion are not at 80-10-10. Outside images, colour takes 2.1 % of Linear's interface and 0.9 % of Notion's. It works because colour is kept for a rare signal, or lives in the content.

**What this measure is.** One home page per site at 1440 px, captured on 2026-11-23, some with seasonal promotions. Rectangles of images, videos, canvases and CSS background images count as images. Outside them, a pixel under 0.04 OKLCH chroma is grey. Seventeen sites were measured, 13 of them under 2.2 % of colour in the interface. These are orders of magnitude from one capture, not norms.

## Choosing

```text
What carries this project?
├─ A task people repeat .................. Signal
├─ Words, a voice, a reputation .......... Monochrome, or Signal if one action must stand out
├─ Photos, products, finished work ....... Content
└─ A brand to recognise at a glance,
   with no strong images to carry it ..... Surfaces
```

A site type does not decide alone. A showcase can use any of the four: its material and its brand decide. Pick one main strategy. A single section may depart from it when that is the gesture.

## The four strategies

**Signal.** A neutral interface and one rare accent on actions and states. Measured: Linear, Notion, Figma, Raycast, The Verge, from 0.7 to 2.1 % of colour in the interface. It fails when the accent spreads to headings, icons and decoration.

**Monochrome.** Ink and ground, almost no colour. Measured: Vercel, Emil Kowalski, Jakub Krehel, Rauno Freiberg, from 0 to 1 %. Type, spacing and contrast do the work. It fails when it is merely unfinished: without a strong typographic voice, it reads as a default.

**Content.** Images carry the colour and the interface recedes. Measured: Apple, Teenage Engineering, Allbirds, Glossier, with images on 61 to 80 % of the page. It fails when the frame competes with the work, or when the images are weak or mismatched.

**Surfaces.** Large fields or gradients are the identity. Measured: Stripe, Mailchimp, It's Nice That, IKEA, with colour on 8 to 22 % of the page. It is the riskiest strategy, and the one that needs the most care with pairs. It fails when several loud fields compete.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `strategy-3` · Signal: keep the accent for actions and states | an accent stays meaningful only while it is rare | heuristic | Linear, Studio | critic phases 2, 4 |
| `strategy-4` · Monochrome: mark actions and states with weight, underline, shape or an icon | with no accent, something else must tell them apart | heuristic | Studio | critic phases 2, 4 |
| `strategy-5` · Content: keep the interface quieter than the images | a coloured frame competes with what it presents | heuristic | Studio | critic phase 2 |
| `strategy-6` · Surfaces: give each coloured surface its own foreground pair | a text colour that reads on one field can fail on the next | heuristic | shadcn, Studio | colour palette + critic phase 2 |

## Broken → fixed

- **Broken:** a SaaS page with a blue button, blue icons, blue headings and blue badges. **Fixed:** neutral icons and headings, blue only on the main action and the selected state.
- **Broken:** a portfolio with a saturated frame around saturated work. **Fixed:** a quiet ground that lets the work carry the colour.
- **Broken:** a monochrome site where links differ from text only by a slightly darker grey. **Fixed:** links underlined.
- **Broken:** a brand page with four full-bleed colours in a row. **Fixed:** one dominant field, the others reduced to details.
