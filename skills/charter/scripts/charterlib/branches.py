"""C2 directions: `branch` copies the charter into branches with starter cards; `merge` brings the chosen one back."""
import filecmp
import re
import shutil
from pathlib import Path

from .build import css_text
from .cardfile import is_generated
from .index import new_index, read_json, read_text, write_bundle, write_json

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
# What the base branch brings: the visual sections, and README.md, which is the charter's README (copied at
# `branch`, and nobody edits the charter between branch and merge) plus the direction's rules. The product
# and UX sections (01 to 07) stay the charter's. tokens.json is written from the base's, with the mix applied.
VISUAL_FILES = ["README.md", "08-colour.md", "09-type.md", "10-shape-and-space.md", "11-imagery-and-icons.md",
                "12-motion.md", "13-rules.md", "14-sources.md"]
# Folders the base brings when it has them, besides each of its asset groups (assets/<Group>).
VISUAL_DIRS = ["fonts", "media"]


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
    _, title = _title(source)
    # Every id and destination is checked before any branch is made.
    for branch_id in ids:
        if not re.match(r"^[a-z]$", branch_id):
            raise ValueError("a branch id is one lower-case letter, not {!r}".format(branch_id))
        if ids.count(branch_id) > 1:
            raise ValueError("branch id {!r} is given twice".format(branch_id))
    for branch_id in ids:
        dest = Path(out_root) / branch_id / "project"
        if dest.exists():
            raise ValueError("{} exists: a branch is made once".format(dest))
    made = []
    for branch_id in ids:
        dest = Path(out_root) / branch_id / "project"
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


def _copy_tree(src, dst):
    """shutil.copytree, with its list of failures turned into one readable line."""
    try:
        shutil.copytree(src, dst)
    except shutil.Error as error:
        failures = error.args[0] if error.args and isinstance(error.args[0], list) else []
        first = failures[0] if failures and isinstance(failures[0], tuple) and len(failures[0]) == 3 else None
        detail = "{}: {}".format(first[0], first[2]) if first else str(error)
        raise ValueError("could not copy {} to {}: {}".format(src, dst, detail)) from None


def _replace_dir(src, dst):
    """Replace dst with a copy of src, only when src exists: a branch without a folder never wipes the charter's."""
    if not src.is_dir():
        return False
    if dst.exists():
        shutil.rmtree(dst)
    _copy_tree(src, dst)
    return True


def _title(project):
    path = project / "design-system.json"
    index = read_json(path)
    title = index.get("title") if isinstance(index, dict) else None
    if not isinstance(title, str) or not title.strip():
        raise ValueError("{} has no title".format(path))
    return index, title


def _tokens(path):
    tokens = read_json(path)
    if not isinstance(tokens, dict):
        raise ValueError("{}: must be a JSON object".format(path))
    return tokens


def _base_components(src, components):
    """The component folders the base provides, which the merge replaces: the base components, Cover, Showcase,
    every other folder of the base but its wireframes (the charter's), and the charter's generated copies of them.
    Every other card of the charter (mockups, motion, cards made by hand) stays."""
    names = set(COMPONENT_GROUPS) | {"Cover", "Showcase"}
    if (src / "components").is_dir():
        names |= {d.name for d in (src / "components").iterdir() if d.is_dir() and not d.name.startswith("Wireframe")}
    for name in list(names):
        copy = components / (name + "Mobile") / "preview.html"
        if copy.is_file() and is_generated(read_text(copy)):
            names.add(name + "Mobile")
    return sorted(names)


def _same_file(a, b):
    return a.is_file() and b.is_file() and filecmp.cmp(a, b, shallow=False)


def _keep_records(index, groups, merged, charter):
    """Uploads belong to the Artifact they were made in: in each asset group the merge replaced, keep only the
    records of files that are still the charter's own; the others are uploaded again to the charter."""
    asset_groups = index.get("assetGroups")
    if not isinstance(asset_groups, dict):
        return
    for group in groups:
        entry = asset_groups.get(group)
        if not isinstance(entry, dict):
            continue
        files = entry.get("files") if isinstance(entry.get("files"), dict) else {}
        kept = {key: rec for key, rec in files.items() if isinstance(rec, dict) and isinstance(rec.get("name"), str)
                and _same_file(merged / "assets" / group / rec["name"], charter / "assets" / group / rec["name"])}
        if not kept:
            del asset_groups[group]
            continue
        names = {rec["name"] for rec in kept.values()}
        entry["files"] = kept
        entry["order"] = [n for n in entry.get("order") or [] if n in names]
    index["groups"] = [g for g in index.get("groups") or [] if g in asset_groups]


def _merge_into(work, charter, src, tokens, parsed, index, title):
    """Apply the merge to `work`, a copy of the charter's project/ (`charter`, left untouched)."""
    for name in VISUAL_FILES:
        if (src / name).is_file():
            shutil.copy2(src / name, work / name)
    components = work / "components"
    components.mkdir(exist_ok=True)
    for name in _base_components(src, components):
        if (components / name).exists():
            shutil.rmtree(components / name)
        if (src / "components" / name).is_dir():
            _copy_tree(src / "components" / name, components / name)
    shutil.copy2(src / "components" / "bundle.css", components / "bundle.css")
    groups = sorted(d.name for d in (src / "assets").iterdir() if d.is_dir()) if (src / "assets").is_dir() else []
    replaced = set()
    for rel in VISUAL_DIRS + ["assets/" + g for g in groups]:
        if _replace_dir(src / rel, work / rel):
            replaced.add(rel)
    for family, _, path, other_tokens in parsed:
        for key in FAMILIES[family]["tokens"]:
            if key in other_tokens:
                tokens[key] = other_tokens[key]
        for name in FAMILIES[family]["files"]:
            shutil.copy2(path / name, work / name)
        for rel in FAMILIES[family]["dirs"]:
            if _replace_dir(path / rel, work / rel):
                replaced.add(rel)
    tokens["name"] = title
    write_json(work / "tokens.json", tokens)
    _keep_records(index, sorted(rel.split("/", 1)[1] for rel in replaced if rel.startswith("assets/")), work, charter)
    write_json(work / "design-system.json", index)
    (work / "tokens.css").write_text(css_text(work), encoding="utf-8")


def merge(charter_root, branches_root, base, takes):
    dst = Path(charter_root) / "project"
    work, old = dst.with_name(dst.name + ".merging"), dst.with_name(dst.name + ".before-merge")
    # project.before-merge is the charter as it was before a merge that stopped between its two renames:
    # it may be the only copy of the charter, so it is never deleted here.
    if old.exists():
        raise ValueError(
            "{old} holds the charter from an interrupted merge. If {dst} is missing or was only made by a fresh "
            "init, move it back: remove {dst}, then rename {old} to {dst}. Otherwise compare the two and remove "
            "{old} by hand. Then run the merge again.".format(old=old, dst=dst))
    if not (dst / "design-system.json").is_file():
        raise ValueError("no charter in {}: run charter.py init".format(dst))

    def source(branch_id):
        path = Path(branches_root) / branch_id / "project"
        if not (path / "design-system.json").exists():
            raise ValueError("no branch {!r} in {}".format(branch_id, branches_root))
        return path

    src = source(base)
    sources = []
    for take in takes:
        family, _, other = take.partition(":")
        if family not in FAMILIES:
            raise ValueError("unknown family {!r} in --take: use {}".format(family, ", ".join(FAMILIES)))
        sources.append((family, other, source(other)))

    # Every source is checked and read before anything is written.
    required = [src / "components" / "bundle.css", src / "tokens.json"]
    for family, _, path in sources:
        required += [path / "tokens.json"] + [path / name for name in FAMILIES[family]["files"]]
    missing = [str(p) for p in required if not p.is_file()]
    if missing:
        raise ValueError("cannot merge, missing: {}".format(", ".join(missing)))
    tokens = _tokens(src / "tokens.json")
    parsed = [(family, other, path, _tokens(path / "tokens.json")) for family, other, path in sources]
    index, title = _title(dst)

    # The merge is built in a copy of project/, then swapped in: a failure leaves the charter as it was.
    # A project.merging left by an earlier run is only ever a partial work copy.
    if work.exists():
        shutil.rmtree(work)
    try:
        _copy_tree(dst, work)
        _merge_into(work, dst, src, tokens, parsed, index, title)
    except BaseException:
        shutil.rmtree(work, ignore_errors=True)
        raise
    dst.rename(old)
    try:
        work.rename(dst)
    except BaseException:
        old.rename(dst)
        raise
    shutil.rmtree(old, ignore_errors=True)
    notes = ["base: {}".format(base)] + ["{} from {}".format(family, other) for family, other, _, _ in parsed]
    return ("merged into {}: {}. Revise 13-rules.md and 14-sources.md for the mix, upload what charter.py assets "
            "lists, then run charter.py check --step C2.".format(dst, ", ".join(notes)))
