"""Colour conversions for colour.py: sRGB hex, OKLab/OKLCH (D65) and CIELAB/LCH (D50), the CSS Color 4 way.

Sources (all constants and steps below):
- CSS Color Module Level 4, W3C: https://www.w3.org/TR/css-color-4/ (the editor's draft is
  https://drafts.csswg.org/css-color-4/), sections "Specifying Lab and LCH", "Specifying Oklab and Oklch",
  "Converting Lab colors", "Converting Oklab colors", "Sample code for color conversions".
- The W3C sample code, https://github.com/w3c/csswg-drafts, css-color-4/conversions.js at commit
  700ba7b5e6ea39623b68a2a0575c2bb89c640d54. Only its published constants (matrices, white points, thresholds) are
  used here, each marked below; the code around them is written for this plugin.
- B. Ottosson, "A perceptual color space for image processing", https://bottosson.github.io/posts/oklab/ (OKLab).

White points: OKLab and OKLCH are defined on D65 and need no adaptation. CIELAB and LCH, as written by CSS
lab() and lch(), use D50: an sRGB (D65) colour goes to XYZ D65, then to XYZ D50 through the Bradford chromatic
adaptation, then to CIELAB with the D50 white point. XYZ here always means "relative to D65, with white at Y = 1"
unless a name says D50.
"""
import math
import re

STANDARD = "CSS Color 4 (OKLab/OKLCH on D65; lab()/lch() on D50, Bradford adaptation)"

# Reference white D50, from its 4-figure CIE x,y chromaticities (0.3457, 0.3585), as conversions.js writes it.
D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585]

# Linear-light sRGB to XYZ D65 and back: conversions.js, lin_sRGB_to_XYZ and XYZ_to_lin_sRGB (rational form).
SRGB_TO_XYZ = [
    [506752 / 1228815, 87881 / 245763, 12673 / 70218],
    [87098 / 409605, 175762 / 245763, 12673 / 175545],
    [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
]
XYZ_TO_SRGB = [
    [12831 / 3959, -329 / 214, -1974 / 3959],
    [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
    [705 / 12673, -2585 / 12673, 705 / 667],
]

# Bradford chromatic adaptation, D65 to D50 and D50 to D65: conversions.js, D65_to_D50 and D50_to_D65.
D65_TO_D50 = [
    [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
    [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
    [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
]
D50_TO_D65 = [
    [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
    [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
    [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
]

# CIE Lab constants as the CIE standard now defines them (rational), as conversions.js writes them:
# epsilon = 216/24389 (6^3/29^3), kappa = 24389/27 (29^3/3^3).
EPSILON = 216 / 24389
KAPPA = 24389 / 27

# XYZ (D65) to OKLab and back: conversions.js, XYZ_to_OKLab and OKLab_to_XYZ. These are the 2021-01-25 matrices
# of Ottosson's article, recalculated at 64-bit precision for the exact D65 white (see the comments there).
XYZ_TO_LMS = [
    [0.8190224379967030, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
]
LMS_TO_OKLAB = [
    [0.2104542683093140, 0.7936177747023054, -0.0040720430116193],
    [1.9779985324311684, -2.4285922420485799, 0.4505937096174110],
    [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
]
OKLAB_TO_LMS = [
    [1.0000000000000000, 0.3963377773761749, 0.2158037573099136],
    [1.0000000000000000, -0.1055613458156586, -0.0638541728258133],
    [1.0000000000000000, -0.0894841775298119, -1.2914855480194092],
]
LMS_TO_XYZ = [
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
    [-0.0405757452148008, 1.1122868032803170, -0.0717110580655164],
    [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
]

# A hue is powerless (written `none`) when the chroma is at or under these: the epsilons of conversions.js,
# Lab_to_LCH (0.0015) and OKLab_to_OKLCH (0.000004).
LCH_POWERLESS = 0.0015
OKLCH_POWERLESS = 0.000004


def _mul(matrix, vector):
    return [sum(m * v for m, v in zip(row, vector)) for row in matrix]


def _cbrt(x):
    # Sign-matched cube root (JavaScript Math.cbrt). math.cbrt only exists from Python 3.11.
    return math.copysign(abs(x) ** (1.0 / 3.0), x)


# ---- sRGB ---------------------------------------------------------------------------------------------------------

def srgb_to_linear(rgb):
    """Gamma-encoded sRGB to linear light, with the extended transfer function of conversions.js lin_sRGB (odd
    around 0, so out-of-gamut values keep their sign). The knee 0.04045, 12.92, 1.055, 0.055 and 2.4 are the sRGB
    constants (IEC 61966-2-1, as CSS Color 4 gives them)."""
    out = []
    for v in rgb:
        a = abs(v)
        out.append(v / 12.92 if a <= 0.04045 else math.copysign(((a + 0.055) / 1.055) ** 2.4, v))
    return out


def linear_to_srgb(rgb):
    """Linear light to gamma-encoded sRGB, extended like srgb_to_linear (conversions.js gam_sRGB; 0.0031308)."""
    out = []
    for v in rgb:
        a = abs(v)
        out.append(math.copysign(1.055 * a ** (1 / 2.4) - 0.055, v) if a > 0.0031308 else 12.92 * v)
    return out


def srgb_to_xyz(rgb):
    return _mul(SRGB_TO_XYZ, srgb_to_linear(rgb))


def xyz_to_srgb(xyz):
    """XYZ D65 to gamma-encoded sRGB. Not clamped: an out-of-gamut colour has components under 0 or over 1."""
    return linear_to_srgb(_mul(XYZ_TO_SRGB, xyz))


# ---- OKLab, OKLCH (D65) ------------------------------------------------------------------------------------------------

def xyz_to_oklab(xyz):
    lms = _mul(XYZ_TO_LMS, xyz)
    return _mul(LMS_TO_OKLAB, [_cbrt(c) for c in lms])


def oklab_to_xyz(lab):
    lms = _mul(OKLAB_TO_LMS, lab)
    return _mul(LMS_TO_XYZ, [c ** 3 for c in lms])


def _to_polar(a, b, powerless):
    chroma = math.hypot(a, b)
    hue = math.degrees(math.atan2(b, a))
    if hue < 0:
        hue += 360
    return chroma, (None if chroma <= powerless else hue)


def _from_polar(chroma, hue):
    angle = math.radians(hue or 0.0)  # a powerless hue (None) counts as 0
    return chroma * math.cos(angle), chroma * math.sin(angle)


def oklab_to_oklch(lab):
    chroma, hue = _to_polar(lab[1], lab[2], OKLCH_POWERLESS)
    return [lab[0], chroma, hue]


def oklch_to_oklab(lch):
    a, b = _from_polar(lch[1], lch[2])
    return [lch[0], a, b]


# ---- CIELAB, LCH (D50) ---------------------------------------------------------------------------------------------------

def xyz_to_lab(xyz):
    """XYZ D65 to CIELAB D50: Bradford adaptation, then the CIE formula against the D50 white (conversions.js
    XYZ_to_Lab, which takes XYZ relative to D50)."""
    f = []
    for value, white in zip(_mul(D65_TO_D50, xyz), D50):
        v = value / white
        f.append(_cbrt(v) if v > EPSILON else (KAPPA * v + 16) / 116)
    return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])]


def lab_to_xyz(lab):
    """CIELAB D50 to XYZ D65 (conversions.js Lab_to_XYZ, then the Bradford matrix back, D50_to_D65)."""
    lightness116 = lab[0] / 116  # L is kept apart from L + 16 for near-black precision, as the sample code does
    a500 = lab[1] / 500
    b200 = lab[2] / 200
    f1 = lightness116 + 16 / 116
    f0 = f1 + a500
    f2 = f1 - b200
    xyz = [
        f0 ** 3 if f0 ** 3 > EPSILON else (lightness116 + a500) * (116 / KAPPA),
        ((lab[0] + 16) / 116) ** 3 if lab[0] > KAPPA * EPSILON else lab[0] / KAPPA,
        f2 ** 3 if f2 ** 3 > EPSILON else (lightness116 - b200) * (116 / KAPPA),
    ]
    return _mul(D50_TO_D65, [value * white for value, white in zip(xyz, D50)])


def lab_to_lch(lab):
    chroma, hue = _to_polar(lab[1], lab[2], LCH_POWERLESS)
    return [lab[0], chroma, hue]


def lch_to_lab(lch):
    a, b = _from_polar(lch[1], lch[2])
    return [lch[0], a, b]


# ---- CSS text in, CSS text out ---------------------------------------------------------------------------------------------

# Percentage references, CSS Color 4: lab() L 100% = 100, a and b 100% = 125; lch() C 100% = 150;
# oklab() L 100% = 1, a and b 100% = 0.4; oklch() C 100% = 0.4.
# Each function: its three components as (name, kind, what 100% means); kind "hue" takes angles, not percentages.
FUNCTIONS = {
    "oklab": (("L", "num", 1.0), ("a", "num", 0.4), ("b", "num", 0.4)),
    "oklch": (("L", "num", 1.0), ("C", "chroma", 0.4), ("H", "hue", None)),
    "lab": (("L", "num", 100.0), ("a", "num", 125.0), ("b", "num", 125.0)),
    "lch": (("L", "num", 100.0), ("C", "chroma", 150.0), ("H", "hue", None)),
}
KINDS = tuple(FUNCTIONS)

_NUMBER = r"[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?"
_TOKEN = re.compile(r"^(" + _NUMBER + r")(%|deg|grad|rad|turn)?$", re.IGNORECASE)
_FUNCTION = re.compile(r"^([a-z]+)\((.*)\)$", re.IGNORECASE | re.DOTALL)
_HEX = re.compile(r"^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
_DEGREES = {"deg": 1.0, "grad": 0.9, "rad": 180 / math.pi, "turn": 360.0}  # CSS angle units, in degrees


def _component(token, spec, function):
    name, kind, hundred = spec
    if token.lower() == "none":
        return 0.0 if kind != "hue" else None  # `none` is zero for a conversion; a missing hue stays powerless
    m = _TOKEN.match(token)
    if not m:
        raise ValueError("{}(): cannot read {!r} as {}".format(function, token, name))
    number, unit = float(m.group(1)), (m.group(2) or "").lower()
    if not math.isfinite(number):
        raise ValueError("{}(): {!r} is not a finite number".format(function, token))
    if kind == "hue":
        if unit == "%":
            raise ValueError("{}(): the hue takes a number or an angle, not a percentage".format(function))
        return number * _DEGREES.get(unit, 1.0)
    if unit and unit != "%":
        raise ValueError("{}(): {} takes a number or a percentage, not {!r}".format(function, name, token))
    value = number * hundred / 100 if unit == "%" else number
    if kind == "chroma" and value < 0:
        raise ValueError("{}(): chroma cannot be negative ({})".format(function, token))
    return value


def parse(text):
    """A colour as hex (#rgb or #rrggbb, # optional) or as CSS oklab(), oklch(), lab() or lch() with space-separated
    components (numbers, percentages, `none`, and angle units on the hue). Returns (kind, values): kind "hex" with
    [r, g, b] from 0 to 1, or the function's name with its three components. Raises ValueError. Alpha is refused."""
    if not isinstance(text, str):
        raise ValueError("not a colour: {!r}".format(text))
    s = text.strip()
    if _HEX.match(s):
        digits = s.lstrip("#")
        if len(digits) == 3:
            digits = "".join(c * 2 for c in digits)
        return "hex", [int(digits[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    m = _FUNCTION.match(s)
    if not m or m.group(1).lower() not in FUNCTIONS:
        raise ValueError("not a colour: {!r} (use #rgb, #rrggbb, oklch(L C H), oklab(L a b), lch(L C H) or lab(L a b))"
                         .format(text))
    function = m.group(1).lower()
    inner = m.group(2)
    if "/" in inner:
        raise ValueError("{}(): alpha is not supported".format(function))
    tokens = inner.split()
    if len(tokens) != 3:
        raise ValueError("{}() takes three space-separated components, got {}: {!r}".format(function, len(tokens), text))
    return function, [_component(t, spec, function) for t, spec in zip(tokens, FUNCTIONS[function])]


def to_xyz(kind, values):
    """XYZ D65 of a parsed colour."""
    if kind == "hex":
        return srgb_to_xyz(values)
    if kind == "oklab":
        return oklab_to_xyz(values)
    if kind == "oklch":
        return oklab_to_xyz(oklch_to_oklab(values))
    if kind == "lab":
        return lab_to_xyz(values)
    return lab_to_xyz(lch_to_lab(values))


def _trim(value, places):
    text = "{:.{}f}".format(value, places).rstrip("0").rstrip(".")
    return "0" if text in ("", "-0") else text


# Printed precision, by format: the decimals of L, of a, b and C, and of the hue in degrees.
PRECISION = {"oklab": (4, 4, 4), "oklch": (4, 4, 2), "lab": (2, 2, 2), "lch": (2, 2, 2)}
PRECISION_NOTE = ("oklab/oklch: lightness, a, b and chroma to 4 decimals, hue to 2; lab/lch: 2 decimals; "
                  "trailing zeros dropped, a powerless hue written none; every decision uses the unrounded values")


def css(kind, values):
    """The CSS function for three components, at the stated precision: oklch(0.628 0.2577 29.23)."""
    places = PRECISION[kind]
    parts = []
    for i, (value, p) in enumerate(zip(values, places)):
        if value is None:
            parts.append("none")
            continue
        text = _trim(value, p)
        if FUNCTIONS[kind][i][1] == "hue" and float(text) >= 360:
            text = "0"
        parts.append(text)
    return "{}({})".format(kind, " ".join(parts))
