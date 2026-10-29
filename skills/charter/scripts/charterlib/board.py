"""The C2 comparison board: the same rows for every branch, side by side, built from the branches' files.
Captures come from design/branches/<id>/captures/, made by each art director."""
import html
import re
import shutil
from pathlib import Path

from . import tokens as tk
from . import use_colour_skill
use_colour_skill()
from colourlib import convert, dominant, wcag  # noqa: E402
from .index import read_json, read_text
from .tokens import as_dict, as_list

CAPTURES = [("cover.png", "Cover"), ("showcase-1440.png", "Showcase · 1440 px"),
            ("showcase-390.png", "Showcase · 390 px"), ("components.png", "Components")]
LEADS = [("08-colour.md", "Colour logic"), ("09-type.md", "Type"), ("10-shape-and-space.md", "Shape and space"),
         ("11-imagery-and-icons.md", "Imagery and icons"), ("12-motion.md", "Motion intent"), ("13-rules.md", "Rules")]

MEASURED = "Colour, measured"
SHOWCASE = "showcase-1440.png"
MEASURED_COLOURS = ("ground", "ink", "accent", "on-accent")
NO_INTENT = "colour intent not recorded"
# [ \t] and not \s: the line must not run on into the next one (the untouched template line is `- **Colour intent**:`).
INTENT_LINE = re.compile(r"^[ \t]*[-*][ \t]*\*\*Colour intent:?\*\*[ \t]*:?[ \t]*(.*)$", re.MULTILINE)
# The line `Strategy: …` of 08-colour.md, plain, bold (`**Strategy**:`, `**Strategy:**`) or as a list item; [ \t] and not \s, so a
# bare `Strategy:` does not take the next line.
STRATEGY_LINE = re.compile(r"^[ \t]*(?:[-*][ \t]+)?(?:\*\*Strategy:?\*\*|Strategy:)[ \t]*:?[ \t]*(.*)$", re.MULTILINE)
NO_STRATEGY = "strategy not recorded"
SURFACE_OR_TONE = re.compile(r"^(?:surface|tone)-\d+$")


class Html(str):
    """A row label that is already HTML."""


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
    paragraph, in_comment = [], False
    for line in read_text(path).split("\n"):
        text = line.strip()
        if in_comment:
            in_comment = "-->" not in text
            continue
        if text.startswith("<!--"):
            in_comment = "-->" not in text
        if not text or text.startswith("#") or text.startswith("<!--"):
            if paragraph:
                break
            continue
        paragraph.append(text)
    return " ".join(paragraph)


def intent_words(path):
    """The colour intent's words, from the `- **Colour intent**: …` line (or `- **Colour intent:** …`) of a 01-context.md: the text up to the first
    ';' or sentence end (the rest of the line is the existing identity and the colours to avoid). None when the file or
    the line is missing, or the line still holds a placeholder."""
    if not path.exists():
        return None
    found = INTENT_LINE.search(read_text(path))
    if not found:
        return None
    value = found.group(1).strip()
    if not value or "<!-- charter:" in value or "[to provide" in value:
        return None
    return re.split(r";|\.(?:\s|$)", value, maxsplit=1)[0].strip() or None


def strategy_words(path):
    """The strategy, from the first `Strategy:` line of a 08-colour.md. None when the file or the line is missing, or the
    line still holds a placeholder."""
    if not path.exists():
        return None
    found = STRATEGY_LINE.search(read_text(path))
    if not found:
        return None
    value = found.group(1).replace("**", "").strip()
    if not value or "<!-- charter:" in value or "[to provide" in value:
        return None
    return value


def _share(share):
    return "{:.2f} %".format(share * 100)


def _measured(tokens_path, tokens, capture, strategy=None):
    """The cell of the "Colour, measured" row for one branch: OKLCH, text contrast and the capture's shares, as the
    colour skill computes them (colourlib), with no verdict on the design. Only ground, ink, accent and on-accent are
    resolved, in the first theme, which the cell names; one that is missing or does not resolve reads "not set"."""
    colours = {t["name"]: t for t in as_list(as_dict(tokens.get("color")).get("tokens"))
               if isinstance(t, dict) and isinstance(t.get("name"), str)}
    if not colours:
        return '<p class="muted">no colours yet</p>'
    first = tk.theme_ids(tokens)[0]
    hexes = {}
    for name in MEASURED_COLOURS:
        value = tk.resolve(name, first, colours, first)
        if value:
            hexes[name] = convert.to_hex(wcag.parse_hex(value))
    items = ['<li class="muted">theme {}</li>'.format(_e(first))]
    items.append("<li>strategy {}</li>".format(_e(strategy)) if strategy else '<li class="muted">{}</li>'.format(NO_STRATEGY))
    for name in ("ground", "ink", "accent"):
        if name not in hexes:
            items.append("<li><code>{}</code> not set</li>".format(name))
            continue
        lch = convert.oklab_to_oklch(convert.xyz_to_oklab(convert.srgb_to_xyz(wcag.parse_hex(hexes[name]))))
        items.append('<li><span class="swatch" style="background:{}"></span><code>{}</code> {}</li>'.format(
            _e(hexes[name]), name, _e(convert.css("oklch", lch))))
    floor = wcag.THRESHOLDS["text-aa"]
    for fg, bg in (("ink", "ground"), ("on-accent", "accent")):
        if fg in hexes and bg in hexes:
            value = wcag.ratio(hexes[fg], hexes[bg])
            items.append("<li>{} on {} {}:1 {}</li>".format(
                fg, bg, wcag.fmt(value, floor), "pass" if wcag.meets(value, floor) else "fail"))
    if not capture.exists():
        items.append('<li class="muted">no capture</li>')
    else:
        try:
            match = dominant.analyse(str(capture), tokens=str(tokens_path))["match"]
        except (ValueError, OSError) as e:  # DominantError, PngError, an unreadable tokens.json
            items.append('<li class="muted">capture not measured: {}</li>'.format(_e(str(e).split(": ", 1)[-1])))
        else:
            accent = sum(t["share"] for t in match["tokens"] if "accent" in t["names"])
            items.append("<li>accent {} of the capture</li>".format(_share(accent)))
            if any(SURFACE_OR_TONE.match(name) for name in colours):
                # An entry whose merged alias names hold several surfaces and tones counts once.
                flat = sum(t["share"] for t in match["tokens"] if any(SURFACE_OR_TONE.match(n) for n in t["names"]))
                items.append("<li>surfaces and tones {} of the capture</li>".format(_share(flat)))
            else:
                items.append("<li>surfaces and tones none</li>")
            items.append("<li>unassigned {} of the capture</li>".format(_share(match["unassigned"]["share"])))
            items.append('<li class="muted">of the Showcase capture, {}; a pixel counts for a token within {:g} (OKLab)</li>'.format(
                _e(SHOWCASE), match["max_distance"]))
    return '<ul class="list">{}</ul>'.format("".join(items))


def _palette(tokens):
    colours = {t["name"]: t for t in as_list(as_dict(tokens.get("color")).get("tokens"))
               if isinstance(t, dict) and isinstance(t.get("name"), str)}
    first = tk.theme_ids(tokens)[0]
    items = []
    for name in colours:
        value = tk.resolve(name, first, colours, first)
        if value:
            items.append('<li><span class="swatch" style="background:{v}"></span><code>{n}</code> {v}</li>'.format(
                v=_e(value), n=_e(name)))
    return '<ul class="swatches">{}</ul>'.format("".join(items)) if items else '<p class="muted">no colours yet</p>'


def _type(tokens):
    block = as_dict(tokens.get("type"))
    families = as_dict(block.get("families"))
    items = []
    for group in as_list(block.get("groups")):
        if not isinstance(group, dict):
            continue
        for style in as_list(group.get("styles")):
            if not isinstance(style, dict):
                continue
            family = style.get("family", group.get("family"))
            items.append("<li><code>{}</code> {} · {}/{} · {}</li>".format(
                _e(style.get("name")), _e(families.get(family, family) if isinstance(family, str) else family),
                _e(style.get("fontSize")),
                _e(style.get("lineHeight", "")), _e(style.get("fontWeight", ""))))
    return '<ul class="list">{}</ul>'.format("".join(items))


def _scale(tokens, family):
    entries = [t for t in as_list(as_dict(tokens.get(family)).get("tokens")) if isinstance(t, dict)]
    return '<ul class="list">{}</ul>'.format("".join(
        "<li><code>{}</code> {}</li>".format(_e(t.get("name")), _e(t.get("value"))) for t in entries))


def render(client, columns):
    rows = [("Direction", ["<h2>{}</h2>{}".format(
        _e(c["title"]), '<a href="{}">Open the design system</a>'.format(_e(c["url"])) if c["url"] else "") for c in columns])]
    for name, label in CAPTURES:
        rows.append((label, ['<img src="{}" alt="{} of {}" loading="lazy">'.format(_e(c["images"][name]), _e(label), _e(c["title"]))
                             if name in c["images"] else '<p class="muted">no capture</p>' for c in columns]))
    rows.append(("Palette", [_palette(c["tokens"]) for c in columns]))
    intents = [c.get("intent") for c in columns if c.get("intent")]
    rows.append((Html("{}<br><small>{}</small>".format(MEASURED, _e(intents[0] if intents else NO_INTENT))),
                 [c.get("colour") or '<p class="muted">no colours yet</p>' for c in columns]))
    rows.append(("Type scale", [_type(c["tokens"]) for c in columns]))
    rows.append(("Radius", [_scale(c["tokens"], "radius") for c in columns]))
    rows.append(("Spacing", [_scale(c["tokens"], "spacing") for c in columns]))
    for i, (_, label) in enumerate(LEADS):
        rows.append((label, ["<p>{}</p>".format(_e(c["leads"][i])) if c["leads"][i] else '<p class="muted">empty</p>'
                             for c in columns]))
    body = "".join('<div class="row"><h3 class="label">{}</h3>{}</div>'.format(
        label if isinstance(label, Html) else _e(label),
        "".join('<div class="cell">{}</div>'.format(cell) for cell in cells)) for label, cells in rows)
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
        index = as_dict(read_json(project / "design-system.json"))
        tokens_path = project / "tokens.json"
        tokens = as_dict(read_json(tokens_path)) if tokens_path.exists() else {}
        images = {}
        for name, _ in CAPTURES:
            src = branches_root / branch_id / "captures" / name
            if src.exists():
                (out_root / branch_id).mkdir(exist_ok=True)
                shutil.copy2(src, out_root / branch_id / name)
                images[name] = "{}/{}".format(branch_id, name)
            else:
                warnings.append("branch {}: captures/{} is missing".format(branch_id, name))
        capture = branches_root / branch_id / "captures" / SHOWCASE
        title = index.get("title")
        columns.append({"id": branch_id, "title": title if isinstance(title, str) and title else branch_id,
                        "url": urls.get(branch_id),
                        "tokens": tokens, "images": images,
                        "intent": intent_words(project / "01-context.md"),
                        "colour": _measured(tokens_path, tokens, capture, strategy_words(project / "08-colour.md")),
                        "leads": [lead(project / f) for f, _ in LEADS]})
    client = columns[0]["title"].split(" · ")[0]
    (out_root / "index.html").write_text(render(client, columns), encoding="utf-8")
    return warnings
