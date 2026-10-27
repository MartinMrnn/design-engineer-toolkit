"""The studio's contract for a charter, read from references/contract.json."""
import json
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent.parent
CONTRACT_PATH = SKILL_DIR / "references" / "contract.json"
TEMPLATES = SKILL_DIR / "templates"


def load():
    return json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))


def due_steps(contract, step):
    """The steps up to and including `step`: what is due when checking at `step`."""
    steps = contract["steps"]
    if step not in steps:
        raise ValueError("unknown step {}: expected one of {}".format(step, ", ".join(steps)))
    return set(steps[: steps.index(step) + 1])
