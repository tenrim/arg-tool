# Complete IAU constellation and NASA eclipse snapshots

This archive was acquired on 2026-10-17 for the static 迷雾工具箱. It is a bounded full catalogue snapshot, not a sample list and not a live ephemeris service.

## Scope and preserved data

- IAU: the complete 88-row constellation name table, including original nominative, pronunciation, abbreviation, English meaning, genitive and genitive pronunciation. All 89 original GIF charts and 89 boundary TXT files are retained. Serpens has separate Caput and Cauda assets but remains one constellation. The graphical and textual chart legends remain available. PDF/TIF alternate-resolution links are preserved in the record; GIF is the bundled image format.
- NASA: all 50 century tables of the Five Millennium Catalog of Solar Eclipses (11,898 records) and all 50 century tables of the Five Millennium Catalog of Lunar Eclipses (12,064 records), astronomical years -1999 through 3000, inclusive. No event or original data column is filtered out. Raw row text, tokenized columns and every original row link remain on each record. Both complete official ASCII editions are also preserved per record separately, including solar plate numbers, solar azimuth and greater coordinate precision. Original edition headers and textual/precision differences are retained; ASCII never overwrites the web table. The date, TD and Delta T agree for all 23,962 joined events.
- NASA originals include the complete index pages, column keys, calendar conventions and Delta T explanation. Runtime metadata preserves their text and the actual table headers. Optional per-event map/plot/path links remain explicit official-site links; 23,962 individual eclipse map images and additional live map services are not represented as bundled local data.
- The Chinese constellation display names reuse the existing complete 88-name mapping in `public/discovery/reference-core.js`. These factual display labels are not claimed to be supplied by IAU. They are frozen in the derived snapshot.

## Sources and permission

IAU source: https://iauarchive.eso.org/public/themes/constellations/

The official chart release explicitly uses Creative Commons Attribution 4.0 International. Credit: IAU / Sky & Telescope; Roger Sinnott and Rick Fienberg; constellation patterns by Alan MacRobert. GIF image bytes are not modified; factual names and coordinates are preserved with the original URLs and headers. Full CC BY 4.0 legal text and source permission page are archived.

NASA source indexes:

- https://eclipse.gsfc.nasa.gov/SEcat5/SEcatalog.html
- https://eclipse.gsfc.nasa.gov/LEcat5/LEcatalog.html

Both official catalogue keys explicitly permit reproduction of the data with this acknowledgment:

> Eclipse Predictions by Fred Espenak and Jean Meeus (NASA's GSFC)

This is the NASA eclipse data's explicit reproduction permission, not an invented CC0 license. Original keys with the permission remain archived. Runtime `NASA-NOTICE.txt` reproduces the required credit and permission.

## Maintenance and offline generation

Use the project's Python 3 runtime (standard library only) and the Windows system `curl.exe`, which uses the machine's trusted certificate store:

```powershell
python scripts/import-atlas-celestial.py
python scripts/build-atlas-celestial.py
```

Only the first command accesses the network. Existing pinned originals are verified against `imports.json` and never silently replaced; a changed upstream response fails the import. The importer downloads directly from the official source URLs. `build-atlas-celestial.py` verifies those hashes before projecting complete deterministic JSON and copying the unmodified chart/boundary/license bytes. It requires no network, package installation or astronomy engine. It never rewrites the pin manifest.

`public/vendor/atlas-celestial/UPSTREAM.json` contains SHA-256 and byte lengths for every runtime asset and every archived source, all paths relative to the repository root. Its counts also enforce the 88/89/89 and 11,898/12,064 coverage contract. The two JSON snapshots also have deterministic gzip copies (zero timestamp and no filename); decompression must produce the exact JSON bytes. Normal website builds consume the checked-in runtime snapshot offline.

## Date and time semantics

The eclipse years use astronomical numbering, including year 0 (1 BCE). Catalogue dates are Julian through 1582-10-04 and Gregorian from 1582-10-15. The table's greatest-eclipse time is TD, with Delta T = TD - UT in seconds. No JavaScript Date conversion, UTC claim or observer-local visibility is inferred. Historical and future Delta T values are estimates; the fixed NASA prediction snapshot is preserved rather than silently updated to modern timescale estimates.

`public/atlas-celestial/core.js` owns pure filtering and pagination only. `queryConstellations(data, params)` and `queryEclipses(data, params)` return `{items,total,page,pageSize,note,facets}`; items retain `raw` complete records. Controllers own source loading, cancellation, UI and notebook bridges.
