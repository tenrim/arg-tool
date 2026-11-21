// A local discovery puzzle, not authentication. Never store tool inputs/results.
export const ANALYSIS_UNLOCK_KEY = 'arg.discovery.text-analysis.v1';
export const ANALYSIS_CAPABILITY = 'native:cipher-detect';
// Decode in order: hexadecimal text -> ROT13 -> Base64 (UTF-8).
export const ANALYSIS_CLUE = '35626862356f6c4e36592b33364d682b';
const solved = 'solved-v1';
export function createAnalysisAccess(storage) {
  let sessionUnlocked = false;
  const listeners = new Set();
  function unlocked() {
    try {
      return sessionUnlocked || storage()?.getItem(ANALYSIS_UNLOCK_KEY) === solved;
    } catch {
      return sessionUnlocked;
    }
  }
  function submit(value) {
    if (
      unlocked() ||
      typeof value !== 'string' ||
      value.length > 64 ||
      value.trim().normalize('NFC') !== '拨开迷雾'
    )
      return null;
    sessionUnlocked = true;
    let persisted = false;
    try {
      storage()?.setItem(ANALYSIS_UNLOCK_KEY, solved);
      persisted = storage()?.getItem(ANALYSIS_UNLOCK_KEY) === solved;
    } catch {
      /* Storage denial still allows this session. */
    }
    for (const listener of listeners) listener();
    return { persisted };
  }
  return {
    unlocked,
    submit,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh() {
      sessionUnlocked = false;
      for (const listener of listeners) listener();
    },
  };
}
export const analysisAccess = createAnalysisAccess(() => globalThis.localStorage);
export function isAnalysisEntry(entry) {
  return entry?.id === ANALYSIS_CAPABILITY || entry?.capabilityIds?.includes(ANALYSIS_CAPABILITY);
}
if (typeof window !== 'undefined')
  window.addEventListener('storage', (event) => {
    if (event.key === ANALYSIS_UNLOCK_KEY || event.key === null) analysisAccess.refresh();
  });
