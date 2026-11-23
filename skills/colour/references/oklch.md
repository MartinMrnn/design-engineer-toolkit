# OKLCH: building colours

The studio reasons and writes in OKLCH. HSL and HSB are not used.

## What OKLCH is
OKLab is a colour space by Björn Ottosson (2020), adopted by CSS Color 4 as `oklab()` and its polar form `oklch()`.

- `L`: lightness, from 0 (black) to 1 (white).
- `C`: chroma, 0 for a grey. No sRGB colour goes above about 0.32.
- `H`: hue angle in degrees. A grey has no hue: `none`.

OKLab was fitted to perceptual data so that equal steps look roughly equal. It is a model: uniformity is approximate, and best for moderate differences.

OKLab's `L` is not the relative luminance WCAG uses. A contrast is always computed, never read from `L`. CSS `lab()` and `lch()` are CIELAB on D50, with `L` from 0 to 100: never mix them with `oklch()` in one argument.

## Why not HSL
HSL rearranges sRGB geometrically. `#ffff00` and `#0000ff` both have 50 % HSL lightness, yet their OKLCH lightness is about 0.97 and 0.45. Equal HSL saturation does not give equal chroma, and blues drift toward purple as they lighten. Linear rebuilt its theme generator on LCH for this kind of reason.

## Building a scale
1. Keep the hue constant. More than about 10° of drift across a scale becomes visible.
2. Spread lightness across the steps you need. `ramp` gives a starting point from 0.97 to 0.25.
3. Think of chroma as a **share of the maximum** at each lightness and hue, because that maximum changes along the scale.
4. For several hues, keep the same lightness and the same share of chroma, so that none looks louder by accident.
5. To gain contrast, move `L` first. Chroma changes the character.

## Gamut and P3
Many OKLCH values do not exist in sRGB, above all at high chroma near very light or very dark lightness. CSS Color 4 brings them in by lowering chroma at constant lightness and hue. `palette`, `ramp` and `convert` use that mapping and say when it applied.

Keep an sRGB value as the base. Add a wider one only as an enhancement:

```css
:root { --primary: oklch(0.55 0.2 262); }
@media (color-gamut: p3) {
  :root { --primary: oklch(0.55 0.25 262); }
}
```

`palette` measures the base value, which every screen can show. Check the P3 value by eye, and with `contrast` on its hex if it is close to a threshold.

## Gradients
By default, CSS interpolates a gradient of legacy colours such as hex in sRGB, which can pass through muddy midtones. OKLCH hue is circular, so a gradient in `oklch` between two distant hues can detour through colours neither end contains. Interpolate in Oklab for a direct, even path:

```css
background: linear-gradient(in oklab, oklch(0.8 0.1 80), oklch(0.5 0.15 260));
```

Use `in oklch` only when travelling around the wheel is the intended effect. Text over a gradient is judged on its worst area (`material.md`).

| Rule | Why | Kind | Source | Checked by |
|---|---|---|---|---|
| `harmony-9` · Build scales in OKLCH, at constant hue, with chroma as a share of the maximum | steps then look even and the hue does not drift | heuristic | Krehel OKLCH, Ottosson 2020 | critic phase 2 |
| `harmony-10` · Interpolate gradients in Oklab unless the detour is intended | sRGB can pass through muddy midtones, and a polar path through colours neither end contains | heuristic | Krehel OKLCH, CSS Color 4 | critic phases 2, 4 |
| `harmony-11` · Keep an sRGB base value; P3 is only an enhancement | every screen must show a correct colour | heuristic | Krehel OKLCH | critic phase 2 |
