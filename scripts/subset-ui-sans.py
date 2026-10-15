"""Optional font maintenance; ordinary Node.js builds stay offline.

Use fonttools==4.60.1 and Brotli==1.2.0. Supply the pinned original
NotoSansSC[wght].ttf outside the repository; only the WOFF2 UI subset ships.
"""
import argparse
import hashlib
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser(description="Subset pinned Noto Sans SC for the workbench UI")
parser.add_argument("source", type=Path, help="Path to the original NotoSansSC[wght].ttf")
args = parser.parse_args()
data = args.source.read_bytes()
blob = hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
if (blob != "fb0637bafbcd804fe32152370a1225990745b4bc"
        or hashlib.sha256(data).hexdigest() != "a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da"):
    parser.error("Source differs from pinned Google Fonts commit 2894aab31764f10f29c421bdfd2340d3b382d384")

root = Path(__file__).resolve().parent.parent
public = root / "public"
chars = set(chr(i) for i in range(32, 127))
for file in sorted(public.rglob("*")):
    if file.suffix not in {".html", ".js", ".mjs", ".css"}:
        continue
    if set(file.relative_to(public).parts) & {"vendor", "fonts", "licenses"}:
        continue
    chars.update(file.read_text(encoding="utf-8"))

options = subset.Options()
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.name_languages = ["*"]
options.name_legacy = True
options.notdef_glyph = True
options.notdef_outline = True
options.recommended_glyphs = True
font = TTFont(args.source, recalcTimestamp=False)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text="".join(sorted(chars)))
subsetter.subset(font)
font.flavor = "woff2"
output = public / "fonts/noto-sans-sc-ui.woff2"
font.save(output)
print(f"Subset from {len(chars)} UI code points; {output.stat().st_size} bytes.")
print("Output SHA-256: " + hashlib.sha256(output.read_bytes()).hexdigest())
