import sys
from pathlib import Path


def use_colour_skill():
    """Put the colour skill's scripts directory on sys.path, so `from colourlib import ...` finds it. The WCAG, OKLab
    and colour-reading code lives in the colour skill, and the charter imports it from the plugin's own layout: from
    this file (skills/charter/scripts/charterlib/__init__.py), parents[3] is skills/. Modules that import colourlib
    call this first."""
    scripts = str(Path(__file__).resolve().parents[3] / "colour" / "scripts")
    if scripts not in sys.path:
        sys.path.insert(0, scripts)
