"""The `freeze` command: raw values that are not tokens in bundle.css and the cards."""
import re
from pathlib import Path

STYLE_ATTR = re.compile(r'style="([^"]*)"', re.I)
STYLE_OPEN = re.compile(r"<style[^>]*>", re.I)
VAR = re.compile(r"var\((?:[^()]|\([^()]*\))*\)")
CSS_COMMENT = re.compile(r"/\*.*?\*/")
RAW = [
    re.compile(r"#[0-9a-fA-F]{3,8}\b"),
    re.compile(r"\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\("),
    re.compile(r"(?<![\w.#-])\d*\.?\d+(?:px|rem|em)\b"),
    re.compile(r"(?<![\w.#-])\d*\.?\d+m?s\b"),
    re.compile(r"cubic-bezier\("),
]
ALLOWED_RAW = {"0px", "1px"}


def _css_fragments(path):
    """(line number, CSS text) pairs: every line of a .css file; in HTML, <style> content and style attributes."""
    text = path.read_text(encoding="utf-8")
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
                for value in STYLE_ATTR.findall(head):
                    yield number, value
                rest = "" if opening is None else rest[opening.end():]
                in_style = opening is not None


def _freeze_files(project):
    components = project / "components"
    if not components.exists():
        return []
    files = [components / "bundle.css"] if (components / "bundle.css").exists() else []
    for folder in sorted(components.iterdir()):
        if (folder.is_dir() and folder.name != "Cover" and not folder.name.startswith("Wireframe")
                and not folder.name.endswith("Mobile") and (folder / "preview.html").exists()):
            files.append(folder / "preview.html")
    return files


def freeze(root):
    """Raw colours, lengths, durations and easings outside tokens, in bundle.css and the cards that use tokens."""
    project = Path(root) / "project"
    problems = []
    for path in _freeze_files(project):
        for number, fragment in _css_fragments(path):
            if "@media" in fragment or "@container" in fragment:
                continue
            cleaned = VAR.sub("", CSS_COMMENT.sub("", fragment))
            for pattern in RAW:
                for match in pattern.finditer(cleaned):
                    if match.group(0) not in ALLOWED_RAW:
                        problems.append("{}:{}: raw value {} (use a token)".format(
                            path.relative_to(project), number, match.group(0).rstrip("(")))
    return problems
