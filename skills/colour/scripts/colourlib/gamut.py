"""Mapping a colour into the sRGB gamut: the CSS Color 4 binary search with local MINDE.

Source: CSS Color Module Level 4, W3C, "CSS Gamut Mapping" and its "Sample Pseudocode for the Binary Search Gamut
Mapping with Local MINDE" (https://drafts.csswg.org/css-color-4/#binsearch; Overview.bs of
https://github.com/w3c/csswg-drafts at commit 700ba7b5e6ea39623b68a2a0575c2bb89c640d54). Constant lightness and hue,
chroma reduced in OKLCH; a clipped colour is accepted once its deltaEOK to the colour being tried is under one
just noticeable difference (JND). Written here from that text, step by step.
"""
from . import convert

STANDARD = "CSS Color 4 gamut mapping (binary search on OKLCH chroma, local MINDE; deltaEOK JND 0.02)"

# "let |JND| be 0.02" and "let |epsilon| be 0.0001" in the pseudocode.
JND = 0.02
EPSILON = 0.0001

# Not from the spec: the pseudocode tests "inside the gamut" with exact bounds. Floating-point noise (a white that
# converts to 1.0000000000000002) must not count as outside, so a component within this of [0, 1] is inside.
NOISE = 1e-9


def in_gamut(rgb):
    return all(-NOISE <= c <= 1 + NOISE for c in rgb)


def clip(rgb):
    """"Clamps each component to the bounds of the reference range" (the pseudocode's clip()): 0 to 1 for sRGB."""
    return [min(1.0, max(0.0, c)) for c in rgb]


def delta_eok(one, two):
    """deltaEOK, CSS Color 4 "Color Difference: deltaEOK": the Euclidean distance between two OKLab colours."""
    return sum((a - b) ** 2 for a, b in zip(one, two)) ** 0.5


def _oklch_to_srgb(oklch):
    return convert.xyz_to_srgb(convert.oklab_to_xyz(convert.oklch_to_oklab(oklch)))


def _srgb_to_oklab(rgb):
    return convert.xyz_to_oklab(convert.srgb_to_xyz(rgb))


def map_oklch(origin):
    """sRGB (gamma-encoded, each from 0 to 1) for an OKLCH colour [L, C, H] (H may be None), by the CSS Color 4
    binary-search gamut mapping. Returns (rgb, mapped): mapped is True when the colour was outside sRGB."""
    raw = _oklch_to_srgb(origin)
    mapped = not in_gamut(raw)
    # Lightness out of range maps to white or black.
    if origin[0] >= 1:
        return [1.0, 1.0, 1.0], mapped
    if origin[0] <= 0:
        return [0.0, 0.0, 0.0], mapped
    if not mapped:
        return clip(raw), False

    current = [origin[0], origin[1], origin[2]]
    clipped = clip(raw)
    # Is the clipped colour already indistinguishable from the origin?
    if delta_eok(_srgb_to_oklab(clipped), convert.oklch_to_oklab(current)) < JND:
        return clipped, True

    low, high = 0.0, origin[1]
    low_in_gamut = True
    while high - low > EPSILON:
        chroma = (low + high) / 2
        current[1] = chroma
        trial = _oklch_to_srgb(current)
        if low_in_gamut and in_gamut(trial):
            low = chroma
            continue
        clipped = clip(trial)
        error = delta_eok(_srgb_to_oklab(clipped), convert.oklch_to_oklab(current))
        if error < JND:
            if JND - error < EPSILON:
                return clipped, True
            low_in_gamut = False
            low = chroma
        else:
            high = chroma
    return clipped, True
