import {CLDR_ANNOTATIONS} from '../vendor/cldr/annotations.js';
import {scriptLabels} from './names.js';

// CLDR annotations cover defined emoji/symbols, not every Unicode character.
export const unicodeAnnotation=character=>CLDR_ANNOTATIONS[character]||null;
export const unicodeScriptLabels=name=>scriptLabels(name);
let sequences;
export function unicodeAnnotatedSequences(){
 return sequences??=Object.entries(CLDR_ANNOTATIONS).filter(([character])=>Array.from(character).length>1);
}
