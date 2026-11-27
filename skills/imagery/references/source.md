# Source: where the visuals come from

None of 35 recent gallery sites uses generic shapes as its visual. Every one shows a real file: photos (about half, often treated), illustration or drawing (about a quarter), 3D (about one in seven), a generative piece or type as the image (the rest). Claude draws badly by hand; it finds, treats and codes well. Work from that.

## The decision tree
1. **The user's or the client's files**: photos, scans, drawings, renders, a logo, a Rive or Lottie file. They carry the project's truth. Look at each one before choosing.
2. **Free libraries**, when the subject is generic enough to be photographed by anyone: matter, light, places, objects, gestures. Never for what only the client has (their team, premises, products, customers).
3. **A coded visual**, drawn from a real material of the project: its photos, its words, its data, its sound.
4. **Type as the image**: the name, a figure or a sentence set large in live text.

What only the client can supply is written `[à fournir : what]` with a brief, never filled with a stand-in.

## What Claude does well, and badly

| Well | Badly |
|---|---|
| Searching libraries and choosing by eye among a few | Drawing people, animals or objects in SVG by hand |
| Treating a real photo: crop, duotone, halftone, dither, ASCII, grain | Inventing an illustration style |
| Generative pieces from real data: lines, particles, fields, patterns | Shapes with no source: circles, blobs, glows |
| Three.js with physical materials and a CC0 HDRI | Modelling a detailed 3D object |
| Setting type as an image | Logos and marks: they are always supplied |

A generative piece with no source is decoration with extra steps. Tie it to something real: the cinema's schedule drives the lines, a real still is dithered, the sound of the venue shapes the particles.

## Libraries

| Library | For | Licence, in short |
|---|---|---|
| Unsplash (unsplash.com) | Photos | Unsplash License: free, commercial use included, no attribution required (credit anyway). Not Unsplash+, a paid licence served from plus.unsplash.com. Size through the URL: `?w=1600&q=80&auto=format` |
| Pexels (pexels.com) | Photos and video | Pexels License: free, commercial use included, no attribution required. It does not clear identifiable people, logos, brands or buildings; never show people in a bad light or as endorsing anything. Size: `?auto=compress&w=1600` |
| Poly Haven (polyhaven.com) | HDRIs, textures, 3D models | CC0 |
| ambientCG (ambientcg.com) | Materials and textures | CC0 |

The official Unsplash MCP server (`mcp.unsplash.com`) can search and fetch photos inside a conversation. It is the user's choice to install it; its API terms ask for attribution.

## Honesty
- A stock person is never presented as the client's team, customers or patients; a stock place never as their premises; a stock object never as their product.
- A photo of a person needs that person's consent for commercial use. Library licences do not give it.

## The brief for what the client supplies
```markdown
[à fournir : portrait of the founder]
Subject: the founder at her desk, three-quarter, looking off frame.
Light: daylight from a window on the left, no flash.
Framing: horizontal 3:2, room above the head for the headline.
```

## Rive and Lottie
They are provided files, made in their own editors; Claude does not author them. Check the licence of a community file before using it. How they move, and what reduced motion shows, is `motion`'s.

## The asset list
One line per file on the entry's `Assets` line or below it: `stills/night-01.jpg · the hunter on the river · https://… · photographer · Unsplash License`. Assets of a direction that was not kept leave with it.

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `source-5` · Every asset is listed with what it shows, its source, its author and its licence, free for commercial use; Unsplash+ and unclear licences are left out | the client must be able to keep the site, and a licence read later is a risk taken now | heuristic | Unsplash, Pexels, Poly Haven, ambientCG, Studio | critic phases 2, 3, 4 |
| `source-6` · What only the client can supply is written `[à fournir : what]` with a brief: subject, light, framing | a placeholder with a brief gets the right photo; a stand-in gets kept | heuristic | Studio | script placeholder + critic phase 2 |
