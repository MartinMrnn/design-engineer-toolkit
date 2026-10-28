"""Reading the colour tokens of a charter's tokens.json, for `palette` and `dominant --match`.

The charter's own code does the reading (alias resolution, themes, the usage-note grounds), so that colour.py and
charter.py never disagree on what a token is. It lives in skills/charter/scripts/charterlib, found from the plugin's own
layout: from this file (skills/colour/scripts/colourlib/tokenfile.py), parents[3] is skills/. It is imported on demand,
not at the top of colour.py: charterlib imports colourlib.wcag, and colour.py's other commands do not need the charter.
"""
import json
import sys
from pathlib import Path

from . import convert, wcag

CHARTER_SCRIPTS = Path(__file__).resolve().parents[3] / "charter" / "scripts"


class TokenError(ValueError):
    pass


def charterlib():
    """The charterlib package's tokens and contract modules."""
    if not (CHARTER_SCRIPTS / "charterlib" / "tokens.py").is_file():
        raise TokenError("the charter skill is not installed next to this one ({} is missing): "
                         "it reads tokens.json".format(CHARTER_SCRIPTS / "charterlib" / "tokens.py"))
    if str(CHARTER_SCRIPTS) not in sys.path:
        sys.path.insert(0, str(CHARTER_SCRIPTS))
    from charterlib import contract, tokens  # noqa: E402
    return tokens, contract


def read(path):
    """The tokens.json object at `path`."""
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except OSError as e:
        raise TokenError("cannot read {}: {}".format(path, e.strerror or e))
    except ValueError as e:
        raise TokenError("{}: {}".format(path, e))
    if not isinstance(data, dict):
        raise TokenError("{}: tokens.json must be a JSON object".format(path))
    return data


def table(data):
    """{token name: token entry} of the colour tokens (the last of two with one name wins, as the charter's resolve)."""
    tk, _ = charterlib()
    return {e["name"]: e for e in tk.as_list(tk.as_dict(data.get("color")).get("tokens"))
            if isinstance(e, dict) and isinstance(e.get("name"), str)}


def colours(data, path):
    """({theme id: [(token name, '#rrggbb'), ...]}, [theme ids]): every colour token resolved in every theme, in the
    order of the file. Raises TokenError when there is no colour token or one does not resolve."""
    tk, _ = charterlib()
    ids = tk.theme_ids(data)
    entries = [e for e in tk.as_list(tk.as_dict(data.get("color")).get("tokens"))
               if isinstance(e, dict) and isinstance(e.get("name"), str)]
    table_ = table(data)
    if not entries:
        raise TokenError('{}: no colour tokens: expected "color": {{"tokens": [{{"name", "value"}}, ...]}}'.format(path))
    out = {}
    for theme in ids:
        resolved = []
        for entry in entries:
            value = tk.resolve(entry["name"], theme, table_, ids[0])
            if value is None:
                raise TokenError("{}: colour '{}' does not resolve to a hex colour in theme '{}' "
                                 "(charter.py validate-tokens says why)".format(path, entry["name"], theme))
            resolved.append((entry["name"], convert.to_hex(wcag.parse_hex(value))))
        out[theme] = resolved
    return out, ids
