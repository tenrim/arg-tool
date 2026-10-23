"""Pinned maintenance importer. Run --download explicitly; default rebuilds offline.

TZif files retain the PSF wheel's unchanged bytes. This is upstream's complete
default zic build (backward included, optional backzone not enabled); all IANA
source files, including backzone, remain available for original-record lookup.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
UP = ROOT / "upstream/timezones"
OUT = ROOT / "public/vendor/timezones"
VERSION = "2026e"
PINS = [
    ("tzdata2026e.tar.gz", "https://data.iana.org/time-zones/releases/tzdata2026e.tar.gz", "b26882805f26aac59d5b222978e6580484b834ccdc98be89df2f05a6dc53a652"),
    ("tzdata-2026.5-py2.py3-none-any.whl", "https://files.pythonhosted.org/packages/94/21/1e5995a1c920cce14e4bffae20c665ec10e7ed03ab25e006cd741092b718/tzdata-2026.5-py2.py3-none-any.whl", "b683bd1b6659ddcd810ff02ad09ba821d4bf1065072805063eb35c49617905ac"),
]
FILES = []


def save(path, data, url=None):
    if isinstance(data, str):
        data = data.encode("utf-8")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    record = {"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(data).hexdigest()}
    if url:
        record["url"] = url
    FILES.append(record)


def main():
    args = argparse.ArgumentParser()
    args.add_argument("--download", action="store_true")
    opt = args.parse_args()
    UP.mkdir(parents=True, exist_ok=True)
    blobs = []
    for name, url, expected in PINS:
        path = UP / name
        if opt.download:
            data = urllib.request.urlopen(url, timeout=60).read()
        else:
            data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() != expected:
            raise ValueError("Pinned source differs: " + name)
        save(path, data, url)
        blobs.append(data)

    originals = {}
    with tarfile.open(fileobj=io.BytesIO(blobs[0]), mode="r:gz") as archive:
        for member in archive:
            if not member.isfile() or "/" in member.name or member.name.startswith("."):
                continue
            data = archive.extractfile(member).read()
            originals[member.name] = data.decode("utf-8")
            save(UP / "iana" / member.name, data)
    assert originals["version"].strip() == VERSION
    save(OUT / "IANA-LICENSE.txt", originals["LICENSE"])
    # The raw source set is complete, not a curated historical rule sample.
    source_names = ["africa", "antarctica", "asia", "australasia", "europe", "northamerica", "southamerica", "etcetera", "backward", "backzone", "factory"]
    for name in source_names + ["zone.tab", "zone1970.tab", "iso3166.tab", "zonenow.tab", "theory.html", "NEWS"]:
        save(OUT / "source" / (name + ".txt"), originals[name])

    zone_bytes = {}
    with zipfile.ZipFile(io.BytesIO(blobs[1])) as wheel:
        package_init = wheel.read("tzdata/__init__.py").decode()
        assert 'IANA_VERSION = "2026e"' in package_init
        for name in wheel.namelist():
            if name.startswith("tzdata/zoneinfo/") and not name.endswith("/"):
                relative = name[len("tzdata/zoneinfo/"):]
                data = wheel.read(name)
                if data.startswith(b"TZif"):
                    zone_bytes[relative] = data
                    save(OUT / "zoneinfo" / relative, data)
            if ".dist-info/licenses/" in name or name.endswith("dist-info/LICENSE"):
                save(UP / "psf-licenses" / name.rsplit("/", 1)[-1], wheel.read(name))
                save(OUT / ("PSF-" + name.rsplit("/", 1)[-1] + ".txt"), wheel.read(name))

    countries = {}
    for line in originals["iso3166.tab"].splitlines():
        if line and not line.startswith("#"):
            code, name = line.split("\t", 1)
            countries[code] = name
    metadata = {}
    for file in ["zone1970.tab", "zone.tab"]:
        for line in originals[file].splitlines():
            if not line or line.startswith("#"):
                continue
            row = line.split("\t")
            metadata.setdefault(row[2], {"countries": row[0].split(","), "coordinates": row[1], "comment": row[3] if len(row) > 3 else ""})
    records, rules, links, backzones = {}, {}, {}, {}
    for name in source_names:
        current = None
        for number, raw in enumerate(originals[name].splitlines(), 1):
            clean = raw.split("#", 1)[0].strip()
            if not clean:
                continue
            parts = clean.split()
            item = {"file": name, "line": number, "text": raw}
            if parts[0] == "Zone":
                current = parts[1]
                (backzones if name == "backzone" else records)[current] = [item]
            elif raw[0].isspace() and current:
                (backzones if name == "backzone" else records)[current].append(item)
            else:
                current = None
                if parts[0] == "Rule":
                    rules.setdefault(("backzone:" if name == "backzone" else "") + parts[1], []).append(item)
                elif parts[0] == "Link" and name != "backzone":
                    links[parts[2]] = {"target": parts[1], **item}

    def canonical(zone):
        seen = set()
        while zone in links:
            if zone in seen:
                raise ValueError("Cyclic IANA Link")
            seen.add(zone)
            zone = links[zone]["target"]
        return zone

    zones = []
    for zone in sorted(zone_bytes):
        target = canonical(zone)
        details = metadata.get(zone, metadata.get(target, {"countries": [], "coordinates": "", "comment": ""}))
        zones.append({"id": zone, "canonical": target, **details})
    index = {"version": VERSION, "distribution": "tzdata 2026.5", "scope": "IANA default zic build; backward enabled; optional backzone not compiled; POSIX timescale", "zoneCount": len(zones), "zones": zones, "countries": countries}
    save(OUT / "index.json", json.dumps(index, ensure_ascii=False, separators=(",", ":")) + "\n")
    save(OUT / "source-records.json", json.dumps({"zones": records, "rules": rules, "links": links, "backzones": backzones}, ensure_ascii=False, separators=(",", ":")) + "\n")
    notice = """IANA Time Zone Database 2026e / PSF tzdata 2026.5

IANA data: https://data.iana.org/time-zones/releases/tzdata2026e.tar.gz
Public-domain dedication and exceptions: IANA-LICENSE.txt; raw sources retained.
Compiled TZif distribution: https://github.com/python/tzdata
Distribution packaging license: Apache-2.0 (PSF-LICENSE.txt).
TZif binaries are unchanged from the pinned official wheel. No years or names
were filtered. Upstream default zic compilation enables backward, not optional
backzone; backzone originals are separately available as non-operative history.
POSIX timestamps do not count leap seconds. Future footer rules are projections
of this release, not a prediction that governments will retain those policies.
"""
    save(OUT / "NOTICE.txt", notice)
    manifest = {"name": "IANA Time Zone Database / PSF tzdata", "version": VERSION, "distributionVersion": "2026.5", "repositories": ["https://www.iana.org/time-zones", "https://github.com/python/tzdata"], "zoneCount": len(zones), "compiledScope": index["scope"], "files": FILES}
    (OUT / "UPSTREAM.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"IANA {VERSION}: {len(zones)} complete default TZif names, {len(records)} Zone blocks, {len(backzones)} optional backzone records; {len(FILES)} pinned artifacts")


if __name__ == "__main__":
    main()
