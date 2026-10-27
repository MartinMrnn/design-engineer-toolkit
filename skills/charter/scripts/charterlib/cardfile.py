"""The first line of a card, the type's `<!-- @dsCard … -->` marker, and the copies `cards` generates."""
import re

MARKER = re.compile(r"^<!-- @dsCard\b(.*?)-->\s*$")
GENERATED = "<!-- charter.py cards: generated from "


def marker_attrs(text):
    match = MARKER.match(text.split("\n", 1)[0])
    return match.group(1) if match else None


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
