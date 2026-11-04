"""One requested analyzer per isolated container; upstream modules stay byte-identical."""

import base64
import importlib
import json
import os
import re
from pathlib import Path
import subprocess
import sys
import types
import zipfile

ROOT = Path("/opt/upstream/aperisolve")
# Namespace bootstrap deliberately excludes AperiSolve's web app, users and upload DB.
for name, directory in [("aperisolve", ROOT), ("aperisolve.utils", ROOT / "utils")]:
    package = types.ModuleType(name)
    package.__path__ = [str(directory)]
    sys.modules[name] = package
os.environ["DB_URI"] = "sqlite:////opt/ihdr.sqlite"
from aperisolve.analyzers.registry import discover_analyzers

ANALYZERS = {cls.name: cls for cls in discover_analyzers()}


def prepare():
    from aperisolve.utils.png import _get_db_app
    from aperisolve.models import db, fill_ihdr_db, IHDR

    with _get_db_app().app_context():
        db.create_all()
        fill_ihdr_db()
        if not IHDR.query.count():
            raise RuntimeError("IHDR recovery table was not generated")
    for command in [
        "binwalk",
        "foremost",
        "exiftool",
        "file",
        "identify",
        "jpseek",
        "jsteg",
        "openstego",
        "outguess",
        "pdfid",
        "pdfinfo",
        "pngcheck",
        "steghide",
        "strings",
        "zsteg",
        "ffmpeg",
        "7z",
    ]:
        import shutil

        if not shutil.which(command):
            raise RuntimeError("Missing engine: " + command)
    if len(ANALYZERS) != 19:
        raise RuntimeError("Expected exactly 19 upstream analyzers")
    print("All 19 analyzers and complete IHDR table ready")


class CompleteOutput:
    """Extend upstream execution, retaining binary stdout and extracted originals."""

    command_index = 0

    def process_output(self, stdout, stderr):
        if self.name == "exiftool":
            # A dictionary would lose repeated tags and original group headings.
            return stdout
        if self.name == "zsteg" and self.options.get("mode") == "extract":
            return "原始提取字节已保存为 zsteg-extracted.bin；标准输出原件同时保留。"
        return super().process_output(stdout, stderr)

    def run_command(self, cmd, cwd=None):
        cmd = [str(x) for x in cmd]
        # Upstream assumes root. Our container is deliberately unprivileged.
        cmd = [x for x in cmd if x != "--run-as=root"]
        options = self.options
        if cmd[0] == "binwalk":
            depth = int(options.get("depth", 2))
            if not 1 <= depth <= 8:
                raise ValueError("递归深度须为 1–8")
            if options.get("mode", "extract") == "scan":
                cmd = ["binwalk", self.img]
            else:
                cmd = [x if not x.startswith("--depth=") else f"--depth={depth}" for x in cmd]
        if cmd[0] == "zsteg":
            mode = options.get("mode", "scan")
            if mode == "all":
                cmd = ["zsteg", "-a", self.img]
            elif mode == "extract":
                spec = options.get("extract", "")
                if not isinstance(spec, str) or not re.fullmatch(r"[a-zA-Z0-9_,.]+", spec):
                    raise ValueError("请输入有效的 zsteg 提取参数")
                cmd = ["zsteg", "-E", spec, self.img]
        if cmd[0] == "strings":
            encoding = options.get("encoding", "s")
            minimum = int(options.get("minimum", 4))
            radix = options.get("radix", "none")
            if (
                encoding not in ["s", "S", "b", "l", "B", "L"]
                or not 1 <= minimum <= 1024
                or radix not in ["none", "x", "d", "o"]
            ):
                raise ValueError("字符串提取参数无效")
            cmd = ["strings", "-a", "-n", str(minimum), "-e", encoding]
            if radix != "none":
                cmd += ["-t", radix]
            cmd.append(self.img)
        if cmd[0] == "pdfinfo":
            mode = options.get("mode", "default")
            if mode not in ["default", "box", "meta", "url"]:
                raise ValueError("PDF 信息范围无效")
            cmd = ["pdfinfo"] + ([] if mode == "default" else ["-" + mode])
            if self.password:
                cmd += ["-upw", self.password]
            cmd.append(self.img)
        if cmd[0] == "exiftool" and options.get("mode") == "json":
            cmd.insert(1, "-j")
        self.command_index += 1
        logs = self.output_dir / "logs"
        logs.mkdir(exist_ok=True)
        stdout_path = logs / f"{self.command_index:02}-stdout.bin"
        stderr_path = logs / f"{self.command_index:02}-stderr.bin"
        with stdout_path.open("wb") as out, stderr_path.open("wb") as err:
            try:
                result = subprocess.run(
                    cmd,
                    cwd=cwd,
                    stdin=subprocess.DEVNULL,
                    stdout=out,
                    stderr=err,
                    timeout=180,
                    check=False,
                )
            except subprocess.TimeoutExpired:
                # The exception's default text contains argv, including passwords.
                raise TimeoutError("分析命令超过 180 秒，已停止；本次未返回完整结果") from None
        stdout = stdout_path.read_bytes()
        stderr = stderr_path.read_bytes()
        # Text is a view only. Binary extraction always uses the original stdout.
        if cmd[0] == "jsteg" and result.returncode == 0:
            (self.output_dir / "jsteg-extracted.bin").write_bytes(stdout)
        if cmd[0] == "zsteg" and "-E" in cmd and result.returncode == 0:
            (self.output_dir / "zsteg-extracted.bin").write_bytes(stdout)
        return subprocess.CompletedProcess(
            cmd,
            result.returncode,
            stdout.decode("utf-8", errors="replace"),
            stderr.decode("utf-8", errors="replace"),
        )

    def generate_archive(self, extracted_dir=None):
        extracted_dir = extracted_dir or self.get_extracted_dir()
        archive = self.output_dir / (self.name + ".zip")
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
            for path in sorted(extracted_dir.rglob("*")):
                if path.is_symlink():
                    raise ValueError("提取结果包含符号链接，已拒绝导出")
                if path.is_file():
                    z.write(path, path.relative_to(extracted_dir))
        return ""


def run(request):
    name = request["engine"]
    if name not in ANALYZERS:
        raise ValueError("未知分析引擎")
    raw = base64.b64decode(request["data"], validate=True)
    if not raw or len(raw) > 20 * 1024 * 1024:
        raise ValueError("文件必须为 1 字节至 20 MB")
    work = Path("/work")
    suffix = Path(request.get("filename", "input.bin")).suffix
    if not suffix.isascii() or len(suffix) > 12 or not suffix[1:].isalnum():
        suffix = ".bin"
    source = work / ("input" + suffix)
    source.write_bytes(raw)
    output = work / "result"
    output.mkdir()
    cls = type("Standalone", (CompleteOutput, ANALYZERS[name]), {"register": False})
    analyzer = cls(source, output)
    analyzer.options = request.get("options", {})
    password = request.get("password", "")
    if not isinstance(password, str) or len(password) > 1024 or "\x00" in password:
        raise ValueError("密码格式不正确")
    analyzer.password = password
    analyzer.analyze(password)
    result = json.loads((output / "results.json").read_text(encoding="utf-8"))[name]
    files = []
    total = 0
    for path in sorted(output.rglob("*")):
        if path.is_symlink():
            raise ValueError("结果包含符号链接，已拒绝导出")
        if not path.is_file() or path in (
            output / "results.json.lock",
            output / "results.json.tmp",
        ):
            continue
        total += path.stat().st_size
        if total > 64 * 1024 * 1024:
            raise ValueError("完整结果超过 64 MB，本次未交付截断结果；请缩小输入")
        files.append(
            {
                "name": path.relative_to(output).as_posix(),
                "data": base64.b64encode(path.read_bytes()).decode("ascii"),
            }
        )
    return {"engine": name, "result": result, "files": files, "complete": True}


if __name__ == "__main__":
    if "--prepare" in sys.argv:
        prepare()
    elif "--health" in sys.argv:
        print(json.dumps({"engines": sorted(ANALYZERS)}))
    else:
        try:
            request = json.loads(sys.stdin.buffer.read(28 * 1024 * 1024))
            response = run(request)
        except Exception as error:
            response = {"error": str(error), "complete": False}
        print(json.dumps(response, ensure_ascii=True))
