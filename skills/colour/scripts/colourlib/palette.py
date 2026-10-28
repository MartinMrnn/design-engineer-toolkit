"""palette: the charter's colours in one report, read from tokens.json (spec 6.1).

Per theme (all of them, or the one given):
- the OKLCH of every colour token, aliases resolved (the values `convert` gives);
- every contrast pair the contract requires, as `charter.py check` and `charter.py validate-tokens` list them: each text
  token over the grounds its usage note names (text, WCAG 2.2 SC 1.4.3) and the focus ring over each ground (non-text,
  SC 1.4.11). The pairs come from the charter's own code (charterlib.tokens.required_pairs), the ratio, the threshold and
  the pass or fail from colourlib.wcag, so the results are identical to charter.py's by construction;
- the CVD pair distances of the state-* colours, closest first, with no verdict (colourlib.cvd).

There is no emotion section: the emotion indicators are not built in this version (spec 6.5).
"""
from . import convert, cvd, tokenfile, wcag

OKLCH_NOTE = "OKLCH on D65, as CSS Color 4 writes it; the values `convert` gives"
EMOTION_NOTE = "Emotion indicators are not available in this version."
STATE_PREFIX = "state-"


def build(data, path, theme=None):
    by_theme, ids = tokenfile.colours(data, path)
    if theme is not None and theme not in by_theme:
        raise tokenfile.TokenError("unknown theme '{}' (themes: {})".format(theme, ", ".join(ids)))
    tk, ct = tokenfile.charterlib()
    spec = ct.load()["color"]
    entries = tokenfile.table(data)
    pairs = tk.required_pairs(entries, spec)
    themes = []
    for tid in ([theme] if theme else ids):
        resolved = by_theme[tid]
        hexes = dict(resolved)
        colours = []
        for name, hex_value in resolved:
            oklab = convert.xyz_to_oklab(convert.srgb_to_xyz(wcag.parse_hex(hex_value)))
            oklch = convert.oklab_to_oklch(oklab)
            colours.append({"name": name, "hex": hex_value, "oklch": oklch, "css": convert.css("oklch", oklch)})
        contrast = []
        for fg, bg, key in pairs:
            if fg not in hexes or bg not in hexes:
                continue
            threshold = wcag.THRESHOLDS[key]
            value = wcag.ratio(hexes[fg], hexes[bg])
            contrast.append({
                "text": fg, "ground": bg, "text_hex": hexes[fg], "ground_hex": hexes[bg],
                "ratio": value, "ratio_display": wcag.fmt(value, threshold),
                "requirement": threshold.label, "threshold": threshold.minimum, "sc": threshold.sc, "level": threshold.level,
                "meets": wcag.meets(value, threshold),
            })
        states = [c for c in colours if c["name"].startswith(STATE_PREFIX)]
        described = [dict(cvd.describe(wcag.parse_hex(c["hex"])), name=c["name"]) for c in states]
        cvd_pairs = []
        for i, one in enumerate(described):
            for two in described[i + 1:]:
                cvd_pairs.append(dict(cvd.pair(one, two), names=[one["name"], two["name"]]))
        cvd_pairs.sort(key=lambda p: p["closest"]["distance"])  # closest first; equals keep the file's order
        themes.append({"id": tid, "colours": colours, "pairs": contrast,
                       "cvd": {"colours": [{"name": d["name"], "hex": d["hex"], "simulated": d["simulated"]} for d in described],
                               "pairs": cvd_pairs}})
    return {
        "name": data.get("name") if isinstance(data.get("name"), str) else None,
        "file": path,
        "oklch": OKLCH_NOTE,
        "contrast": {"standard": wcag.STANDARD, "compared": "unrounded",
                     "pairs": "those the contract requires, as charter.py check lists them"},
        "cvd": {"model": cvd.MODEL, "severity": cvd.SEVERITY, "method": cvd.METHOD, "distance": cvd.DISTANCE_NOTE,
                "note": cvd.CAUTION},
        "emotion": {"available": False, "note": EMOTION_NOTE},
        "themes": themes,
    }


def _requirement(p):
    return "{}, at least {:g}:1 (SC {}, {})".format(p["requirement"].split(" (")[0], p["threshold"], p["sc"], p["level"])


def text(r):
    out = ["Palette of {} ({}), {} theme{}: {}.".format(
        r["name"] or "tokens.json", r["file"], len(r["themes"]), "" if len(r["themes"]) == 1 else "s",
        ", ".join(t["id"] for t in r["themes"]))]
    for t in r["themes"]:
        width = max(len(c["name"]) for c in t["colours"])
        out += ["", "Theme {}".format(t["id"]), "", "Colours: {}.".format(r["oklch"])]
        for c in t["colours"]:
            out.append("  {:<{w}}  {}  {}".format(c["name"], c["hex"], c["css"], w=width))
        out += ["", "Contrast, {}: the pairs the contract requires, as charter.py check lists them. The ratio is compared "
                    "to the threshold unrounded; the figure shows the decimals needed to keep its side visible.".format(r["contrast"]["standard"])]
        if t["pairs"]:
            pw = max(len("{} on {}".format(p["text"], p["ground"])) for p in t["pairs"])
            for p in t["pairs"]:
                out.append("  {:<{w}}  {:>7}:1  {}: {}".format("{} on {}".format(p["text"], p["ground"]), p["ratio_display"],
                                                             _requirement(p), "pass" if p["meets"] else "FAIL", w=pw))
        else:
            out.append("  No pair: the usage notes name no ground.")
        out += ["", "Colour-vision deficiency of the state-* colours ({}). {}:".format(r["cvd"]["model"], r["cvd"]["distance"])]
        if t["cvd"]["pairs"]:
            names = max(len(" ".join(p["names"])) for p in t["cvd"]["pairs"])
            out.append("  {:<{w}}  {:<8} {:<11} {:<13} {:<11} {}".format(
                "pair, the closest first", "normal", "protanopia", "deuteranopia", "tritanopia", "closest in", w=names + 0))
            for p in t["cvd"]["pairs"]:
                d = p["distance"]
                out.append("  {:<{w}}  {:<8.3f} {:<11.3f} {:<13.3f} {:<11.3f} {}".format(
                    " ".join(p["names"]), d["normal"], d["protanopia"], d["deuteranopia"], d["tritanopia"],
                    p["closest"]["condition"], w=max(names, len("pair, the closest first"))))
            out.append("  " + r["cvd"]["note"])
        else:
            out.append("  Fewer than two state-* colours: nothing to compare.")
    out += ["", r["emotion"]["note"]]
    return "\n".join(out)
