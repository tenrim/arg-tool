#!/usr/bin/env python3
"""Maintenance-only download of hash-pinned AviList and Open Opus source data."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'upstream/atlas-life-culture'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='explicitly refresh mutable source snapshots and update their pins')
    parser.add_argument('--snapshot-date', help='reviewed YYYY-MM-DD date for an explicit refresh')
    args = parser.parse_args()
    if args.refresh and not args.snapshot_date:
        parser.error('--refresh requires --snapshot-date YYYY-MM-DD; do not label refreshed data with an old snapshot date')
    if args.snapshot_date:
        datetime.date.fromisoformat(args.snapshot_date)
    manifest_path = BASE / 'pins.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    for source in manifest['files']:
        target = ROOT / source['path']
        if not target.exists() or args.refresh:
            request = urllib.request.Request(source['url'], headers={'User-Agent': 'Mozilla/5.0 (MistToolbox source maintenance)'})
            data = urllib.request.urlopen(request, timeout=120).read()
            digest = hashlib.sha256(data).hexdigest()
            if not args.refresh and digest != source['sha256']:
                raise RuntimeError(f"Source changed: {source['path']}; expected {source['sha256']}, got {digest}. Review an explicit --refresh before adopting it.")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            if args.refresh:
                source['sha256'] = digest
                source['bytes'] = len(data)
        actual = hashlib.sha256(target.read_bytes()).hexdigest()
        if actual != source['sha256']:
            raise RuntimeError(f"Fixed local source integrity failure: {source['path']}")
        print(f"Verified {source['path']}")
    if args.refresh:
        manifest['snapshotDate'] = args.snapshot_date
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

if __name__ == '__main__':
    main()
