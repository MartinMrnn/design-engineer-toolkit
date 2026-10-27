"""tokens.json as the Design System type reads it, narrowed by the studio's contract:
fixed names, hex colours or aliases, list-shaped families, usage notes, contrast."""
import re

NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
HEX = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
ALIAS = re.compile(r"^\{([A-Za-z0-9][A-Za-z0-9_.-]{0,63})\}$")
LENGTH = re.compile(r"^(?:0|-?\d*\.?\d+(?:px|rem|em|%))$")
FONT_SIZE = re.compile(r"^(?:0|\d*\.?\d+(?:px|rem|em|%))$")
WEIGHT = re.compile(r"^\d{1,4}$")
FONT_STYLES = ("normal", "italic")
FONT_NAME = re.compile(r"^[^\"'{}();<>\\\n]{1,100}$")
FONT_FILE = re.compile(r"^[^\"'{}();<>\\\n]+\.(?:woff2|woff|ttf|otf)$", re.I)
LINE_HEIGHT = re.compile(r"^(?:\d*\.?\d+(?:px|rem|em|%)?)$")
PLAIN = re.compile(r"^[A-Za-z0-9 #%(),./+_-]{1,200}$")
STACK = re.compile(r"^[^;{}<>\\()]{1,200}$")
TICKED = re.compile(r"`([A-Za-z0-9][A-Za-z0-9_.-]{0,63})`")
META_KEYS = {"name", "version", "meta"}


def as_dict(value):
    return value if isinstance(value, dict) else {}


def as_list(value):
    return value if isinstance(value, list) else []


def theme_ids(tokens):
    """The ids of the colour themes, first theme first. A theme whose id is not a string is skipped here
    (validate reports it): an id is a key of a themed value, and a list or an object cannot be one."""
    themes = as_list(as_dict(as_dict(tokens).get("color")).get("themes"))
    return [t["id"] for t in themes if isinstance(t, dict) and isinstance(t.get("id"), str)] or ["light"]


def theme_value(token, theme, first):
    """A token's value in a theme: a plain value holds for every theme; a missing theme inherits the first."""
    value = token.get("value")
    if isinstance(value, dict):
        return value.get(theme, value.get(first))
    return value


def resolve(name, theme, colours, first, depth=0):
    """The hex value of colour `name` in `theme`, following aliases; None when it cannot be resolved."""
    if depth > 16 or name not in colours:
        return None
    value = theme_value(colours[name], theme, first)
    if not isinstance(value, str):
        return None
    alias = ALIAS.match(value)
    if alias:
        return resolve(alias.group(1), theme, colours, first, depth + 1)
    return value if HEX.match(value) else None


def _channels(hex_value):
    digits = hex_value[1:]
    if len(digits) == 3:
        digits = "".join(c * 2 for c in digits)
    return [int(digits[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def luminance(hex_value):
    def linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (linear(c) for c in _channels(hex_value))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    high, low = sorted((luminance(a), luminance(b)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def _entries(family, block):
    if not isinstance(block, dict) or not isinstance(block.get("tokens"), list):
        return None, ["tokens.json: '{}' must be {{\"tokens\": [{{\"name\", \"value\", \"usage\"}}, ...]}}".format(family)]
    return block["tokens"], []


def _names(family, entries, expected, seen, optional=()):
    problems, names = [], []
    for entry in entries:
        name = entry.get("name") if isinstance(entry, dict) else None
        if not isinstance(name, str) or not NAME.match(name):
            problems.append("tokens.json: {} has an entry with an invalid name {!r}".format(family, name))
            continue
        if name in seen:
            problems.append("tokens.json: '{}' is used twice ({} and {})".format(name, seen[name], family))
        seen[name] = family
        if name not in expected and name not in optional:
            problems.append("tokens.json: '{}' is not a name of the contract for {}".format(name, family))
        if not str(entry.get("usage", "")).strip():
            problems.append("tokens.json: '{}' has no usage note".format(name))
        names.append(name)
    for name in expected:
        if name not in names:
            problems.append("tokens.json: '{}' is missing from {}".format(name, family))
    return names, problems


def _value_ok(family, value):
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return family in ("spacing", "radius")
    if not isinstance(value, str):
        return False
    if family in ("spacing", "radius"):
        return LENGTH.match(value) is not None
    return PLAIN.match(value) is not None and "var(" not in value and "url(" not in value


def _family(family, block, expected, seen):
    entries, problems = _entries(family, block)
    if entries is None:
        return problems
    problems += _names(family, entries, expected, seen)[1]
    for entry in entries:
        if isinstance(entry, dict) and not _value_ok(family, entry.get("value")):
            problems.append("tokens.json: '{}' has a value the type would drop: {!r}".format(entry.get("name"), entry.get("value")))
    return problems


def _colours(tokens, spec, seen):
    if "color" not in tokens:
        return ["tokens.json: 'color' is missing"]
    block = tokens["color"]
    entries, problems = _entries("color", block)
    if entries is None:
        return problems
    themes = block.get("themes")
    if not isinstance(themes, list) or not themes or not all(
            isinstance(t, dict) and NAME.match(str(t.get("id", ""))) for t in themes):
        return problems + ["tokens.json: color.themes must list at least one theme with an id"]
    ids = [t["id"] for t in themes]
    first = ids[0]
    problems += _names("color", entries, spec["required"], seen, spec["optional"])[1]
    colours = {e["name"]: e for e in entries if isinstance(e, dict) and isinstance(e.get("name"), str)}
    for name, entry in colours.items():
        value = entry.get("value")
        if isinstance(value, dict):
            for theme in sorted(set(value) - set(ids)):
                problems.append("tokens.json: colour '{}' has a value for an unknown theme '{}'".format(name, theme))
            if first not in value:
                problems.append("tokens.json: colour '{}' needs a value for the first theme '{}'".format(name, first))
            values = list(value.values())
        else:
            values = [value]
        for v in values:
            alias = ALIAS.match(v) if isinstance(v, str) else None
            if not isinstance(v, str) or not (HEX.match(v) or alias):
                problems.append("tokens.json: colour '{}' must be #rgb, #rrggbb or an alias {{name}}, not {!r}".format(name, v))
            elif alias and alias.group(1) not in colours:
                problems.append("tokens.json: colour '{}' aliases a missing token {}".format(name, v))
    if problems:
        return problems
    # An alias that loops (a colour aliasing itself, two aliasing each other) resolves to nothing.
    for name in colours:
        for theme in ids:
            if resolve(name, theme, colours, first) is None:
                problems.append("tokens.json: colour '{}' does not resolve to a hex colour in theme '{}' (an alias loop?)".format(
                    name, theme))
    if problems:
        return problems
    for name in spec["text"]:
        if name not in colours:
            continue
        grounds = [g for g in TICKED.findall(str(colours[name].get("usage", ""))) if g in colours and g != name]
        if not grounds:
            problems.append("tokens.json: the usage note of '{}' must name the grounds it reads on, as `token` names".format(name))
            continue
        for theme in ids:
            for ground in grounds:
                problems += _pair(name, ground, theme, colours, first, 4.5)
    for theme in ids:
        for ground in spec["grounds"]:
            problems += _pair(spec["focus"], ground, theme, colours, first, 3.0)
    return problems


def _pair(fg_name, bg_name, theme, colours, first, floor):
    fg, bg = resolve(fg_name, theme, colours, first), resolve(bg_name, theme, colours, first)
    if fg and bg and contrast(fg, bg) < floor:
        return ["contrast: '{}' on '{}' is {:.2f}:1 in theme '{}', under {:g}:1".format(
            fg_name, bg_name, contrast(fg, bg), theme, floor)]
    return []


def _weight(value, allow_range=False):
    """A font weight from 1 to 1000; for a font file, also a variable range "a b"."""
    if isinstance(value, bool):
        return False
    if isinstance(value, (int, float)):
        return 1 <= value <= 1000
    if not isinstance(value, str):
        return False
    parts = value.split(" ")
    if len(parts) > (2 if allow_range else 1):
        return False
    return all(WEIGHT.match(part) and 1 <= int(part) <= 1000 for part in parts)


def _font(font):
    if not isinstance(font, dict) or not font.get("family") or not font.get("file"):
        return ["tokens.json: every type.fonts entry needs a family and a file"]
    family, file = font["family"], font["file"]
    if not isinstance(family, str) or not FONT_NAME.match(family):
        return ["tokens.json: type.fonts: invalid family {!r} (no quotes, braces, brackets or semicolons)".format(family)]
    problems = []
    if (not isinstance(file, str) or not FONT_FILE.match(file) or not font_path(file).startswith("fonts/")
            or ".." in file.split("/")):
        problems.append("tokens.json: type.fonts: {}'s file must be in fonts/ (woff2, woff, ttf or otf), not {!r}".format(
            family, file))
    if "weight" in font and not _weight(font["weight"], allow_range=True):
        problems.append("tokens.json: type.fonts: {} has an invalid weight {!r} (1 to 1000, or a range \"100 900\")".format(
            family, font["weight"]))
    if "style" in font and font["style"] not in FONT_STYLES:
        problems.append("tokens.json: type.fonts: {} has an invalid style {!r} (normal or italic)".format(family, font["style"]))
    return problems


def _style(name, style, group, families):
    problems = []

    def given(key):
        return key in style and style[key] != ""

    if not FONT_SIZE.match(str(style.get("fontSize", ""))):
        problems.append("tokens.json: type style '{}' has an invalid fontSize {!r}".format(name, style.get("fontSize")))
    if "lineHeight" in style and not LINE_HEIGHT.match(str(style["lineHeight"])):
        problems.append("tokens.json: type style '{}' has an invalid lineHeight {!r}".format(name, style["lineHeight"]))
    if given("fontWeight") and not _weight(style["fontWeight"]):
        problems.append("tokens.json: type style '{}' has an invalid fontWeight {!r} (1 to 1000)".format(name, style["fontWeight"]))
    if given("letterSpacing") and not (isinstance(style["letterSpacing"], str) and LENGTH.match(style["letterSpacing"])):
        problems.append("tokens.json: type style '{}' has an invalid letterSpacing {!r}".format(name, style["letterSpacing"]))
    if given("fontStyle") and style["fontStyle"] not in FONT_STYLES:
        problems.append("tokens.json: type style '{}' has an invalid fontStyle {!r} (normal or italic)".format(name, style["fontStyle"]))
    family = style.get("family", group.get("family"))
    if not isinstance(family, str) or family not in families:
        problems.append("tokens.json: type style '{}' uses an unknown family {!r}".format(name, family))
    return problems


def _type(tokens, spec):
    block = tokens.get("type")
    if not isinstance(block, dict):
        return ["tokens.json: 'type' is missing"]
    problems = []
    families = block.get("families", {})
    if not isinstance(families, dict):
        problems.append('tokens.json: type.families must be an object {"display": "<font stack>", ...}')
        families = {}
    for key in spec["families"]:
        if key not in families:
            problems.append("tokens.json: type family '{}' is missing".format(key))
    for key, stack in families.items():
        if key not in spec["families"] + spec["optional_families"]:
            problems.append("tokens.json: type family '{}' is not in the contract".format(key))
        elif not isinstance(stack, str) or not STACK.match(stack) or stack.count('"') % 2:
            problems.append("tokens.json: type family '{}' is not a valid font stack: {!r}".format(key, stack))
    fonts = block.get("fonts", [])
    if not isinstance(fonts, list):
        problems.append("tokens.json: type.fonts must be a list")
        fonts = []
    for font in fonts:
        problems += _font(font)
    group_list = block.get("groups", [])
    if not isinstance(group_list, list):
        problems.append("tokens.json: type.groups must be a list")
        group_list = []
    groups = {g.get("name"): g for g in group_list if isinstance(g, dict) and isinstance(g.get("name"), str)}
    for group_name in groups:
        if group_name not in spec["groups"]:
            problems.append("tokens.json: type group '{}' is not in the contract".format(group_name))
    for group_name, expected in spec["groups"].items():
        group = groups.get(group_name)
        if group is None:
            problems.append("tokens.json: type group '{}' is missing".format(group_name))
            continue
        style_list = group.get("styles", [])
        if not isinstance(style_list, list):
            problems.append("tokens.json: type group '{}': styles must be a list".format(group_name))
            style_list = []
        styles = {st.get("name"): st for st in style_list if isinstance(st, dict) and isinstance(st.get("name"), str)}
        for name in expected:
            if name not in styles:
                problems.append("tokens.json: type style '{}' is missing from {}".format(name, group_name))
        for name, style in styles.items():
            if name not in expected:
                problems.append("tokens.json: type style '{}' is not in the contract for {}".format(name, group_name))
                continue
            problems += _style(name, style, group, families)
    return problems


def validate(tokens, contract, due):
    """Every way `tokens` departs from the contract when checked at a step whose due steps are `due`."""
    if not isinstance(tokens, dict):
        return ["tokens.json: must be a JSON object"]
    families = contract["families"]
    allowed = META_KEYS | {"color", "type"} | set(families)
    problems = []
    for key in tokens:
        if key not in allowed:
            problems.append("tokens.json: unknown family '{}' (the contract allows {})".format(
                key, ", ".join(sorted(allowed - META_KEYS))))
    seen = {}
    problems += _colours(tokens, contract["color"], seen)
    problems += _type(tokens, contract["type"])
    for family, spec in families.items():
        if family not in tokens:
            if spec["step"] in due:
                problems.append("tokens.json: family '{}' is missing (due at {})".format(family, spec["step"]))
            continue
        problems += _family(family, tokens[family], spec["names"], seen)
    return problems


FORMATS = {"woff2": "woff2", "woff": "woff", "ttf": "truetype", "otf": "opentype"}


def font_path(file):
    """A font's path under project/: a bare file name means fonts/<file>."""
    return file if "/" in file else "fonts/" + file


def _css_value(value):
    alias = ALIAS.match(value) if isinstance(value, str) else None
    return "var(--{})".format(alias.group(1)) if alias else str(value)


def _font_url(file, font_base):
    """The font's URL from tokens.css: its path under fonts/, folders kept, after font_base."""
    path = font_path(file)
    return font_base + (path[len("fonts/"):] if path.startswith("fonts/") else path.rsplit("/", 1)[-1])


def _named(entries):
    return [e for e in as_list(entries) if isinstance(e, dict) and isinstance(e.get("name"), str)]


def _or(value, default):
    return default if value is None else value


def compile_css(tokens, title, font_base="fonts/"):
    """tokens.css as the Design System type compiles it: themed colours and shadows, then the other
    families and the font stacks on :root, a class per type style, an @font-face per font file."""
    tokens = as_dict(tokens)
    lines = ["/* {} — generated from tokens.json */".format(title)]
    ids = theme_ids(tokens)
    first = ids[0]
    themed = _named(as_dict(tokens.get("color")).get("tokens")) + _named(as_dict(tokens.get("shadow")).get("tokens"))
    # A value that is missing (None) is never written: check reports it, and `--ground: None;` is not CSS.
    for i, theme in enumerate(ids):
        lines.append(':root, [data-theme="{}"] {{'.format(theme) if i == 0 else '[data-theme="{}"] {{'.format(theme))
        for token in themed:
            value = theme_value(token, theme, first)
            if value is not None:
                lines.append("  --{}: {};".format(token["name"], _css_value(value)))
        lines.append("}")
    root = []
    for key, block in tokens.items():
        if key in META_KEYS or key in ("color", "type", "shadow") or not isinstance(block, dict):
            continue
        for token in _named(block.get("tokens")):
            value = token.get("value")
            if value is None:
                continue
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                value = "{}px".format(value)
            root.append("  --{}: {};".format(token["name"], value))
    type_block = as_dict(tokens.get("type"))
    for key, stack in as_dict(type_block.get("families")).items():
        if stack is None:
            continue
        root.append("  --font-{}: {};".format(key, stack))
    lines += [":root {"] + root + ["}"]
    for group in as_list(type_block.get("groups")):
        if not isinstance(group, dict):
            continue
        for style in _named(group.get("styles")):
            family = style.get("family", group.get("family"))
            props = [] if family is None else ["font-family: var(--font-{})".format(family)]
            for key, prop in (("fontSize", "font-size"), ("lineHeight", "line-height"), ("fontWeight", "font-weight"),
                              ("letterSpacing", "letter-spacing"), ("fontStyle", "font-style")):
                if style.get(key) not in ("", None):
                    props.append("{}: {}".format(prop, style[key]))
            lines.append(".{} {{ {}; }}".format(style["name"], "; ".join(props)))
    for font in as_list(type_block.get("fonts")):
        if not isinstance(font, dict) or not isinstance(font.get("file"), str) or font.get("family") is None:
            continue
        url = _font_url(font["file"], font_base)
        fmt = FORMATS.get(url.rsplit(".", 1)[-1].lower(), "woff2")
        lines.append('@font-face {{ font-family: "{}"; src: url("{}") format("{}"); font-weight: {}; '
                     'font-style: {}; font-display: swap; }}'.format(
                         font["family"], url, fmt, _or(font.get("weight"), "400"), _or(font.get("style"), "normal")))
    return "\n".join(lines) + "\n"
