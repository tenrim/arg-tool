import { prepareZXingModule, readBarcodes } from './vendor/hunt/zxing/index.js';
const overrides = {
  locateFile: (path) => new URL('./vendor/hunt/zxing/' + path, import.meta.url).href,
};
export function scanBarcodes(image, options = {}) {
  prepareZXingModule({ overrides });
  return readBarcodes(image, { tryHarder: true, tryInvert: true, ...options });
}
