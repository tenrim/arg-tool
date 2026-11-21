import test from 'node:test';
import assert from 'node:assert/strict';
import { SCIENCE_PROVIDERS } from '../services/online-query/providers/science.mjs';
import { readFile } from 'node:fs/promises';

const provider = (id) => SCIENCE_PROVIDERS.find((item) => item.id === id);
const response = (value, status = 200) => ({
  response: new Response(typeof value === 'string' ? value : JSON.stringify(value), {
    status,
    headers: { 'Content-Type': typeof value === 'string' ? 'text/plain' : 'application/json' },
  }),
  text: typeof value === 'string' ? value : JSON.stringify(value),
});
function context(handler) {
  const calls = [],
    controller = new AbortController();
  return {
    calls,
    controller,
    signal: controller.signal,
    now: () => Date.UTC(2026, 9, 17),
    async request(url, options) {
      controller.signal.throwIfAborted();
      calls.push({ url: String(url), options });
      return handler(url, options, calls.length);
    },
  };
}
const compound = (id, extra = {}) => ({
  id: { id: { cid: id } },
  atoms: { aid: [1], element: [6] },
  bonds: { aid1: [], aid2: [], order: [] },
  coords: [{ type: [1], conformers: [{ x: [0], y: [0] }] }],
  props: [{ urn: { label: 'IUPAC Name', name: 'Preferred' }, value: { sval: 'Full compound' } }],
  unknown: { all: ['preserved', null, 1] },
  ...extra,
});
test('science adapters expose fixed official hosts, explicit modes and bounded white-list inputs', () => {
  assert.equal(SCIENCE_PROVIDERS.length, 2);
  assert.deepEqual(provider('cod').allowedHosts, ['www.crystallography.net']);
  assert.deepEqual(provider('pubchem').allowedHosts, ['pubchem.ncbi.nlm.nih.gov']);
  for (const id of ['cod', 'pubchem'])
    assert.throws(() => provider(id).validate({ query: 'test', url: 'https://attacker.invalid' }), {
      status: 400,
    });
  for (const input of [
    { query: '' },
    { query: 'x', elements: ['Qq'] },
    { query: 'x', elements: ['H'], excludeElements: ['H'] },
    { mode: 'cif', id: '../../etc' },
    { query: 'x', start: 1 },
  ])
    assert.throws(() => provider('cod').validate(input), { status: 400 });
  for (const input of [
    { kind: 'unknown', query: 'x' },
    { kind: 'cid', query: '0' },
    { kind: 'cid', query: '9007199254740993' },
    { query: 'x', start: 250 },
    { mode: 'structure', cid: 1, dimension: '4d' },
    { mode: 'detail', cid: 1, url: 'https://example.org' },
  ])
    assert.throws(() => provider('pubchem').validate(input), { status: 400 });
});

test('COD query count bounds the real JSON search, complete fields and exact CIF/detail actions', async () => {
  const p = provider('cod'),
    rows = Array.from({ length: 26 }, (_, i) => ({
      file: String(1000000 + i),
      formula: 'Si O2',
      cell: { a: 4.9, units: 'angstrom' },
      authors: ['A', 'B'],
      unknown: [null, 'full'],
    })),
    ctx = context((url, _options, n) => response(n === 1 ? '26' : rows)),
    input = p.validate({
      query: 'quartz',
      formula: 'O2 Si',
      elements: ['Si'],
      excludeElements: ['Na'],
      spacegroup: 'P 31 2 1',
      year: 1990,
      doi: '10.1234/example',
    }),
    value = await p.execute(input, ctx),
    url = new URL(ctx.calls[1].url);
  assert.equal(url.searchParams.get('format'), 'json');
  assert.equal(url.searchParams.get('el1'), 'Si');
  assert.equal(url.searchParams.get('nel1'), 'Na');
  assert.equal(url.searchParams.get('spacegroup'), 'P 31 2 1');
  for (const flag of ['include_duplicates', 'include_errors', 'include_theoretical'])
    assert.equal(url.searchParams.has(flag), false, 'ordinary searches retain COD default filters');
  assert.equal(value.total, 26);
  assert.equal(value.records.length, 25);
  assert.equal(value.next.start, 25);
  assert.deepEqual(value.records[0].fields, rows[0]);
  assert.deepEqual(value.records[0].actions[1].parameters, { mode: 'cif', id: '1000000' });
  assert.equal(value.attribution.licenseURL, 'https://creativecommons.org/publicdomain/zero/1.0/');
  assert.deepEqual(value.rawResponse, rows);
});

test('COD exact ID includes flagged entries while ordinary search retains official exclusion defaults', async () => {
  const fixture = JSON.parse(
      await readFile(
        new URL('./fixtures/online-reading/science/cod-detail-duplicate.json', import.meta.url),
        'utf8',
      ),
    ),
    raw = fixture.record.fields,
    p = provider('cod'),
    ctx = context((url) => {
      const target = new URL(url);
      assert.equal(target.searchParams.get('id'), '1000000');
      assert.equal(target.searchParams.get('format'), 'json');
      const included = ['include_duplicates', 'include_errors', 'include_theoretical'].every(
        (name) => target.searchParams.get(name) === '1',
      );
      return response(included ? [raw] : []);
    }),
    value = await p.execute(p.validate({ mode: 'detail', id: '1000000' }), ctx);
  assert.equal(value.records.length, 1, 'documented duplicate ID is not reported as missing');
  assert.equal(value.records[0].id, '1000000');
  assert.equal(value.records[0].fields.duplicateof, '2011331');
  assert.deepEqual(value.records[0].fields, raw);
  assert.equal(value.records[0].fields.doi, '10.1107/S0108270100008532');
});

test('COD count over limit never silently drops matches or requests the broad JSON; no-results and failures remain explicit', async () => {
  const p = provider('cod'),
    input = p.validate({ query: 'quartz' }),
    broad = context(() => response('251'));
  await assert.rejects(p.execute(input, broad), { status: 422, code: 'QUERY_TOO_BROAD' });
  assert.equal(broad.calls.length, 1);
  const empty = context(() => response('0'));
  assert.deepEqual((await p.execute(input, empty)).records, []);
  assert.equal(empty.calls.length, 1);
  await assert.rejects(
    p.execute(
      input,
      context(() => response('<html>Error</html>')),
    ),
    { status: 502 },
  );
  await assert.rejects(
    p.execute(
      input,
      context(() => response('maintenance', 503)),
    ),
    { status: 502 },
  );
  await assert.rejects(
    p.execute(
      p.validate({ mode: 'detail', id: '1000000' }),
      context(() => response([{ file: '9000000' }])),
    ),
    { status: 502 },
  );
});

test('COD original CIF is fetched only after explicit mode and retained byte-for-text without HTML substitution', async () => {
  const p = provider('cod'),
    raw =
      'data_1000000\n# Full original references\n_cell_length_a 4.321(4)\nloop_\n_atom_site_label\nSi1\n',
    ctx = context(() => response(raw)),
    value = await p.execute(p.validate({ mode: 'cif', id: '1000000' }), ctx);
  assert.equal(ctx.calls[0].url, 'https://www.crystallography.net/cod/1000000.cif');
  assert.equal(value.records[0].fields.cif, raw);
  assert.equal(value.records[0].fields.format, 'CIF');
  assert.equal(value.total, 1);
  await assert.rejects(
    p.execute(
      p.validate({ mode: 'cif', id: '1000000' }),
      context(() => response('<html>captcha</html>')),
    ),
    { status: 502 },
  );
});

test('PubChem name and formula search page genuine CIDs and retain complete compound atoms, bonds, coordinates, properties', async () => {
  const p = provider('pubchem'),
    ids = Array.from({ length: 26 }, (_, i) => i + 1),
    ctx = context((_url, _options, n) =>
      response(
        n === 1
          ? { IdentifierList: { CID: ids, unknown: 'kept' } }
          : { PC_Compounds: ids.slice(0, 25).map((id) => compound(id)) },
      ),
    ),
    value = await p.execute(p.validate({ kind: 'formula', query: 'C9H8O4' }), ctx),
    url = new URL(ctx.calls[0].url);
  assert.equal(url.pathname, '/rest/pug/compound/fastformula/C9H8O4/cids/JSON');
  assert.equal(url.searchParams.get('MaxRecords'), '251');
  assert.equal(value.records.length, 25);
  assert.equal(value.total, 26);
  assert.equal(value.next.start, 25);
  assert.deepEqual(value.records[0].fields, compound(1));
  assert.equal(value.rawResponse.identifiers.IdentifierList.unknown, 'kept');
  assert.deepEqual(
    value.records[0].actions.map((a) => a.parameters.mode),
    ['detail', 'synonyms', 'structure', 'structure'],
  );
  const capped = context((_url, _options, n) =>
    response(
      n === 1
        ? { IdentifierList: { CID: Array.from({ length: 251 }, (_, i) => i + 1) } }
        : { PC_Compounds: Array.from({ length: 25 }, (_, i) => compound(i + 1)) },
    ),
  );
  const result = await p.execute(p.validate({ kind: 'formula', query: 'C6H12O6' }), capped);
  assert.equal(result.total, null);
  assert.equal(result.limits.moreBeyondWindow, true);
});

test('PubChem SMILES/InChI remain encoded POST fields, never paths or arbitrary endpoint URLs', async () => {
  const p = provider('pubchem');
  for (const kind of ['smiles', 'inchi']) {
    const query = kind === 'smiles' ? 'C/C=C\\C' : 'InChI=1S/H2O/h1H2',
      ctx = context((_url, _options, n) =>
        response(n === 1 ? { IdentifierList: { CID: [962] } } : { PC_Compounds: [compound(962)] }),
      );
    await p.execute(p.validate({ kind, query }), ctx);
    assert.equal(new URL(ctx.calls[0].url).pathname, `/rest/pug/compound/${kind}/cids/JSON`);
    assert.equal(ctx.calls[0].options.method, 'POST');
    assert.equal(new URLSearchParams(ctx.calls[0].options.body).get(kind), query);
  }
});

test('PubChem details preserve full annotation/reference sections, synonyms and original 2D/3D structures', async () => {
  const p = provider('pubchem'),
    detail = {
      Record: {
        RecordType: 'CID',
        RecordNumber: 2244,
        RecordTitle: 'Aspirin',
        Section: [
          {
            TOCHeading: 'All',
            Information: [
              {
                ReferenceNumber: 33,
                Value: {
                  StringWithMarkup: [
                    { String: 'Full', Markup: [{ URL: 'https://original.example/' }] },
                  ],
                },
              },
            ],
          },
        ],
        Reference: [
          {
            ReferenceNumber: 33,
            SourceName: 'Original',
            LicenseURL: 'https://original.example/license',
          },
        ],
        unknown: 'preserved',
      },
    };
  const value = await p.execute(
    p.validate({ mode: 'detail', cid: 2244 }),
    context(() => response(detail)),
  );
  assert.deepEqual(value.records[0].fields, detail);
  assert.equal(value.records[0].title, 'Aspirin');
  const synonyms = {
    InformationList: {
      Information: [{ CID: 2244, Synonym: Array.from({ length: 2000 }, (_, i) => 'Synonym ' + i) }],
    },
  };
  assert.deepEqual(
    (
      await p.execute(
        p.validate({ mode: 'synonyms', cid: 2244 }),
        context(() => response(synonyms)),
      )
    ).records[0].fields,
    synonyms,
  );
  const structure = {
    PC_Compounds: [
      compound(2244, { coords: [{ type: [2], conformers: [{ x: [1], y: [2], z: [3] }] }] }),
    ],
  };
  const c = context(() => response(structure));
  assert.deepEqual(
    (await p.execute(p.validate({ mode: 'structure', cid: 2244, dimension: '3d' }), c)).records[0]
      .fields,
    structure,
  );
  assert.equal(new URL(c.calls[0].url).searchParams.get('record_type'), '3d');
});

test('PubChem documented no-result errors are empty; 3D absence and malformed/inconsistent IDs cannot invent results', async () => {
  const p = provider('pubchem'),
    empty = {
      Fault: { Code: 'PUGREST.NotFound', Message: 'No CID found', Details: ['No record'] },
    };
  assert.equal(
    (
      await p.execute(
        p.validate({ query: 'nonexistent' }),
        context(() => response(empty, 404)),
      )
    ).total,
    0,
  );
  for (const raw of [
    { IdentifierList: { CID: ['1'] } },
    { IdentifierList: { CID: [1, 1] } },
    { Fault: { Code: 'PUGREST.BadRequest' } },
    '<html>captcha</html>',
  ])
    await assert.rejects(
      p.execute(
        p.validate({ query: 'x' }),
        context(() => response(raw)),
      ),
      { status: 502 },
    );
  await assert.rejects(
    p.execute(
      p.validate({ mode: 'structure', cid: 2244 }),
      context(() => response({ PC_Compounds: [compound(1)] })),
    ),
    { status: 502 },
  );
  await assert.rejects(
    p.execute(
      p.validate({ mode: 'detail', cid: 2244 }),
      context(() => response({ Record: { RecordNumber: 1 } })),
    ),
    { status: 502 },
  );
  await assert.rejects(
    p.execute(
      p.validate({ query: 'x' }),
      context(() => response('too many', 429)),
    ),
    { status: 503, code: 'UPSTREAM_RATE_LIMITED' },
  );
});

test('every science adapter delegates request cancellation to the shared context and refuses late results', async () => {
  const inputs = {
    cod: { mode: 'cif', id: '1000000' },
    pubchem: { mode: 'detail', cid: 2244 },
  };
  for (const p of SCIENCE_PROVIDERS) {
    const controller = new AbortController(),
      reason = new Error('cancelled'),
      ctx = {
        signal: controller.signal,
        now: Date.now,
        request: () =>
          new Promise((_resolve, reject) =>
            controller.signal.addEventListener('abort', () => reject(controller.signal.reason), {
              once: true,
            }),
          ),
      };
    const promise = p.execute(p.validate(inputs[p.id]), ctx);
    controller.abort(reason);
    await assert.rejects(promise, (error) => error === reason);
  }
});
