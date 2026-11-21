"""Typed, single-process calls to the pinned StegoVeritas 1.11 algorithms.

Original files remain unchanged. See docs/STEGOVERITAS.md for deduplication.
"""

import contextlib
import json
import logging
import multiprocessing
import os
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


def bootstrap():
    root = Path(os.environ.get("STEGOVERITAS_SOURCE", "/opt/stegoveritas"))
    sys.path.insert(0, str(root))
    # Avoid package __init__ eagerly starting the full CLI dependency graph.
    if "stegoveritas" not in sys.modules:
        package = ModuleType("stegoveritas")
        package.__path__ = [str(root / "stegoveritas")]
        sys.modules["stegoveritas"] = package


def indexes(value, maximum=7, allow_empty=True):
    import re

    if not isinstance(value, str) or len(value) > 1024:
        raise ValueError("位编号／索引格式不正确")
    if not value.strip():
        if allow_empty:
            return []
        raise ValueError("请填写索引")
    if not re.fullmatch(r"\d+(?:[ ,]+\d+)*", value.strip()):
        raise ValueError("索引须为以空格或逗号分隔的整数")
    result = [int(x) for x in re.split(r"[ ,]+", value.strip())]
    if len(set(result)) != len(result) or any(x > maximum for x in result):
        raise ValueError(f"索引不可重复，范围为 0–{maximum}")
    return result


class SerialPool:
    """Preserve upstream job enumeration, but propagate every child failure."""

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def apply_async(self, function, args=(), kwds=None, error_callback=None):
        function(*args, **(kwds or {}))
        return SimpleNamespace(wait=lambda: None)


def transforms(image):
    from stegoveritas.modules.image.analysis import filters

    if image.file.mode == "P":
        raise ValueError("索引图请使用调色板索引分析；不会先转换颜色再猜测原始位平面")
    # Colour/bit planes, invert and grayscale already have local toolbox owners.
    # These are the remaining original filter/enhancement operations.
    visible = image.file.copy()
    if "A" in visible.getbands():
        visible.putalpha(255)
    for operation in (
        ImageFilter.EDGE_ENHANCE,
        ImageFilter.EDGE_ENHANCE_MORE,
        ImageFilter.FIND_EDGES,
        ImageFilter.MaxFilter,
        ImageFilter.MedianFilter,
        ImageFilter.MinFilter,
        ImageFilter.ModeFilter,
        ImageFilter.SHARPEN,
        ImageFilter.SMOOTH,
        ImageFilter.GaussianBlur,
    ):
        filters.run_filter(image, visible, operation)
    for strength in (25, 50, 75, 100, -25, -50, -75, -100):
        filters.run_enhancer(
            image,
            [(ImageEnhance.Sharpness, strength)],
            f"enhance_sharpness_{strength}.png",
        )
    # Pillow cannot equalize RGBA directly. Apply the same original operation
    # to RGB and restore the original alpha, instead of silently skipping it.
    for name, operation in (
        ("autocontrast", ImageOps.autocontrast),
        ("equalize", ImageOps.equalize),
        ("solarized", ImageOps.solarize),
    ):
        original = image.file
        if original.mode in ("RGBA", "LA"):
            image.file = original.convert("RGB" if original.mode == "RGBA" else "L")
        try:
            filters.run_image_op(image, operation, name + ".png")
            if "A" in original.getbands():
                path = Path(image.veritas.results_directory) / (
                    Path(image.veritas.file_name).name + "_" + name + ".png"
                )
                with Image.open(path) as generated:
                    restored = generated.copy()
                restored.putalpha(original.getchannel("A"))
                restored.save(path)
        finally:
            image.file = original
    return {
        "生成图像": 21,
        "说明": "完整输出 10 种滤镜、8 档锐度、自动对比度、直方图均衡、曝光反转；位平面等在本地图片工具中。",
    }


def run(source, output, options, attachment=None):
    bootstrap()
    from stegoveritas.modules.image import SVImage

    mode = options.get("mode", "transform")
    args = SimpleNamespace(auto=False, extractLSB=True, colorMap=None, colorMapRange=None)
    veritas = SimpleNamespace(file_name=str(source), results_directory=str(output), args=args)
    image = SVImage(veritas)
    if not image.valid:
        raise ValueError("无法读取图片；请使用原始、完整图片文件")
    image.file.load()
    log = output / "logs"
    log.mkdir()
    with (
        (log / "stegoveritas-stdout.bin").open("w", encoding="utf-8") as stream,
        (log / "stegoveritas-stderr.bin").open("w", encoding="utf-8") as errors,
        contextlib.redirect_stdout(stream),
        contextlib.redirect_stderr(errors),
    ):
        handler = logging.StreamHandler(errors)
        logging.getLogger().addHandler(handler)
        try:
            if mode == "transform":
                result = transforms(image)
            elif mode == "colormap":
                from stegoveritas.modules.image.analysis import colormap

                if image.file.mode != "P":
                    raise ValueError("需要保留原始索引的调色板图片（P 模式）")
                args.colorMap = indexes(options.get("indices", ""), 255)
                keep = indexes(options.get("keep", ""), 255)
                start, end = options.get("rangeStart", ""), options.get("rangeEnd", "")
                if start != "" or end != "":
                    if (
                        not str(start).isdigit()
                        or not str(end).isdigit()
                        or not 0 <= int(start) < int(end) <= 256
                    ):
                        raise ValueError("索引区间须为 0 ≤ 起点 < 终点 ≤ 256，终点不包含")
                    keep = sorted(set(keep) | set(range(int(start), int(end))))
                colormap.extract_colormap(image, saveMap=keep)
                result = {"导出索引": args.colorMap or list(range(256)), "共同保留索引": keep}
            elif mode in ("extract", "brute"):
                if image.file.mode not in ("RGB", "RGBA"):
                    raise ValueError(
                        "此位序算法需要 RGB／RGBA 原始图片；其他模式请使用本地图片隐写或 zsteg"
                    )
                if mode == "extract":
                    from stegoveritas.modules.image.analysis import extractLSB

                    selected = {
                        c: indexes(options.get(c, "0" if c in ("red", "green", "blue") else ""))
                        for c in ("red", "green", "blue", "alpha")
                    }
                    if not any(selected.values()):
                        raise ValueError("至少选择一个颜色位")
                    if selected["alpha"] and image.file.mode != "RGBA":
                        raise ValueError("原图没有 Alpha 通道")
                    for key, value in selected.items():
                        setattr(args, key, value)
                    extractLSB.run(image)
                    result = {
                        "位编号": selected,
                        "位序": "逐像素、位编号从低到高、同一位按 RGBA；末尾不足 8 位按上游低位补齐为一字节",
                    }
                else:
                    from stegoveritas.modules.image.analysis import brute_lsb
                    from stegoveritas.stegoveritas import StegoVeritas

                    candidates = output / "candidates"
                    candidates.mkdir()
                    keepers = output / "keepers"
                    keepers.mkdir()
                    veritas._keeper_directory = str(keepers)
                    count = 0
                    parameters = {}
                    manifest = []

                    def examine(raw):
                        nonlocal count
                        count += 1
                        # Preserve even unrecognized candidates; file signatures
                        # are hints, not proof that no hidden content exists.
                        (candidates / f"{count:02}.bin").write_bytes(raw)
                        manifest.append(
                            {
                                "file": f"{count:02}.bin",
                                "bytes": len(raw),
                                "channels": {
                                    c: parameters.get(c + "_index", [])
                                    for c in ("red", "green", "blue", "alpha")
                                },
                            }
                        )
                        StegoVeritas.test_output(veritas, raw)

                    veritas.test_output = examine
                    args.bruteLSB = True
                    original_pool = multiprocessing.Pool
                    original_dump = brute_lsb.run_dump

                    def tracked_dump(image, **selected):
                        nonlocal parameters
                        parameters = selected
                        return original_dump(image, **selected)

                    brute_lsb.run_dump = tracked_dump
                    multiprocessing.Pool = SerialPool
                    try:
                        brute_lsb.run(image)
                    finally:
                        multiprocessing.Pool = original_pool
                        brute_lsb.run_dump = original_dump
                    (candidates / "manifest.json").write_text(
                        json.dumps(manifest, indent=2), encoding="utf-8"
                    )
                    result = {
                        "完成候选数": count,
                        "说明": "上游全部 40（RGB）／48（RGBA）组候选均已检测并保留。识别命中仅为线索；不是所有可能密码的穷举。",
                    }
            elif mode == "trailing":
                from trailing_data import extract_trailing

                result = extract_trailing(source, output, image.file.format)
            elif mode == "hide":
                from stegoveritas import hide_lsb

                if image.file.mode not in ("RGB", "RGBA"):
                    raise ValueError("嵌入需要 RGB／RGBA 图片")
                bands = options.get("bands", "RGB").upper()
                if (
                    not bands
                    or len(set(bands)) != len(bands)
                    or any(c not in image.file.getbands() for c in bands)
                ):
                    raise ValueError("颜色顺序须为原图通道的无重复组合，例如 RGB、BGR 或 RGBA")
                payload = (
                    attachment
                    if attachment is not None
                    else options.get("text", "").encode("utf-8")
                )
                if not payload:
                    raise ValueError("请填写要嵌入的文字或选择载荷文件")
                capacity = image.file.width * image.file.height * len(bands) // 8
                if len(payload) > capacity:
                    raise ValueError(f"载荷超过图片容量（{capacity} 字节），未嵌入部分数据")
                hide_lsb.img = image.file
                bits = hide_lsb.bytes_to_bits(payload)
                for index, bit in enumerate(bits):
                    pixel, channel = divmod(index, len(bands))
                    hide_lsb.encode_pixel(
                        pixel % image.file.width, pixel // image.file.width, bands[channel], bit
                    )
                fmt = options.get("format", "png")
                if fmt not in ("png", "bmp") or (fmt == "bmp" and "A" in bands):
                    raise ValueError("Alpha 嵌入必须导出 PNG；RGB 可选择 PNG 或 BMP")
                image.file.save(output / ("embedded." + fmt))
                result = {
                    "完整载荷字节数": len(payload),
                    "容量字节数": capacity,
                    "通道顺序": bands,
                    "说明": "逐行、每通道最低位；无长度头，提取时按载荷字节数取值。",
                }
            else:
                raise ValueError("未知 StegoVeritas 操作")
        finally:
            logging.getLogger().removeHandler(handler)
            handler.close()
            image.file.close()
    result = {"status": "ok", "引擎": "StegoVeritas 1.11", "操作": mode, **result}
    (output / "report.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return result
