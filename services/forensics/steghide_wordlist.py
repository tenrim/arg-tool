"""Extend the existing Steghide owner with complete user-supplied wordlists."""

import hashlib
import subprocess


def run(source, output, password, raw):
    header = source.read_bytes()[:12]
    if not (
        header.startswith((b"\xff\xd8", b"BM", b".snd"))
        or (header[:4] == b"RIFF" and header[8:12] == b"WAVE")
    ):
        raise ValueError("Steghide 密码列表仅支持 JPEG、BMP、WAV、AU 载体")
    try:
        words = raw.decode("utf-8-sig").splitlines()
    except UnicodeDecodeError:
        raise ValueError("密码列表必须为 UTF-8 文本") from None
    attempts, matches, seen, payloads = 0, [], set(), set()
    # Empty password, explicit password, then every nonempty dictionary line.
    for candidate in ["", password, *(line.strip() for line in words if line.strip())]:
        if candidate in seen:
            continue
        if len(candidate) > 1024 or "\x00" in candidate:
            raise ValueError("密码列表含无效行：单行最多 1024 字符且不能包含 NUL")
        seen.add(candidate)
        attempts += 1
        destination = output / f"wordlist-{attempts:06}.bin"
        try:
            process = subprocess.run(
                [
                    "steghide",
                    "extract",
                    "-f",
                    "-sf",
                    str(source),
                    "-xf",
                    str(destination),
                    "-p",
                    candidate,
                ],
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=30,
                check=False,
            )
        except subprocess.TimeoutExpired:
            raise TimeoutError("单次 Steghide 尝试超时，密码列表未完成") from None
        if process.returncode == 0 and destination.is_file():
            digest = hashlib.sha256(destination.read_bytes()).hexdigest()
            matches.append({"尝试序号": attempts, "sha256": digest})
            if digest in payloads:
                destination.unlink()
            payloads.add(digest)
        elif destination.exists():
            destination.unlink()
    return {
        "status": "ok",
        "完成尝试": attempts,
        "命中": matches,
        "说明": "已尝试整个列表，重复密码去重；不会保存或回显密码。未命中不证明文件没有隐写。",
    }
