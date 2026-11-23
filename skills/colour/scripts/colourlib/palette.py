"""palette: the colours of a tokens.css in one report.

Per theme (all of them, or the one given):
- the OKLCH of every colour token, aliases resolved, a transparent colour composited over `--background`;
- the WCAG 2.2 contrast of the pairs the shadcn token names declare: `--foreground` on `--background`, each `--x-foreground`
  on `--x`, `--muted-foreground` also on `--background` and `--card` (text, SC 1.4.3), `--ring` on `--background`
  (non-text, SC 1.4.11);
- the CVD pair distances of the state colours, closest first, with no verdict (colourlib.cvd);
- what could not be measured, never guessed.
"""
from . import convert, cvd, tokenfile, wcag

OKLCH_NOTE = "OKLCH on D65, as CSS Color 4 writes it; the values `convert` gives"
STATES = ("--destructive", "--success", "--warning", "--info")
SUFFIX = "-foreground"


def pairs(table):
    """(foreground, ground, threshold key) of every pair these token names declare, in the order of the file."""
    names = list(table)
    found = [("--foreground", "--background", "text-aa")] if "--foreground" in table and "--background" in table else []
    for name in names:
        if name != "--foreground" and name.endswith(SUFFIX) and name[:-len(SUFFIX)] in table:
            found.append((name, name[:-len(SUFFIX)], "text-aa"))
    if "--muted-foreground" in table:
        found += [("--muted-foreground", ground, "text-aa") for ground in ("--background", "--card") if ground in table]
    if "--ring" in table and "--background" in table:
        found.append(("--ring", "--background", "non-text-aa"))
    return found


def _theme(tid, table, resolved, path):
    found, unread, broken = tokenfile.theme_colours(table)
    hexes = dict(resolved)
    colours = []
    for name, hex_value in resolved:
        oklch = convert.oklab_to_oklch(convert.xyz_to_oklab(convert.srgb_to_xyz(wcag.parse_hex(hex_value))))
        colours.append({"name": name, "hex": hex_value, "oklch": oklch, "css": convert.css("oklch", oklch),
                        "gamut_mapped": found[name][2], "composited": found[name][1] < 1})
    contrast, skipped = [], []
    for fg, bg, key in pairs(table):
        for name in (fg, bg):
            if name in broken:
                raise tokenfile.TokenError("{}: {} in theme '{}': {}".format(path, name, tid, broken[name]))
        if fg not in hexes or bg not in hexes:
            skipped.append({"text": fg, "ground": bg})
            continue
        threshold = wcag.THRESHOLDS[key]
        value = wcag.ratio(hexes[fg], hexes[bg])
        contrast.append({
            "text": fg, "ground": bg, "text_hex": hexes[fg], "ground_hex": hexes[bg],
            "ratio": value, "ratio_display": wcag.fmt(value, threshold),
            "requirement": threshold.label, "threshold": threshold.minimum, "sc": threshold.sc, "level": threshold.level,
            "meets": wcag.meets(value, threshold),
        })
    described = [dict(cvd.describe(wcag.parse_hex(c["hex"])), name=c["name"]) for c in colours if c["name"] in STATES]
    cvd_pairs = []
    for i, one in enumerate(described):
        for two in described[i + 1:]:
            cvd_pairs.append(dict(cvd.pair(one, two), names=[one["name"], two["name"]]))
    cvd_pairs.sort(key=lambda p: p["closest"]["distance"])  # closest first; equals keep the file's order
    return {"id": tid, "colours": colours, "pairs": contrast, "not_measured": {"tokens": unread, "pairs": skipped},
            "cvd": {"colours": [{"name": d["name"], "hex": d["hex"], "simulated": d["simulated"]} for d in described],
                    "pairs": cvd_pairs}}


def build(data, path, theme=None):
    by_theme, ids = tokenfile.colours(data, path)
    if theme is not None and theme not in by_theme:
        raise tokenfile.TokenError("unknown theme '{}' (themes: {})".format(theme, ", ".join(ids)))
    return {
        "file": path,
        "oklch": OKLCH_NOTE,
        "contrast": {"standard": wcag.STANDARD, "compared": "unrounded", "pairs": "those the shadcn token names declare"},
        "cvd": {"model": cvd.MODEL, "severity": cvd.SEVERITY, "method": cvd.METHOD, "distance": cvd.DISTANCE_NOTE,
                "note": cvd.CAUTION},
        "themes": [_theme(tid, data[tid], by_theme[tid], path) for tid in ([theme] if theme else ids)],
    }


def _requirement(p):
    return "{}, at least {:g}:1 (SC {}, {})".format(p["requirement"].split(" (")[0], p["threshold"], p["sc"], p["level"])


def _colour_line(c, width):
    notes = [text for flag, text in ((c["gamut_mapped"], "mapped into sRGB"), (c["composited"], "over --background")) if flag]
    return "  {:<{w}}  {}  {}{}".format(c["name"], c["hex"], c["css"], "  ({})".format(", ".join(notes)) if notes else "", w=width)


def text(r):
    out = ["Palette of {}, {} theme{}: {}.".format(r["file"], len(r["themes"]), "" if len(r["themes"]) == 1 else "s",
                                                  ", ".join(t["id"] for t in r["themes"]))]
    for t in r["themes"]:
        width = max((len(c["name"]) for c in t["colours"]), default=0)
        out += ["", "Theme {}".format(t["id"]), "", "Colours: {}.".format(r["oklch"])]
        out += [_colour_line(c, width) for c in t["colours"]]
        out += ["", "Contrast, {}: the pairs the shadcn token names declare. The ratio is compared to the threshold "
                    "unrounded; the figure shows the decimals needed to keep its side visible.".format(r["contrast"]["standard"])]
        if t["pairs"]:
            pw = max(len("{} on {}".format(p["text"], p["ground"])) for p in t["pairs"])
            for p in t["pairs"]:
                out.append("  {:<{w}}  {:>7}:1  {}: {}".format("{} on {}".format(p["text"], p["ground"]), p["ratio_display"],
                                                             _requirement(p), "pass" if p["meets"] else "FAIL", w=pw))
        else:
            out.append("  No pair: name the tokens as shadcn does (--background, --foreground, --x and --x-foreground).")
        if t["not_measured"]["tokens"] or t["not_measured"]["pairs"]:
            out += ["", "Not measured (write these in hex or OKLCH):"]
            out += ["  {}: {}".format(name, value) for name, value in t["not_measured"]["tokens"].items()]
            out += ["  {} on {}".format(p["text"], p["ground"]) for p in t["not_measured"]["pairs"]]
        out += ["", "Colour-vision deficiency of the state colours ({}). {}:".format(r["cvd"]["model"], r["cvd"]["distance"])]
        if t["cvd"]["pairs"]:
            names = max(len(" ".join(p["names"])) for p in t["cvd"]["pairs"])
            head = "pair, the closest first"
            out.append("  {:<{w}}  {:<8} {:<11} {:<13} {:<11} {}".format(
                head, "normal", "protanopia", "deuteranopia", "tritanopia", "closest in", w=max(names, len(head))))
            for p in t["cvd"]["pairs"]:
                d = p["distance"]
                out.append("  {:<{w}}  {:<8.3f} {:<11.3f} {:<13.3f} {:<11.3f} {}".format(
                    " ".join(p["names"]), d["normal"], d["protanopia"], d["deuteranopia"], d["tritanopia"],
                    p["closest"]["condition"], w=max(names, len(head))))
            out.append("  " + r["cvd"]["note"])
        else:
            out.append("  Fewer than two state colours: nothing to compare.")
    return "\n".join(out)
