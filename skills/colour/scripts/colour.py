#!/usr/bin/env python3
"""colour.py · colour measures for the design studio: WCAG 2.2 contrast.

Standard library only. Errors print as `colour: <message>` on stderr and exit 1, like charter.py.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from colourlib import wcag  # noqa: E402


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


def main():
    parser = Parser(prog="colour.py", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True, parser_class=Parser)
    add_contrast(sub)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
