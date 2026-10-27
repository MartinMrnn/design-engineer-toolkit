#!/usr/bin/env python3
"""kickoff.py · sets up a design studio project in the current folder.

Usage, from the project folder:
    python3 "<studio skill directory>/scripts/kickoff.py"

It creates the project folders, installs the critic's scripts in
design/reviews/scripts/ with their output folder filled in, and copies the
starting templates. The charter itself is created by the charter skill's
`charter.py init`, once the client's name is known. It can run again safely: it
reinstalls the critic's scripts but never overwrites a template that already exists. It refuses to
run, and changes nothing, in the home folder or at the filesystem root.
"""
import json
import os
import sys
from pathlib import Path

# The critic's scripts hold this exact literal once; it becomes the output folder.
TOKEN = "'__OUT__'"
SCRIPTS = ["capture.js", "checks.js"]
FOLDERS = [
    "design/inspiration/captures",
    "design/ux/captures",
    "design/charter",
    "design/branches",
    "design/board",
    "design/mockups",
    "design/motion",
    "design/reviews/scripts",
    "design/reviews/captures",
    "site",
    ".claude",
]
TEMPLATES = [
    ("references/launch.json", ".claude/launch.json"),
    ("references/decisions.md", "design/decisions.md"),
    ("references/feedback.md", "design/feedback.md"),
    ("references/deviations.md", "design/deviations.md"),
]


def fail(message):
    print("kickoff: " + message, file=sys.stderr)
    sys.exit(1)


def install_script(source, target, out):
    text = source.read_text(encoding="utf-8")
    count = text.count(TOKEN)
    if count != 1:
        fail("{} must contain {} exactly once, found {}".format(source, TOKEN, count))
    # A JSON string is a valid JavaScript string literal, whatever the path holds:
    # quotes, &, #, $, backslashes or accents.
    temporary = target.with_name(target.name + ".tmp")
    temporary.write_text(text.replace(TOKEN, json.dumps(out)), encoding="utf-8")
    os.replace(str(temporary), str(target))


def main():
    skill_dir = Path(__file__).resolve().parent.parent
    plugin_root = skill_dir.parent.parent
    project = Path.cwd().resolve()

    if project == Path.home().resolve() or project == Path(project.anchor):
        fail("refusing to set up a studio project in {}. Open the session in a folder "
             "dedicated to the client project, then run the kickoff again.".format(project))

    for folder in FOLDERS:
        (project / folder).mkdir(parents=True, exist_ok=True)

    out = str(project / "design/reviews/captures")
    for name in SCRIPTS:
        install_script(plugin_root / "skills/critique/scripts" / name,
                       project / "design/reviews/scripts" / name, out)
        print("installed design/reviews/scripts/{} (output folder: {})".format(name, out))

    for source, target in TEMPLATES:
        destination = project / target
        if destination.exists():
            print("kept the existing {}".format(target))
            continue
        destination.write_bytes((skill_dir / source).read_bytes())
        print("created {}".format(target))


if __name__ == "__main__":
    main()
