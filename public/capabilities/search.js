import Fuse from '../vendor/fuse/fuse.js';
import { matchesSearch, searchText, clueSearchTerms } from '../tool-search.js';

// Shared, lazily cached indexes keep lessons out of default tool searches.
// No clue contents, files, preferences or network requests enter this index.
const indexes = new WeakMap();
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
// Map normalized search offsets back to the unchanged display string. NFKC,
// whitespace, combining characters and surrogate pairs must not shift marks.
function searchable(value) {
  const text = String(value),
    offsets = [];
  for (const { segment, index } of graphemes.segment(text)) {
    const part = searchText(segment);
    for (let i = 0; i < part.length; i++) offsets.push([index, index + segment.length]);
  }
  return { text, normalized: searchText(text), offsets };
}
function mergeRanges(ranges) {
  const result = [];
  for (const [start, end] of ranges.sort((a, b) => a[0] - b[0])) {
    const last = result.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else result.push([start, end]);
  }
  return result;
}
function displayRanges(field, indices) {
  return mergeRanges(
    indices.flatMap(([start, end]) =>
      field.offsets[start] && field.offsets[end]
        ? [[field.offsets[start][0], field.offsets[end][1]]]
        : [],
    ),
  );
}
function literalRanges(field, query) {
  const indices = [];
  for (const token of String(query)
    .normalize('NFKC')
    .trim()
    .split(/\s+/)
    .map(searchText)
    .filter(Boolean)) {
    for (
      let index = field.normalized.indexOf(token);
      index >= 0;
      index = field.normalized.indexOf(token, index + token.length)
    )
      indices.push([index, index + token.length - 1]);
  }
  return displayRanges(field, indices);
}
function excerpt(field, ranges) {
  // Keep context around the first hit rather than dumping a long alias list.
  let start = Math.max(0, ranges[0][0] - 24),
    end = Math.min(field.text.length, Math.max(start + 120, ranges[0][1]));
  start = field.offsets.find((pair) => pair[0] >= start)?.[0] ?? start;
  end = field.offsets.find((pair) => pair[1] >= end)?.[1] ?? end;
  const prefix = start ? '…' : '';
  return {
    text: prefix + field.text.slice(start, end) + (end < field.text.length ? '…' : ''),
    ranges: ranges
      .filter(([a, b]) => a < end && b > start)
      .map(([a, b]) => [
        Math.max(a, start) - start + prefix.length,
        Math.min(b, end) - start + prefix.length,
      ]),
  };
}
function evidence(fields, query, matches) {
  const hits = [];
  for (const [key, values] of Object.entries(fields))
    for (const [index, field] of values.entries()) {
      const ranges = matches
        ? displayRanges(
            field,
            matches
              .filter((match) => match.key === key && (match.refIndex ?? 0) === index)
              .flatMap((match) => match.indices),
          )
        : literalRanges(field, query);
      if (ranges.length) hits.push({ key, field, ranges });
    }
  const title = hits.find((hit) => hit.key === 'title')?.ranges || [];
  const seen = new Set([fields.title[0].text]);
  const titleExplains = title.length && (matches || matchesSearch(fields.title[0].text, query));
  const tokens = String(query)
    .normalize('NFKC')
    .trim()
    .split(/\s+/)
    .map(searchText)
    .filter(Boolean);
  const candidates = hits
    .filter((hit) => hit.key !== 'title')
    .map((hit) => ({
      ...hit,
      tokens: tokens.filter((token) => hit.field.normalized.includes(token)),
    }))
    .sort((a, b) => b.tokens.length - a.tokens.length || a.field.text.length - b.field.text.length);
  const covered = new Set(tokens.filter((token) => fields.title[0].normalized.includes(token))),
    selected = [];
  if (!titleExplains)
    for (const hit of candidates) {
      if (
        seen.has(hit.field.text) ||
        (!matches && selected.length && hit.tokens.every((token) => covered.has(token)))
      )
        continue;
      seen.add(hit.field.text);
      selected.push(hit);
      hit.tokens.forEach((token) => covered.add(token));
      if (matches || covered.size === tokens.length || selected.length === 2) break;
    }
  const snippets = selected.map((hit) => ({
    label: hit.key === 'aliases' ? '相关名称' : '功能',
    ...excerpt(hit.field, hit.ranges),
  }));
  return { title, snippets, approximate: !!matches };
}
export function literalSearchEvidence(entry, query) {
  return evidence(
    { title: [searchable(entry.title)], aliases: (entry.aliases || []).map(searchable) },
    query,
  );
}
const algorithmName = (value) =>
  searchText(
    String(value)
      .replace(/^(?:To|From)\s+/i, '')
      .replace(/\s+(?:Encode|Decode|Encrypt|Decrypt)$/i, ''),
  );
const operationNames = (entry) =>
  [
    ...(entry.sourceOperationIds || []),
    ...(entry.actions || entry.directions || []).flatMap((item) => [item.op, item.label]),
    ...(entry.variants || []).flatMap((item) => [
      item.title,
      ...(item.directions || []).flatMap((direction) => [direction.op, direction.label]),
    ]),
    ...(entry.open?.nativeDirections || []).map((item) => item.label),
  ].filter(Boolean);
function indexFor(entries, includeKnowledge) {
  if (!indexes.has(entries)) indexes.set(entries, new Map());
  const scopes = indexes.get(entries);
  if (!scopes.has(includeKnowledge)) {
    const rows = entries
      .filter(
        (entry) => entry.listed !== false && (includeKnowledge || entry.category !== 'knowledge'),
      )
      .map((entry, index) => {
        const fields = {
          title: [searchable(entry.title)],
          names: operationNames(entry).map(searchable),
          aliases: [
            ...new Set([
              ...(entry.aliases || []),
              ...(entry.variants || []).flatMap((variant) => variant.aliases || []),
              ...(entry.open?.nativeDirections || []).flatMap(
                (direction) => direction.aliases || [],
              ),
            ]),
          ].map(searchable),
        };
        return {
          entry,
          index,
          fields,
          title: fields.title[0].normalized,
          memberTitles: (entry.variants || []).map((item) => searchText(item.title)),
          names: fields.names.map((field) => field.normalized),
          coreNames: [
            ...(entry.coreNames || []).map(searchText),
            ...(entry.sourceOperationIds || []).map(algorithmName),
            ...(entry.actions || entry.directions || []).map((action) => searchText(action.label)),
          ],
          haystack: Object.values(fields)
            .flat()
            .map((field) => field.normalized)
            .join(' '),
          aliases: fields.aliases.map((field) => field.normalized),
        };
      });
    scopes.set(includeKnowledge, {
      rows,
      fuse: new Fuse(rows, {
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true,
        threshold: 0.38,
        keys: [
          { name: 'title', weight: 3 },
          { name: 'names', weight: 2 },
          { name: 'aliases', weight: 1 },
        ],
      }),
    });
  }
  return scopes.get(includeKnowledge);
}
function literalPriority(row, term, normalized) {
  if (row.title === normalized) return 5;
  if (
    row.title.startsWith(normalized) ||
    row.coreNames.includes(normalized) ||
    row.memberTitles.includes(normalized)
  )
    return 4;
  if (
    row.aliases.includes(normalized) ||
    row.names.includes(normalized) ||
    row.memberTitles.some((title) => title.startsWith(normalized))
  )
    return 3;
  if (matchesSearch(row.title, term)) return 2;
  if (row.names.some((name) => matchesSearch(name, term))) return 1;
  return 0;
}

export function rankCapabilities(entries, query, category = '', { includeKnowledge = false } = {}) {
  const term = String(query).trim(),
    normalized = searchText(term);
  const eligible = (entry) => !category || entry.category === category;
  if (!term) return entries.filter((entry) => entry.listed !== false && eligible(entry));
  const { rows, fuse } = indexFor(entries, includeKnowledge === true || category === 'knowledge');
  const candidates = rows.filter(({ entry }) => eligible(entry));
  const found = new Map();
  for (const row of candidates) {
    if (!matchesSearch(row.haystack, term)) continue;
    const { entry, index, fields } = row;
    const priority = literalPriority(row, term, normalized);
    const rank =
      entry.category === 'knowledge' && category !== 'knowledge'
        ? Math.min(priority, 2.5)
        : priority;
    found.set(entry.id, {
      entry,
      index,
      priority: rank,
      score: 0,
      searchMatch: evidence(fields, term),
    });
  }
  // A scene points only to its registered, visible owners. An unlocked-only
  // capability is absent from the candidate set until discovery permits it.
  for (const [clueRank, id] of clueSearchTerms(term).entries()) {
    const row = candidates.find(({ entry }) => entry.id === id);
    if (!row) continue;
    const existing = found.get(id);
    if (existing) {
      existing.priority = Math.max(3, existing.priority);
      existing.clueRank = clueRank;
    } else {
      found.set(id, {
        entry: row.entry,
        index: row.index,
        priority: 3,
        clueRank,
        score: 0,
        searchMatch: {
          title: [],
          snippets: [{ label: '按线索匹配', text: row.entry.title, ranges: [] }],
          approximate: false,
        },
      });
    }
  }
  // A recognized short algorithm name (SM4, SHA1) must not acquire similar but
  // unrelated algorithms. Fuzzy matching is a fallback when literals miss.
  if (normalized.length >= 3 && found.size === 0) {
    for (const result of fuse.search(normalized)) {
      const { entry, index } = result.item;
      if (!eligible(entry) || found.has(entry.id)) continue;
      found.set(entry.id, {
        entry,
        index,
        priority: -1,
        score: result.score,
        searchMatch: evidence(result.item.fields, term, result.matches),
      });
    }
  }
  return [...found.values()]
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        (a.clueRank ?? Number.MAX_SAFE_INTEGER) - (b.clueRank ?? Number.MAX_SAFE_INTEGER) ||
        a.score - b.score ||
        (a.entry.representativeRank ?? Number.MAX_SAFE_INTEGER) -
          (b.entry.representativeRank ?? Number.MAX_SAFE_INTEGER) ||
        a.index - b.index,
    )
    .map((row) => ({ ...row.entry, searchMatch: row.searchMatch }));
}
