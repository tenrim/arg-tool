import {Button, Box, element} from '../ui/index.js';
export function openReference(kind, selection) {
  if (!['countries', 'currencies', 'sky'].includes(kind)) return;
  document.dispatchEvent(new CustomEvent('arg:reference-request', {detail: {kind, selection}}));
  location.hash = kind;
}
export function openSkyObject(object) {
  if (!object || object.ra === null || object.dec === null || !Number.isFinite(object.ra) || !Number.isFinite(object.dec)) return;
  document.dispatchEvent(new CustomEvent('arg:astronomy-object', {detail: object}));
  location.hash = 'astronomy';
}
export function appendDiscoveryActions(host, record) {
  const actions = Box({className: 'currency-links'});
  for (const code of record.currencyCodes || []) actions.append(Button({text: '货币资料 · ' + code, attrs: {'data-currency': code}, on: {click: () => openReference('currencies', {query: code, filter: 'current', region: ''})}}));
  for (const country of record.countryLinks || []) {
    const children = [];
    if (country.flag) {const image = element('img', undefined, 'ref-flag'); image.src = new URL('../vendor/reference/flags/' + country.id.toLowerCase() + '.svg', import.meta.url).href; image.alt = ''; image.loading = 'lazy'; children.push(image);}
    children.push(country.name);
    actions.append(Button({children, attrs: {'data-country': country.id}, on: {click: () => openReference('countries', {query: country.id, recordId: country.id, region: ''})}}));
  }
  if (record.sky) actions.append(Button({text: '在天文工具中查询方位', variant: 'primary', attrs: {'data-sky': record.id}, on: {click: () => openSkyObject(record.sky)}}));
  if (actions.childNodes.length) host.append(actions);
}
