import importlib.util
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

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

if __name__ == "__main__":
    unittest.main()
