import importlib.util
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import io
import sys
from unittest.mock import patch
import urllib.error

spec = importlib.util.spec_from_file_location("dependencies", Path(__file__).resolve().parents[1] / "scripts/source-dependencies.py")
deps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deps)

class DependenciesTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "target"
        self.root.mkdir()
        self.source = Path(self.temporary.name) / "source"
        self.source.mkdir()
        self.data = b"fixed external engine bytes"
        self.rows = [{"path": "public/vendor/engine/runtime.bin", "size": len(self.data), "sha256": hashlib.sha256(self.data).hexdigest()}]
        file = self.source / self.rows[0]["path"]
        file.parent.mkdir(parents=True)
        file.write_bytes(self.data)
        (self.root / "dependencies.lock.json").write_text(json.dumps({"schema": 1, "files": self.rows}))
        self.archive = Path(self.temporary.name) / "deps.zip"

    def test_roundtrip_and_local_copy(self):
        deps.export_bundle(self.source, self.rows, self.archive)
        deps.install(self.root, self.rows, archive_path=self.archive)
        deps.check(self.root, deps.load_lock(self.root))
        deps.install(self.root, self.rows, source=self.source)
        self.assertEqual((self.root / self.rows[0]["path"]).read_bytes(), self.data)

    def test_corruption_does_not_replace_existing_files(self):
        target = self.root / self.rows[0]["path"]
        target.parent.mkdir(parents=True)
        target.write_bytes(b"keep previous installation")
        with zipfile.ZipFile(self.archive, "w") as archive:
            archive.writestr(self.rows[0]["path"], b"x" * len(self.data))
        with self.assertRaisesRegex(ValueError, "hash mismatch"):
            deps.install(self.root, self.rows, archive_path=self.archive)
        self.assertEqual(target.read_bytes(), b"keep previous installation")

    def test_archive_cannot_write_source_or_escape(self):
        for bad in ["../escape", "public/app.js", "public/vendor/../app.js"]:
            self.archive.unlink(missing_ok=True)
            with zipfile.ZipFile(self.archive, "w") as archive:
                archive.writestr(self.rows[0]["path"], self.data)
                archive.writestr(bad, b"bad")
            with self.assertRaisesRegex(ValueError, "entries differ"):
                deps.install(self.root, self.rows, archive_path=self.archive)
        self.assertFalse((self.root / "public/app.js").exists())

    def test_bad_lock_paths_and_duplicates(self):
        for bad in ["../escape", "/public/vendor/x", "public/app.js", "public/vendor/../app.js", "public/vendor/x:stream", "public/vendor/x."]:
            with self.assertRaises(ValueError):
                deps.safe_path(self.root, bad)
        (self.root / "dependencies.lock.json").write_text(json.dumps({"schema": 1, "files": self.rows * 2}))
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            deps.load_lock(self.root)

    def test_duplicate_archive_and_wrong_size(self):
        for size in [1, len(self.data) + 1]:
            self.archive.unlink(missing_ok=True)
            with zipfile.ZipFile(self.archive, "w") as archive:
                archive.writestr(self.rows[0]["path"], b"x" * size)
            with self.assertRaisesRegex(ValueError, "Wrong-size"):
                deps.install(self.root, self.rows, archive_path=self.archive)

    def test_symlink_cannot_escape(self):
        parent = self.root / "public"
        try:
            parent.symlink_to(self.source, target_is_directory=True)
        except OSError:
            self.skipTest("OS does not permit creating symlinks")
        with self.assertRaisesRegex(ValueError, "Symlink"):
            deps.safe_path(self.root, self.rows[0]["path"])

    def bundle(self, payload=b"downloaded fixed bytes"):
        lock = {"schema": 1, "files": self.rows, "bundle": {"url": "https://example.org/fixed.zip", "size": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}}
        (self.root / "dependencies.lock.json").write_text(json.dumps(lock))
        return payload

    def test_download_and_verified_cache(self):
        payload = self.bundle()
        class Opener:
            calls = 0
            def open(self, request, timeout):
                self.calls += 1
                return io.BytesIO(payload)
        opener = Opener()
        with patch.object(deps.urllib.request, "build_opener", return_value=opener):
            path = deps.fetch_bundle(self.root)
            self.assertEqual(path.read_bytes(), payload)
            self.assertEqual(deps.fetch_bundle(self.root), path)
        self.assertEqual(opener.calls, 1)

    def test_download_rejects_corruption_and_cleans_partial_file(self):
        payload = self.bundle()
        for body in [b"x" * len(payload), payload + b"extra"]:
            class Opener:
                def open(self, request, timeout):return io.BytesIO(body)
            with patch.object(deps.urllib.request, "build_opener", return_value=Opener()):
                with self.assertRaises(ValueError):deps.fetch_bundle(self.root)
            self.assertEqual(list((self.root / ".cache/arg-dependencies").iterdir()), [])
        self.assertFalse((self.root / self.rows[0]["path"]).exists())

    def test_download_retries_then_recovers(self):
        payload = self.bundle()
        class Opener:
            calls = 0
            def open(self, request, timeout):
                self.calls += 1
                if self.calls == 1:raise urllib.error.URLError("offline")
                return io.BytesIO(payload)
        opener = Opener()
        with patch.object(deps.urllib.request, "build_opener", return_value=opener), patch.object(deps.time, "sleep"):
            self.assertEqual(deps.fetch_bundle(self.root).read_bytes(), payload)
        self.assertEqual(opener.calls, 2)

    def test_download_failure_has_no_install_side_effect(self):
        self.bundle()
        class Opener:
            def open(self, request, timeout):raise urllib.error.URLError("offline")
        with patch.object(deps.urllib.request, "build_opener", return_value=Opener()), patch.object(deps.time, "sleep"):
            with self.assertRaisesRegex(RuntimeError, "offline installation"):deps.fetch_bundle(self.root)
        self.assertEqual(list((self.root / ".cache/arg-dependencies").iterdir()), [])

    def test_network_policy_rejects_plain_http_credentials_and_downgrade(self):
        self.bundle()
        for url in ["http://example.org/file.zip", "https://user:secret@example.org/file.zip"]:
            with self.assertRaises(ValueError):deps.bundle_info(self.root, url)
        with self.assertRaisesRegex(ValueError, "away from HTTPS"):
            deps.HTTPSRedirect().redirect_request(None, None, 302, "", {}, "http://example.org/file.zip")

    def test_existing_install_needs_no_network(self):
        deps.install(self.root, self.rows, source=self.source)
        with patch.object(sys, "argv", ["source-dependencies.py", "install", "--root", str(self.root)]), patch.object(deps, "fetch_bundle", side_effect=AssertionError("must stay offline")):
            deps.main()


if __name__ == "__main__":
    unittest.main()
