import {operationName} from '../cyberchef-i18n.js';
import {searchScore} from './catalog.js';
import {matchesSearch} from '../tool-search.js';

// Discovery is a projection of the canonical registry, never another pair list.
// Rows retain their official IDs and engine boundaries for actual execution.
export function operationFamilies(rows, registry) {
  const families = new Map();
  for (const row of rows) {
    const owner = registry.byOperation.get(row.op);
    if (!owner) throw Error(`操作缺少统一登记：${row.op}`);
    let family = families.get(owner.id);
    if (!family) {
      family = {id:owner.id, title:owner.title, owner, rows:[], directions:[]};
      families.set(owner.id, family);
    }
    if (!family.rows.some(member => member.op === row.op)) family.rows.push(row);
  }
  for (const family of families.values()) {
    const byOp = new Map(family.rows.map(row => [row.op,row]));
    const declared = family.owner.directions || [];
    const ordered = [...declared.map(direction => direction.op),...byOp.keys()];
    family.directions = [...new Set(ordered)].filter(op => byOp.has(op)).map(op => ({
      op, label:declared.find(direction => direction.op === op)?.label || operationName(op)
    }));
    // A native owner may additionally provide a visual form. This palette only
    // represents the actual Chef forms supplied by its caller.
    if (family.rows.length === 1) family.title = operationName(family.rows[0].op);
  }
  return [...families.values()];
}

export function matchFamilies(families, term, {group, preferred} = {}) {
  return families.map(family => {
    const rows = family.rows.filter(row => term || !group || row.group === group);
    if (!rows.length) return null;
    const ranked = rows.map(row => ({row,score:searchScore(row,term,operationName(row.op))}))
      .sort((a,b) => b.score-a.score);
    // Registry aliases also contain broad legacy-page vocabulary. A local
    // picker uses this family's name and its actual operation keywords so a
    // query for Base64 does not match every tool on the encoding page.
    const metadataScore = term && matchesSearch(family.title,term) ? 2 : 0;
    const score = Math.max(metadataScore,ranked[0]?.score || 0);
    if (!score) return null;
    const preferredRow = ranked.find(item => item.row.op === preferred);
    // Direction order belongs to the registry, not the upstream alphabetical
    // operation list. Keep an explicit request or preferred current direction;
    // equal matches use the first declared real direction available here.
    const declared = family.directions.find(direction => ranked.some(item =>
      item.row.op === direction.op && item.score === ranked[0].score));
    const op = preferredRow && preferredRow.score >= ranked[0].score
      ? preferred : declared?.op || ranked[0].row.op;
    return {...family,score,op};
  }).filter(Boolean).sort((a,b) => b.score-a.score);
}
