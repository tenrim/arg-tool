"""Synthetic, redistributable positive fixtures; each carrier contains known bytes."""

import base64
import io
import json
from pathlib import Path
import random
import struct
import subprocess
import wave
import zipfile
from PIL import Image

root = Path("/work")
payload = b"mist-forensics-proof\x00\xff\x80\n"
(root / "payload.bin").write_bytes(payload)
rng = random.Random(711)
image = Image.frombytes("RGB", (512, 512), rng.randbytes(512 * 512 * 3))
image.save(root / "cover.jpg", quality=95)
image.save(root / "cover.png")
fixtures = {}


def add(name, path, **extra):
    fixtures[name] = {
        "filename": path.name,
        "data": base64.b64encode(path.read_bytes()).decode(),
        **extra,
    }


def command(args):
    p = subprocess.run(args, cwd=root, capture_output=True, timeout=90)
    if p.returncode:
        raise RuntimeError(str(args[0]) + ": " + p.stderr.decode(errors="replace"))


command(
    [
        "steghide",
        "embed",
        "-cf",
        "cover.jpg",
        "-ef",
        "payload.bin",
        "-sf",
        "steghide.jpg",
        "-p",
        "test",
        "-f",
    ]
)
add("steghide", root / "steghide.jpg", password="test")
command(["outguess", "-k", "test", "-d", "payload.bin", "cover.jpg", "outguess.jpg"])
add("outguess", root / "outguess.jpg", password="test")
command(["jsteg", "hide", "cover.jpg", "payload.bin", "jsteg.jpg"])
add("jsteg", root / "jsteg.jpg")
command(
    [
        "expect",
        "-c",
        'spawn jphide cover.jpg jpseek.jpg payload.bin; expect "Passphrase:"; send "test\\r"; expect "Re-enter:"; send "test\\r"; expect eof',
    ]
)
add("jpseek", root / "jpseek.jpg", password="test")
for algorithm in ["AES128", "AES256"]:
    filename = "openstego-" + algorithm + ".png"
    command(
        [
            "openstego",
            "embed",
            "-a",
            "randomlsb",
            "--cryptalgo",
            algorithm,
            "-mf",
            "payload.bin",
            "-cf",
            "cover.png",
            "-sf",
            filename,
            "-p",
            "test",
        ]
    )
    add("openstego-" + algorithm, root / filename, password="test")

small = Image.new("RGB", (64, 32), (84, 142, 60))
small.save(root / "small.png")
add("png", root / "small.png")
broken = bytearray((root / "small.png").read_bytes())
broken[16:20] = struct.pack(">I", 65)
(root / "broken.png").write_bytes(broken)
add("pcrt", root / "broken.png")

lsb = bytearray(image.tobytes())
message = b"MIST_ZSTEG_PAYLOAD\x00"
for i in range(len(message) * 8):
    lsb[i] = (lsb[i] & 254) | ((message[i // 8] >> (7 - i % 8)) & 1)
Image.frombytes("RGB", image.size, bytes(lsb)).save(root / "zsteg.png")
add("zsteg", root / "zsteg.png")

archive = io.BytesIO()
with zipfile.ZipFile(archive, "w") as z:
    z.writestr("proof.txt", payload)
(root / "embedded.bin").write_bytes((root / "small.png").read_bytes() + archive.getvalue())
add("embedded", root / "embedded.bin")
with wave.open(str(root / "tone.wav"), "wb") as wav:
    import math

    wav.setparams((2, 2, 22050, 0, "NONE", "not compressed"))
    wav.writeframes(
        b"".join(
            struct.pack(
                "<hh",
                int(20000 * math.sin(i * 2 * math.pi * 440 / 22050)),
                int(20000 * math.sin(i * 2 * math.pi * 880 / 22050)),
            )
            for i in range(22050)
        )
    )
add("spectrogram", root / "tone.wav")
small.save(root / "document.pdf", "PDF")
add("pdf", root / "document.pdf")
add("text", root / "payload.bin")
print(json.dumps({"fixtures": fixtures, "payload": base64.b64encode(payload).decode()}))
