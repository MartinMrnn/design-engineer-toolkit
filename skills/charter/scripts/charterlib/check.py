"""The `check` command: a charter, or a branch, against the contract up to a step."""
from . import tokens as tk
from .cardfile import attr, is_generated, is_page, marker_attrs, mobile_copies, mobile_copy
from .css import selector_classes
from .index import read_json, read_text

LINKS = ('href="../../tokens.css"', 'href="../bundle.css"')


def check(root, contract, due, sketch=False):
    project = root / "project"
    problems = _index(project)
    problems += _sections(project, contract, due)
    if contract["tokens_step"] in due:
        problems += _tokens(project, contract, due)
        problems += _components(project, contract, sketch)
    problems += _cards(project, contract, due)
    return problems


def _index(project):
    path = project / "design-system.json"
    if not path.exists():
        return ["design-system.json is missing: run charter.py init"]
    try:
        index = read_json(path)
    except ValueError:
        return ["design-system.json is not valid JSON"]
    if not isinstance(index, dict):
        return ["design-system.json must be a JSON object"]
    problems = []
    if "createdOnFiles" not in index and "convertedFrom" not in index:
        problems.append("design-system.json has no createdOnFiles marker: the page would open it read-only")
    if not str(index.get("title", "")).strip():
        problems.append("design-system.json has no title")
    bundle = project / "components" / "bundle.js"
    if not bundle.exists() or not read_text(bundle).startswith("/* @ds-bundle:"):
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
        text = read_text(path)
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
        tokens = read_json(path)
    except ValueError as error:
        return ["tokens.json is not valid JSON: {}".format(str(error).replace(str(path) + ": ", "", 1))]
    problems = tk.validate(tokens, contract, due)
    type_block = tokens.get("type") if isinstance(tokens, dict) else None
    fonts = type_block.get("fonts") if isinstance(type_block, dict) else None
    for font in fonts if isinstance(fonts, list) else []:
        file = font.get("file") if isinstance(font, dict) else None
        if isinstance(file, str) and file and not (project / tk.font_path(file)).exists():
            problems.append("tokens.json: font file {} is missing".format(tk.font_path(file)))
    index_path = project / "design-system.json"
    if not problems and index_path.exists():
        index = read_json(index_path)
        title = index.get("title", "") if isinstance(index, dict) else ""
        css = project / "tokens.css"
        if not css.exists() or read_text(css) != tk.compile_css(tokens, title):
            problems.append("tokens.css is missing or out of date: run charter.py css")
    return problems


def _card(folder, group, page, links, contract):
    preview = folder / "preview.html"
    name = folder.name
    if not preview.exists():
        return ["components/{}/preview.html is missing".format(name)]
    text = read_text(preview)
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


def _surfaces(project, contract):
    """The surface-n tokens the palette holds, in the contract's order; none when tokens.json cannot be read (check
    says so in _tokens)."""
    path = project / "tokens.json"
    try:
        entries = tk.as_list(tk.as_dict(tk.as_dict(read_json(path)).get("color")).get("tokens")) if path.exists() else []
    except ValueError:
        return []
    names = {e.get("name") for e in entries if isinstance(e, dict)}
    return [surface for surface in contract["color"].get("surfaces", {}) if surface in names]


def _components(project, contract, sketch=False):
    components = project / "components"
    problems = []
    bundle = components / "bundle.css"
    if not bundle.exists():
        problems.append("components/bundle.css is missing")
    else:
        for cls in sorted(selector_classes(read_text(bundle))):
            if not cls.startswith(("ds-", "is-")):
                problems.append("components/bundle.css: class .{} must start with ds- (states: is-)".format(cls))
    if bundle.exists():
        classes = selector_classes(read_text(bundle))
        for surface in _surfaces(project, contract):
            if "ds-" + surface not in classes:
                problems.append("components/bundle.css: {} needs a class .ds-{} (background, text and focus outline colour)".format(
                    surface, surface))
    for name in contract["components"]["sketch" if sketch else "names"]:
        folder = components / name
        problems += _card(folder, None, False, True, contract)
        readme = folder / "README.md"
        if not readme.exists():
            problems.append("components/{}/README.md is missing".format(name))
        elif contract["placeholder"] in read_text(readme):
            problems.append("components/{}/README.md still holds a placeholder".format(name))
    cover = components / "Cover"
    problems += _card(cover, None, False, True, contract)
    if cover.exists() and sorted(p.name for p in cover.iterdir()) != ["preview.html"]:
        problems.append("components/Cover must hold only preview.html, or the type treats it as a component")
    return problems


def _cards(project, contract, due):
    components = project / "components"
    copies = mobile_copies(components)
    problems = []
    for spec in contract["cards"]:
        if spec["step"] not in due:
            continue
        if "name" in spec:
            folders = [components / spec["name"]]
        else:
            folders = sorted(d for d in components.iterdir() if d.is_dir() and d.name.startswith(spec["prefix"])
                             and d.name not in copies) if components.exists() else []
            if not folders:
                problems.append("no {}<Page> card yet (due at {})".format(spec["prefix"], spec["step"]))
                continue
        for folder in folders:
            problems += _card(folder, spec["group"], True, spec["links"], contract)
            problems += _copy(folder)
    return problems


def _copy(folder):
    """The 390 px copy of a page card: present and, when generated, what `cards` would write now."""
    copy = folder.parent / (folder.name + "Mobile") / "preview.html"
    if not copy.is_file():
        return ["components/{}Mobile is missing: run charter.py cards".format(folder.name)]
    text = read_text(copy)
    source = folder / "preview.html"
    if is_generated(text) and source.is_file() and text != mobile_copy(read_text(source), folder.name):
        return ["components/{}Mobile is out of date: run charter.py cards".format(folder.name)]
    return []
