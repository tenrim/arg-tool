import {CLDR_NAMES} from '../vendor/cldr/names.js';

export const CLDR_VERSION=CLDR_NAMES.version;
export const currencyLabels=code=>CLDR_NAMES.currencies[code]?.names||[];
export const currencySymbols=code=>CLDR_NAMES.currencies[code]?.symbols||[];
export const territoryLabels=code=>CLDR_NAMES.territories[code]||[];
let territories;
export function territoryEntries(){return territories??=Object.entries(CLDR_NAMES.territories).map(([code,labels])=>({code,labels,english:CLDR_NAMES.territoryEnglish[code]||[]}));}
export const scriptLabels=name=>CLDR_NAMES.scripts[name]||[];
export function timezoneLabels(id,canonical=id){
 const exact=CLDR_NAMES.zones[id],target=CLDR_NAMES.zones[canonical];
 return {cities:[...new Set([...(exact?.cities||[]),...(target?.cities||[])])],names:[...new Set([...(exact?.names||[]),...(target?.names||[])])]};
}
