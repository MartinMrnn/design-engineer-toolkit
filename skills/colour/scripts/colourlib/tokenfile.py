"""Reading the colour tokens of a tokens.css, for `palette` and `dominant --match`.

The custom properties of `:root` and `html` are the `default` theme. `.dark`, `.light`, `[data-theme="x"]` and
`@media (prefers-color-scheme: ...)` are themes, which inherit what they do not redefine. `@layer` is transparent. Any
other at-rule (`@theme`, `@supports`, `@media (color-gamut: p3)`) is left out: it does not set a theme's base value.
"""
import re

from . import convert, gamut

DEFAULT = "default"
WHITE = [1.0, 1.0, 1.0]

_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
_DECLARATION = re.compile(r"(--[\w-]+)\s*:\s*([^;]+)")
_IMPORTANT = re.compile(r"\s*!important\s*$", re.IGNORECASE)
_NOT = re.compile(r":not\([^)]*\)", re.IGNORECASE)
_DATA_THEME = re.compile(r"\[data-theme\s*=\s*[\"']?([\w-]+)[\"']?\s*\]", re.IGNORECASE)
_CLASS_THEME = re.compile(r"^(?::root|html)?\.(dark|light)$", re.IGNORECASE)
_SCHEME = re.compile(r"prefers-color-scheme\s*:\s*(dark|light)", re.IGNORECASE)
_VAR = re.compile(r"^var\(\s*(--[\w-]+)\s*(?:,\s*(.*))?\)$", re.DOTALL)
_FUNCTION = re.compile(r"^[a-z-]+\(", re.IGNORECASE)
_ALPHA = re.compile(r"^(.*\S)\s*/\s*([\d.]+)(%?)\s*\)$", re.DOTALL)
_LOOKS_LIKE_COLOUR = re.compile(r"^(?:#|(?:rgba?|hsla?|hwb|color|color-mix|light-dark|oklch|oklab|lch|lab)\()", re.IGNORECASE)


class TokenError(ValueError):
    pass


def _rules(css, path):
    """(enclosing at-rules, selector, body) of every innermost rule."""
    # shortcut: braces inside strings and declarations beside nested rules are not read; a tokens.css has neither.
    out, stack, start = [], [], 0
    for i, ch in enumerate(css):
        if ch == "{":
            stack.append((css[start:i].split(";")[-1].strip(), i + 1))
            start = i + 1
        elif ch == "}":
            if not stack:
                raise TokenError("{}: unbalanced braces".format(path))
            prelude, opened = stack.pop()
            body = css[opened:i]
            if "{" not in body:
                out.append(([p for p, _ in stack], prelude, body))
            start = i + 1
    if stack:
        raise TokenError("{}: unbalanced braces".format(path))
    return out


def _themes_of(parents, selector):
    """The themes a rule sets; none when it sits in an at-rule that is not a colour scheme or a layer."""
    scheme = None
    for at in parents:
        low = at.lower()
        if low.startswith("@layer"):
            continue
        found = _SCHEME.search(low) if low.startswith("@media") else None
        if not found:
            return []
        scheme = found.group(1)
    names = []
    for part in _NOT.sub("", selector).split(","):
        part = part.strip()
        data, cls = _DATA_THEME.search(part), _CLASS_THEME.match(part)
        if data:
            names.append(data.group(1).lower())
        elif cls:
            names.append(cls.group(1).lower())
        elif part.lower() in (":root", "html"):
            names.append(scheme or DEFAULT)
    return names


def read(path):
    """{theme: {token: raw value}}, the default theme first. Each theme holds the default theme's tokens it inherits."""
    try:
        with open(path, encoding="utf-8") as f:
            css = _COMMENT.sub("", f.read())
    except (OSError, UnicodeDecodeError) as e:
        raise TokenError("cannot read {}: {}".format(path, getattr(e, "strerror", None) or e))
    themes = {DEFAULT: {}}
    for parents, selector, body in _rules(css, path):
        for name in _themes_of(parents, selector):
            table = themes.setdefault(name, {})
            for key, value in _DECLARATION.findall(body):
                table[key] = _IMPORTANT.sub("", value).strip()
    base = themes[DEFAULT]
    merged = {name: {**base, **table} for name, table in themes.items()}
    if not base:
        del merged[DEFAULT]
    return merged


def _resolve(value, table, seen):
    m = _VAR.match(value.strip())
    if not m:
        return value.strip()
    name, fallback = m.groups()
    if name in seen:
        raise TokenError("circular var({})".format(name))
    if name in table:
        return _resolve(table[name], table, seen | {name})
    if fallback is not None:
        return _resolve(fallback, table, seen)
    raise TokenError("unknown var({})".format(name))


def _colour(text):
    """(rgb from 0 to 1, alpha, mapped into sRGB), or None for a value this cannot read as a colour."""
    # `400` is a valid hex for convert.parse, so a colour here must start with # or be a function.
    if not (text.startswith("#") or _FUNCTION.match(text)):
        return None
    try:
        alpha, plain = 1.0, text
        m = _ALPHA.match(text)
        if m:
            plain, alpha = m.group(1) + ")", float(m.group(2)) / (100 if m.group(3) else 1)
        kind, values = convert.parse(plain)
    except ValueError:
        return None
    alpha = min(alpha, 1.0)
    xyz = convert.to_xyz(kind, values)
    raw = values if kind == "hex" else convert.xyz_to_srgb(xyz)
    if gamut.in_gamut(raw):
        return gamut.clip(raw), alpha, False
    return gamut.map_oklch(convert.oklab_to_oklch(convert.xyz_to_oklab(xyz)))[0], alpha, True


def theme_colours(table):
    """Of one theme's tokens: {name: (rgb, alpha, mapped)}, {name: a value that looks like a colour and cannot be read},
    {name: why its var() is broken}. A broken var() matters only on a token a pair needs: `--font-sans` may be set at
    run time."""
    colours, unread, broken = {}, {}, {}
    for name, value in table.items():
        try:
            text = _resolve(value, table, {name})
        except TokenError as e:
            broken[name] = str(e)
            continue
        found = _colour(text)
        if found:
            colours[name] = found
        elif _LOOKS_LIKE_COLOUR.match(text):
            unread[name] = text
    return colours, unread, broken


def _over(rgb, alpha, ground):
    return [c * alpha + g * (1 - alpha) for c, g in zip(rgb, ground)]


def colours(data, path):
    """({theme: [(token, '#rrggbb'), ...]}, [themes]), in the order of the file. A transparent colour is composited over
    `--background` of its theme. Raises TokenError when there is no colour token."""
    out = {}
    for theme, table in data.items():
        found = theme_colours(table)[0]
        rgb, alpha, _ = found.get("--background", (WHITE, 1.0, False))
        ground = _over(rgb, alpha, WHITE)
        out[theme] = [(name, convert.to_hex(_over(c, a, ground))) for name, (c, a, _) in found.items()]
    if not any(out.values()):
        raise TokenError("{}: no colour token: expected custom properties such as --background: #fff".format(path))
    return out, list(out)
