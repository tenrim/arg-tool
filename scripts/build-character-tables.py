"""Build the bounded UCD 17 / CLDR 48.2 character repertoire, entirely offline."""

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "upstream/character-tables"
TARGET = ROOT / "public/vendor/character-tables"
LANGUAGES = {
    "ja": ["Hiragana", "Katakana"],
    "ko": ["Hangul"],
    "el": ["Greek"],
    "ru": ["Cyrillic"],
    "he": ["Hebrew"],
    "ar": ["Arabic"],
    "th": ["Thai"],
    "hi": ["Devanagari"],
}
SHORT = dict(
    zip(
        ["Hira", "Kana", "Hang", "Grek", "Cyrl", "Hebr", "Arab", "Thai", "Deva"],
        [
            "Hiragana",
            "Katakana",
            "Hangul",
            "Greek",
            "Cyrillic",
            "Hebrew",
            "Arabic",
            "Thai",
            "Devanagari",
        ],
    )
)
EXTRA = json.loads((SOURCE / "repertoires.json").read_text(encoding="utf-8"))
SHORT.update({short: script for _, _, script, short in EXTRA})


def unicode_set(text):
    """Parse the literal/range/string subset present in the pinned exemplars.

    Reject unsupported syntax rather than silently omit source characters.
    """
    assert text.startswith("[") and text.endswith("]"), text
    text, tokens, i = text[1:-1], [], 0
    while i < len(text):
        c = text[i]
        if c in " \t\r\n":
            i += 1
            continue
        if c == "\\":
            m = re.match(r"\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{8})", text[i:])
            if m:
                tokens.append(chr(int(m[1] or m[2], 16)))
                i += len(m[0])
            else:
                assert i + 1 < len(text)
                tokens.append(text[i + 1])
                i += 2
        elif c == "{":
            end = text.index("}", i)
            value = text[i + 1 : end]
            assert value and not any(x in value for x in "{}\\[]"), value
            tokens.append(value)
            i = end + 1
        elif c == "-":
            assert tokens and i + 1 < len(text) and len(tokens[-1]) == 1
            end = text[i + 1]
            assert end not in "[]{}\\ -" and ord(end) >= ord(tokens[-1])
            tokens.extend(chr(cp) for cp in range(ord(tokens[-1]) + 1, ord(end) + 1))
            i += 2
        else:
            assert c not in "[]}&^", c
            tokens.append(c)
            i += 1
    return list(dict.fromkeys(tokens))


def ranges(path):
    result = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.split("#")[0].strip()
        if not line:
            continue
        span, value = map(str.strip, line.split(";"))
        ends = span.split("..")
        result.append((int(ends[0], 16), int(ends[-1], 16), value))
    return result


def build():
    pins = json.loads((SOURCE / "PINS.json").read_text(encoding="utf-8"))
    for entry in pins["sources"]:
        raw = (SOURCE / entry["path"]).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == entry["sha256"], entry["path"]
    ucd = ROOT / "upstream/reference/sources"
    scripts = {}
    selected_scripts = set(SHORT.values())
    wanted = set()
    script_sets = {name: set() for name in sorted(selected_scripts)}
    for lo, hi, name in ranges(ucd / "Scripts.txt"):
        for cp in range(lo, hi + 1):
            scripts[cp] = name
            if name in selected_scripts:
                script_sets[name].add(cp)
    for lo, hi, names in ranges(SOURCE / "ScriptExtensions.txt"):
        for short in names.split():
            if short in SHORT:
                script_sets[SHORT[short]].update(range(lo, hi + 1))
    numeric = {}
    for line in (SOURCE / "DerivedNumericValues.txt").read_text(encoding="utf-8").splitlines():
        fields = line.split("#")[0].strip().split(";")
        if len(fields) < 4:
            continue
        span, value = fields[0].strip().split(".."), fields[3].strip()
        for cp in range(int(span[0], 16), int(span[-1], 16) + 1):
            numeric[cp] = value
    wanted.update(numeric)
    exemplars, sets = {}, {}
    for lang, names in LANGUAGES.items():
        raw = json.loads((SOURCE / (lang + ".json")).read_text(encoding="utf-8"))["main"][lang][
            "characters"
        ]
        exemplars[lang] = {
            key: raw.get(key, "[]") for key in ["exemplarCharacters", "auxiliary", "index"]
        }
        sets[lang] = {key: unicode_set(value) for key, value in exemplars[lang].items()}
        points = set().union(*(script_sets[name] for name in names))
        wanted.update(points)
        wanted.update(ord(c) for values in sets[lang].values() for text in values for c in text)
        sets[lang]["script"] = sorted(points)
    for lang, _, script, _ in EXTRA:
        points = script_sets[script]
        assert points, script
        sets[lang] = {"script": sorted(points)}
        wanted.update(points)
    rows, upper, lower = {}, {}, {}
    start = None
    for line in (ucd / "UnicodeData.txt").read_text(encoding="utf-8").splitlines():
        fields = line.split(";")
        cp, name, category = int(fields[0], 16), fields[1], fields[2]
        if name.endswith(", First>"):
            start = cp
            continue
        if name.endswith(", Last>"):
            assert start is not None
            for point in range(start, cp + 1):
                if point not in wanted:
                    continue
                if 0xAC00 <= point <= 0xD7A3:
                    n = point - 0xAC00
                    ls = [
                        "G",
                        "GG",
                        "N",
                        "D",
                        "DD",
                        "R",
                        "M",
                        "B",
                        "BB",
                        "S",
                        "SS",
                        "",
                        "J",
                        "JJ",
                        "C",
                        "K",
                        "T",
                        "P",
                        "H",
                    ]
                    vs = [
                        "A",
                        "AE",
                        "YA",
                        "YAE",
                        "EO",
                        "E",
                        "YEO",
                        "YE",
                        "O",
                        "WA",
                        "WAE",
                        "OE",
                        "YO",
                        "U",
                        "WEO",
                        "WE",
                        "WI",
                        "YU",
                        "EU",
                        "YI",
                        "I",
                    ]
                    ts = [
                        "",
                        "G",
                        "GG",
                        "GS",
                        "N",
                        "NJ",
                        "NH",
                        "D",
                        "L",
                        "LG",
                        "LM",
                        "LB",
                        "LS",
                        "LT",
                        "LP",
                        "LH",
                        "M",
                        "B",
                        "BS",
                        "S",
                        "SS",
                        "NG",
                        "J",
                        "C",
                        "K",
                        "T",
                        "P",
                        "H",
                    ]
                    label = "HANGUL SYLLABLE " + ls[n // 588] + vs[n % 588 // 28] + ts[n % 28]
                else:
                    assert "Ideograph" in name, name
                    label = "CJK UNIFIED IDEOGRAPH-" + format(point, "X")
                rows[point] = [point, label, category, scripts.get(point, "Unknown")]
            start = None
            continue
        if fields[12]:
            upper[cp] = int(fields[12], 16)
        if fields[13]:
            lower[cp] = int(fields[13], 16)
        if cp in wanted:
            rows[cp] = [cp, name, category, scripts.get(cp, "Unknown")]
    for lo, hi, name in ranges(ucd / "Blocks.txt"):
        for cp in range(lo, hi + 1):
            if cp in rows:
                rows[cp].append(name)
    for cp, row in rows.items():
        row.append(numeric.get(cp))
    for lang, groups in sets.items():
        common = list(dict.fromkeys(groups.get("exemplarCharacters", []) + groups.get("index", [])))
        # Case partners are UCD simple mappings, not locale-sensitive rewriting.
        if lang in ["el", "ru"]:
            common = list(
                dict.fromkeys(
                    common
                    + [
                        chr(mapping[ord(c)])
                        for c in common
                        if len(c) == 1
                        for mapping in [upper, lower]
                        if ord(c) in mapping
                    ]
                )
            )
        if lang in LANGUAGES:
            groups["common"] = common
        groups["all"] = list(
            dict.fromkeys(
                common + groups.get("auxiliary", []) + [chr(cp) for cp in groups["script"]]
            )
        )
        groups["numbers"] = [text for text in groups["all"] if any(ord(c) in numeric for c in text)]
        for text in groups["all"]:
            assert all(ord(c) in rows for c in text), (lang, text)
    numeric_points = sorted(numeric)
    number_groups = {"all": [chr(cp) for cp in numeric_points]}
    filters = {
        "decimal": lambda cp: rows[cp][2] == "Nd",
        "fractions": lambda cp: "/" in numeric[cp],
        "roman": lambda cp: "ROMAN NUMERAL" in rows[cp][1],
        "han": lambda cp: rows[cp][3] == "Han",
        "circled": lambda cp: rows[cp][4]
        in [
            "Enclosed Alphanumerics",
            "Enclosed Alphanumeric Supplement",
            "Enclosed CJK Letters and Months",
            "Enclosed Ideographic Supplement",
        ],
        "super-sub": lambda cp: "SUPERSCRIPT" in rows[cp][1] or "SUBSCRIPT" in rows[cp][1],
        "rods": lambda cp: rows[cp][4] == "Counting Rod Numerals",
        "mayan": lambda cp: rows[cp][4] == "Mayan Numerals",
        "cuneiform": lambda cp: rows[cp][3] == "Cuneiform",
        "aegean": lambda cp: rows[cp][4] == "Aegean Numbers",
    }
    for key, predicate in filters.items():
        number_groups[key] = [chr(cp) for cp in numeric_points if predicate(cp)]
        assert number_groups[key], key
    sets["numbers"] = number_groups
    data = {
        "ucdVersion": "17.0.0",
        "cldrVersion": "48.2.0",
        "fields": ["codePoint", "name", "category", "script", "block", "numericValue"],
        "scriptSets": {name: sorted(points) for name, points in script_sets.items()},
        "rows": [rows[cp] for cp in sorted(rows)],
        "languages": sets,
        "exemplars": exemplars,
    }
    TARGET.mkdir(parents=True, exist_ok=True)
    output = (json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    (TARGET / "characters.json").write_bytes(output)
    notice = (
        "Unicode Character Database 17.0.0 and CLDR 48.2.0\nCopyright Unicode, Inc. and contributors. Unicode License v3.\n\nSelected complete Script/Script_Extensions repertoires: "
        + ", ".join(sorted(selected_scripts))
        + ". Complete main, auxiliary and index exemplar sets: ja, ko, el, ru, he, ar, th, hi. Greek/Russian common view includes UCD simple case partners. Japanese Han and Korean Hanja coverage is the selected CLDR exemplar repertoire, not all Han characters.\n\nComplete UCD 17 DerivedNumericValues repertoire, including its Unihan-derived records. Exact numeric values are retained as integer/fraction strings; values describe Unicode properties, not context-dependent numeral parsing. Numeric views are explicit property/block filters.\n\nDerived by scripts/build-character-tables.py. Original records, fixed URLs and SHA-256: upstream/character-tables/PINS.json. Existing UCD originals: upstream/reference/sources/. Selected script configuration: upstream/character-tables/repertoires.json. No dictionary definitions or transliterations.\n"
    )
    (TARGET / "NOTICE.txt").write_text(notice, encoding="utf-8")
    (TARGET / "LICENSE.txt").write_bytes((ROOT / "upstream/cldr/LICENSE.txt").read_bytes())
    manifest = {
        **pins,
        "outputSha256": hashlib.sha256(output).hexdigest(),
        "rowCount": len(rows),
        "counts": {
            lang: {key: len(value) for key, value in groups.items()}
            for lang, groups in sets.items()
        },
    }
    (TARGET / "SOURCE.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (ROOT / "public/character-tables/repertoires.js").write_text(
        "// Generated by scripts/build-character-tables.py from the selected script configuration.\nexport const EXTRA_REPERTOIRES="
        + json.dumps(EXTRA, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {"rows": len(rows), "bytes": len(output), "counts": manifest["counts"]},
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    build()
