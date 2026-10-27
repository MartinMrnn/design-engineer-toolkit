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
