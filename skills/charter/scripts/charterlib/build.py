"""What leaves tokens.json for a stylesheet: tokens.css in the charter (css), and the files the build needs (export)."""
import shutil
from pathlib import Path

from .index import read_json
from .tokens import compile_css


def write_css(root, font_base="fonts/"):
    project = Path(root) / "project"
    tokens = read_json(project / "tokens.json")
    title = read_json(project / "design-system.json").get("title", "")
    (project / "tokens.css").write_text(compile_css(tokens, title, font_base), encoding="utf-8")
    return "wrote {}".format(project / "tokens.css")


def export(root, dest):
    """What the build needs from the charter: tokens.css with font URLs for css/, the components, fonts and media."""
    project = Path(root) / "project"
    dest = Path(dest)
    tokens = read_json(project / "tokens.json")
    title = read_json(project / "design-system.json").get("title", "")
    (dest / "css").mkdir(parents=True, exist_ok=True)
    (dest / "css" / "tokens.css").write_text(compile_css(tokens, title, "../fonts/"), encoding="utf-8")
    shutil.copy2(project / "components" / "bundle.css", dest / "css" / "components.css")
    copied = ["css/tokens.css", "css/components.css"]
    for src, name in ((project / "fonts", "fonts"), (project / "media", "img")):
        if src.exists():
            if (dest / name).exists():
                shutil.rmtree(dest / name)
            shutil.copytree(src, dest / name)
            copied.append(name + "/")
    return "exported to {}: {}".format(dest, ", ".join(copied))
