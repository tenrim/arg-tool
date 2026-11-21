"""Container-aware trailing-byte boundaries; no string-search 'IEND' heuristic.

References and the upstream JPEG/GIF/TIFF defects are recorded in STEGOVERITAS.md.
"""


def boundary(data, kind):
    def need(at, size):
        if at < 0 or size < 0 or at + size > len(data):
            raise ValueError("图片结构越界或不完整，不能确定尾随数据")

    def number(at, size, endian="big"):
        need(at, size)
        return int.from_bytes(data[at : at + size], endian)

    if kind == "PNG":
        at = 8
        while True:
            length = number(at, 4)
            need(at, length + 12)
            name = data[at + 4 : at + 8]
            at += length + 12
            if name == b"IEND":
                if length:
                    raise ValueError("IEND 长度无效")
                return at
    if kind == "BMP":
        end = number(2, 4, "little")
        if end < 26 or end < number(10, 4, "little"):
            raise ValueError("BMP 声明长度无效")
        need(0, end)
        return end
    if kind == "JPEG":
        at = 2
        scan = False
        while True:
            need(at, 2)
            if scan and data[at] != 255:
                at += 1
                continue
            if data[at] != 255:
                raise ValueError("JPEG 标记无效")
            while data[at] == 255:
                at += 1
                need(at, 1)
            marker = data[at]
            at += 1
            if scan and (marker == 0 or 0xD0 <= marker <= 0xD7):
                continue
            if marker == 0xD9:
                return at
            scan = False
            if marker in (1, 0xD8) or 0xD0 <= marker <= 0xD7:
                continue
            length = number(at, 2)
            if length < 2:
                raise ValueError("JPEG 段长度无效")
            need(at, length)
            at += length
            scan = marker == 0xDA
    if kind == "GIF":
        need(0, 13)
        at = 13 + (3 * 2 ** ((data[10] & 7) + 1) if data[10] & 128 else 0)

        def blocks(at):
            while True:
                n = number(at, 1)
                at += 1
                need(at, n)
                at += n
                if not n:
                    return at

        while True:
            marker = number(at, 1)
            at += 1
            if marker == 0x3B:
                return at
            if marker == 0x21:
                at = blocks(at + 1)
            elif marker == 0x2C:
                need(at, 9)
                packed = data[at + 8]
                at += 9 + (3 * 2 ** ((packed & 7) + 1) if packed & 128 else 0)
                at = blocks(at + 1)
            else:
                raise ValueError("GIF 数据块无效")
    if kind == "TIFF":
        endian = "little" if data[:2] == b"II" else "big"
        if number(2, 2, endian) != 42:
            raise ValueError("仅支持经典 TIFF；BigTIFF 请使用完整文件元数据和文件雕刻工具")
        sizes = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4}
        maximum, seen = 8, set()

        def directory(at):
            nonlocal maximum
            if not at:
                return
            if at in seen:
                raise ValueError("TIFF 目录循环引用")
            seen.add(at)
            if len(seen) > 4096:
                raise ValueError("TIFF 目录超过处理限额")
            count = number(at, 2, endian)
            end = at + 2 + count * 12 + 4
            need(at, end - at)
            maximum = max(maximum, end)
            tags = {}
            for i in range(count):
                entry = at + 2 + i * 12
                tag, dtype = number(entry, 2, endian), number(entry + 2, 2, endian)
                n = number(entry + 4, 4, endian)
                if dtype not in sizes:
                    raise ValueError("TIFF 包含未知类型，无法可靠确定尾部边界")
                length = sizes[dtype] * n
                location = entry + 8 if length <= 4 else number(entry + 8, 4, endian)
                need(location, length)
                maximum = max(maximum, location + length)
                if dtype in (1, 3, 4, 13):
                    tags[tag] = [
                        number(location + j * sizes[dtype], sizes[dtype], endian) for j in range(n)
                    ]
            for offsets, lengths in ((273, 279), (324, 325), (513, 514)):
                if offsets in tags or lengths in tags:
                    if len(tags.get(offsets, [])) != len(tags.get(lengths, [])):
                        raise ValueError("TIFF 像素段偏移与长度不匹配")
                    for position, size in zip(tags.get(offsets, []), tags.get(lengths, [])):
                        need(position, size)
                        maximum = max(maximum, position + size)
            for pointer in (330, 34665, 34853, 40965):
                for child in tags.get(pointer, []):
                    directory(child)
            directory(number(end - 4, 4, endian))

        directory(number(4, 4, endian))
        return maximum
    raise ValueError("尾随提取支持 PNG、JPEG、BMP、GIF 和经典 TIFF")


def extract_trailing(source, output, kind):
    data = source.read_bytes()
    end = boundary(data, kind)
    tail = data[end:]
    if tail:
        (output / "trailing_data.bin").write_bytes(tail)
    return {
        "格式": kind,
        "内容结束偏移": end,
        "尾随字节数": len(tail),
        "说明": "按图片容器结构提取附加字节；不代表这些字节一定是隐写。TIFF 按已识别目录和数据引用计算，私有标签可能另有引用。",
    }
