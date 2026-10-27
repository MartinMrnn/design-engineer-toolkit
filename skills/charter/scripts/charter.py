#!/usr/bin/env python3
"""charter.py · the design studio's charter: a native Claude Design System kept in local files.

Run from the project folder. Each command is described in the charter skill's SKILL.md.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from charterlib import check as ck  # noqa: E402
from charterlib import contract as ct  # noqa: E402
from charterlib import project as pj  # noqa: E402
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


def root_arg(parser, default="design/charter"):
    parser.add_argument("--root", default=default, help="the folder that holds project/ (default: %(default)s)")


def add_validate_tokens(sub):
    p = sub.add_parser("validate-tokens", help="validate one tokens.json file at a step")
    p.add_argument("file")
    p.add_argument("--step", required=True)
    p.set_defaults(func=lambda a, c: report("tokens", tk.validate(
        json.loads(Path(a.file).read_text(encoding="utf-8")), c, ct.due_steps(c, a.step))))


def add_init(sub):
    p = sub.add_parser("init", help="create the charter's skeleton and index")
    p.add_argument("--title", required=True)
    root_arg(p)
    p.set_defaults(func=lambda a, c: print(pj.init(Path(a.root), a.title)))


def add_stamp(sub):
    p = sub.add_parser("stamp", help="set the index's lastChange right before a publish")
    p.add_argument("--step", required=True)
    p.add_argument("--by", required=True, help="the user's name")
    p.add_argument("--title", help="a new title (rename)")
    p.add_argument("--remote", help="the published project/design-system.json, read right before")
    p.add_argument("--note")
    root_arg(p)
    p.set_defaults(func=lambda a, c: print(pj.stamp(Path(a.root), a.step, a.by, a.title, a.remote, a.note)))


def add_css(sub):
    p = sub.add_parser("css", help="compile project/tokens.css from project/tokens.json")
    root_arg(p)
    p.set_defaults(func=lambda a, c: print(pj.write_css(Path(a.root))))


def add_branch(sub):
    p = sub.add_parser("branch", help="create C2 branches from the charter")
    p.add_argument("ids", nargs="+", help="one lower-case letter per branch, for example: a b c")
    root_arg(p)
    p.add_argument("--out", default="design/branches")
    p.set_defaults(func=lambda a, c: print(pj.branch(Path(a.root), Path(a.out), a.ids, c)))


def add_cards(sub):
    p = sub.add_parser("cards", help="write the 390 px copy of every page card")
    root_arg(p)
    p.set_defaults(func=lambda a, c: print(pj.cards(Path(a.root))))


def add_check(sub):
    p = sub.add_parser("check", help="validate the charter against the contract up to a step")
    p.add_argument("--step", required=True)
    root_arg(p)
    p.set_defaults(func=lambda a, c: report("check {}".format(a.step), ck.check(Path(a.root), c, ct.due_steps(c, a.step))))


ADDERS = [add_validate_tokens, add_init, add_stamp, add_css, add_branch, add_cards, add_check]


def main(argv=None):
    parser = argparse.ArgumentParser(prog="charter.py", description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)
    for add in ADDERS:
        add(sub)
    args = parser.parse_args(argv)
    contract = ct.load()
    try:
        args.func(args, contract)
    except (ValueError, FileNotFoundError, FileExistsError) as error:
        fail(str(error))


if __name__ == "__main__":
    main()
