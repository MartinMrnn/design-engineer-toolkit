"""harmony: hue candidates for a colour, in OKLCH.

Each candidate keeps the colour's lightness and its share of the largest chroma sRGB allows at that lightness and hue, so
that the candidates have the same visual weight. The hue angles are a design heuristic: they give ideas to judge in
place, never a verdict.
"""
from . import convert, gamut

SCHEMES = (("analogous", (-30, 30)), ("complementary", (180,)), ("split-complementary", (-150, 150)), ("triadic", (-120, 120)))
NOTE = "Candidates to judge in place on the real page, not a verdict. For one hue in several lightnesses, use `ramp`."
CHROMA_LIMIT = 0.4  # above every sRGB colour


class HarmonyError(ValueError):
    pass


def _srgb(oklch):
    return convert.xyz_to_srgb(convert.oklab_to_xyz(convert.oklch_to_oklab(oklch)))


def max_chroma(lightness, hue):
    """The largest OKLCH chroma inside sRGB at this lightness and hue, by binary search."""
    low, high = 0.0, CHROMA_LIMIT
    while high - low > 0.0001:
        middle = (low + high) / 2
        if gamut.in_gamut(_srgb([lightness, middle, hue])):
            low = middle
        else:
            high = middle
    return low


def _candidate(lightness, share, hue, turn):
    angle = (hue + turn) % 360
    top = max_chroma(lightness, angle)
    oklch = [lightness, share * top, angle]
    return {"turn": turn, "hex": convert.to_hex(gamut.clip(_srgb(oklch))), "oklch": oklch, "max_chroma": top,
            "css": convert.css("oklch", oklch)}


def build(text):
    kind, values = convert.parse(text)
    lightness, chroma, hue = convert.oklab_to_oklch(convert.xyz_to_oklab(convert.to_xyz(kind, values)))
    top = 0.0 if hue is None or not 0 < lightness < 1 else max_chroma(lightness, hue)
    if top == 0.0:
        raise HarmonyError("{} has no measurable hue: use `ramp` for a neutral scale".format(text))
    share = min(1.0, chroma / top)
    return {
        "input": text, "lightness": lightness, "chroma": chroma, "hue": hue, "share": share, "note": NOTE,
        "schemes": [{"name": name, "candidates": [_candidate(lightness, share, hue, turn) for turn in turns]}
                    for name, turns in SCHEMES],
    }


def report(r):
    out = ["Harmony of {}: OKLCH lightness {:.3f}, chroma {:.3f}, hue {:.1f}, {:.0f} % of the sRGB maximum there.".format(
        r["input"], r["lightness"], r["chroma"], r["hue"], r["share"] * 100),
        "Each candidate keeps that lightness and that share of its own maximum chroma.", r["note"]]
    for scheme in r["schemes"]:
        out += ["", scheme["name"]]
        out += ["  {:>+5}°  {}  {}".format(c["turn"], c["hex"], c["css"]) for c in scheme["candidates"]]
    return "\n".join(out)
