"""tokens.json as the Design System type reads it, narrowed by the studio's contract:
fixed names, hex colours or aliases, list-shaped families, usage notes, contrast."""
import re

NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
HEX = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
ALIAS = re.compile(r"^\{([A-Za-z0-9][A-Za-z0-9_.-]{0,63})\}$")
LENGTH = re.compile(r"^(?:0|-?\d*\.?\d+(?:px|rem|em|%))$")
LINE_HEIGHT = re.compile(r"^(?:\d*\.?\d+(?:px|rem|em|%)?)$")
PLAIN = re.compile(r"^[A-Za-z0-9 #%(),./+_-]{1,200}$")
STACK = re.compile(r"^[^;{}<>\\()]{1,200}$")
TICKED = re.compile(r"`([A-Za-z0-9][A-Za-z0-9_.-]{0,63})`")
META_KEYS = {"name", "version", "meta"}


def theme_ids(tokens):
    themes = tokens.get("color", {}).get("themes") or [{"id": "light"}]
    return [t["id"] for t in themes]


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
            for theme in set(value) - set(ids):
                problems.append("tokens.json: colour '{}' has a value for an unknown theme '{}'".format(name, theme))
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


def _type(tokens, spec):
    block = tokens.get("type")
    if not isinstance(block, dict):
        return ["tokens.json: 'type' is missing"]
    problems = []
    families = block.get("families") or {}
    for key in spec["families"]:
        if key not in families:
            problems.append("tokens.json: type family '{}' is missing".format(key))
    for key, stack in families.items():
        if key not in spec["families"] + spec["optional_families"]:
            problems.append("tokens.json: type family '{}' is not in the contract".format(key))
        elif not isinstance(stack, str) or not STACK.match(stack) or stack.count('"') % 2:
            problems.append("tokens.json: type family '{}' is not a valid font stack: {!r}".format(key, stack))
    for font in block.get("fonts") or []:
        if not isinstance(font, dict) or not font.get("family") or not font.get("file"):
            problems.append("tokens.json: every type.fonts entry needs a family and a file")
    groups = {g.get("name"): g for g in block.get("groups") or [] if isinstance(g, dict)}
    for group_name in groups:
        if group_name not in spec["groups"]:
            problems.append("tokens.json: type group '{}' is not in the contract".format(group_name))
    for group_name, expected in spec["groups"].items():
        group = groups.get(group_name)
        if group is None:
            problems.append("tokens.json: type group '{}' is missing".format(group_name))
            continue
        styles = {s.get("name"): s for s in group.get("styles") or [] if isinstance(s, dict)}
        for name in expected:
            if name not in styles:
                problems.append("tokens.json: type style '{}' is missing from {}".format(name, group_name))
        for name, style in styles.items():
            if name not in expected:
                problems.append("tokens.json: type style '{}' is not in the contract for {}".format(name, group_name))
                continue
            if not LENGTH.match(str(style.get("fontSize", ""))):
                problems.append("tokens.json: type style '{}' has an invalid fontSize {!r}".format(name, style.get("fontSize")))
            if "lineHeight" in style and not LINE_HEIGHT.match(str(style["lineHeight"])):
                problems.append("tokens.json: type style '{}' has an invalid lineHeight {!r}".format(name, style["lineHeight"]))
            if style.get("family", group.get("family")) not in families:
                problems.append("tokens.json: type style '{}' uses an unknown family {!r}".format(
                    name, style.get("family", group.get("family"))))
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
