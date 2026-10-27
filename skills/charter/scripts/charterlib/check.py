"""The `check` command: a charter, or a branch, against the contract up to a step."""
import json
import re

from . import tokens as tk
from .cardfile import attr, is_page, marker_attrs

LINKS = ('href="../../tokens.css"', 'href="../bundle.css"')
CLASS = re.compile(r"\.(-?[_a-zA-Z][\w-]*)")
COMMENT = re.compile(r"/\*.*?\*/", re.S)


def check(root, contract, due):
    project = root / "project"
    problems = _index(project)
    problems += _sections(project, contract, due)
    if contract["tokens_step"] in due:
        problems += _tokens(project, contract, due)
        problems += _components(project, contract)
    problems += _cards(project, contract, due)
    return problems


def _index(project):
    path = project / "design-system.json"
    if not path.exists():
        return ["design-system.json is missing: run charter.py init"]
    try:
        index = json.loads(path.read_text(encoding="utf-8"))
    except ValueError:
        return ["design-system.json is not valid JSON"]
    problems = []
    if "createdOnFiles" not in index and "convertedFrom" not in index:
        problems.append("design-system.json has no createdOnFiles marker: the page would open it read-only")
    if not str(index.get("title", "")).strip():
        problems.append("design-system.json has no title")
    bundle = project / "components" / "bundle.js"
    if not bundle.exists() or not bundle.read_text(encoding="utf-8").startswith("/* @ds-bundle:"):
        problems.append("components/bundle.js is missing: the page would show static previews (charter.py init writes it)")
    return problems


def _sections(project, contract, due):
    problems = []
    for section in contract["sections"]:
        if section["step"] not in due:
            continue
        path = project / section["file"]
        if not path.exists():
            problems.append("{} is missing (due at {})".format(section["file"], section["step"]))
            continue
        text = path.read_text(encoding="utf-8")
        if contract["placeholder"] in text:
            problems.append("{} is due at {} and still holds its placeholder".format(section["file"], section["step"]))
        elif not [line for line in text.split("\n") if line.strip() and not line.lstrip().startswith("#")]:
            problems.append("{} is due at {} and is empty".format(section["file"], section["step"]))
    return problems


def _tokens(project, contract, due):
    path = project / "tokens.json"
    if not path.exists():
        return ["tokens.json is missing (due at {})".format(contract["tokens_step"])]
    try:
        tokens = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as error:
        return ["tokens.json is not valid JSON: {}".format(error)]
    problems = tk.validate(tokens, contract, due)
    for font in (tokens.get("type") or {}).get("fonts") or []:
        file = font.get("file") if isinstance(font, dict) else None
        if file and not (project / tk.font_path(file)).exists():
            problems.append("tokens.json: font file {} is missing".format(tk.font_path(file)))
    if not problems:
        title = json.loads((project / "design-system.json").read_text(encoding="utf-8")).get("title", "")
        css = project / "tokens.css"
        if not css.exists() or css.read_text(encoding="utf-8") != tk.compile_css(tokens, title):
            problems.append("tokens.css is missing or out of date: run charter.py css")
    return problems


def _card(folder, group, page, links, contract):
    preview = folder / "preview.html"
    name = folder.name
    if not preview.exists():
        return ["components/{}/preview.html is missing".format(name)]
    text = preview.read_text(encoding="utf-8")
    attrs = marker_attrs(text)
    if attrs is None:
        return ["components/{}/preview.html: line 1 must be the <!-- @dsCard ... --> marker".format(name)]
    problems = []
    if group is not None and attr(attrs, "group") != group:
        problems.append('components/{}: its marker needs group="{}"'.format(name, group))
    if page and not is_page(attrs):
        problems.append("components/{}: its marker needs page".format(name))
    if links:
        for link in LINKS:
            if link not in text:
                problems.append("components/{}/preview.html must link {}".format(name, link.split("=", 1)[1]))
    if contract["placeholder"] in text:
        problems.append("components/{}/preview.html still holds a placeholder".format(name))
    return problems


def _components(project, contract):
    components = project / "components"
    problems = []
    bundle = components / "bundle.css"
    if not bundle.exists():
        problems.append("components/bundle.css is missing")
    else:
        css = COMMENT.sub("", bundle.read_text(encoding="utf-8"))
        for cls in sorted(set(CLASS.findall(css))):
            if not cls.startswith(("ds-", "is-")):
                problems.append("components/bundle.css: class .{} must start with ds- (states: is-)".format(cls))
    for name in contract["components"]["names"]:
        folder = components / name
        problems += _card(folder, None, False, True, contract)
        readme = folder / "README.md"
        if not readme.exists():
            problems.append("components/{}/README.md is missing".format(name))
        elif contract["placeholder"] in readme.read_text(encoding="utf-8"):
            problems.append("components/{}/README.md still holds a placeholder".format(name))
    cover = components / "Cover"
    problems += _card(cover, None, False, True, contract)
    if cover.exists() and sorted(p.name for p in cover.iterdir()) != ["preview.html"]:
        problems.append("components/Cover must hold only preview.html, or the type treats it as a component")
    return problems


def _cards(project, contract, due):
    components = project / "components"
    problems = []
    for spec in contract["cards"]:
        if spec["step"] not in due:
            continue
        if "name" in spec:
            folders = [components / spec["name"]]
        else:
            folders = sorted(d for d in components.iterdir() if d.is_dir() and d.name.startswith(spec["prefix"])
                             and not d.name.endswith("Mobile")) if components.exists() else []
            if not folders:
                problems.append("no {}<Page> card yet (due at {})".format(spec["prefix"], spec["step"]))
                continue
        for folder in folders:
            problems += _card(folder, spec["group"], True, spec["links"], contract)
            if not (components / (folder.name + "Mobile") / "preview.html").exists():
                problems.append("components/{}Mobile is missing: run charter.py cards".format(folder.name))
    return problems
