"""What leaves tokens.json for a stylesheet: tokens.css in the charter (css), and the files the build needs (export)."""
import shutil
from pathlib import Path

from .index import read_json
from .tokens import compile_css


def css_text(project, font_base="fonts/"):
    """tokens.css for the project folder `project`, from its tokens.json and the title of its index."""
    tokens = read_json(project / "tokens.json")
    index = read_json(project / "design-system.json")
    title = index.get("title", "") if isinstance(index, dict) else ""
    return compile_css(tokens, title, font_base)


def write_css(root):
    project = Path(root) / "project"
    (project / "tokens.css").write_text(css_text(project), encoding="utf-8")
    return "wrote {}".format(project / "tokens.css")


def export(root, dest):
    """What the build needs from the charter: tokens.css with font URLs for css/, the components, fonts and media."""
    project = Path(root) / "project"
    dest = Path(dest)
    css = css_text(project, "../fonts/")
    (dest / "css").mkdir(parents=True, exist_ok=True)
    (dest / "css" / "tokens.css").write_text(css, encoding="utf-8")
    shutil.copy2(project / "components" / "bundle.css", dest / "css" / "components.css")
    copied = ["css/tokens.css", "css/components.css"]
    # Added to the build's folders, never replacing them: the build keeps the files it put there itself.
    for src, name in ((project / "fonts", "fonts"), (project / "media", "img")):
        if src.is_dir():
            shutil.copytree(src, dest / name, dirs_exist_ok=True)
            copied.append(name + "/")
    return "exported to {}: {}".format(dest, ", ".join(copied))
