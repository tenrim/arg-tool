// Readable projections of the original science responses. These functions do
// not fetch, translate prose, mutate records, or replace the complete payload.
const present = (value) =>
  value !== null && value !== undefined && !(typeof value === 'string' && !value.trim());
const list = (value) => (Array.isArray(value) ? value : []);
const text = (value) =>
  Array.isArray(value)
    ? value.filter(present).map(text).join('；')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : String(value ?? '');
const values = (entries) =>
  entries.filter(([, value]) => present(value)).map(([label, value]) => [label, text(value)]);
const section = (title, fields, paragraphs = []) => ({
  title,
  fields: values(fields),
  ...(paragraphs.length ? { paragraphs } : {}),
});
const limitNote = (shown, total, noun) =>
  shown < total ? [`此处展示 ${shown} / ${total} ${noun}，其余保留在完整下载文件中。`] : [];
function tableSection(title, columns, rows, maximum = 40) {
  return {
    title,
    table: {
      columns,
      rows: rows
        .slice(0, maximum)
        .map((row) => row.map((value) => (present(value) ? text(value) : '未提供'))),
    },
    paragraphs: limitNote(Math.min(maximum, rows.length), rows.length, '项'),
  };
}
const COD_FIELDS = [
  ['file', 'COD 编号'],
  ['commonname', '常用名称（原文）'],
  ['chemname', '化学名称（原文）'],
  ['mineral', '矿物名称（原文）'],
  ['formula', '分子式'],
  ['calcformula', '由晶胞计算的分子式'],
  ['sg', '空间群（Hermann–Mauguin）'],
  ['sgHall', '空间群（Hall）'],
  ['sgNumber', '空间群编号'],
  ['a', '晶胞边长 a（Å）'],
  ['b', '晶胞边长 b（Å）'],
  ['c', '晶胞边长 c（Å）'],
  ['alpha', '晶胞角 α（°）'],
  ['beta', '晶胞角 β（°）'],
  ['gamma', '晶胞角 γ（°）'],
  ['vol', '晶胞体积（Å³）'],
  ['celltemp', '晶胞测量温度（K）'],
  ['cellpressure', '晶胞测量压力（kPa）'],
  ['status', '记录状态'],
  ['duplicateof', '重复记录对应 COD 编号'],
  ['flags', '结构数据标记'],
];
const CIF_FIELDS = [
  ['_chemical_name_common', '常用名称（原文）'],
  ['_chemical_name_systematic', '系统名称（原文）'],
  ['_chemical_formula_sum', '分子式'],
  ['_space_group_name_H-M_alt', '空间群（Hermann–Mauguin）'],
  ['_symmetry_space_group_name_H-M', '空间群（Hermann–Mauguin）'],
  ['_space_group_name_Hall', '空间群（Hall）'],
  ['_cell_length_a', '晶胞边长 a（Å）'],
  ['_cell_length_b', '晶胞边长 b（Å）'],
  ['_cell_length_c', '晶胞边长 c（Å）'],
  ['_cell_angle_alpha', '晶胞角 α（°）'],
  ['_cell_angle_beta', '晶胞角 β（°）'],
  ['_cell_angle_gamma', '晶胞角 γ（°）'],
  ['_cell_volume', '晶胞体积（Å³）'],
  ['_journal_paper_doi', '原始论文 DOI'],
  ['_publ_section_title', '论文题名（原文）'],
];
function cifScalars(cif) {
  const selected = new Set(CIF_FIELDS.map(([name]) => name.toLowerCase())),
    result = {};
  let multiline = false;
  for (const line of cif.split(/\r?\n/)) {
    if (line.startsWith(';')) {
      multiline = !multiline;
      continue;
    }
    if (multiline) continue;
    const match = line.match(/^\s*(_\S+)\s+(?:'([^']*)'|"([^"]*)"|([^\s#]+))\s*(?:#.*)?$/);
    if (match && selected.has(match[1].toLowerCase())) {
      const value = match[2] ?? match[3] ?? match[4];
      if (value !== '.' && value !== '?') result[match[1].toLowerCase()] = value;
    }
  }
  return result;
}
function codReading(record, result) {
  const f = record.fields || {},
    id = f.file || f.id || record.id,
    sections = [];
  if (typeof f.cif === 'string') {
    const scalars = cifScalars(f.cif);
    sections.push(
      section(
        'CIF 结构摘要',
        [
          ['COD 编号', id],
          ['原始 CIF 链接', record.sourceURL],
          ...CIF_FIELDS.map(([key, label]) => [label, scalars[key.toLowerCase()]]),
        ],
        [],
      ),
    );
  } else {
    sections.push(
      section(
        '晶体结构',
        COD_FIELDS.map(([key, label]) => [label, f[key]]),
      ),
    );
    sections.push(
      section('原始论文', [
        ['论文题名（原文）', f.title],
        ['作者', f.authors || f.author],
        ['期刊', f.journal],
        ['年份', f.year],
        ['卷', f.volume],
        ['期', f.issue],
        ['起始页', f.firstpage],
        ['末页', f.lastpage],
        ['DOI', f.doi],
        ['原始论文入口', present(f.doi) ? `https://doi.org/${f.doi}` : null],
        [
          '原始 CIF 链接',
          /^\d{7}$/.test(String(id)) ? `https://www.crystallography.net/cod/${id}.cif` : null,
        ],
      ]),
    );
  }
  return { title: record.title, sections: sections.filter((s) => s.fields.length) };
}

function propertyValue(value) {
  for (const key of ['sval', 'fval', 'ival', 'bval']) if (present(value?.[key])) return value[key];
  return null;
}
const PC_PROPERTIES = [
  ['Molecular Formula', '', '分子式'],
  ['IUPAC Name', 'Preferred', 'IUPAC 名称（原文）'],
  ['Molecular Weight', '', '分子量（g/mol）'],
  ['Mass', 'Exact', '精确质量（Da）'],
  ['Weight', 'MonoIsotopic', '单同位素质量（Da）'],
  ['InChI', 'Standard', '标准 InChI'],
  ['InChIKey', 'Standard', '标准 InChIKey'],
  ['SMILES', 'Absolute', 'SMILES（含立体信息）'],
  ['SMILES', 'Connectivity', 'SMILES（连接关系）'],
  ['Count', 'Hydrogen Bond Donor', '氢键供体数'],
  ['Count', 'Hydrogen Bond Acceptor', '氢键受体数'],
  ['Count', 'Rotatable Bond', '可旋转键数'],
  ['Log P', 'XLogP3', 'XLogP3'],
  ['Topological', 'Polar Surface Area', '拓扑极性表面积'],
];
const VIEW_HEADINGS = new Map([
  ['Record Description', '记录简介（原文）'],
  ['Molecular Formula', '分子式'],
  ['IUPAC Name', 'IUPAC 名称'],
  ['InChI', 'InChI'],
  ['InChI Key', 'InChIKey'],
  ['InChIKey', 'InChIKey'],
  ['SMILES', 'SMILES'],
  ['Canonical SMILES', '标准 SMILES'],
  ['Isomeric SMILES', '异构 SMILES'],
  ['Molecular Weight', '分子量'],
  ['Exact Mass', '精确质量'],
  ['Monoisotopic Mass', '单同位素质量'],
  ['Color/Form', '颜色与形态（原文）'],
  ['Melting Point', '熔点'],
  ['Boiling Point', '沸点'],
  ['Density', '密度'],
  ['Solubility', '溶解度（原文）'],
  ['CAS', 'CAS 登记号'],
  ['Wikipedia', '百科资料（原文）'],
]);
function viewValue(value) {
  if (!value || typeof value !== 'object') return '';
  const content = Array.isArray(value.StringWithMarkup)
    ? value.StringWithMarkup.map((item) => item.String).filter(present)
    : Array.isArray(value.Number)
      ? value.Number
      : Array.isArray(value.Boolean)
        ? value.Boolean
        : [];
  return content.map(text).join('；') + (present(value.Unit) ? ` ${value.Unit}` : '');
}
function pubchemView(record) {
  const view = record.fields.Record || {},
    references = new Map(
      list(view.Reference)
        .filter(Boolean)
        .map((reference) => [reference.ReferenceNumber, reference]),
    ),
    rows = [],
    rowReferences = [];
  let skipped = 0;
  function walk(sections, depth = 0) {
    if (depth > 20) return;
    for (const item of list(sections).filter(Boolean)) {
      if (VIEW_HEADINGS.has(item.TOCHeading)) {
        let shown = 0;
        const information = list(item.Information)
          .filter(Boolean)
          .slice()
          .sort(
            (a, b) =>
              Number(b.Description === 'Physical Description') -
              Number(a.Description === 'Physical Description'),
          );
        for (const info of information) {
          const value = viewValue(info.Value);
          if (!value) continue;
          if (shown >= 2) {
            skipped++;
            continue;
          }
          const ref = references.get(info.ReferenceNumber),
            source = ref?.SourceName || `来源编号 ${info.ReferenceNumber ?? '未提供'}`;
          rows.push([
            VIEW_HEADINGS.get(item.TOCHeading),
            value,
            source,
            info.Description || info.Name || '',
          ]);
          rowReferences.push(info.ReferenceNumber);
          shown++;
        }
      }
      walk(item.Section, depth + 1);
    }
  }
  walk(view.Section);
  const shownSources = [...new Set(rowReferences.slice(0, 32))].filter((id) => references.has(id)),
    properties = tableSection(
      '基本性质与说明',
      ['项目', '原始数值／内容', '提供方', '原始限定说明'],
      rows,
      32,
    );
  if (skipped)
    properties.paragraphs.push(
      `每个项目最多展示两条已有注释；另有 ${skipped} 条同类注释保留在下载文件中。`,
    );
  return {
    title: view.RecordTitle || record.title,
    sections: [
      section('物质身份', [
        ['PubChem CID', view.RecordNumber],
        ['PubChem 名称', view.RecordTitle],
      ]),
      properties,
      {
        collapsed: true,
        ...tableSection(
          '资料出处',
          ['来源编号', '提供方', '原始链接', '许可链接'],
          shownSources.map((id) => {
            const ref = references.get(id);
            return [id, ref.SourceName, ref.URL, ref.LicenseURL];
          }),
          20,
        ),
      },
    ],
    summary: '',
  };
}
function pubchemReading(record, result) {
  const f = record.fields || {},
    mode = result?.parameters?.mode;
  if (f.Record) return pubchemView(record);
  if (mode === 'synonyms' || f.InformationList) {
    const info =
        (f.InformationList?.Information || []).find((item) => String(item.CID) === record.id) ||
        (f.InformationList?.Information || [])[0],
      synonyms = Array.isArray(info?.Synonym) ? info.Synonym : [],
      chinese = synonyms.filter((name) => /\p{Script=Han}/u.test(name)),
      others = synonyms.filter((name) => !/\p{Script=Han}/u.test(name));
    return {
      title: record.title,
      sections: [
        section(
          '同义词范围',
          [
            ['PubChem CID', info?.CID],
            ['同义词数量', synonyms.length],
            ['其中原服务已提供的中文名称', chinese.length],
          ],
          [],
        ),
        ...(chinese.length
          ? [
              tableSection(
                '原服务中文同义词',
                ['名称'],
                chinese.map((name) => [name]),
                20,
              ),
            ]
          : []),
        tableSection(
          '其他同义词与编号',
          ['名称／编号'],
          others.map((name) => [name]),
          40,
        ),
      ],
    };
  }
  const compound = Array.isArray(f.PC_Compounds)
      ? f.PC_Compounds.find((item) => String(item.id?.id?.cid) === record.id) || f.PC_Compounds[0]
      : f,
    props = Array.isArray(compound.props) ? compound.props : [],
    fields = [
      ['PubChem CID', compound.id?.id?.cid],
      ['总形式电荷', compound.charge],
    ];
  for (const [label, name, chinese] of PC_PROPERTIES) {
    const property = props.find(
      (item) => item.urn?.label === label && (!name || item.urn?.name === name),
    );
    if (property) fields.push([chinese, propertyValue(property.value)]);
  }
  const sources = [
      ...new Set(
        props
          .filter((item) =>
            PC_PROPERTIES.some(
              ([label, name]) => item.urn?.label === label && (!name || item.urn?.name === name),
            ),
          )
          .map((item) =>
            [item.urn?.source, item.urn?.software, item.urn?.version].filter(present).join(' / '),
          )
          .filter(present),
      ),
    ],
    sections = [
      section(
        '物质基本信息',
        fields,
        sources.length ? [`属性计算／提供方：${sources.join('；')}`] : [],
      ),
    ];
  if (mode === 'structure') {
    const coordinates = Array.isArray(compound.coords) ? compound.coords : [],
      atoms = compound.atoms || {},
      bonds = compound.bonds || {},
      first = coordinates[0],
      conformer = first?.conformers?.[0],
      aids = first?.aid || atoms.aid || [],
      elementMap = new Map((atoms.aid || []).map((aid, index) => [aid, atoms.element?.[index]])),
      rows = aids.map((aid, index) => [
        aid,
        elementMap.get(aid),
        conformer?.x?.[index],
        conformer?.y?.[index],
        conformer?.z?.[index],
      ]);
    sections.push(
      section(
        '返回的结构范围',
        [
          ['请求维度', result.parameters.dimension],
          ['原子数量（本记录）', Array.isArray(atoms.aid) ? atoms.aid.length : null],
          ['化学键数量（本记录）', Array.isArray(bonds.aid1) ? bonds.aid1.length : null],
          ['坐标集合数量', coordinates.length],
          ['首个集合的构象数量', Array.isArray(first?.conformers) ? first.conformers.length : null],
        ],
        [],
      ),
    );
    if (rows.length)
      sections.push(
        tableSection(
          '首个构象的原子坐标',
          ['原子 ID', '原子序数', 'x', 'y', 'z（若提供）'],
          rows,
          24,
        ),
      );
    if (Array.isArray(bonds.aid1) && bonds.aid1.length)
      sections.push(
        tableSection(
          '化学键',
          ['原子 1 ID', '原子 2 ID', '键级（原代码）'],
          bonds.aid1.map((aid, index) => [aid, bonds.aid2?.[index], bonds.order?.[index]]),
          24,
        ),
      );
  }
  return { title: record.title, sections };
}

export function scienceReading(provider, record, result) {
  if (!record || !record.fields || typeof record.fields !== 'object') return null;
  if (provider === 'cod') return codReading(record, result);
  if (provider === 'pubchem') return pubchemReading(record, result);
  return null;
}
