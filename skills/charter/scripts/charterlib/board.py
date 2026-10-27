"""The C2 comparison board: the same rows for every branch, side by side, built from the branches' files.
Captures come from design/branches/<id>/captures/, made by each art director."""
import html
import json
import shutil
from pathlib import Path

from . import tokens as tk

CAPTURES = [("cover.png", "Cover"), ("showcase-1440.png", "Showcase · 1440 px"),
            ("showcase-390.png", "Showcase · 390 px"), ("components.png", "Components")]
LEADS = [("08-colour.md", "Colour logic"), ("09-type.md", "Type"), ("10-shape-and-space.md", "Shape and space"),
         ("11-imagery-and-icons.md", "Imagery and icons"), ("12-motion.md", "Motion intent"), ("13-rules.md", "Rules")]

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
:root {{ --bg: #f6f6f3; --panel: #ffffff; --ink: #1c1c1a; --muted: #5d5d58; --line: #d9d9d2; }}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{ --bg: #151514; --panel: #1f1f1d; --ink: #ecece7; --muted: #a9a9a2; --line: #3a3a36; }}
}}
:root[data-theme="dark"] {{ --bg: #151514; --panel: #1f1f1d; --ink: #ecece7; --muted: #a9a9a2; --line: #3a3a36; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, sans-serif; }}
header {{ max-width: 1600px; margin: 0 auto; padding: 24px 16px 8px; }}
h1 {{ font-size: 24px; margin: 0 0 4px; }}
.intro {{ color: var(--muted); margin: 0; }}
.board {{ max-width: 1600px; margin: 0 auto; padding: 16px; overflow-x: auto; }}
.row {{ display: grid; grid-template-columns: 8rem repeat({n}, minmax(16rem, 1fr)); gap: 12px; padding: 12px 0;
        border-top: 1px solid var(--line); min-width: calc(8rem + {n} * 17rem); }}
.label {{ position: sticky; left: 0; margin: 0; font-size: 13px; color: var(--muted); background: var(--bg); }}
.cell {{ min-width: 0; padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }}
.cell img {{ display: block; width: 100%; height: auto; border-radius: 4px; }}
.cell h2 {{ margin: 0 0 6px; font-size: 18px; }}
.cell a {{ color: inherit; }}
.swatches, .list {{ display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; font-size: 13px; }}
.swatch {{ display: inline-block; width: 18px; height: 18px; margin-right: 6px; vertical-align: -4px;
           border: 1px solid var(--line); border-radius: 4px; }}
.muted {{ margin: 0; color: var(--muted); }}
code {{ font: 12px ui-monospace, monospace; }}
</style>
</head>
<body>
<header><h1>{client} · Directions</h1>
<p class="intro">The same rows for every direction: only the design changes. Open each design system for the whole charter.</p></header>
<main class="board">{body}</main>
</body>
</html>
"""


def _e(value):
    return html.escape(str(value), quote=True)


def lead(path):
    """The first paragraph of a section, after its heading and placeholder comments."""
    if not path.exists():
        return ""
    paragraph = []
    for line in path.read_text(encoding="utf-8").split("\n"):
        text = line.strip()
        if not text or text.startswith("#") or text.startswith("<!--"):
            if paragraph:
                break
            continue
        paragraph.append(text)
    return " ".join(paragraph)


def _palette(tokens):
    colours = {t["name"]: t for t in (tokens.get("color") or {}).get("tokens") or [] if isinstance(t, dict) and "name" in t}
    first = tk.theme_ids(tokens)[0]
    items = []
    for name in colours:
        value = tk.resolve(name, first, colours, first)
        if value:
            items.append('<li><span class="swatch" style="background:{v}"></span><code>{n}</code> {v}</li>'.format(
                v=_e(value), n=_e(name)))
    return '<ul class="swatches">{}</ul>'.format("".join(items)) if items else '<p class="muted">no colours yet</p>'


def _type(tokens):
    block = tokens.get("type") or {}
    families = block.get("families") or {}
    items = []
    for group in block.get("groups") or []:
        for style in group.get("styles") or []:
            family = style.get("family", group.get("family"))
            items.append("<li><code>{}</code> {} · {}/{} · {}</li>".format(
                _e(style.get("name")), _e(families.get(family, family)), _e(style.get("fontSize")),
                _e(style.get("lineHeight", "")), _e(style.get("fontWeight", ""))))
    return '<ul class="list">{}</ul>'.format("".join(items))


def _scale(tokens, family):
    entries = (tokens.get(family) or {}).get("tokens") or []
    return '<ul class="list">{}</ul>'.format("".join(
        "<li><code>{}</code> {}</li>".format(_e(t.get("name")), _e(t.get("value"))) for t in entries))


def render(client, columns):
    rows = [("Direction", ["<h2>{}</h2>{}".format(
        _e(c["title"]), '<a href="{}">Open the design system</a>'.format(_e(c["url"])) if c["url"] else "") for c in columns])]
    for name, label in CAPTURES:
        rows.append((label, ['<img src="{}" alt="{} of {}" loading="lazy">'.format(_e(c["images"][name]), _e(label), _e(c["title"]))
                             if name in c["images"] else '<p class="muted">no capture</p>' for c in columns]))
    rows.append(("Palette", [_palette(c["tokens"]) for c in columns]))
    rows.append(("Type scale", [_type(c["tokens"]) for c in columns]))
    rows.append(("Radius", [_scale(c["tokens"], "radius") for c in columns]))
    rows.append(("Spacing", [_scale(c["tokens"], "spacing") for c in columns]))
    for i, (_, label) in enumerate(LEADS):
        rows.append((label, ["<p>{}</p>".format(_e(c["leads"][i])) if c["leads"][i] else '<p class="muted">empty</p>'
                             for c in columns]))
    body = "".join('<div class="row"><h3 class="label">{}</h3>{}</div>'.format(
        _e(label), "".join('<div class="cell">{}</div>'.format(cell) for cell in cells)) for label, cells in rows)
    return PAGE.format(title=_e(client + " · Directions"), client=_e(client), n=len(columns), body=body)


def build(branches_root, out_root, urls):
    branches_root, out_root = Path(branches_root), Path(out_root)
    ids = sorted(d.name for d in branches_root.iterdir()
                 if (d / "project" / "design-system.json").exists()) if branches_root.exists() else []
    if not ids:
        raise ValueError("no branches in {}".format(branches_root))
    out_root.mkdir(parents=True, exist_ok=True)
    warnings, columns = [], []
    for branch_id in ids:
        project = branches_root / branch_id / "project"
        index = json.loads((project / "design-system.json").read_text(encoding="utf-8"))
        tokens_path = project / "tokens.json"
        tokens = json.loads(tokens_path.read_text(encoding="utf-8")) if tokens_path.exists() else {}
        images = {}
        for name, _ in CAPTURES:
            src = branches_root / branch_id / "captures" / name
            if src.exists():
                (out_root / branch_id).mkdir(exist_ok=True)
                shutil.copy2(src, out_root / branch_id / name)
                images[name] = "{}/{}".format(branch_id, name)
            else:
                warnings.append("branch {}: captures/{} is missing".format(branch_id, name))
        columns.append({"id": branch_id, "title": index.get("title", branch_id), "url": urls.get(branch_id),
                        "tokens": tokens, "images": images, "leads": [lead(project / f) for f, _ in LEADS]})
    client = columns[0]["title"].split(" · ")[0]
    (out_root / "index.html").write_text(render(client, columns), encoding="utf-8")
    return warnings
