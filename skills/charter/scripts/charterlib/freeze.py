"""The `freeze` command: raw values that are not tokens in bundle.css and the cards."""
import re
from pathlib import Path

from .cardfile import is_generated
from .css import strip_comments
from .index import read_text

STYLE_ATTR = re.compile(r"(?<![\w-])style\s*=\s*([\"'])(.*?)\1", re.I)
STYLE_OPEN = re.compile(r"<style[^>]*>", re.I)
VAR = re.compile(r"var\((?:[^()]|\([^()]*\))*\)")
# The condition of an @media or @container rule: var() cannot go there, so its values stay raw.
CONDITION = re.compile(r"@(?:media|container)\b[^{};]*", re.I)
RAW = [
    re.compile(r"#[0-9a-fA-F]{3,8}\b"),
    re.compile(r"\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\("),
    re.compile(r"(?<![\w.#-])-?\d*\.?\d+(?:px|rem|em|ch|vh|vw|svh|dvh|pt)\b"),
    re.compile(r"(?<![\w.#-])\d*\.?\d+m?s\b"),
    re.compile(r"cubic-bezier\("),
]
ALLOWED_RAW = {"0px", "1px"}


def _blank(match):
    return "\n" * match.group(0).count("\n")


def _css_fragments(path):
    """(line number, CSS text) pairs: every line of a .css file; in HTML, <style> content and style attributes.
    Comments and @media / @container conditions are gone, line numbers kept."""
    text = CONDITION.sub(_blank, strip_comments(read_text(path)))
    if path.suffix == ".css":
        for number, line in enumerate(text.split("\n"), 1):
            yield number, line
        return
    in_style = False
    for number, line in enumerate(text.split("\n"), 1):
        rest = line
        while rest:
            if in_style:
                end = rest.lower().find("</style>")
                if end == -1:
                    yield number, rest
                    rest = ""
                else:
                    yield number, rest[:end]
                    rest = rest[end + len("</style>"):]
                    in_style = False
            else:
                opening = STYLE_OPEN.search(rest)
                head = rest if opening is None else rest[:opening.start()]
                for match in STYLE_ATTR.finditer(head):
                    yield number, match.group(2)
                rest = "" if opening is None else rest[opening.end():]
                in_style = opening is not None


def _freeze_files(project):
    """bundle.css and every card but the Cover, the wireframes and the copies `cards` generated."""
    components = project / "components"
    if not components.exists():
        return []
    files = [components / "bundle.css"] if (components / "bundle.css").exists() else []
    for folder in sorted(components.iterdir()):
        preview = folder / "preview.html"
        if (folder.is_dir() and folder.name != "Cover" and not folder.name.startswith("Wireframe")
                and preview.is_file() and not is_generated(read_text(preview))):
            files.append(preview)
    return files


def freeze(root):
    """Raw colours, lengths, durations and easings outside tokens, in bundle.css and the cards that use tokens."""
    project = Path(root) / "project"
    problems = []
    for path in _freeze_files(project):
        for number, fragment in _css_fragments(path):
            cleaned = VAR.sub("", fragment)
            for pattern in RAW:
                for match in pattern.finditer(cleaned):
                    if match.group(0) not in ALLOWED_RAW:
                        problems.append("{}:{}: raw value {} (use a token)".format(
                            path.relative_to(project), number, match.group(0).rstrip("(")))
    return problems
