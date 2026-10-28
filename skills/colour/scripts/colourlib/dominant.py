"""dominant: the colours seen in a PNG capture, by share of pixels (spec 6.6).

This measures an image. It is not a measure of a design system: for the design's own colours, `palette` on tokens.json is
the source of truth. Everything here is deterministic: the same image and options give the same output, byte for byte.

How it works, in order:
1. The PNG is decoded (png.py) and read as sRGB; colour profiles are ignored.
2. Pixels outside --crop, inside --exclude, or fully transparent (alpha 0) are left out and counted apart. Pixels
   with 0 < alpha < 255 are composited over --over (default white), counted and reported. What remains is the analysed
   set: it is the 100 % of every share.
3. The analysed pixels are counted exactly, colour by colour (a histogram). Every share and every --match decision
   uses these exact counts, so a one-pixel-wide line is never missed by them.
4. By area: k-means in OKLab (colour distance = Euclidean distance in OKLab, deltaEOK of CSS Color 4) on the distinct
   colours, weighted by their pixel counts.
   - Downsampling, for speed: when the image has more than MAX_POINTS distinct colours (a photo, a gradient), the
     centres are fitted on a regular grid sample, one pixel in every s x s (the rows and columns that are multiples of
     s from the crop's top-left corner), s the smallest whole number that gives at most MAX_POINTS grid points. The
     sample does not average pixels (no blending); it can miss a line thinner than s. A screen capture of an interface
     usually has far fewer distinct colours than MAX_POINTS and is then not sampled at all.
   - Initialisation (deterministic): the most frequent colour is the first centre; each next centre is the colour that
     maximises (pixel count x squared distance to the nearest centre so far), the greedy form of k-means++. Ties go to
     the colour with the smaller packed RGB value. Then Lloyd's iterations until no colour changes cluster.
   - With k or fewer distinct colours, each colour is its own cluster and no k-means runs.
   - Afterwards every distinct colour of the full histogram goes to its nearest centre, so the shares are exact.
5. Accents: a second pass on the most chromatic pixels, so a small vivid colour is not averaged away.
6. --match: each distinct colour (hence each pixel) goes to the nearest colour token within d, else unassigned.
"""
import math
import sys
from array import array
from collections import Counter

from . import convert, gamut, png, wcag

NOTICE = "Colours seen in this image, by share of pixels. Not the tokens of a design system."

# What the output says every time (spec 6.6). {k} is filled in.
LIMITS = [
    "Photos and illustrations dominate the area unless excluded (--exclude).",
    "Gradients and anti-aliasing create in-between colours.",
    "Scaling blends neighbouring colours (a capture that was resized). This tool's own sampling does not blend, "
    "but it can miss a line thinner than its step.",
    "The result depends on k (here {k}): a different k groups the same pixels differently.",
    "Embedded colour profiles and the PNG colour-space chunks (iCCP, sRGB, gAMA, cHRM) are ignored: pixel values are read "
    "as sRGB.",
]

DEFAULT_K = 5
MAX_K = 16

# A design heuristic, not a standard (spec 6.6): above the commonly cited OKLab just-noticeable difference (about
# 0.02), to absorb anti-aliasing and compression. Neighbouring tokens can be closer to each other than this.
DEFAULT_DISTANCE = 0.05

# Not from a standard: the most distinct colours the k-means runs on. Each Lloyd iteration costs about
# points x k distance computations; 20 000 keeps a run to a few seconds in plain Python.
MAX_POINTS = 20000

# Spec 6.6: the accents pass reads "the top decile of chroma": the most chromatic tenth of the analysed pixels.
ACCENT_FRACTION = 0.10
# A heuristic of this tool: under this OKLCH chroma a colour reads as near-neutral (a warm grey like #5c5750 has about
# 0.02; a muted brand colour like #b4532a has about 0.13; sRGB reaches about 0.32). Without a floor, the "top decile" of
# an all-grey page would be an arbitrary tenth of its greys.
ACCENT_CHROMA_FLOOR = 0.04
ACCENT_K = 3

LLOYD_MAX_ITERATIONS = 50


class DominantError(ValueError):
    pass


# ---- Colour arithmetic -------------------------------------------------------------------------------------------------

def _compose(first, second):
    return [[sum(a * b for a, b in zip(row, col)) for col in zip(*second)] for row in first]


# Linear sRGB to LMS in one matrix: the product of convert's linear-sRGB-to-XYZ and XYZ-to-LMS matrices. The same
# arithmetic as convert.xyz_to_oklab(convert.srgb_to_xyz(...)), regrouped so that a pixel costs one matrix product.
_SRGB_TO_LMS = _compose(convert.XYZ_TO_LMS, convert.SRGB_TO_XYZ)
_LINEAR = [convert.srgb_to_linear([i / 255])[0] for i in range(256)]


def oklab_of_rgb8(r, g, b):
    lr, lg, lb = _LINEAR[r], _LINEAR[g], _LINEAR[b]
    m = _SRGB_TO_LMS
    l = convert._cbrt(m[0][0] * lr + m[0][1] * lg + m[0][2] * lb)
    mm = convert._cbrt(m[1][0] * lr + m[1][1] * lg + m[1][2] * lb)
    s = convert._cbrt(m[2][0] * lr + m[2][1] * lg + m[2][2] * lb)
    o = convert.LMS_TO_OKLAB
    return (o[0][0] * l + o[0][1] * mm + o[0][2] * s,
            o[1][0] * l + o[1][1] * mm + o[1][2] * s,
            o[2][0] * l + o[2][1] * mm + o[2][2] * s)


def oklab_of_packed(packed):
    return oklab_of_rgb8((packed >> 16) & 255, (packed >> 8) & 255, packed & 255)


def oklab_of_hex(hex_value):
    rgb = [round(c * 255) for c in wcag.parse_hex(hex_value)]
    return list(oklab_of_rgb8(*rgb))


def hex_of_packed(packed):
    return "#{:06x}".format(packed)


def hex_of_oklab(lab):
    """The sRGB colour of an OKLab colour, clipped into the gamut (a mean of in-gamut colours can fall just outside)."""
    srgb = convert.xyz_to_srgb(convert.oklab_to_xyz(list(lab)))
    return convert.to_hex(gamut.clip(srgb))


def _squared(p, q):
    return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2


def nearest(point, centres):
    """[index, distance, second index, second distance] of the centres nearest to `point` (OKLab, Euclidean). An exact
    tie goes to the centre listed first; the second is None, None when there is only one centre."""
    order = sorted(range(len(centres)), key=lambda i: (_squared(point, centres[i]), i))
    first = order[0]
    if len(order) == 1:
        return [first, math.sqrt(_squared(point, centres[first])), None, None]
    second = order[1]
    return [first, math.sqrt(_squared(point, centres[first])), second, math.sqrt(_squared(point, centres[second]))]


def _closest(point, centres):
    """Index of the nearest centre, the first of equals (the hot loop: no sorting)."""
    best, best_d = 0, _squared(point, centres[0])
    for i in range(1, len(centres)):
        d = _squared(point, centres[i])
        if d < best_d:
            best, best_d = i, d
    return best


# ---- k-means -----------------------------------------------------------------------------------------------------------

def kmeans(points, weights, k):
    """Centres (OKLab triples) of a weighted k-means, deterministic (see the module notes). `points` must be listed in
    a fixed order (here, by packed RGB value): ties go to the lower index."""
    n = len(points)
    if n <= k:
        return [tuple(p) for p in points]
    first = max(range(n), key=lambda i: (weights[i], -i))
    centres = [points[first]]
    gap = [_squared(p, points[first]) for p in points]
    while len(centres) < k:
        best = max(range(n), key=lambda i: (weights[i] * gap[i], -i))
        if weights[best] * gap[best] <= 0:
            break
        centres.append(points[best])
        gap = [min(g, _squared(p, points[best])) for g, p in zip(gap, points)]
    owner = [-1] * n
    for _ in range(LLOYD_MAX_ITERATIONS):
        changed = False
        sums = [[0.0, 0.0, 0.0, 0] for _ in centres]
        for i, p in enumerate(points):
            c = _closest(p, centres)
            if c != owner[i]:
                owner[i] = c
                changed = True
            w = weights[i]
            s = sums[c]
            s[0] += w * p[0]
            s[1] += w * p[1]
            s[2] += w * p[2]
            s[3] += w
        if not changed:
            break
        centres = [(s[0] / s[3], s[1] / s[3], s[2] / s[3]) if s[3] else c for s, c in zip(sums, centres)]
    return centres


class Grid:
    """The analysed pixels of the crop, row by row: a packed #rrggbb per pixel, -1 for a pixel left out."""

    def __init__(self, packed, width, height):
        self.packed, self.width, self.height = packed, width, height

    def stride(self):
        s = max(2, math.ceil(math.sqrt(self.width * self.height / MAX_POINTS)))
        while math.ceil(self.width / s) * math.ceil(self.height / s) > MAX_POINTS:
            s += 1
        return s

    def sample(self, stride, select):
        counts = Counter()
        for y in range(0, self.height, stride):
            counts.update(self.packed[y * self.width:(y + 1) * self.width:stride])
        return Counter({c: n for c, n in counts.items() if c >= 0 and select(c)})


def fit(select, hist, grid, k, labs):
    """Cluster the colours of `hist` for which select(packed) holds. Returns (centres, info): info says whether the
    centres were fitted on a grid sample (and its stride and size), or on every distinct colour."""
    colours = sorted(c for c in hist if select(c))
    info = {"downsampled": False, "stride": 1, "sample_pixels": sum(hist[c] for c in colours), "distinct": len(colours)}
    if not colours:
        return [], info
    entries = [(c, hist[c]) for c in colours]
    if len(colours) > MAX_POINTS:
        stride = grid.stride()
        sample = grid.sample(stride, select)
        if not sample:
            # The grid missed every selected pixel (a region thinner than the step): use the most frequent colours.
            sample = Counter(dict(sorted(entries, key=lambda e: (-e[1], e[0]))[:MAX_POINTS]))
            stride = 1
        entries = sorted(sample.items())
        info.update(downsampled=True, stride=stride, sample_pixels=sum(sample.values()))
    points = [labs(c) for c, _ in entries]
    return kmeans(points, [n for _, n in entries], k), info


def group(select, hist, grid, k, labs, total):
    """k-means clusters of the selected colours, with their exact pixel counts and shares of `total`, largest first."""
    centres, info = fit(select, hist, grid, k, labs)
    counts = [0] * len(centres)
    for c, n in hist.items():
        if select(c):
            counts[_closest(labs(c), centres)] += n
    clusters = []
    for centre, n in zip(centres, counts):
        if n:
            oklch = convert.oklab_to_oklch(list(centre))
            clusters.append({"hex": hex_of_oklab(centre), "pixels": n, "share": n / total, "oklch": oklch,
                             "css": convert.css("oklch", oklch), "_lab": centre})
    clusters.sort(key=lambda c: (-c["pixels"], c["hex"]))
    return clusters, info


def public(clusters):
    return [{k: v for k, v in c.items() if not k.startswith("_")} for c in clusters]


# ---- Reading the image -----------------------------------------------------------------------------------------------------

def parse_rect(text, option):
    parts = text.split(",")
    try:
        if len(parts) != 4 or not all(p.strip().isdigit() for p in parts):
            raise ValueError
        x, y, w, h = (int(p) for p in parts)
    except ValueError:
        raise ValueError("{} must be x,y,w,h: four whole numbers (the left and top corner, the width and height in "
                         "pixels), got {!r}".format(option, text)) from None
    if w == 0 or h == 0:
        raise ValueError("{}: the width and height must be positive, got {!r}".format(option, text))
    return x, y, w, h


def _composite(value, over):
    """The packed #rrggbb of a pixel (little-endian RGBA integer) over the colour `over` (r, g, b); -1 if alpha is 0."""
    r, g, b, a = value & 255, (value >> 8) & 255, (value >> 16) & 255, value >> 24
    if a == 0:
        return -1
    if a < 255:
        # round-half-up of (src x a + over x (255 - a)) / 255, in integers
        r, g, b = ((2 * (s * a + o * (255 - a)) + 255) // 510 for s, o in zip((r, g, b), over))
    return (r << 16) | (g << 8) | b


def load(path, crop, excludes, over_hex):
    """The Grid of analysed pixels and the counts, from a PNG file."""
    try:
        width, height, rgba = png.read(path)
    except png.PngError as e:
        raise DominantError("{}: {}".format(path, e)) from None
    except OSError as e:
        raise DominantError("cannot read {}: {}".format(path, e.strerror or e)) from None
    x0, y0, cw, ch = crop if crop else (0, 0, width, height)
    if x0 + cw > width or y0 + ch > height:
        raise DominantError("--crop {} reaches outside the image ({} x {} pixels)".format(
            ",".join(str(v) for v in (x0, y0, cw, ch)), width, height))
    values = array("I")
    values.frombytes(rgba)
    if values.itemsize != 4:
        raise DominantError("this Python's C unsigned int is not 32 bits: cannot read the pixels")
    if sys.byteorder == "big":
        values.byteswap()
    region = array("q")
    for y in range(y0, y0 + ch):
        region.fromlist(values[y * width + x0:y * width + x0 + cw].tolist())
    # Excluded pixels: a mask over the crop, so that overlapping excludes count each pixel once.
    mask = bytearray(cw * ch)
    for ex, ey, ew, eh in excludes:
        left, right = max(ex, x0) - x0, min(ex + ew, x0 + cw) - x0
        top, bottom = max(ey, y0) - y0, min(ey + eh, y0 + ch) - y0
        for row in range(top, bottom):
            if left < right:
                mask[row * cw + left:row * cw + right] = b"\x01" * (right - left)
                region[row * cw + left:row * cw + right] = array("q", [-1]) * (right - left)
    excluded = mask.count(1)
    over = [round(c * 255) for c in wcag.parse_hex(over_hex)]
    seen = Counter(region)
    cache = {v: (-1 if v < 0 else _composite(v, over)) for v in seen}
    transparent = sum(n for v, n in seen.items() if v >= 0 and v >> 24 == 0)
    composited = sum(n for v, n in seen.items() if v >= 0 and 0 < v >> 24 < 255)
    packed = array("i", [cache[v] for v in region])
    analysed = len(packed) - excluded - transparent
    if analysed <= 0:
        raise DominantError("nothing to analyse: every pixel is transparent, outside --crop or inside --exclude")
    pixels = {"total": width * height, "outside_crop": width * height - cw * ch, "excluded": excluded,
              "transparent": transparent, "analysed": analysed, "composited": composited,
              "over": convert.to_hex([c / 255 for c in over])}
    return width, height, Grid(packed, cw, ch), pixels


# ---- Matching to tokens --------------------------------------------------------------------------------------------------------

def token_colours(resolved):
    """[{names, hex, lab}]: the tokens of one theme, tokens that resolve to the same colour merged (all their names),
    in the order of each colour's first token in tokens.json."""
    colours, by_hex = [], {}
    for name, hex_value in resolved:
        if hex_value in by_hex:
            by_hex[hex_value]["names"].append(name)
        else:
            by_hex[hex_value] = {"names": [name], "hex": hex_value, "lab": tuple(oklab_of_hex(hex_value))}
            colours.append(by_hex[hex_value])
    return colours


def match(hist, grid, tokens, d, k, labs, total):
    labs_t = [t["lab"] for t in tokens]
    counts = [0] * len(tokens)
    ambiguous_of = [0] * len(tokens)
    pairs = Counter()
    unassigned = {}
    for c in sorted(hist):
        n = hist[c]
        first, dist, second, dist2 = nearest(labs(c), labs_t)
        if dist <= d:
            counts[first] += n
            if second is not None and dist2 <= d:
                ambiguous_of[first] += n
                pairs[(min(first, second), max(first, second))] += n
        else:
            unassigned[c] = n
    close = []
    for i in range(len(tokens)):
        for j in range(i + 1, len(tokens)):
            dist = math.sqrt(_squared(labs_t[i], labs_t[j]))
            if dist < d:
                close.append({"a": _ref(tokens[i]), "b": _ref(tokens[j]), "distance": dist})
    close.sort(key=lambda p: (p["distance"], p["a"]["names"], p["b"]["names"]))
    entries = [{"names": t["names"], "hex": t["hex"], "pixels": n, "share": n / total, "ambiguous_pixels": a,
                "ambiguous_share": a / total} for t, n, a in zip(tokens, counts, ambiguous_of)]
    clusters, _ = group(lambda c: c in unassigned, hist, grid, k, labs, total)
    for cluster in clusters:
        index, dist, _s, _d = nearest(cluster["_lab"], labs_t)
        cluster["nearest"] = {"names": tokens[index]["names"], "hex": tokens[index]["hex"], "distance": dist}
    count_unassigned = sum(unassigned.values())
    return {
        "max_distance": d,
        "distance": "OKLab Euclidean distance (deltaEOK, CSS Color 4)",
        "close_pairs": close,
        "tokens": entries,
        "unassigned": {"pixels": count_unassigned, "share": count_unassigned / total, "colours": public(clusters)},
        "ambiguous": [{"a": _ref(tokens[i]), "b": _ref(tokens[j]), "pixels": n, "share": n / total}
                      for (i, j), n in sorted(pairs.items())],
    }


def _ref(token):
    return {"names": token["names"], "hex": token["hex"]}


# ---- The command --------------------------------------------------------------------------------------------------------------------

def accents(hist, grid, k, labs, total):
    chroma = {c: math.hypot(labs(c)[1], labs(c)[2]) for c in hist}
    target = math.ceil(ACCENT_FRACTION * total)
    chosen, running, threshold = set(), 0, None
    for c in sorted(hist, key=lambda c: (-chroma[c], c)):
        if running >= target or chroma[c] < ACCENT_CHROMA_FLOOR:
            break
        chosen.add(c)
        running += hist[c]
        threshold = chroma[c]
    clusters, _ = group(lambda c: c in chosen, hist, grid, min(k, ACCENT_K), labs, total)
    return {
        "fraction": ACCENT_FRACTION,
        "chroma_floor": ACCENT_CHROMA_FLOOR,
        "definition": "the most chromatic 10 % of the analysed pixels (the top decile of OKLCH chroma), "
                      "only those with chroma of at least {} (a heuristic floor: under it a colour reads as "
                      "near-neutral), grouped into at most {} colours".format(ACCENT_CHROMA_FLOOR, ACCENT_K),
        "threshold": threshold,
        "pixels": running,
        "colours": public(clusters),
    }


def analyse(path, k=DEFAULT_K, over="#ffffff", crop=None, excludes=(), tokens=None, theme=None, distance=DEFAULT_DISTANCE):
    """The whole result as a dict. `tokens` is the path of a tokens.json for --match."""
    from . import tokenfile
    resolved = None
    if tokens is not None:
        try:
            data = tokenfile.read(tokens)
            by_theme, ids = tokenfile.colours(data, tokens)
        except tokenfile.TokenError as e:
            raise DominantError(str(e)) from None
        theme = theme or ids[0]
        if theme not in by_theme:
            raise DominantError("unknown theme '{}' (themes: {})".format(theme, ", ".join(ids)))
        resolved = by_theme[theme]
    width, height, grid, pixels = load(path, crop, excludes, over)
    total = pixels["analysed"]
    hist = Counter(grid.packed)
    hist.pop(-1, None)
    cache = {}

    def labs(c):
        if c not in cache:
            cache[c] = oklab_of_packed(c)
        return cache[c]

    clusters, info = group(lambda c: True, hist, grid, k, labs, total)
    result = {
        "notice": NOTICE,
        "limits": [text.format(k=k) for text in LIMITS],
        "image": {"path": path, "width": width, "height": height},
        "pixels": pixels,
        "method": {
            "algorithm": "k-means", "space": "OKLab", "k": k, "colours_found": len(clusters),
            "initialisation": "the most frequent colour, then the colour that maximises pixels x squared distance "
                              "to the nearest centre so far (greedy k-means++); ties to the smaller RGB value",
            "downsampled": info["downsampled"], "stride": info["stride"], "sample_pixels": info["sample_pixels"],
            "distinct_colours": info["distinct"], "max_points": MAX_POINTS,
            "shares": "counted on every analysed pixel",
        },
        "areas": public(clusters),
        "accents": accents(hist, grid, k, labs, total),
    }
    if resolved is not None:
        toks = token_colours(resolved)
        result["match"] = dict(match(hist, grid, toks, distance, k, labs, total), theme=theme)
    return result


# ---- Text ----------------------------------------------------------------------------------------------------------------------------------

def _pct(share):
    return "{:.2f} %".format(share * 100).rjust(8)


def _names(names):
    return ", ".join(names)


def text(r):
    p, m = r["pixels"], r["method"]
    out = [r["notice"], "", "Limits that apply:"]
    out += ["  - " + line for line in r["limits"]]
    out += ["", "Image: {}, {} x {} pixels.".format(r["image"]["path"], r["image"]["width"], r["image"]["height"])]
    out.append("Analysed: {} pixels, the 100 % of every share. Left out, counted apart from it: {} outside --crop, "
               "{} excluded, {} fully transparent.".format(p["analysed"], p["outside_crop"], p["excluded"], p["transparent"]))
    if p["composited"]:
        out.append("Composited: {} partly transparent pixels, composited over {} (--over); they are counted in the "
                   "analysed pixels.".format(p["composited"], p["over"]))
    if m["downsampled"]:
        fitted = ("the centres are fitted on a sample, one pixel in every {s} x {s} ({n} pixels, of {d} distinct "
                  "colours in the image); the shares are counted on every analysed pixel").format(
                      s=m["stride"], n=m["sample_pixels"], d=m["distinct_colours"])
    else:
        fitted = "{} distinct colours, counted exactly on every analysed pixel, no sampling".format(m["distinct_colours"])
    out.append("Method: k-means in OKLab, k = {}, deterministic ({}).".format(m["k"], fitted))
    out += ["", "By area ({} colours):".format(len(r["areas"]))]
    for c in r["areas"]:
        out.append("  {}  {}  {:>6} pixels  {}".format(c["hex"], _pct(c["share"]), c["pixels"], c["css"]))
    a = r["accents"]
    out += ["", "Accents: " + a["definition"] + ":"]
    if a["colours"]:
        for c in a["colours"]:
            out.append("  {}  {}  {:>6} pixels  {}".format(c["hex"], _pct(c["share"]), c["pixels"], c["css"]))
        out.append("  (shares of all analysed pixels; an accent is often already part of an area colour)")
    else:
        out.append("  none: no pixel reaches chroma {}.".format(a["chroma_floor"]))
    if "match" in r:
        out += _match_text(r["match"], p["analysed"])
    return "\n".join(out)


def _match_text(m, analysed):
    out = ["", "Match to the colour tokens (theme {}): each analysed pixel goes to the nearest token if its {} is at "
               "most d = {:g} (heuristic, configurable); farther pixels are unassigned, never moved to a token.".format(
                   m["theme"], m["distance"], m["max_distance"])]
    if m["close_pairs"]:
        out += ["", "Warning: these colour tokens are closer to each other than d, so this capture cannot tell them "
                    "apart reliably:"]
        for pair in m["close_pairs"]:
            out.append("  {} and {}: {:.3f}".format(_names(pair["a"]["names"]), _names(pair["b"]["names"]), pair["distance"]))
    width = max(len(_names(t["names"])) for t in m["tokens"])
    width = max(width, len("unassigned"))
    out += ["", "Token shares of the analysed pixels (tokens that resolve to the same colour are listed together):"]
    for t in m["tokens"]:
        extra = "  ({} of them ambiguous)".format(t["ambiguous_pixels"]) if t["ambiguous_pixels"] else ""
        out.append("  {:<{w}}  {}  {}  {:>6} pixels{}".format(_names(t["names"]), t["hex"], _pct(t["share"]), t["pixels"], extra, w=width))
    u = m["unassigned"]
    out.append("  {:<{w}}  {}  {}  {:>6} pixels".format("unassigned", " " * 7, _pct(u["share"]), u["pixels"], w=width))
    total = sum(t["share"] for t in m["tokens"]) + u["share"]
    out.append("  {:<{w}}  {}  {}".format("total", " " * 7, _pct(total), w=width))
    if u["colours"]:
        out += ["", "Main unassigned colours, with the nearest token and its distance:"]
        for c in u["colours"]:
            out.append("  {}  {}  nearest token: {} {} ({:.3f})".format(
                c["hex"], _pct(c["share"]), _names(c["nearest"]["names"]), c["nearest"]["hex"], c["nearest"]["distance"]))
    if m["ambiguous"]:
        out += ["", "Ambiguous pixels (the second-nearest token is also within d): each is counted once, to its nearest "
                    "token, so the two shares of a pair may swap:"]
        for pair in m["ambiguous"]:
            out.append("  {} and {}: {} of analysed pixels ({} pixels)".format(
                _names(pair["a"]["names"]), _names(pair["b"]["names"]), _pct(pair["share"]), pair["pixels"]))
    return out
