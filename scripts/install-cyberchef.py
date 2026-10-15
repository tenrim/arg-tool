"""Import the pinned official CyberChef release without rebuilding its code.

Usage: python scripts/install-cyberchef.py /path/to/release.zip /path/to/LICENSE
This maintenance step is not required for normal builds.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import zipfile

parser = argparse.ArgumentParser(description="Import the verified CyberChef 11.5.0 browser release")
parser.add_argument("archive", type=Path)
parser.add_argument("license", type=Path)
args = parser.parse_args()
checksums = [
    (args.archive, "f6478925d3eaa16ec08626a85f5b85eed10d531a5e18700615fed7ecb024cccf"),
    (args.license, "58d1e17ffe5109a7ae296caafcadfdbe6a7d176f0bc4ab01e12a689b0499d8bd"),
]
for file, expected in checksums:
    if hashlib.sha256(file.read_bytes()).hexdigest() != expected:
        parser.error(f"Checksum mismatch: {file.name}")
root = Path(__file__).resolve().parent.parent / "public/vendor/cyberchef"
records = []
with zipfile.ZipFile(args.archive) as archive:
    for entry in archive.infolist():
        path = PurePosixPath(entry.filename)
        if path.is_absolute() or ".." in path.parts:
            parser.error("Unsafe archive path")
        if entry.is_dir():
            continue
        # Keep the compressed OCR model; omit duplicate HTTP compression variants.
        if path.suffix in {".gz", ".br"} and not entry.filename.endswith("traineddata.gz"):
            continue
        destination = "index.html" if entry.filename == "CyberChef_v11.5.0.html" else entry.filename
        data = archive.read(entry)
        file = root / destination
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes(data)
        file.chmod(0o644)
        records.append({"path": destination, "upstream_path": entry.filename, "sha256": hashlib.sha256(data).hexdigest()})
root.mkdir(parents=True, exist_ok=True)
(root / "LICENSE.txt").write_bytes(args.license.read_bytes())
(root / "UPSTREAM.json").write_text(json.dumps({
    "project": "CyberChef", "version": "11.5.0",
    "commit": "8cd426dd4f40f1423912d5fad91b578a86a65112",
    "repository": "https://github.com/gchq/CyberChef",
    "archive_sha256": checksums[0][1], "files": records,
}, indent=2) + "\n")
print(f"Imported {len(records)} unchanged runtime files and upstream license notices.")
