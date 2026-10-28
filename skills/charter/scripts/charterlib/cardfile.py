"""The first line of a card, the type's `<!-- @dsCard … -->` marker, and the 390 px copies `cards` generates."""
import re
from pathlib import Path

from .index import read_text

BOM = "\ufeff"
MARKER = re.compile(r"^<!-- @dsCard\b(.*?)-->\s*$")
GENERATED = "<!-- charter.py cards: generated from "
GENERATED_FROM = re.compile(r"^<!-- charter\.py cards: generated from \.\./(.+)/preview\.html -->")


def marker_attrs(text):
    match = MARKER.match(text.lstrip(BOM).split("\n", 1)[0])
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
    """The marker line with name=value: replaced in place, or added before the closing -->."""
    pattern = r"(\s){}=\S+?(?=\s|-->|$)".format(re.escape(name))
    if re.search(pattern, line):
        return re.sub(pattern, lambda m: "{}{}={}".format(m.group(1), name, value), line, count=1)
    head, sep, tail = line.partition("-->")
    return "{} {}={} {}{}".format(head.rstrip(), name, value, sep, tail)


def mobile_copy(text, name):
    """The 390 px copy of page card `name` whose preview.html is `text`, as `cards` writes it: 844 px high, or
    the card's mobile-height (which the copy does not repeat)."""
    first, _, rest = text.lstrip(BOM).partition("\n")
    attrs = marker_attrs(first)
    height = attr(attrs, "mobile-height") if attrs is not None else None
    height = height if height and height.isdigit() else "844"
    first = re.sub(r"\s+mobile-height=\S+?(?=\s|-->|$)", "", first)
    first = set_attr(set_attr(first, "width", "390"), "height", height)
    return "{}\n{}../{}/preview.html -->\n{}".format(first, GENERATED, name, rest)


def _previews(components):
    """(folder, preview.html text) for every component folder that has a preview."""
    if not components.is_dir():
        return []
    return [(folder, read_text(folder / "preview.html")) for folder in sorted(components.iterdir())
            if folder.is_dir() and (folder / "preview.html").is_file()]


def page_cards(components):
    """{name: text} of the page cards, without their 390 px copies: the copies `cards` generated (known by
    their line 2), and copies made by hand (<Name>Mobile next to a page card <Name>). A page whose own name
    ends in Mobile is a page."""
    found = {}
    for folder, text in _previews(components):
        attrs = marker_attrs(text)
        if attrs is not None and is_page(attrs) and not is_generated(text):
            found[folder.name] = text
    return {name: text for name, text in found.items() if not (name.endswith("Mobile") and name[:-6] in found)}


def mobile_copies(components):
    """The names of the folders that hold a 390 px copy, generated or made by hand."""
    pages = page_cards(components)
    names = {folder.name for folder, text in _previews(components) if is_generated(text)}
    return names | {name + "Mobile" for name in pages if (components / (name + "Mobile")).is_dir()}


def cards(root):
    """Write a 390 px copy, <Name>Mobile, of every page card; remove generated copies whose card is gone."""
    components = Path(root) / "project" / "components"
    if not components.is_dir():
        return "no components yet"
    pages = page_cards(components)
    notes = []
    for folder, text in _previews(components):
        if not is_generated(text):
            continue
        match = GENERATED_FROM.match(text.split("\n", 2)[1])
        source = match.group(1) if match else folder.name[:-len("Mobile")]
        if source not in pages:
            (folder / "preview.html").unlink()
            if not any(folder.iterdir()):
                folder.rmdir()
            notes.append("removed {}".format(folder.name))
    for name, text in pages.items():
        target = components / (name + "Mobile") / "preview.html"
        if target.is_file() and not is_generated(read_text(target)):
            notes.append("kept {}Mobile, made by hand".format(name))
            continue
        target.parent.mkdir(exist_ok=True)
        target.write_text(mobile_copy(text, name), encoding="utf-8")
        notes.append("wrote {}Mobile".format(name))
    return "\n".join(notes) or "no page cards"
