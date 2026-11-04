import { listArchive, extractArchive, createArchive } from './archive-engine.js';
self.onmessage = ({ data }) => {
  try {
    self.postMessage({
      result:
        data.op === 'list'
          ? listArchive(data.bytes, data.encoding)
          : data.op === 'extract'
            ? extractArchive(data.bytes, data.index, data.encoding)
            : createArchive(data.files),
    });
  } catch (e) {
    self.postMessage({ error: e.message });
  }
};
