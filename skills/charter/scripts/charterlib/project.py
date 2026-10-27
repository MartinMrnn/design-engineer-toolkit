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
