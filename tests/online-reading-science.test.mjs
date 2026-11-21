import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scienceReading } from '../public/online-query/reading-science.js';

const fixture = (name) =>
  JSON.parse(
    fs.readFileSync(
      new URL(`./fixtures/online-reading/science/${name}.json`, import.meta.url),
      'utf8',
    ),
  );
const read = (provider, name) => {
  const { record, result } = fixture(name);
  return scienceReading(provider, record, result);
};
const fields = (reading) =>
  Object.fromEntries(reading.sections.flatMap((section) => section.fields || []));
const table = (reading, title) =>
  reading.sections.find((section) => section.title === title)?.table;
const freeze = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

test('COD search/detail summarizes documented schema units and original publication without claiming an available live service', () => {
  // Protocol edge fixture, not a downloaded COD record. The field units are
  // documented by COD's public MySQL schema.
  const record = {
      id: '1000000',
      title: 'Protocol sample',
      fields: {
        file: '1000000',
        formula: 'Si O2',
        sg: 'P 31 2 1',
        a: '4.9(1)',
        alpha: 90,
        vol: 100,
        celltemp: 298,
        title: 'Original paper',
        authors: ['Author A', 'Author B'],
        doi: '10.1234/test',
        year: 2000,
        unknown: { original: true },
      },
    },
    before = JSON.stringify(record);
  for (const mode of ['search', 'detail']) {
    const reading = scienceReading('cod', record, { parameters: { mode } }),
      shown = fields(reading);
    assert.equal(shown['分子式'], 'Si O2');
    assert.equal(shown['空间群（Hermann–Mauguin）'], 'P 31 2 1');
    assert.equal(shown['晶胞边长 a（Å）'], '4.9(1)');
    assert.equal(shown['晶胞角 α（°）'], '90');
    assert.equal(shown['晶胞测量温度（K）'], '298');
    assert.equal(shown['作者'], 'Author A；Author B');
    assert.equal(shown['原始论文入口'], 'https://doi.org/10.1234/test');
    assert.equal(shown['原始 CIF 链接'], 'https://www.crystallography.net/cod/1000000.cif');
  }
  assert.equal(JSON.stringify(record), before);
});

test('COD duplicate details retain their own record and show the linked original COD number', () => {
  const value = fixture('cod-detail-duplicate'),
    before = JSON.stringify(value),
    reading = scienceReading('cod', value.record, value.result);
  assert.equal(fields(reading)['COD 编号'], '1000000');
  assert.equal(fields(reading)['重复记录对应 COD 编号'], '2011331');
  assert.equal(fields(reading)['DOI'], '10.1107/S0108270100008532');
  assert.equal(JSON.stringify(value), before);
});

test('COD CIF reading extracts only explicit scalar fields, skips multiline quotations and leaves uncertainty unchanged', () => {
  const cif =
      "data_1000000\n_chemical_formula_sum 'Si O2'\n_cell_length_a 4.123(4)\n_cell_length_b ?\n_cell_angle_alpha 90\n_publ_section_title\n;\n_cell_length_c 999\nthis is quoted text\n;\nloop_\n_atom_site_label\nSi1\n",
    record = {
      id: '1000000',
      title: 'COD',
      fields: { id: '1000000', format: 'CIF', cif },
      sourceURL: 'https://www.crystallography.net/cod/1000000.cif',
    },
    shown = fields(scienceReading('cod', record, { parameters: { mode: 'cif' } }));
  assert.equal(shown['分子式'], 'Si O2');
  assert.equal(shown['晶胞边长 a（Å）'], '4.123(4)');
  assert.equal(shown['晶胞边长 b（Å）'], undefined);
  assert.equal(shown['晶胞边长 c（Å）'], undefined);
  assert.equal(shown['数据块'], undefined);
  assert.equal(record.fields.cif, cif);
});

test('PubChem search exposes actual molecular identity, mass, identifiers and calculated properties for every supported identifier kind', () => {
  const { record, result } = fixture('pubchem-search'),
    before = JSON.stringify(record);
  for (const kind of ['name', 'cid', 'formula', 'smiles', 'inchi']) {
    const reading = scienceReading('pubchem', freeze(record), {
        ...result,
        parameters: { mode: 'search', kind },
      }),
      shown = fields(reading);
    assert.equal(shown['PubChem CID'], '2244');
    assert.equal(shown['分子式'], 'C9H8O4');
    assert.equal(shown['分子量（g/mol）'], '180.16');
    assert.equal(shown['精确质量（Da）'], '180.04225873');
    assert.equal(shown['总形式电荷'], '0');
    assert.match(shown['标准 InChI'], /^InChI=/);
    assert.equal(shown['标准 InChIKey'], 'BSYNRYMUTXBXSQ-UHFFFAOYSA-N');
    assert.match(shown['SMILES（含立体信息）'], /^CC/);
  }
  assert.equal(JSON.stringify(record), before);
});

test('PubChem annotation view selects useful fields, preserves per-value units/conditions and attaches only actual original sources', () => {
  const reading = read('pubchem', 'pubchem-detail'),
    properties = table(reading, '基本性质与说明').rows,
    sources = table(reading, '资料出处').rows;
  assert.equal(fields(reading)['PubChem 名称'], 'Aspirin');
  assert.equal(properties.find((row) => row[0] === '分子量')[1], '180.16 g/mol');
  assert.equal(properties.find((row) => row[0] === '精确质量')[1], '180.04225873 Da');
  assert.ok(properties.some((row) => row[0] === '颜色与形态（原文）'));
  assert.ok(sources.some((row) => row[1] === 'PubChem'));
  assert.ok(sources.some((row) => row[3].startsWith('https://')));
  const unknown = scienceReading(
    'pubchem',
    {
      title: 'Unknown',
      fields: {
        Record: {
          RecordNumber: 1,
          RecordTitle: 'Original',
          Section: [
            {
              TOCHeading: 'Molecular Weight',
              Information: [{ ReferenceNumber: 99, Value: { Number: [0], Unit: 'u' } }],
            },
            { TOCHeading: 'Unmapped source section', Information: [{ Value: { Number: [9] } }] },
          ],
        },
      },
    },
    { parameters: { mode: 'detail' } },
  );
  const rows = table(unknown, '基本性质与说明').rows;
  assert.deepEqual(rows[0], ['分子量', '0 u', '来源编号 99', '未提供']);
  assert.equal(rows.length, 1);
});

test('PubChem synonyms use actual source Chinese names when present and explicitly bound large previews', () => {
  assert.equal(fields(read('pubchem', 'pubchem-synonyms'))['同义词数量'], '8');
  const synonyms = ['现有中文名', ...Array.from({ length: 100 }, (_, i) => `Synonym ${i}`)],
    record = {
      id: '1',
      title: 'CID1',
      fields: { InformationList: { Information: [{ CID: 1, Synonym: synonyms }] } },
    },
    reading = scienceReading('pubchem', record, { parameters: { mode: 'synonyms' } });
  assert.deepEqual(table(reading, '原服务中文同义词').rows, [['现有中文名']]);
  assert.equal(table(reading, '其他同义词与编号').rows.length, 40);
  assert.match(reading.sections.at(-1).paragraphs[0], /40 \/ 100/);
  assert.equal(record.fields.InformationList.Information[0].Synonym.length, 101);
});

test('PubChem structure preserves real atom IDs/atomic numbers/coordinates/bonds and does not invent 3D positions or units', () => {
  const { record, result } = fixture('pubchem-structure'),
    reading = scienceReading('pubchem', record, result),
    shown = fields(reading),
    atom = table(reading, '首个构象的原子坐标').rows[0];
  assert.equal(shown['请求维度'], '3d');
  assert.equal(shown['原子数量（本记录）'], '21');
  assert.deepEqual(atom, ['1', '8', '1.2333', '0.554', '0.7792']);
  assert.deepEqual(table(reading, '化学键').rows[0], ['1', '5', '1']);
  assert.equal(record.fields.PC_Compounds[0].coords.length > 0, true);
  const twoD = scienceReading(
    'pubchem',
    {
      id: '2',
      title: '2D',
      fields: {
        PC_Compounds: [
          {
            id: { id: { cid: 2 } },
            atoms: { aid: [7], element: [6] },
            coords: [{ aid: [7], conformers: [{ x: [0], y: [0] }] }],
            bonds: { aid1: [], aid2: [], order: [] },
          },
        ],
      },
    },
    { parameters: { mode: 'structure', dimension: '2d' } },
  );
  assert.deepEqual(table(twoD, '首个构象的原子坐标').rows[0], ['7', '6', '0', '0', '未提供']);
});

test('science reader does not generate data for unknown providers and accepts absent optional fields without false values', () => {
  assert.equal(scienceReading('unknown', { fields: {} }, {}), null);
  for (const retired of ['simbad', 'vizier'])
    assert.equal(scienceReading(retired, { fields: { main_id: 'retired' } }, {}), null);
  for (const provider of ['cod', 'pubchem']) {
    const reading = scienceReading(
      provider,
      { id: '1', title: 'Original', fields: {} },
      { parameters: {} },
    );
    assert.ok(Array.isArray(reading.sections));
    assert.ok(!JSON.stringify(reading).includes('undefined'));
  }
});
