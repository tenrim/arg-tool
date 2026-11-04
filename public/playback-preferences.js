import { getPreferences } from './preferences.js';

// Playback gain only: never touch decoded samples, analysis or exported files.
const media = new WeakMap();
let installed = false,
  tone;
const gain = () => getPreferences().masterVolume / 100;
function applyMedia(node, state) {
  const p = getPreferences();
  state.appliedVolume = (state.volume * p.masterVolume) / 100;
  state.appliedMuted = state.muted || p.audioMuted;
  node.volume = state.appliedVolume;
  node.muted = state.appliedMuted;
}
export function registerPlayback(node) {
  if (media.has(node)) return;
  const state = { volume: node.volume, muted: node.muted };
  media.set(node, state);
  applyMedia(node, state);
  node.addEventListener('volumechange', () => {
    if (node.volume === state.appliedVolume && node.muted === state.appliedMuted) return;
    if (node.volume !== state.appliedVolume)
      state.volume = gain() ? Math.min(1, node.volume / gain()) : node.volume;
    if (node.muted !== state.appliedMuted) state.muted = node.muted;
    applyMedia(node, state);
  });
}
function applyTone() {
  if (!tone) return;
  const p = getPreferences();
  tone.Destination.volume.value = p.masterVolume
    ? 20 * Math.log10(p.masterVolume / 100)
    : -Infinity;
  tone.Destination.mute = p.audioMuted || p.masterVolume === 0;
}
export function connectTonePlayback(value) {
  tone = value;
  applyTone();
}
export function initPlaybackPreferences() {
  if (installed) return;
  installed = true;
  document.addEventListener(
    'play',
    (event) => {
      if (event.target.matches?.('audio,video')) registerPlayback(event.target);
    },
    true,
  );
  document.addEventListener('arg:preferenceschange', () => {
    for (const node of document.querySelectorAll('audio,video')) {
      registerPlayback(node);
      applyMedia(node, media.get(node));
    }
    applyTone();
  });
}
