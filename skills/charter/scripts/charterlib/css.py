"""CSS text as the charter's checks read it: without comments, url(...) and strings; the classes of its selectors."""
import re

COMMENT = re.compile(r"/\*.*?\*/", re.S)
URL = re.compile(r"url\(\s*(?:\"[^\"]*\"|'[^']*'|[^)]*)\s*\)", re.I)
STRING = re.compile(r"\"(?:[^\"\\\n]|\\.)*\"|'(?:[^'\\\n]|\\.)*'")
CLASS = re.compile(r"\.(-?[_a-zA-Z][\w-]*)")
PRELUDE = re.compile(r"([^{};]*)\{")


def strip_comments(text):
    """`text` without /* */ comments; each comment leaves its line breaks, so line numbers hold."""
    return COMMENT.sub(lambda m: "\n" * m.group(0).count("\n"), text)


def selector_classes(css):
    """The class names in the selectors of `css`: not in comments, url(...), strings, declarations, or the
    preludes of at-rules (@media, @font-face, @import…)."""
    text = STRING.sub('""', URL.sub("url()", strip_comments(css)))
    classes = set()
    for match in PRELUDE.finditer(text):
        prelude = match.group(1).strip()
        if not prelude.startswith("@"):
            classes.update(CLASS.findall(prelude))
    return classes
