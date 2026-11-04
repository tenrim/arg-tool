"""Run the pinned, isolated formatter without adding runtime dependencies."""

import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / "tools" / "format" / "python"))
try:
    import black
except ImportError:
    raise SystemExit(
        "请先运行 python -m pip install --target tools/format/python "
        "-r tools/format/requirements.txt"
    ) from None

if __name__ == "__main__":
    black.main(
        args=["--config", str(root / "pyproject.toml"), str(root / "scripts"), *sys.argv[1:]]
    )
