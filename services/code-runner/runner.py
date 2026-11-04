"""One disposable, unprivileged container per program. No shell interpolation."""

import json
import os
import selectors
import signal
import subprocess
import sys
import time
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROFILES = json.loads((ROOT / "profiles.json").read_text(encoding="utf-8"))
LIMIT = 256 * 1024


def execute(argv, stdin, seconds):
    started = time.monotonic()
    with open("input.txt", "wb") as stream:
        stream.write(stdin.encode("utf-8"))
    with open("input.txt", "rb") as stream:
        process = subprocess.Popen(
            argv,
            stdin=stream,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True,
        )
    chunks = {"stdout": bytearray(), "stderr": bytearray()}
    selector = selectors.DefaultSelector()
    for pipe, key in [(process.stdout, "stdout"), (process.stderr, "stderr")]:
        os.set_blocking(pipe.fileno(), False)
        selector.register(pipe, selectors.EVENT_READ, key)
    reason = None
    try:
        while selector.get_map():
            if time.monotonic() - started > seconds:
                reason = "timeout"
                break
            for event, _ in selector.select(0.05):
                data = os.read(event.fd, 8192)
                if not data:
                    selector.unregister(event.fileobj)
                    continue
                remaining = LIMIT - sum(map(len, chunks.values()))
                chunks[event.data].extend(data[:remaining])
                if len(data) > remaining:
                    reason = "output_limit"
                    break
            if reason:
                break
        if reason:
            kill_group(process.pid)
        code = process.wait(timeout=max(0.1, seconds - (time.monotonic() - started)))
    except subprocess.TimeoutExpired:
        kill_group(process.pid)
        code = process.wait()
        reason = "timeout"
    finally:
        selector.close()
        process.stdout.close()
        process.stderr.close()
    return {
        "stdout": bytes(chunks["stdout"][:LIMIT]).decode("utf-8", errors="replace"),
        "stderr": bytes(chunks["stderr"][:LIMIT]).decode("utf-8", errors="replace"),
        "exitCode": code,
        "reason": reason,
        "elapsed": round((time.monotonic() - started) * 1000),
    }


def kill_group(pid):
    try:
        os.killpg(pid, signal.SIGKILL)
    except ProcessLookupError:
        pass


def manifest():
    result = {}
    for language, spec in PROFILES.items():
        completed = subprocess.run(spec["version"], capture_output=True, timeout=30)
        if completed.returncode:
            raise RuntimeError(language + " runtime missing")
        version = (completed.stdout + completed.stderr).decode("utf-8", errors="replace").strip()
        if language == "typescript":
            version += (
                " / Node.js " + subprocess.check_output(["node", "--version"], text=True).strip()
            )
        result[language] = version[:2000]
    return result


def notices():
    paths = set(Path("/usr/share/doc").glob("*/copyright"))
    paths.update(path for path in Path("/usr/share/common-licenses").glob("*") if path.is_file())
    for root in [
        "/opt/kotlin",
        "/opt/scala",
        "/opt/powershell",
        "/opt/dart",
        "/usr/local/lib/node_modules",
        "/usr/share/dotnet",
        "/usr/share/swift",
    ]:
        base = Path(root)
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path.is_file() and any(
                word in path.name.upper()
                for word in ["LICENSE", "LICENCE", "NOTICE", "COPYING", "COPYRIGHT"]
            ):
                paths.add(path)
    print("迷雾工具箱：服务器代码运行环境原始许可与版权声明\n")
    for path in sorted(paths):
        if path.stat().st_size > 32 * 1024 * 1024:
            raise ValueError("许可文件异常过大：" + str(path))
        print("\n========== " + str(path) + " ==========\n")
        print(path.read_text(encoding="utf-8", errors="replace"))
    for root in ["/opt/kotlin", "/opt/scala"]:
        for path in sorted(Path(root).rglob("*.jar")):
            with zipfile.ZipFile(path) as archive:
                for member in archive.infolist():
                    name = member.filename.upper()
                    if member.is_dir() or name.endswith(".CLASS"):
                        continue
                    if any(
                        word in name
                        for word in ["LICENSE", "LICENCE", "NOTICE", "COPYING", "COPYRIGHT"]
                    ):
                        if member.file_size > 2 * 1024 * 1024:
                            raise ValueError("JAR 许可异常过大：" + str(path))
                        print(
                            "\n========== " + str(path) + "!/" + member.filename + " ==========\n"
                        )
                        print(archive.read(member).decode("utf-8", errors="replace"))


def main():
    raw = sys.stdin.buffer.read(16 * LIMIT + 1)
    if len(raw) > 16 * LIMIT:
        raise ValueError("请求过大")
    job = json.loads(raw)
    language = job["language"]
    spec = PROFILES[language]
    for key in ["code", "input"]:
        if not isinstance(job[key], str) or len(job[key].encode("utf-8")) > LIMIT:
            raise ValueError("代码和输入分别最多 256 KB")
    Path(spec["file"]).write_text(job["code"], encoding="utf-8")
    if language == "csharp":
        runtime_directory = Path.cwd() / ".runtime"
        runtime_directory.mkdir(mode=0o700)
        os.environ["XDG_RUNTIME_DIR"] = str(runtime_directory)
        Path("Runner.csproj").write_text(
            '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType>'
            "<TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings>"
            "<Nullable>enable</Nullable></PropertyGroup></Project>",
            encoding="utf-8",
        )
        Path("NuGet.Config").write_text(
            "<configuration><packageSources><clear /></packageSources></configuration>",
            encoding="utf-8",
        )
    if language == "typescript":
        Path("globals.d.ts").write_text(
            "declare const stdin: string; declare function readline(): string | undefined;\n",
            encoding="utf-8",
        )
        Path("stdin.cjs").write_text(
            "let input, lines;\n"
            "const read = () => input ??= require('node:fs').readFileSync(0, 'utf8');\n"
            "Object.defineProperty(globalThis, 'stdin', { get: read });\n"
            "globalThis.readline = () => { if (!lines) { lines = read().split(/\\r?\\n/);"
            " if (lines.at(-1) === '') lines.pop(); } return lines.shift(); };\n",
            encoding="utf-8",
        )
    compiled = execute(spec["compile"], "", 60) if spec.get("compile") else None
    version = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))[language]
    if compiled and (compiled["exitCode"] or compiled["reason"]):
        return {"status": "compile_error", "compile": compiled, "run": None, "version": version}
    result = execute(spec["run"], job["input"], 10)
    return {
        "status": "ok" if result["exitCode"] == 0 and not result["reason"] else "runtime_error",
        "compile": compiled,
        "run": result,
        "version": version,
    }


if __name__ == "__main__":
    if "--manifest" in sys.argv:
        print(json.dumps(manifest(), ensure_ascii=False))
    elif "--notices" in sys.argv:
        notices()
    else:
        try:
            print(json.dumps(main(), ensure_ascii=False))
        except Exception as error:
            print(json.dumps({"error": str(error)}, ensure_ascii=False))
            sys.exit(1)
