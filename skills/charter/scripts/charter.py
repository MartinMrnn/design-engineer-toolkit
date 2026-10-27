#!/usr/bin/env python3
"""charter.py · the design studio's charter: a native Claude Design System kept in local files.

Run from the project folder. See the charter skill's SKILL.md for the commands.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from charterlib import contract as ct  # noqa: E402
from charterlib import tokens as tk  # noqa: E402


def fail(message):
    print("charter: " + message, file=sys.stderr)
    sys.exit(1)


def report(title, problems):
    if problems:
        print("{}: {} problem{}".format(title, len(problems), "" if len(problems) == 1 else "s"))
        for p in problems:
            print("- " + p)
        sys.exit(1)
    print("{}: ok".format(title))


def cmd_validate_tokens(args, contract):
    tokens = json.loads(Path(args.file).read_text(encoding="utf-8"))
    report("tokens", tk.validate(tokens, contract, ct.due_steps(contract, args.step)))


def main(argv=None):
    parser = argparse.ArgumentParser(prog="charter.py")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("validate-tokens", help="validate one tokens.json file (used by the tests)")
    p.add_argument("file")
    p.add_argument("--step", required=True)
    p.set_defaults(func=cmd_validate_tokens)
    args = parser.parse_args(argv)
    contract = ct.load()
    try:
        args.func(args, contract)
    except ValueError as error:
        fail(str(error))


if __name__ == "__main__":
    main()
