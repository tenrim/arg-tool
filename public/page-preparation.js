import { prepareCyberChef, cancelCyberChefPreparation } from './cyberchef-client.js';
import { clearPreparedWorker, prepareWorker } from './prepared-worker.js';
import { hasIdleLookup } from './idle-worker.js';
import { prepareVideoCore, cancelVideoPreparation } from './video/runtime.js';
import { COMPLETION_TASKS } from './completion/catalog.js';
import { CLASSICAL_CIPHERS } from './expansion/classical-catalog.js';
import { ATLAS_TOOLS } from './atlas/catalog.js';
import { REFERENCE_TOOLS } from './reference/catalog.js';
import { LANGUAGES } from './coderunner/catalog.js';

const root = new URL('./', import.meta.url);
const engines = new Map();
function register(pages, file, type = 'module') {
  for (const page of pages) engines.set(page, { file, type });
}
register(
  COMPLETION_TASKS.filter(
    (t) => !['origami', 'virtual-keyboard', 'braille-languages'].includes(t.id),
  ).map((t) => t.panel),
  'completion/worker.js',
);
register(['braille-languages'], 'completion/braille-worker.js', 'classic');
register(
  [
    ...CLASSICAL_CIPHERS.map((c) => 'classical-' + c.id),
    'keyboard',
    'hunt-constraints',
    'dictionary-substitution',
    'element-spelling',
    'stroke-endpoints',
  ],
  'expansion/worker.js',
);
register(['words', 'words-chinese'], 'hunt-worker.js');
register(['timezones', 'meeting', 'countdown'], 'timezones/worker.js', 'classic');
register(
  REFERENCE_TOOLS.map((t) => t.id),
  'reference/worker.js',
  'classic',
);
register(['file-batch', 'file-versions'], 'file-workbench/worker.js');
register(['turing'], 'turing/worker.js', 'classic');
register(['roman', 'invisible', 'tapcode', 'baudot', 'radix'], 'basics/worker.js', 'classic');
register(['score', 'morse', 'audio'], 'audio-worker.js');
register(['music-analysis'], 'round2/music-worker.js');
register(['sstv'], 'vendor/hunt/sstv/worker/decoder.js');
register(['go'], 'discovery/go-worker.js', 'classic');
register(['cube'], 'round1/cubing-worker.js');
register(['substitution'], 'round1/substitution-worker.js');
register(['image'], 'image-worker.js');
register(['stereo'], 'stereo-worker.js');
register(['image-comparison'], 'round2/image-worker.js');
register(['qr-repair'], 'round1/qr-worker.js');
register(['animation'], 'animation/worker.js');
register(['hex-editor'], 'hex/search-worker.js');
register(['archive'], 'round2/archive-worker.js');
register(['model'], 'round4/cif-worker.js');
register(
  [
    'pic-scramble',
    'visual-crypto',
    'text-steganography',
    'beast-codec',
    'buddha-codec',
    'file-image',
    'screen-drop',
    'spectral-images',
  ],
  'fun-tools/worker.js',
  'classic',
);
register(
  Object.keys(LANGUAGES)
    .filter((id) => LANGUAGES[id].runtime !== 'server')
    .map((id) => 'code-' + id),
  'coderunner/worker.js',
  'classic',
);
register(['paper'], 'round3/solver-worker.js');
register(['qalculate', 'unitconvert', 'geometry', 'bmi'], 'qalculate/worker.js');
register(
  ATLAS_TOOLS.map((t) => t.id),
  'atlas/worker.js',
);
register(
  ['astronomy', 'sequence', 'calendar', 'chemistry', 'molecule'],
  'science/worker.js',
  'classic',
);

function selectedEngine(panel, entry, group) {
  const task = entry?.taskId || entry?.id;
  if (
    ['operation', 'recipe'].includes(entry?.open.kind) ||
    panel === 'analysis' ||
    panel === 'cyberchef'
  )
    return 'cyberchef';
  if (panel === 'basics') return group === 'radix' ? 'radix' : 'cyberchef';
  if (panel === 'video') return task === 'native:video-animation' ? 'animation' : 'ffmpeg';
  if (panel === 'file') return { hex: 'hex-editor', archive: 'archive' }[entry?.open.slice];
  if (panel === 'audio') {
    if (task === 'native:audio-sstv') return 'sstv';
    if (task === 'native:audio-music') return 'music-analysis';
    if (task === 'native:audio-play') return;
  }
  if (panel === 'image') {
    if (task === 'native:image-qr') return 'qr-repair';
    if (task === 'native:image-stereo') return 'stereo';
    if (['compare', 'color'].includes(entry?.open.slice)) return 'image-comparison';
  }
  if (panel === 'code') {
    const key = task?.replace('native:', '');
    return engines.has(key) ? key : undefined;
  }
  if (panel === 'chemistry' && task === 'native:chemistry-molecule') return 'molecule';
  if (panel === 'words' && task === 'native:words-chinese') return 'words-chinese';
  return engines.has(panel) ? panel : undefined;
}

let current;
export function clearPagePreparation() {
  current = undefined;
  cancelCyberChefPreparation();
  clearPreparedWorker();
  cancelVideoPreparation();
}
export function preparePage(panel, entry, group) {
  const key = selectedEngine(panel, entry, group);
  if (navigator.connection?.saveData || !key) return clearPagePreparation();
  if (key === current) return;
  // A direct analysis visit may already have started the same empty Chef.
  if (current || key !== 'cyberchef') clearPagePreparation();
  current = key;
  try {
    if (key === 'cyberchef') return prepareCyberChef();
    if (key === 'ffmpeg') return prepareVideoCore();
    const { file, type } = engines.get(key);
    let init, variant;
    if (file === 'coderunner/worker.js') {
      variant = key.slice(5);
      init = { kind: 'prepare-runtime', language: variant };
    }
    if (file === 'hunt-worker.js' || file === 'fun-tools/worker.js')
      init = { prepare: true, task: key };
    if (file === 'round3/solver-worker.js' || file === 'qalculate/worker.js')
      init = { prepare: true };
    if (
      [
        'atlas/worker.js',
        'science/worker.js',
        'reference/worker.js',
        'timezones/worker.js',
      ].includes(file)
    ) {
      init = {
        prepare: true,
        kind: key === 'molecule' ? 'chemistry' : key,
        resourceBase: root.href,
      };
      if (key === 'molecule') init.params = { mode: 'molecule' };
    }
    const url = new URL(file, root);
    const group = ['science/worker.js', 'reference/worker.js'].includes(file) ? panel : '';
    if (!hasIdleLookup(url, type, group)) prepareWorker(url, type, init, variant);
  } catch {
    clearPagePreparation();
  }
}
globalThis.addEventListener?.('pagehide', clearPagePreparation);
