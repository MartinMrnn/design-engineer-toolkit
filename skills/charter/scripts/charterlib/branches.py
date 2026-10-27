"""C2 directions: `branch` copies the charter into branches with starter cards; `merge` brings the chosen one back."""
import re
import shutil
from pathlib import Path

from .build import write_css
from .index import new_index, read_json, write_bundle, write_json

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
