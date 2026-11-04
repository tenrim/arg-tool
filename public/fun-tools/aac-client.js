// Generic binary-audio decoder process; the GPL-2.0 decoder is separately distributed.
import { createJob } from './client.js';
const active = new Set();
export function cancelAudioDecoders() {
  for (const job of active) job.cancel();
  active.clear();
}
export function audioDecoder(engine) {
  return async (bytes) => {
    const url =
      engine === 'aac'
        ? new URL('../vendor/fun-tools/aac-worker.js', import.meta.url)
        : new URL('../vendor/fun-tools/audio-decoders-worker.js', import.meta.url);
    const job = createJob(url, 'module');
    active.add(job);
    try {
      return await job.run({ bytes, engine });
    } finally {
      active.delete(job);
    }
  };
}
export default audioDecoder('aac');
