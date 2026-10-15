"""Optional font maintenance; not required by the Node.js build.

Install fonttools[woff] and supply the original Noto Serif SC variable TTF.
The original font stays outside the repository.
"""
import argparse
import hashlib
from pathlib import Path
import subprocess
import tempfile

parser = argparse.ArgumentParser(description="Subset the fixed Noto Serif SC source for the workbench UI")
parser.add_argument("source", type=Path, help="Path to NotoSerifSC[wght].ttf")
args = parser.parse_args()
expected = "050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9"
if hashlib.sha256(args.source.read_bytes()).hexdigest() != expected:
    parser.error("Source checksum differs from upstream-manifest.json")
root = Path(__file__).resolve().parent.parent
chars = set(chr(i) for i in range(32, 127))
for file in [root / "public/index.html", *sorted((root / "public").glob("*.js"))]:
    chars.update(file.read_text())
with tempfile.TemporaryDirectory(prefix="arg-ui-font-") as directory:
    text = Path(directory) / "glyphs.txt"
    text.write_text("".join(sorted(chars)))
    subprocess.run([
        "pyftsubset", str(args.source), f"--text-file={text}",
        f"--output-file={root / 'public/fonts/noto-serif-sc-ui.woff2'}",
        "--flavor=woff2", "--layout-features=*", "--name-IDs=*",
        "--name-languages=*", "--name-legacy", "--notdef-glyph",
        "--notdef-outline", "--recommended-glyphs", "--no-recalc-timestamp",
    ], check=True)
print(f"Subset generated from {len(chars)} UI code points.")
