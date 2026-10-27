"""The first line of a card, the type's `<!-- @dsCard … -->` marker, and the 390 px copies `cards` generates."""
import re
import shutil
from pathlib import Path

MARKER = re.compile(r"^<!-- @dsCard\b(.*?)-->\s*$")
GENERATED = "<!-- charter.py cards: generated from "


def marker_attrs(text):
    match = MARKER.match(text.split("\n", 1)[0])
    return match.group(1) if match else None


def is_generated(text):
    """Whether a preview.html is a copy written by `cards`: its line 2 says so."""
    lines = text.split("\n", 2)
    return len(lines) > 1 and lines[1].startswith(GENERATED)


def is_page(attrs):
    return re.search(r"(?:^|\s)page(?=\s|=|$)", attrs) is not None


def attr(attrs, name):
    match = re.search(r'(?:^|\s){}=("([^"]*)"|\S+)'.format(re.escape(name)), attrs)
    if not match:
        return None
    return match.group(2) if match.group(2) is not None else match.group(1)


def set_attr(line, name, value):
    pattern = r"(\s){}=\S+".format(re.escape(name))
    if re.search(pattern, line):
        return re.sub(pattern, r"\g<1>{}={}".format(name, value), line, count=1)
    return line.replace("-->", "{}={} -->".format(name, value), 1)


def mobile_copy(text, name):
    """The 390 × 844 copy of page card `name` whose preview.html is `text`, as `cards` writes it."""
    first, rest = text.split("\n", 1)
    first = set_attr(set_attr(first, "width", "390"), "height", "844")
    return "{}\n{}../{}/preview.html -->\n{}".format(first, GENERATED, name, rest)


def cards(root):
    """Write a 390 × 844 copy, <Name>Mobile, of every page card; remove generated copies whose card is gone."""
    components = Path(root) / "project" / "components"
    if not components.exists():
        return "no components yet"
    pages = {}
    for folder in sorted(components.iterdir()):
        preview = folder / "preview.html"
        if folder.is_dir() and not folder.name.endswith("Mobile") and preview.exists():
            attrs = marker_attrs(preview.read_text(encoding="utf-8"))
            if attrs is not None and is_page(attrs):
                pages[folder.name] = preview
    notes = []
    for folder in sorted(components.iterdir()):
        preview = folder / "preview.html"
        if folder.is_dir() and folder.name.endswith("Mobile") and folder.name[:-6] not in pages and preview.exists():
            if preview.read_text(encoding="utf-8").split("\n")[1:2] and preview.read_text(encoding="utf-8").split("\n")[1].startswith(GENERATED):
                shutil.rmtree(folder)
                notes.append("removed {}".format(folder.name))
    for name, preview in pages.items():
        target = components / (name + "Mobile") / "preview.html"
        if target.exists() and not target.read_text(encoding="utf-8").split("\n")[1].startswith(GENERATED):
            notes.append("kept {}Mobile, made by hand".format(name))
            continue
        target.parent.mkdir(exist_ok=True)
        target.write_text(mobile_copy(preview.read_text(encoding="utf-8"), name), encoding="utf-8")
        notes.append("wrote {}Mobile".format(name))
    return "\n".join(notes) or "no page cards"
