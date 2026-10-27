"""The charter's index, design-system.json: init, stamp before a publish, and the asset uploads it records."""
import json
import mimetypes
import re
import shutil
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from .contract import TEMPLATES
from .tokens import as_dict, as_list

TEXT_EXTENSIONS = {".md", ".json", ".txt", ".csv"}
SAFE_KEY = re.compile(r"[A-Za-z0-9_./-]")


def read_text(path):
    """A file's UTF-8 text; a ValueError that names the file when it is not UTF-8."""
    try:
        return Path(path).read_text(encoding="utf-8")
    except UnicodeDecodeError as error:
        raise ValueError("{}: not UTF-8 text ({})".format(path, error.reason)) from None


def read_json(path):
    """A JSON file's data; a ValueError that names the file when it is not JSON."""
    text = read_text(path)
    try:
        return json.loads(text)
    except ValueError as error:
        raise ValueError("{}: {}".format(path, error)) from None


def read_object(path):
    """A JSON file that must hold an object."""
    data = read_json(path)
    if not isinstance(data, dict):
        raise ValueError("{}: must be a JSON object".format(path))
    return data


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


def write_bundle(project, name):
    """A bundle with no components. Verified at Task 0: without components/bundle.js the type shows previews
    as static snapshots, where scripts do not run and relative files (../../media/…) do not load."""
    (project / "components").mkdir(parents=True, exist_ok=True)
    (project / "components" / "bundle.js").write_text(
        '/* @ds-bundle: {{"format":4,"namespace":"{0}","components":[]}} */\n'
        "window.{0} = window.{0} || {{}};\n".format(name), encoding="utf-8")


def init(root, title):
    project = Path(root) / "project"
    index = project / "design-system.json"
    if index.exists():
        return "kept the existing charter in {}".format(project)
    # Only the template files that are missing: a charter that lost its index keeps every section it holds.
    template = TEMPLATES / "project"
    for src in sorted(template.rglob("*")):
        dst = project / src.relative_to(template)
        if src.is_file() and not dst.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
    data = new_index(title)
    write_json(index, data)
    write_bundle(project, data["namespace"])
    return "created the charter '{}' in {}".format(title, project)


def stamp(root, step, by, title=None, remote=None, note=None):
    """Prepare the index for a publish: start from the published index when given (so the page's own
    keys survive), put this charter's asset groups in it, set the title only when asked, set lastChange."""
    path = Path(root) / "project" / "design-system.json"
    local = read_object(path)
    data = read_object(remote) if remote else dict(local)
    if "createdOnFiles" not in data and "convertedFrom" not in data:
        raise ValueError("{} has no createdOnFiles marker: it is not a charter index; refusing to write over it".format(
            remote or path))
    data["title"] = title or data.get("title") or local.get("title")
    groups = data["assetGroups"] = as_dict(data.get("assetGroups"))
    order = data["groups"] = as_list(data.get("groups"))
    # Each local group's records and order replace the published group's: the local files are the source.
    # Groups only the published index has stay as they are.
    for name, entry in as_dict(local.get("assetGroups")).items():
        if not isinstance(entry, dict):
            continue
        target = groups.get(name)
        if not isinstance(target, dict):
            target = groups[name] = {"name": name, "tile": entry.get("tile", "m")}
        files = dict(as_dict(entry.get("files")))
        names = list(as_list(entry.get("order")))
        for item in files.values():
            if isinstance(item, dict) and item.get("name") not in names:
                names.append(item.get("name"))
        target["files"], target["order"] = files, names
        if name not in order:
            order.append(name)
    data["lastChange"] = {"by": by, "at": now(), "via": "Claude Code · design-studio {}".format(step)}
    if note:
        data["lastChange"]["note"] = note
    write_json(path, data)
    return "stamped {} for {} (by {})".format(path, step, by)


def asset_key(name):
    """The index key of an asset: its name, with every byte outside [A-Za-z0-9_./-] written ~ and two hex digits."""
    return "".join(ch if SAFE_KEY.match(ch) else "".join("~{:02x}".format(b) for b in ch.encode("utf-8")) for ch in name)


def nfc(text):
    """A name in its composed form: macOS keeps NFD names on disk, people type NFC."""
    return unicodedata.normalize("NFC", text)


def _records(index):
    """{group: {key: record}} of the index's asset records."""
    return {group: as_dict(entry.get("files")) for group, entry in as_dict(index.get("assetGroups")).items()
            if isinstance(entry, dict)}


def pending_assets(root):
    """Files under project/assets/<Group>/ that must be uploaded and have no record in the index yet."""
    project = Path(root) / "project"
    assets = project / "assets"
    if not assets.exists():
        return []
    records = _records(read_object(project / "design-system.json"))
    pending = []
    for path in sorted(p for p in assets.rglob("*") if p.is_file()):
        rel = path.relative_to(assets)
        if len(rel.parts) < 2 or path.suffix.lower() in TEXT_EXTENSIONS or any(p.startswith(".") for p in rel.parts):
            continue
        group, name = nfc(rel.parts[0]), nfc("/".join(rel.parts[1:]))
        if asset_key(name) not in records.get(group, {}):
            pending.append(nfc(str(path.relative_to(project))))
    return pending


def _find(project, file):
    """project/file, each part of the path matched to the name on disk whatever its Unicode form."""
    current = project
    for part in Path(file).parts:
        candidate = current / part
        if not candidate.exists() and current.is_dir():
            candidate = next((c for c in current.iterdir() if nfc(c.name) == nfc(part)), candidate)
        current = candidate
    return current


def record(root, file, blob):
    """Name an upload in the index: assetGroups.<Group>.files.<key> = {name, blob, size, type}."""
    project = Path(root) / "project"
    path = _find(project, file)
    if not path.is_file():
        raise ValueError("{} does not exist".format(project / file))
    try:
        rel = path.resolve().relative_to((project / "assets").resolve())
    except ValueError:
        raise ValueError("{} is not under project/assets/<Group>/".format(file)) from None
    if len(rel.parts) < 2:
        raise ValueError("{} is not under project/assets/<Group>/".format(file))
    if path.suffix.lower() in TEXT_EXTENSIONS or any(part.startswith(".") for part in rel.parts):
        raise ValueError("{} is a text or hidden file: only the files charter.py assets lists are uploaded".format(file))
    group, name = nfc(rel.parts[0]), nfc("/".join(rel.parts[1:]))
    mime = "image/svg+xml" if path.suffix.lower() == ".svg" else (mimetypes.guess_type(path.name)[0] or "application/octet-stream")
    blob_id = blob.rstrip("/").rsplit("/", 1)[-1]
    index = read_object(project / "design-system.json")
    groups = index["assetGroups"] = as_dict(index.get("assetGroups"))
    entry = groups.get(group)
    if not isinstance(entry, dict):
        entry = groups[group] = {"name": group, "tile": "m", "order": [], "files": {}}
    entry["files"] = as_dict(entry.get("files"))
    entry["files"][asset_key(name)] = {"name": name, "blob": blob_id, "size": path.stat().st_size, "type": mime}
    entry["order"] = as_list(entry.get("order"))
    if name not in entry["order"]:
        entry["order"].append(name)
    index["groups"] = as_list(index.get("groups"))
    if group not in index["groups"]:
        index["groups"].append(group)
    write_json(project / "design-system.json", index)
    return "recorded {} as {} in {}".format(name, blob_id, group)
