"""Commands that write the charter's files: init, stamp (and, in later tasks, branch, merge, cards,
freeze, export, assets, record)."""
import json
import re
import shutil
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from .contract import TEMPLATES


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def namespace(title):
    ascii_title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    name = "".join(w[:1].upper() + w[1:] for w in re.findall(r"[A-Za-z0-9]+", ascii_title)) or "Charter"
    return name if name[0].isalpha() else "Charter" + name


def new_index(title):
    """A fresh index for a system this studio starts, with the type's createdOnFiles marker."""
    return {
        "v": 3,
        "layout": "files",
        "createdOnFiles": {"v": 1, "at": now()},
        "title": title,
        "namespace": namespace(title),
        "libraries": [],
        "sections": {},
        "groups": [],
        "assetGroups": {},
        "blobs": {},
        "docs": {"sections": []},
    }


def init(root, title):
    project = Path(root) / "project"
    index = project / "design-system.json"
    if index.exists():
        return "kept the existing charter in {}".format(project)
    shutil.copytree(TEMPLATES / "project", project, dirs_exist_ok=True)
    data = new_index(title)
    write_json(index, data)
    write_bundle(project, data["namespace"])
    return "created the charter '{}' in {}".format(title, project)


def write_bundle(project, name):
    """A bundle with no components. Verified at Task 0: without components/bundle.js the type shows previews
    as static snapshots, where scripts do not run and relative files (../../media/…) do not load."""
    (project / "components").mkdir(parents=True, exist_ok=True)
    (project / "components" / "bundle.js").write_text(
        '/* @ds-bundle: {{"format":4,"namespace":"{0}","components":[]}} */\n'
        "window.{0} = window.{0} || {{}};\n".format(name), encoding="utf-8")


def stamp(root, step, by, title=None, remote=None, note=None):
    """Prepare the index for a publish: start from the published index when given (so the page's own
    keys survive), add this charter's asset records, set the title only when asked, set lastChange."""
    path = Path(root) / "project" / "design-system.json"
    local = read_json(path)
    data = read_json(remote) if remote else dict(local)
    if "createdOnFiles" not in data and "convertedFrom" not in data:
        raise ValueError("{} has no createdOnFiles marker: it is not a charter index; refusing to write over it".format(
            remote or path))
    data["title"] = title or data.get("title") or local.get("title")
    groups = data.setdefault("assetGroups", {})
    order = data.setdefault("groups", [])
    for name, entry in (local.get("assetGroups") or {}).items():
        target = groups.setdefault(name, {"name": name, "tile": entry.get("tile", "m"), "order": [], "files": {}})
        target.setdefault("order", [])
        target.setdefault("files", {})
        for key, record in (entry.get("files") or {}).items():
            target["files"][key] = record
            if record.get("name") not in target["order"]:
                target["order"].append(record.get("name"))
        if name not in order:
            order.append(name)
    data["lastChange"] = {"by": by, "at": now(), "via": "Claude Code · design-studio {}".format(step)}
    if note:
        data["lastChange"]["note"] = note
    write_json(path, data)
    return "stamped {} for {} (by {})".format(path, step, by)


def write_css(root, font_base="fonts/"):
    from .tokens import compile_css
    project = Path(root) / "project"
    tokens = read_json(project / "tokens.json")
    title = read_json(project / "design-system.json").get("title", "")
    (project / "tokens.css").write_text(compile_css(tokens, title, font_base), encoding="utf-8")
    return "wrote {}".format(project / "tokens.css")


from .cardfile import GENERATED, is_page, marker_attrs, set_attr  # noqa: E402

COMPONENT_GROUPS = {"Button": "Actions", "Link": "Actions", "Card": "Content", "Field": "Forms", "Nav": "Navigation"}
COMPONENT_BRIEFS = {
    "Button": "primary and secondary, each default, hover (.is-hover), focus (.is-focus), active (.is-active) and disabled",
    "Link": "inline in a sentence and standalone, each default, hover (.is-hover) and focus (.is-focus)",
    "Card": "one card with real copy from the charter, default and hover (.is-hover)",
    "Field": "a text field with its label and help, focused (.is-focus), with an error message, and disabled",
    "Nav": "the desktop navigation, then the mobile pattern of 06-structure, closed and open",
}
BUNDLE_START = (
    "/* The charter's components. Every class starts with ds- (states: is-hover, is-focus, is-active);\n"
    "   every value is a token from tokens.css. */\n"
    "body { margin: 0; background: var(--ground); color: var(--ink); font-family: var(--font-text); }\n"
    ".ds-preview { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); padding: var(--space-4); }\n"
)


def card_html(title, marker, body):
    return "\n".join([
        marker, "<!doctype html>", '<html lang="en">', "<head>", '<meta charset="utf-8">',
        "<title>{}</title>".format(title),
        '<link rel="stylesheet" href="../../tokens.css">',
        '<link rel="stylesheet" href="../bundle.css">',
        "</head>", "<body>", body, "</body>", "</html>", ""])


def starters():
    """The files a C2 branch starts from: base components, Cover, Showcase, bundle.css."""
    files = {}
    for name, group in COMPONENT_GROUPS.items():
        files["components/{}/preview.html".format(name)] = card_html(
            name, '<!-- @dsCard group="{}" height=160 -->'.format(group),
            '<div class="ds-preview">\n<!-- charter: draw the {}: {}. -->\n</div>'.format(name, COMPONENT_BRIEFS[name]))
        files["components/{}/README.md".format(name)] = (
            "# {}\n\n<!-- charter: one sentence on what it is for; then what the page provides (content, container), "
            "when to use it, and do / don't. -->\n".format(name))
    files["components/Cover/preview.html"] = card_html(
        "Cover", "<!-- @dsCard height=288 -->",
        "<!-- charter: draw the cover last, as the Design System type's cover.md says: colour blocks, one pattern, the name. -->")
    files["components/Showcase/preview.html"] = card_html(
        "Showcase", '<!-- @dsCard group="Pages" page width=1440 height=900 -->',
        "<!-- charter: the home page's opening section, with the real copy of 06-structure and its wireframe. -->")
    files["components/bundle.css"] = BUNDLE_START
    return files


def skeleton_tokens(contract, title):
    """tokens.json with every name the contract requires at C2 and empty values to fill."""
    def entry(name):
        return {"name": name, "value": "", "usage": ""}
    tokens = {
        "name": title,
        "version": 1,
        "color": {"themes": [{"id": "light", "name": "Light"}], "tokens": [entry(n) for n in contract["color"]["required"]]},
        "type": {
            "fonts": [],
            "families": {key: "" for key in contract["type"]["families"]},
            "groups": [{"name": group, "family": "", "styles": [
                {"name": s, "fontSize": "", "lineHeight": "", "fontWeight": 400} for s in styles]}
                for group, styles in contract["type"]["groups"].items()],
        },
    }
    for family, spec in contract["families"].items():
        if spec["step"] == contract["tokens_step"]:
            tokens[family] = {"tokens": [entry(n) for n in spec["names"]]}
    return tokens


def branch(charter_root, out_root, ids, contract):
    source = Path(charter_root) / "project"
    title = read_json(source / "design-system.json")["title"]
    made = []
    for branch_id in ids:
        if not re.match(r"^[a-z]$", branch_id):
            raise ValueError("a branch id is one lower-case letter, not {!r}".format(branch_id))
        dest = Path(out_root) / branch_id / "project"
        if dest.exists():
            raise ValueError("{} exists: a branch is made once".format(dest))
        shutil.copytree(source, dest, ignore=shutil.ignore_patterns("design-system.json", "tokens.css"))
        for rel, text in starters().items():
            path = dest / rel
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text, encoding="utf-8")
        branch_title = "{} · {}".format(title, branch_id.upper())
        if not (dest / "tokens.json").exists():
            write_json(dest / "tokens.json", skeleton_tokens(contract, branch_title))
        fresh = new_index(branch_title)
        write_json(dest / "design-system.json", fresh)
        write_bundle(dest, fresh["namespace"])
        made.append(str(dest))
    return "created " + ", ".join(made)


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
        first, rest = preview.read_text(encoding="utf-8").split("\n", 1)
        first = set_attr(set_attr(first, "width", "390"), "height", "844")
        target.parent.mkdir(exist_ok=True)
        target.write_text("{}\n{}../{}/preview.html -->\n{}".format(first, GENERATED, name, rest), encoding="utf-8")
        notes.append("wrote {}Mobile".format(name))
    return "\n".join(notes) or "no page cards"


# What a mix can take from another branch, and where it lives.
FAMILIES = {
    "colour": {"tokens": ["color"], "files": ["08-colour.md"], "dirs": []},
    "type": {"tokens": ["type"], "files": ["09-type.md"], "dirs": ["fonts"]},
    "shape": {"tokens": ["spacing", "radius", "shadow", "layout"], "files": ["10-shape-and-space.md"], "dirs": []},
    "imagery": {"tokens": [], "files": ["11-imagery-and-icons.md"], "dirs": ["assets/Icons", "media"]},
}
# What the base branch brings: everything visual. Product and UX content stays the charter's.
VISUAL_FILES = ["README.md", "08-colour.md", "09-type.md", "10-shape-and-space.md", "11-imagery-and-icons.md",
                "12-motion.md", "13-rules.md", "14-sources.md", "tokens.json"]
VISUAL_DIRS = ["fonts", "media", "assets/Icons"]


def _replace_dir(src, dst):
    if dst.exists():
        shutil.rmtree(dst)
    if src.exists():
        shutil.copytree(src, dst)


def _visual_components(folder):
    if not folder.exists():
        return []
    return [d for d in folder.iterdir() if d.is_dir() and not d.name.startswith("Wireframe")]


def merge(charter_root, branches_root, base, takes):
    dst = Path(charter_root) / "project"

    def source(branch_id):
        path = Path(branches_root) / branch_id / "project"
        if not (path / "design-system.json").exists():
            raise ValueError("no branch {!r} in {}".format(branch_id, branches_root))
        return path

    src = source(base)
    parsed = []
    for take in takes:
        family, _, other = take.partition(":")
        if family not in FAMILIES:
            raise ValueError("unknown family {!r} in --take: use {}".format(family, ", ".join(FAMILIES)))
        parsed.append((family, other, source(other)))

    for name in VISUAL_FILES:
        if (src / name).exists():
            shutil.copy2(src / name, dst / name)
    components = dst / "components"
    components.mkdir(exist_ok=True)
    for folder in _visual_components(components):
        shutil.rmtree(folder)
    for folder in _visual_components(src / "components"):
        shutil.copytree(folder, components / folder.name)
    shutil.copy2(src / "components" / "bundle.css", components / "bundle.css")
    for rel in VISUAL_DIRS:
        _replace_dir(src / rel, dst / rel)

    tokens = read_json(dst / "tokens.json")
    notes = ["base: {}".format(base)]
    for family, other, path in parsed:
        other_tokens = read_json(path / "tokens.json")
        for key in FAMILIES[family]["tokens"]:
            if key in other_tokens:
                tokens[key] = other_tokens[key]
        for name in FAMILIES[family]["files"]:
            shutil.copy2(path / name, dst / name)
        for rel in FAMILIES[family]["dirs"]:
            _replace_dir(path / rel, dst / rel)
        notes.append("{} from {}".format(family, other))
    index = read_json(dst / "design-system.json")
    tokens["name"] = index["title"]
    write_json(dst / "tokens.json", tokens)
    # Uploads belong to the Artifact they were made in: the merged icons are uploaded again to the charter.
    index.get("assetGroups", {}).pop("Icons", None)
    index["groups"] = [g for g in index.get("groups", []) if g in index.get("assetGroups", {})]
    write_json(dst / "design-system.json", index)
    write_css(charter_root)
    return ("merged into {}: {}. Revise 13-rules.md and 14-sources.md for the mix, upload what charter.py assets "
            "lists, then run charter.py check --step C2.".format(dst, ", ".join(notes)))


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


def export(root, dest):
    """What the build needs from the charter: tokens.css with font URLs for css/, the components, fonts and media."""
    from .tokens import compile_css
    project = Path(root) / "project"
    dest = Path(dest)
    tokens = read_json(project / "tokens.json")
    title = read_json(project / "design-system.json").get("title", "")
    (dest / "css").mkdir(parents=True, exist_ok=True)
    (dest / "css" / "tokens.css").write_text(compile_css(tokens, title, "../fonts/"), encoding="utf-8")
    shutil.copy2(project / "components" / "bundle.css", dest / "css" / "components.css")
    copied = ["css/tokens.css", "css/components.css"]
    for src, name in ((project / "fonts", "fonts"), (project / "media", "img")):
        if src.exists():
            _replace_dir(src, dest / name)
            copied.append(name + "/")
    return "exported to {}: {}".format(dest, ", ".join(copied))


import mimetypes  # noqa: E402

TEXT_EXTENSIONS = {".md", ".json", ".txt", ".csv"}
SAFE_KEY = re.compile(r"[A-Za-z0-9_./-]")


def asset_key(name):
    """The index key of an asset: its name, with every byte outside [A-Za-z0-9_./-] written ~ and two hex digits."""
    return "".join(ch if SAFE_KEY.match(ch) else "".join("~{:02x}".format(b) for b in ch.encode("utf-8")) for ch in name)


def pending_assets(root):
    """Files under project/assets/<Group>/ that must be uploaded and have no record in the index yet."""
    project = Path(root) / "project"
    assets = project / "assets"
    if not assets.exists():
        return []
    groups = read_json(project / "design-system.json").get("assetGroups") or {}
    pending = []
    for path in sorted(p for p in assets.rglob("*") if p.is_file()):
        rel = path.relative_to(assets)
        if len(rel.parts) < 2 or path.suffix.lower() in TEXT_EXTENSIONS or path.name.startswith("."):
            continue
        group, name = rel.parts[0], "/".join(rel.parts[1:])
        if asset_key(name) not in ((groups.get(group) or {}).get("files") or {}):
            pending.append(str(path.relative_to(project)))
    return pending


def record(root, file, blob):
    """Name an upload in the index: assetGroups.<Group>.files.<key> = {name, blob, size, type}."""
    project = Path(root) / "project"
    path = project / file
    if not path.is_file():
        raise ValueError("{} does not exist".format(path))
    try:
        rel = path.relative_to(project / "assets")
    except ValueError:
        raise ValueError("{} is not under project/assets/<Group>/".format(file))
    if len(rel.parts) < 2:
        raise ValueError("{} is not under project/assets/<Group>/".format(file))
    group, name = rel.parts[0], "/".join(rel.parts[1:])
    mime = "image/svg+xml" if path.suffix.lower() == ".svg" else (mimetypes.guess_type(path.name)[0] or "application/octet-stream")
    blob_id = blob.rstrip("/").rsplit("/", 1)[-1]
    index = read_json(project / "design-system.json")
    entry = index.setdefault("assetGroups", {}).setdefault(group, {"name": group, "tile": "m", "order": [], "files": {}})
    entry.setdefault("files", {})[asset_key(name)] = {"name": name, "blob": blob_id, "size": path.stat().st_size, "type": mime}
    if name not in entry.setdefault("order", []):
        entry["order"].append(name)
    if group not in index.setdefault("groups", []):
        index["groups"].append(group)
    write_json(project / "design-system.json", index)
    return "recorded {} as {} in {}".format(name, blob_id, group)
