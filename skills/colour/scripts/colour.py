#!/usr/bin/env python3
"""colour.py · colour measures for the design studio: WCAG 2.2 contrast, conversions (OKLab, OKLCH, CIELAB), lightness ramps,
colour-vision-deficiency simulation, the colours seen in a PNG capture.

Standard library only. Errors print as `colour: <message>` on stderr and exit 1, like charter.py.
"""
import argparse
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from colourlib import convert, cvd, dominant, gamut, wcag  # noqa: E402


def fail(message):
    print("colour: " + message, file=sys.stderr)
    sys.exit(1)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        fail(message)


def check_colour(value):
    try:
        wcag.parse_hex(value)
    except ValueError as e:
        fail(str(e))


def requirement(value, threshold):
    return {
        "name": "{} {}".format(threshold.label, threshold.level),
        "level": threshold.level,
        "sc": threshold.sc,
        "threshold": threshold.minimum,
        "meets": wcag.meets(value, threshold),
        "ratio_display": wcag.fmt(value, threshold),
    }


def contrast_result(text, ground, large, non_text):
    value = wcag.ratio(text, ground)
    if non_text:
        required, reported = wcag.THRESHOLDS["non-text-aa"], None
    elif large:
        required, reported = wcag.THRESHOLDS["large-text-aa"], wcag.THRESHOLDS["large-text-aaa"]
    else:
        required, reported = wcag.THRESHOLDS["text-aa"], wcag.THRESHOLDS["text-aaa"]
    return {
        "standard": wcag.STANDARD,
        "text": text,
        "ground": ground,
        "ratio": value,
        "required": requirement(value, required),
        "reported": requirement(value, reported) if reported else None,
        "compared": "unrounded",
    }


def line(label, req):
    return "  {}: at least {:g}:1, SC {} ({}): {}".format(label, req["threshold"], req["sc"], req["level"],
                                                       "pass" if req["meets"] else "FAIL")


def cmd_contrast(args):
    if args.large and args.non_text:
        fail("--large and --non-text cannot be combined: non-text contrast has a single threshold (1.4.11)")
    check_colour(args.text)
    check_colour(args.ground)
    result = contrast_result(args.text, args.ground, args.large, args.non_text)
    if args.json:
        print(json.dumps(result, indent=2))
        return
    req, rep = result["required"], result["reported"]
    # One figure for the whole report, with the decimals that keep every threshold's side visible.
    shown = max((r["ratio_display"] for r in (req, rep) if r), key=len)
    print("{} contrast: {} on {}".format(wcag.STANDARD, args.text, args.ground))
    print("  Ratio: {}:1 ({})".format(shown, req["name"].rsplit(" ", 1)[0]))
    print(line("Required", req))
    if rep:
        print(line("Reported", rep) + " (reported, not required)")
    print("  The ratio is compared to each threshold unrounded; the figure shows the decimals needed to keep its side visible.")


def add_contrast(sub):
    p = sub.add_parser("contrast", help="WCAG 2.2 contrast ratio of a text (or foreground) colour on a ground")
    p.add_argument("text", help="#rgb or #rrggbb")
    p.add_argument("ground", help="#rgb or #rrggbb")
    p.add_argument("--large", action="store_true", help="large-scale text: 18 pt, or 14 pt bold (24 px, or 18.67 px bold): 3:1 (1.4.3)")
    p.add_argument("--non-text", action="store_true", help="interface components and graphics: 3:1 (1.4.11)")
    p.add_argument("--json", action="store_true", help="print JSON")
    p.set_defaults(func=cmd_contrast)


# ---- convert ------------------------------------------------------------------------------------------------------

to_hex = convert.to_hex


def parse_colour(text):
    try:
        return convert.parse(text)
    except ValueError as e:
        fail(str(e))


def formats(xyz):
    """The four CSS formats of a colour (XYZ D65), unrounded."""
    oklab = convert.xyz_to_oklab(xyz)
    lab = convert.xyz_to_lab(xyz)
    return {"oklab": oklab, "oklch": convert.oklab_to_oklch(oklab), "lab": lab, "lch": convert.lab_to_lch(lab)}


def describe(text):
    kind, values = parse_colour(text)
    xyz = convert.to_xyz(kind, values)
    result = formats(xyz)
    raw = values if kind == "hex" else convert.xyz_to_srgb(xyz)
    inside = gamut.in_gamut(raw)
    # Inside sRGB the colour is its own sRGB value; outside, the CSS Color 4 gamut-mapped one.
    srgb = gamut.clip(raw) if inside else gamut.map_oklch(result["oklch"])[0]
    result.update({
        "input": text,
        "hex": to_hex(srgb),
        "srgb": srgb,
        "css": {k: convert.css(k, result[k]) for k in convert.KINDS},
        "in_gamut": inside,
        "gamut_mapped": not inside,
    })
    return result


def cmd_convert(args):
    colours = [describe(c) for c in args.colours]
    if args.json:
        print(json.dumps({"standard": convert.STANDARD, "gamut_mapping": gamut.STANDARD,
                          "precision": convert.PRECISION_NOTE, "colours": colours}, indent=2))
        return
    print("Conversion: " + convert.STANDARD)
    for c in colours:
        print()
        print(c["input"])
        print("  hex    " + c["hex"])
        for kind in ("oklch", "oklab", "lch", "lab"):
            print("  {:<6} {}".format(kind, c["css"][kind]))
        if c["gamut_mapped"]:
            print("  outside sRGB: the hex is the colour gamut mapped into sRGB, by the {}.".format(gamut.STANDARD))
            print("  The four values above are the colour as given.")
    print()
    print("Precision: " + convert.PRECISION_NOTE + ".")


def add_convert(sub):
    p = sub.add_parser("convert", help="hex, OKLab/OKLCH (D65) and CSS lab()/lch() (CIELAB D50) of each colour",
                       description="Converts between #rrggbb, oklch(), oklab(), lch() and lab(). "
                                   "oklab/oklch are on D65; lab/lch are CIELAB on D50, reached through the Bradford "
                                   "adaptation, as CSS Color 4 specifies. " + convert.PRECISION_NOTE + ".")
    p.add_argument("colours", nargs="+", metavar="colour",
                   help="#rgb, #rrggbb, oklch(L C H), oklab(L a b), lch(L C H) or lab(L a b) (quote the CSS forms)")
    p.add_argument("--json", action="store_true", help="print JSON, with the unrounded values")
    p.set_defaults(func=cmd_convert)


# ---- ramp ---------------------------------------------------------------------------------------------------------

# The ramp's lightness range is a heuristic (spec 6.1: "heuristic (the ramp's shape)"). From 0.97 (a tint that still
# shows the hue, a usable page ground) to 0.25 (a shade that is still not black, a usable ink): at both ends sRGB
# leaves room for some chroma, which pure white (L = 1) and pure black (L = 0) do not.
RAMP_LIGHTEST = 0.97
RAMP_DARKEST = 0.25
RAMP_MAX_STEPS = 50
RAMP_HELP = ("Lightness runs from {} (lightest, first) to {} (darkest) in even steps, a heuristic: both ends keep room "
             "for some chroma, which pure white and pure black do not.").format(RAMP_LIGHTEST, RAMP_DARKEST)


def steps_arg(value):
    try:
        n = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError("--steps must be a whole number from 2 to {}, got {!r}".format(RAMP_MAX_STEPS, value))
    if not 2 <= n <= RAMP_MAX_STEPS:
        raise argparse.ArgumentTypeError("--steps must be from 2 to {}, got {}".format(RAMP_MAX_STEPS, n))
    return n


def ramp_result(text, n):
    kind, values = parse_colour(text)
    _, chroma, hue = formats(convert.to_xyz(kind, values))["oklch"]
    if hue is None:  # a grey (hue powerless): the ramp is neutral
        chroma, hue = 0.0, 0.0
    steps = []
    for i in range(n):
        lightness = RAMP_LIGHTEST + (RAMP_DARKEST - RAMP_LIGHTEST) * i / (n - 1)
        srgb, mapped = gamut.map_oklch([lightness, chroma, hue])
        oklch = convert.oklab_to_oklch(convert.xyz_to_oklab(convert.srgb_to_xyz(srgb)))
        steps.append({
            "step": i + 1,
            "lightness": lightness,
            "chroma_requested": chroma,
            "hex": to_hex(srgb),
            "srgb": srgb,
            "oklch": oklch,
            "css": convert.css("oklch", oklch),
            "gamut_mapped": mapped,
        })
    return {
        "input": text,
        "hue": hue,
        "chroma": chroma,
        "lightest": RAMP_LIGHTEST,
        "darkest": RAMP_DARKEST,
        "gamut_mapping": gamut.STANDARD,
        "steps": steps,
    }


def cmd_ramp(args):
    result = ramp_result(args.colour, args.steps)
    if args.json:
        print(json.dumps(result, indent=2))
        return
    print("Lightness ramp of {}: {} steps at OKLCH hue {:.2f}, chroma {:.4f} where sRGB allows it".format(
        args.colour, args.steps, result["hue"], result["chroma"]))
    print(RAMP_HELP)
    print("Each colour is brought into sRGB by the {}.".format(gamut.STANDARD))
    print()
    for s in result["steps"]:
        print("  {:>2}  {}  {}{}".format(s["step"], s["hex"], s["css"], "  chroma reduced to fit sRGB" if s["gamut_mapped"] else ""))


def add_ramp(sub):
    p = sub.add_parser("ramp", help="a lightness ramp at the colour's OKLCH hue, chroma reduced into sRGB",
                       description="A ramp of --steps colours at the input's OKLCH hue and chroma, lightness evenly spread. "
                                   + RAMP_HELP + " Each colour is brought into the sRGB gamut by the " + gamut.STANDARD + ".")
    p.add_argument("colour", help="#rgb, #rrggbb, oklch(L C H), oklab(L a b), lch(L C H) or lab(L a b)")
    p.add_argument("--steps", type=steps_arg, required=True, metavar="n", help="number of colours, 2 to {}".format(RAMP_MAX_STEPS))
    p.add_argument("--json", action="store_true", help="print JSON, with the unrounded values")
    p.set_defaults(func=cmd_ramp)


# ---- cvd ----------------------------------------------------------------------------------------------------------

CVD_CAUTION = ("Distances help spot colours that may be hard to tell apart; there is no universal threshold, "
               "and states must not rely on colour alone (WCAG 2.2, SC 1.4.1).")
CVD_ONE = "Give two or more colours to compare pairs by distance."
CVD_METHOD = ("{} at severity 1.0 (dichromacy); the matrices work on linear-light sRGB (derived from the primaries' spectral "
              "power, see cvd.py), and each result is clamped into [0, 1]").format(cvd.MODEL)


def cvd_colour(text):
    kind, values = parse_colour(text)
    if kind != "hex":
        fail("cvd takes hex colours (#rgb or #rrggbb), got {!r}".format(text))
    simulated = {}
    for name in cvd.CONDITIONS:
        srgb, clamped = cvd.simulate(values, name)
        simulated[name] = {"hex": to_hex(srgb), "srgb": srgb, "clamped": clamped}
    return {"input": text, "hex": to_hex(values), "srgb": values, "simulated": simulated}


def cvd_pairs(colours):
    pairs = []
    for i, one in enumerate(colours):
        for two in colours[i + 1:]:
            rgb = {"normal": (one["srgb"], two["srgb"])}
            rgb.update({n: (one["simulated"][n]["srgb"], two["simulated"][n]["srgb"]) for n in cvd.CONDITIONS})
            distance = {k: cvd.distance(*v) for k, v in rgb.items()}
            nearest = min(distance, key=distance.get)  # the first of equals, in the order normal, protanopia, ...
            pairs.append({"a": one["hex"], "b": two["hex"], "distance": distance,
                          "closest": {"condition": nearest, "distance": distance[nearest]}})
    # Closest first, on the unrounded figures; equal figures keep the order the colours were given in.
    return sorted(pairs, key=lambda p: p["closest"]["distance"])


def cmd_cvd(args):
    colours = [cvd_colour(c) for c in args.colours]
    pairs = cvd_pairs(colours)
    if args.json:
        print(json.dumps({"model": cvd.MODEL, "severity": cvd.SEVERITY, "method": CVD_METHOD,
                          "distance": "OKLab Euclidean distance (deltaEOK, CSS Color 4), unrounded",
                          "colours": colours, "pairs": pairs, "note": CVD_CAUTION}, indent=2))
        return
    print("Colour-vision-deficiency simulation: " + CVD_METHOD + ".")
    print("A * marks a colour that clamping changed.")
    print()
    print("  {:<9} {:<13} {:<13} {}".format("colour", "protanopia", "deuteranopia", "tritanopia"))
    for c in colours:
        cells = [s["hex"] + ("*" if s["clamped"] else " ") for s in (c["simulated"][n] for n in cvd.CONDITIONS)]
        print("  {:<9} {:<13} {:<13} {}".format(c["hex"], *cells).rstrip())
    if pairs:
        print()
        print("Pairs by OKLab distance (Euclidean), the closest first; a pair is placed by its smallest distance:")
        print("  {:<17} {:<8} {:<11} {:<13} {:<11} {}".format("pair", "normal", "protanopia", "deuteranopia", "tritanopia", "closest in"))
        for p in pairs:
            d = p["distance"]
            print("  {:<17} {:<8.3f} {:<11.3f} {:<13.3f} {:<11.3f} {}".format(
                p["a"] + " " + p["b"], d["normal"], d["protanopia"], d["deuteranopia"], d["tritanopia"], p["closest"]["condition"]))
    print()
    print(CVD_CAUTION if pairs else CVD_ONE)


def add_cvd(sub):
    p = sub.add_parser("cvd", help="simulate protanopia, deuteranopia and tritanopia; OKLab distance of every pair",
                       description="Simulates each colour for protanopia, deuteranopia and tritanopia ("
                                   + CVD_METHOD + "), then gives the OKLab distance of every pair in normal vision and "
                                   "under each deficiency, the closest first. " + CVD_CAUTION)
    p.add_argument("colours", nargs="+", metavar="colour", help="#rgb or #rrggbb; two or more to compare pairs")
    p.add_argument("--json", action="store_true", help="print JSON, with the unrounded values")
    p.set_defaults(func=cmd_cvd)


# ---- dominant -----------------------------------------------------------------------------------------------------

def k_arg(value):
    try:
        n = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError("--k must be a whole number from 1 to {}, got {!r}".format(dominant.MAX_K, value))
    if not 1 <= n <= dominant.MAX_K:
        raise argparse.ArgumentTypeError("--k must be from 1 to {}, got {}".format(dominant.MAX_K, n))
    return n


def rect_arg(option):
    def parse(value):
        try:
            return dominant.parse_rect(value, option)
        except ValueError as e:
            raise argparse.ArgumentTypeError(str(e))
    return parse


def distance_arg(value):
    try:
        d = float(value)
    except ValueError:
        raise argparse.ArgumentTypeError("--max-distance must be a number above 0, got {!r}".format(value))
    if not math.isfinite(d) or d <= 0:
        raise argparse.ArgumentTypeError("--max-distance must be a number above 0, got {!r}".format(value))
    return d


def cmd_dominant(args):
    if args.match is None and (args.theme is not None or args.max_distance is not None):
        fail("{} only applies with --match".format("--theme" if args.theme is not None else "--max-distance"))
    check_colour(args.over)
    try:
        result = dominant.analyse(args.image, k=args.k, over=args.over, crop=args.crop, excludes=args.exclude,
                                  tokens=args.match, theme=args.theme,
                                  distance=dominant.DEFAULT_DISTANCE if args.max_distance is None else args.max_distance)
    except dominant.DominantError as e:
        fail(str(e))
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(dominant.text(result))


def add_dominant(sub):
    p = sub.add_parser("dominant", help="the colours seen in a PNG capture, by share of pixels (not a design system's tokens)",
                       description=dominant.NOTICE + " Reads 8-bit, non-interlaced PNG (RGB, RGBA, greyscale, indexed); "
                                   "colours are taken as sRGB and colour profiles are ignored. On macOS, "
                                   "`sips -s format png in.jpg --out out.png` converts a JPEG.")
    p.add_argument("image", help="a PNG file")
    p.add_argument("--k", type=k_arg, default=dominant.DEFAULT_K, metavar="n",
                   help="colours in the by-area list (k-means), 1 to {} (default: %(default)s)".format(dominant.MAX_K))
    p.add_argument("--over", default="#ffffff", metavar="hex", help="colour that partly transparent pixels are composited over "
                                                                "(default: %(default)s); fully transparent pixels are ignored")
    p.add_argument("--crop", type=rect_arg("--crop"), metavar="x,y,w,h", help="analyse only this region")
    p.add_argument("--exclude", type=rect_arg("--exclude"), action="append", default=[], metavar="x,y,w,h",
                   help="leave this region out (repeatable); counted apart from the analysed pixels")
    p.add_argument("--match", metavar="tokens.json", help="assign every pixel to the nearest colour token within --max-distance, "
                                                          "else to an unassigned category")
    p.add_argument("--max-distance", type=distance_arg, metavar="d", help="with --match: the largest OKLab distance at which a "
                   "pixel is assigned to a token (default: {:g}, a design heuristic)".format(dominant.DEFAULT_DISTANCE))
    p.add_argument("--theme", metavar="name", help="with --match: the theme whose colours are matched (default: the first)")
    p.add_argument("--json", action="store_true", help="print JSON, with the unrounded values")
    p.set_defaults(func=cmd_dominant)


def main():
    parser = Parser(prog="colour.py", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True, parser_class=Parser)
    add_contrast(sub)
    add_convert(sub)
    add_ramp(sub)
    add_cvd(sub)
    add_dominant(sub)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
