"""WCAG 2.2 contrast: the one implementation that colour.py and charter.py both use.

Sources, all from the WCAG 2.2 text (W3C Recommendation):
- Definitions "relative luminance" and "contrast ratio".
- SC 1.4.3 Contrast (Minimum), AA: 4.5:1 for text, 3:1 for large-scale text.
- SC 1.4.6 Contrast (Enhanced), AAA: 7:1 for text, 4.5:1 for large-scale text.
- SC 1.4.11 Non-text Contrast, AA: 3:1.
The ratio is compared to a threshold unrounded (Understanding SC 1.4.3, informative): 4.499:1 does not meet 4.5:1.
"""
import math
import re
from collections import namedtuple

STANDARD = "WCAG 2.2"

HEX = re.compile(r"^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

# One requirement: a key, a label, the minimum ratio, its success criterion and level, and whether a failure is a defect.
Threshold = namedtuple("Threshold", "key label minimum sc level required")

# Large-scale text is 18 pt, or 14 pt bold (SC 1.4.3). With 1 pt = 4/3 CSS px: 24 px, or 18.67 px bold.
LARGE_TEXT = "large-scale text (24 px, or 18.67 px bold)"

THRESHOLDS = {t.key: t for t in (
    Threshold("text-aa", "text", 4.5, "1.4.3", "AA", True),
    Threshold("large-text-aa", LARGE_TEXT, 3.0, "1.4.3", "AA", True),
    Threshold("non-text-aa", "interface components and graphics", 3.0, "1.4.11", "AA", True),
    # AAA is reported, not required.
    Threshold("text-aaa", "text", 7.0, "1.4.6", "AAA", False),
    Threshold("large-text-aaa", LARGE_TEXT, 4.5, "1.4.6", "AAA", False),
)}


def parse_hex(value):
    """The red, green and blue of a #rgb or #rrggbb colour (the # may be left out), each from 0 to 1.
    Raises ValueError for anything else."""
    if not isinstance(value, str) or not HEX.match(value):
        raise ValueError("not a hex colour: {!r} (use #rgb or #rrggbb)".format(value))
    digits = value.lstrip("#")
    if len(digits) == 3:
        digits = "".join(c * 2 for c in digits)
    return [int(digits[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def _linear(c):
    # sRGB channel to linear light, as the WCAG 2.2 definition writes it.
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_value):
    """L = 0.2126 R + 0.7152 G + 0.0722 B, with R, G and B linearised (WCAG 2.2, "relative luminance")."""
    r, g, b = (_linear(c) for c in parse_hex(hex_value))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    """(L1 + 0.05) / (L2 + 0.05), L1 the lighter colour's luminance (WCAG 2.2, "contrast ratio"). Unrounded."""
    high, low = sorted((relative_luminance(a), relative_luminance(b)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def _minimum(threshold):
    return getattr(threshold, "minimum", threshold)


def meets(value, threshold):
    """Whether a ratio meets a threshold (a Threshold or a number), compared unrounded."""
    return value >= _minimum(threshold)


def fmt(value, threshold):
    """The ratio with two decimals, unless two would show the wrong side of the threshold (4.499 is not 4.50):
    then one decimal more at a time, up to four. If four still hide it, the ratio is cut, never rounded up."""
    wanted = meets(value, threshold)
    for places in (2, 3, 4):
        text = "{:.{}f}".format(value, places)
        if (float(text) >= _minimum(threshold)) == wanted:
            return text
    scale = 10 ** 4
    return "{:.4f}".format(math.floor(value * scale) / scale)
