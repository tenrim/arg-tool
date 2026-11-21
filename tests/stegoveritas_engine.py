"""Run inside the isolated forensics image; only generated fixtures are used."""

import base64
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile

from PIL import Image, PngImagePlugin

sys.path.insert(0, "/opt")
from stegoveritas_adapter import run
from steghide_wordlist import run as wordlist
from trailing_data import boundary


def main():
    passed = []
    with tempfile.TemporaryDirectory(dir="/work") as tmp:
        root = Path(tmp)
        rgb = Image.new("RGB", (32, 24))
        rgb.putdata([(i % 256, i * 3 % 256, i * 7 % 256) for i in range(32 * 24)])
        source = root / "input.png"
        rgb.save(source)

        def execute(options, payload=None, path=source):
            out = root / f"result-{len(list(root.iterdir()))}"
            out.mkdir()
            return run(path, out, options, payload), out

        report, out = execute({"mode": "transform"})
        assert len(list(out.glob("*.png"))) == report["生成图像"] == 21
        passed.append("全部 21 张 RGB 增强图")
        rgba = rgb.convert("RGBA")
        rgba.putalpha(Image.new("L", rgb.size, 42))
        rgba_path = root / "rgba.png"
        rgba.save(rgba_path)
        report, out = execute({"mode": "transform"}, path=rgba_path)
        assert len(list(out.glob("*.png"))) == 21
        for name in ("autocontrast", "equalize", "solarized"):
            with Image.open(out / f"rgba.png_{name}.png") as enhanced:
                assert enhanced.getchannel("A").getextrema() == (42, 42)
        passed.append("RGBA 增强完整并保留透明度")
        palette = Image.new("P", (4, 1))
        palette.putpalette([x for i in range(256) for x in (i, i, i)])
        palette.putdata([0, 1, 2, 3])
        palette_path = root / "palette.png"
        palette.save(palette_path)
        report, out = execute(
            {"mode": "colormap", "indices": "0 3", "rangeStart": "1", "rangeEnd": "2"},
            path=palette_path,
        )
        assert len(list(out.glob("*.png"))) == 2
        with Image.open(out / "palette.png_0.png") as image:
            assert list(image.convert("L").getdata()) == [0, 0, 255, 255]
        passed.append("调色板指定索引与半开区间")
        report, out = execute({"mode": "colormap"}, path=palette_path)
        assert len(list(out.glob("*.png"))) == 256
        passed.append("全部 256 个调色板索引，无抽样")
        exact = Image.new("RGBA", (1, 1), (1, 2, 3, 1))
        exact_path = root / "exact.png"
        exact.save(exact_path)
        _, out = execute(
            {"mode": "extract", "red": "0 1", "green": "0 1", "blue": "0 1", "alpha": "0 1"},
            path=exact_path,
        )
        assert (out / "LSBExtracted.bin").read_bytes() == bytes([0b10110110])
        _, out = execute(
            {"mode": "extract", "red": "0", "green": "", "blue": "", "alpha": ""}, path=exact_path
        )
        assert (out / "LSBExtracted.bin").read_bytes() == b"\x01"
        passed.append("RGBA 位交织精确字节及末尾不足一字节")
        payload = b"MIST\x00\xff"
        _, out = execute({"mode": "hide", "bands": "RGBA", "format": "png"}, payload, rgba_path)
        _, extracted = execute({"mode": "extract", "alpha": "0"}, path=out / "embedded.png")
        assert (extracted / "LSBExtracted.bin").read_bytes().startswith(payload)
        passed.append("二进制载荷经 RGBA 嵌入后原字节提取")
        _, out = execute({"mode": "hide", "text": "迷雾", "bands": "BGR", "format": "bmp"})
        with Image.open(out / "embedded.bmp") as encoded:
            bits = "".join(str(pixel[c] & 1) for pixel in encoded.getdata() for c in (2, 1, 0))
        assert bytes(int(bits[i : i + 8], 2) for i in range(0, 48, 8)) == "迷雾".encode()
        passed.append("UTF-8 文字／BGR／BMP")
        for options, path, content in [
            ({"mode": "hide"}, exact_path, b"too-large"),
            ({"mode": "extract", "red": "8"}, source, None),
            ({"mode": "extract", "alpha": "0"}, source, None),
            ({"mode": "colormap"}, source, None),
            ({"mode": "colormap", "indices": "256"}, palette_path, None),
            ({"mode": "colormap", "rangeStart": "4", "rangeEnd": "3"}, palette_path, None),
        ]:
            try:
                execute(options, content, path)
            except ValueError:
                pass
            else:
                raise AssertionError(options)
        passed.append("容量、位编号、缺失通道、错误图片模式与区间拒绝")
        tail = b"TRAILING\x00IEND\xff"
        for fmt in ("PNG", "JPEG", "GIF", "BMP", "TIFF"):
            file = root / ("tail." + fmt.lower())
            extra = {}
            if fmt == "PNG":
                info = PngImagePlugin.PngInfo()
                info.add_text("test", "IEND must not be mistaken for the end")
                extra["pnginfo"] = info
            rgb.save(file, format=fmt, **extra)
            original = file.read_bytes()
            assert boundary(original, fmt) == len(original), fmt
            file.write_bytes(original + tail)
            _, out = execute({"mode": "trailing"}, path=file)
            assert (out / "trailing_data.bin").read_bytes() == tail, fmt
        passed.append("PNG/JPEG/GIF/BMP/TIFF 尾随原字节；PNG 文本中 IEND 不误判")
        for path, count in ((source, 40), (rgba_path, 48)):
            report, out = execute({"mode": "brute"}, path=path)
            assert report["完成候选数"] == count
            assert len(list((out / "candidates").glob("*.bin"))) == count
            manifest = json.loads((out / "candidates/manifest.json").read_text())
            assert len(manifest) == count
            assert manifest[0]["channels"] == {"red": [0], "green": [0], "blue": [0], "alpha": []}
        passed.append("RGB 40／RGBA 48 组全部运行、识别并保留原始候选")
        archive = io.BytesIO()
        with zipfile.ZipFile(archive, "w") as z:
            z.writestr("proof.txt", b"MIST_STEGO_CARVE_PROOF")
        _, hidden_zip = execute({"mode": "hide"}, archive.getvalue())
        _, carved = execute({"mode": "brute"}, path=hidden_zip / "embedded.png")
        assert any(
            p.is_file() and p.read_bytes() == b"MIST_STEGO_CARVE_PROOF"
            for p in (carved / "keepers").rglob("*")
        )
        passed.append("LSB 内嵌 ZIP 经候选识别与 Binwalk 提取出真实文件")
        cover = root / "cover.jpg"
        import random

        rng = random.Random(1729)
        Image.frombytes(
            "RGB", (256, 256), bytes(rng.randrange(256) for _ in range(256 * 256 * 3))
        ).save(cover, quality=95)
        hidden = root / "payload.bin"
        hidden.write_bytes(payload)
        subprocess.run(
            ["steghide", "embed", "-cf", str(cover), "-ef", str(hidden), "-p", "mist-test", "-f"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        out = root / "wordlist"
        out.mkdir()
        report = wordlist(cover, out, "wrong", b"wrong\n\nmist-test\nlast\n")
        assert report["完成尝试"] == 4 and len(report["命中"]) == 1
        assert any(p.read_bytes() == payload for p in out.glob("*.bin"))
        assert "mist-test" not in json.dumps(report)
        passed.append("密码列表跨空行、不提前停止、完整提取且不回显密码")
    print(json.dumps({"ok": True, "passed": passed}, ensure_ascii=False))


if __name__ == "__main__":
    main()
