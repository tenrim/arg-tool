"""Prepare exact dependencies without storing third-party payloads in the source branch.
Python 3.12+, standard library only. HTTPS downloads are hash-pinned; no downloaded code is executed during installation.
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
import urllib.request
import urllib.parse
import urllib.error
import time


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


class HTTPSRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        if urllib.parse.urlparse(newurl).scheme != "https":
            raise ValueError("Dependency download cannot redirect away from HTTPS")
        return super().redirect_request(request, fp, code, msg, headers, newurl)


def bundle_info(root, override_url=None):
    info = json.loads((root / "dependencies.lock.json").read_text(encoding="utf-8")).get("bundle", {})
    url = override_url or info.get("url", "")
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Dependency bundle needs a public HTTPS URL without credentials")
    digest = info.get("sha256", "")
    size = info.get("size")
    if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
        raise ValueError("Dependency bundle needs a pinned SHA-256")
    if not isinstance(size, int) or not 0 < size <= 1024**3:
        raise ValueError("Invalid pinned dependency bundle size")
    return {"url": url, "size": size, "sha256": digest}


def fetch_bundle(root, override_url=None):
    info = bundle_info(root, override_url)
    cache = root / ".cache" / "arg-dependencies"
    for path in [root / ".cache", cache]:
        if path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction()):
            raise ValueError("Dependency cache cannot be a symlink or junction")
    cache.mkdir(parents=True, exist_ok=True)
    target = cache / (info["sha256"] + ".zip")
    if target.is_symlink():
        raise ValueError("Dependency cache file cannot be a symlink")
    row = {**info, "path": "downloaded dependency bundle"}
    if target.exists():
        try:
            validate_file(target, row)
            print("Using verified dependency download cache")
            return target
        except ValueError:
            pass  # Replace a corrupt cache only after a new download validates.
    opener = urllib.request.build_opener(HTTPSRedirect())
    request = urllib.request.Request(info["url"], headers={"User-Agent": "arg-tool-dependency-setup/1"})
    print(f"Downloading pinned dependencies ({info['size']:,} bytes)...", flush=True)
    for attempt in range(3):
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=cache, suffix=".part", delete=False) as outgoing:
                temporary = Path(outgoing.name)
                with opener.open(request, timeout=60) as incoming:
                    total = 0
                    while block := incoming.read(1024 * 1024):
                        total += len(block)
                        if total > info["size"]:
                            raise ValueError("Downloaded dependency bundle exceeds pinned size")
                        outgoing.write(block)
            validate_file(temporary, row)
            temporary.replace(target)
            return target
        except (OSError, urllib.error.URLError):
            if attempt == 2:
                raise RuntimeError("Dependency download failed. Check network access or use --archive FILE.zip for offline installation.") from None
            time.sleep(1)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    raise RuntimeError("Dependency download failed")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["check", "export", "install", "fetch"])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--from", dest="source", type=Path)
    parser.add_argument("--url", help="Alternate HTTPS location for the exact same hash-pinned bundle")
    args = parser.parse_args()
    root = args.root.resolve()
    rows = load_lock(root)
    if args.command == "check":
        check(root, rows)
    elif args.command == "fetch":
        print(fetch_bundle(root, args.url))
    elif args.command == "export":
        if not args.archive:
            parser.error("export requires --archive OUTPUT.zip")
        export_bundle(root, rows, args.archive)
    else:
        if args.archive and args.source:
            parser.error("choose --archive FILE.zip or --from DIRECTORY")
        if not args.archive and not args.source:
            try:
                check(root, rows)
                print(f"PASS: already installed; {len(rows)} pinned dependency files")
                return
            except (ValueError, OSError):
                args.archive = fetch_bundle(root, args.url)
        install(root, rows, args.archive, args.source)
    print(f"PASS: {args.command}; {len(rows)} pinned dependency files")


if __name__ == "__main__":
    main()
