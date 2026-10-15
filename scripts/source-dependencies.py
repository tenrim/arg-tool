"""Prepare exact dependencies without storing third-party payloads in the source branch.
Python 3.12+, standard library only. No network, scripts, or archive code executed.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import tempfile
import zipfile


def safe_path(root, name):
    parts = PurePosixPath(name).parts
    if (not parts or name != "/".join(parts) or "\\" in name or ":" in name
            or any(p in {".", ".."} or p.endswith((".", " ")) for p in parts)
            or not name.startswith(("public/vendor/", "public/fonts/", "upstream/"))):
        raise ValueError("Unsafe dependency path: " + name)
    target = root.joinpath(*parts)
    for parent in [target, *target.parents]:
        if parent == root:
            break
        if parent.is_symlink() or (hasattr(parent, "is_junction") and parent.is_junction()):
            raise ValueError("Symlink/junction dependency path: " + name)
    if not target.resolve().is_relative_to(root.resolve()):
        raise ValueError("Dependency escapes root: " + name)
    return target


def load_lock(root):
    lock = json.loads((root / "dependencies.lock.json").read_text(encoding="utf-8"))
    if lock.get("schema") != 1 or not isinstance(lock.get("files"), list):
        raise ValueError("Unsupported dependency lock")
    names = set()
    for row in lock["files"]:
        name = row["path"]
        safe_path(root, name)
        if name.casefold() in names:
            raise ValueError("Duplicate dependency path: " + name)
        names.add(name.casefold())
        if not isinstance(row["size"], int) or not 0 <= row["size"] <= 1024**3:
            raise ValueError("Invalid dependency size")
        if len(row["sha256"]) != 64 or any(c not in "0123456789abcdef" for c in row["sha256"]):
            raise ValueError("Invalid SHA-256")
    return lock["files"]


def validate_file(path, row):
    if not path.is_file() or path.stat().st_size != row["size"]:
        raise ValueError("Missing or wrong-size dependency: " + row["path"])
    with path.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != row["sha256"]:
        raise ValueError("Dependency hash mismatch: " + row["path"])


def check(root, rows):
    for row in rows:
        validate_file(safe_path(root, row["path"]), row)


def export_bundle(root, rows, output):
    check(root, rows)
    output = output.resolve()
    if output.exists():
        raise ValueError("Output already exists: " + str(output))
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for row in rows:
            archive.write(safe_path(root, row["path"]), row["path"])


def install(root, rows, archive_path=None, source=None):
    # Verify every file in staging before changing installed files. Only paths
    # listed in the source tree's lock can be written, never arbitrary ZIP names.
    with tempfile.TemporaryDirectory(prefix="arg-deps-") as temporary:
        stage = Path(temporary)
        if archive_path:
            with zipfile.ZipFile(archive_path) as archive:
                entries = archive.infolist()
                expected = {row["path"]: row for row in rows}
                if len(entries) != len(expected) or {e.filename for e in entries} != set(expected):
                    raise ValueError("Archive entries differ from the dependency lock")
                for entry in entries:
                    row = expected[entry.filename]
                    if entry.file_size != row["size"] or stat.S_ISLNK(entry.external_attr >> 16):
                        raise ValueError("Wrong-size or symlink ZIP entry: " + entry.filename)
                    target = safe_path(stage, entry.filename)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(entry) as incoming, target.open("wb") as outgoing:
                        remaining = row["size"]
                        while remaining:
                            block = incoming.read(min(1024*1024, remaining))
                            if not block:
                                raise ValueError("Truncated ZIP entry")
                            outgoing.write(block)
                            remaining -= len(block)
                        if incoming.read(1):
                            raise ValueError("Oversize ZIP entry")
                    validate_file(target, row)
        else:
            source = source.resolve()
            check(source, rows)
            for row in rows:
                target = safe_path(stage, row["path"])
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(safe_path(source, row["path"]), target)
                validate_file(target, row)
        for row in rows:
            safe_path(root, row["path"])
        for row in rows:
            target = safe_path(root, row["path"])
            target.parent.mkdir(parents=True, exist_ok=True)
            # Replace only after verification. Source and server configuration
            # cannot be destinations because they are not lock entries.
            shutil.copyfile(safe_path(stage, row["path"]), target)
    check(root, rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["check", "export", "install"])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--from", dest="source", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    rows = load_lock(root)
    if args.command == "check":
        check(root, rows)
    elif args.command == "export":
        if not args.archive:
            parser.error("export requires --archive OUTPUT.zip")
        export_bundle(root, rows, args.archive)
    else:
        if bool(args.archive) == bool(args.source):
            parser.error("install requires exactly one of --archive FILE.zip or --from DIRECTORY")
        install(root, rows, args.archive, args.source)
    print(f"PASS: {args.command}; {len(rows)} pinned dependency files")


if __name__ == "__main__":
    main()
