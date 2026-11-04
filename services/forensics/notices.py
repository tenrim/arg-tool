"""Export the actual installed tools' notices, without reading runtime/user data."""

import base64
import json
from pathlib import Path
import subprocess

packages = {
    "binwalk": "binwalk",
    "exiftool": "libimage-exiftool-perl",
    "file": "file",
    "foremost": "foremost",
    "identify": "graphicsmagick",
    "openstego": "openstego",
    "outguess": "outguess",
    "pdfinfo": "poppler-utils",
    "pngcheck": "pngcheck",
    "steghide": "steghide",
    "strings": "binutils",
    "spectrogram": "ffmpeg",
    "pillow": "python3-pil",
    "numpy": "python3-numpy",
    "flask": "python3-flask",
    "flask-sqlalchemy": "python3-flask-sqlalchemy",
    "sqlalchemy": "python3-sqlalchemy",
}
result = {}
common = "\n\n".join(
    p.read_text(errors="replace")
    for p in sorted(Path("/usr/share/common-licenses").glob("*"))
    if p.is_file()
)
for name, package in packages.items():
    path = Path("/usr/share/doc") / package / "copyright"
    result[name] = (
        path.read_text(errors="replace") + "\n\nReferenced common license texts:\n" + common
    )
for name, path in [
    ("jsteg", "/opt/sources/jsteg/LICENSE"),
    ("jpseek", "/opt/sources/jphs/COPYING"),
    ("pdfid", "/usr/local/bin/pdfid"),
]:
    result[name] = Path(path).read_text(errors="replace")
result["jpseek"] += "\n\nJPEG library:\n" + Path("/opt/sources/jphs/jpeg-8a/README").read_text(
    errors="replace"
)
gem_root = Path("/var/lib/gems")
licenses = [
    p
    for p in gem_root.rglob("*")
    if p.is_file() and p.name.lower().startswith(("license", "copying"))
]
result["zsteg"] = "\n\n".join(str(p) + "\n" + p.read_text(errors="replace") for p in licenses)
if not result["zsteg"]:
    raise RuntimeError("Gem notices missing")
versions = subprocess.check_output(["dpkg-query", "-W", "-f=${Package}\t${Version}\n"], text=True)
result["runtime-packages"] = (
    versions + "\n" + subprocess.check_output(["gem", "list", "--local"], text=True)
)
print(json.dumps(result))
