import {Converter} from '../vendor/round1/opencc-js/full.js';

// Search-only orthographic normalization. Never rewrite records, exports or IDs.
// Both the source text and query use the same pinned OpenCC dictionaries.
let simplify;
const cached=new Map();
export function normalizeChineseSearch(value){
 const original=String(value??'');
 if(!/\p{Script=Han}/u.test(original))return original.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
 if(cached.has(original))return cached.get(original);
 simplify||=Converter({from:'t',to:'cn'});
 const normalized=simplify(original).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
 // Bounded ephemeral memory only; neither records nor queries enter storage/network.
 if(cached.size>=10000)cached.clear();
 cached.set(original,normalized);return normalized;
}
