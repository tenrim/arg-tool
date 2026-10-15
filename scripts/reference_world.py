"""Pure offline Natural Earth adapter shared by maintenance and regressions."""
import hashlib
import json
import pathlib


def build_world(source, countries):
    """Postal abbreviations are not country identifiers (Northern Cyprus uses CN)."""
    world = []
    for feature in source['features']:
        properties = feature['properties']
        code = next((properties.get(key) for key in ('ISO_A2_EH', 'ISO_A2')
                     if properties.get(key) in countries), None)
        # Keep unsupported regions individually identifiable and noninteractive.
        # Never let an ambiguous abbreviation become a selectable country.
        if code is None:
            code = 'ne:' + str(properties.get('ADM0_A3') or properties.get('NAME') or len(world))
        polygons = feature['geometry']['coordinates']
        if feature['geometry']['type'] == 'Polygon':
            polygons = [polygons]
        path = []
        for polygon in polygons:
            for ring in polygon:
                path.append('M' + 'L'.join(f'{(x+180)*1000/360:.2f},{(90-y)*500/180:.2f}'
                                          for x, y, *_ in ring) + 'Z')
        world.append({'id': code, 'name': properties.get('NAME_ZH') or properties['NAME'],
                      'path': ''.join(path)})
    return world


if __name__ == '__main__':
    root = pathlib.Path(__file__).resolve().parents[1]
    source = root / 'upstream/reference/sources'
    output = root / 'public/vendor/reference/world.json'
    world = build_world(json.loads((source / 'world.geojson').read_text()),
                        json.loads((source / 'countries.json').read_text()))
    output.write_text(json.dumps(world, ensure_ascii=False, separators=(',', ':')) + '\n')
    manifest_file = output.parent / 'UPSTREAM.json'
    manifest = json.loads(manifest_file.read_text())
    record = next(row for row in manifest['files'] if row['path'] == str(output.relative_to(root)))
    record['sha256'] = hashlib.sha256(output.read_bytes()).hexdigest()
    manifest_file.write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Regenerated {len(world)} world features from pinned source; refreshed derivative hash.')
