# Local Chinese reference supplement

Wikidata structured labels and aliases are CC0-1.0. This supplement is a fixed,
partial naming overlay on the complete existing databases; it is not a Chinese
replacement database or an official naming standard. Original datasets, record
counts, IDs and raw names are preserved.

Run `node scripts/import-reference-chinese.mjs` to rebuild offline. Only the
explicit maintenance command `node scripts/import-reference-chinese.mjs --refresh`
contacts the fixed Wikidata Query Service. It never runs during ordinary builds
or reference searches. Each response is parsed in full before acceptance because
WDQS can return a 200 header followed by an incomplete JSON body and timeout text.

`imports.json` pins exact queries, compressed and original SHA-256 hashes. Large
UN/LOCODE queries are partitioned automatically across every A–Z prefix; no city
or country is hand selected. Capital, airport and sky labels cover available
Chinese language variants; the complete UN/LOCODE query selects the `zh` labels.
OpenCC supplies simplified/traditional search matching without changing names.

Joins use source identifiers, never fuzzy Chinese or English title matching.
Airports additionally need a matching coordinate within 15 km and reject
conflicting ICAO/IATA ownership. Capitals require an exact normalized original
English capital name as well as the ISO country code. Multiple observed Chinese
Wikidata identities are rejected. These safeguards do not certify every upstream
statement: missing or incorrect upstream naming remains a possible limitation.

The geological supplement contains only deterministic lower/middle/upper names
derived from the pinned ICS chart's already translated parent names. Source ages,
hierarchy and identifiers are not updated. The ICS chart is separately retained
under its existing CC BY 4.0 attribution. The official chart explains the matching
lower/middle/upper and early/middle/late terminology at
<https://stratigraphy.org/chart/?language=zh>.

`coverage.json` records actual generated coverage. Public attribution and the
CC0 legal code are bundled under `public/licenses/REFERENCE-CHINESE-*`.
