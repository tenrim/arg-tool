"""Reproducible verification fixture from CPython's independent ZoneInfo.

Only the pinned local wheel is read; this never asks host/OS timezone data.
Fixture stays under tests and is excluded from static delivery.
"""
from datetime import datetime, timezone
import gzip
import io
import json
from pathlib import Path
import zoneinfo
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DATES = ["1850-01-15T12:34:56", "1900-06-15T12:34:56", "1945-08-15T12:34:56", "1970-01-15T12:34:56", "2024-01-15T12:34:56", "2024-07-15T12:34:56", "2100-07-15T12:34:56", "2500-01-15T12:34:56", "2500-07-15T12:34:56", "9999-06-15T12:34:56"]
records = []
with zipfile.ZipFile(ROOT / "upstream/timezones/tzdata-2026.5-py2.py3-none-any.whl") as wheel:
    for name in sorted(wheel.namelist()):
        if not name.startswith("tzdata/zoneinfo/") or name.endswith("/"):
            continue
        data = wheel.read(name)
        if not data.startswith(b"TZif"):
            continue
        key = name[len("tzdata/zoneinfo/"):]
        zone = zoneinfo.ZoneInfo.from_file(io.BytesIO(data), key=key)
        expected = []
        for date in DATES:
            utc = datetime.fromisoformat(date).replace(tzinfo=timezone.utc)
            local = utc.astimezone(zone)
            expected.append([int(local.utcoffset().total_seconds()), bool(local.dst()), local.tzname()])
        records.append([key, expected])
content = json.dumps({"ianaVersion": "2026e", "oracle": "CPython zoneinfo.ZoneInfo.from_file, exact pinned wheel TZif bytes", "datesUTC": DATES, "zones": records}, ensure_ascii=False, separators=(",", ":")).encode()
path = ROOT / "tests/fixtures/timezones-oracle.json.gz"
path.write_bytes(gzip.compress(content, mtime=0))
print(f"{len(records)} zones × {len(DATES)} independent UTC states; {len(content)} uncompressed / {path.stat().st_size} gzip bytes")
