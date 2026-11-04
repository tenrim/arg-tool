import { readSet, compareSets, transformFile, validateFiles, MAX_FILE } from './model.js';
import { zipSync } from '../vendor/round2/fflate.js';
self.onmessage = async ({ data }) => {
  const progress = (text) => self.postMessage({ progress: text });
  try {
    if (data.action === 'compare') {
      const before = await readSet(data.before, data.beforeZip, progress, data.beforeEncoding);
      const after = await readSet(data.after, data.afterZip, progress, data.afterEncoding);
      const rows = await compareSets(before, after, progress);
      self.postMessage({ result: rows });
    } else if (data.action === 'batch') {
      validateFiles(data.files);
      let size = data.existingSize || 0;
      for (const item of data.files) {
        progress('正在处理：' + item.path);
        try {
          const source = new Uint8Array(await item.file.arrayBuffer());
          const result = await transformFile(source, data.operation, data.options);
          if (result.bytes.length > MAX_FILE || size + result.bytes.length > MAX_FILE)
            throw Error('结果合计超过 32 MB，请减少本批文件数量。');
          size += result.bytes.length;
          self.postMessage(
            { item: { index: item.index, name: item.path + result.suffix, bytes: result.bytes } },
            [result.bytes.buffer],
          );
        } catch (error) {
          self.postMessage({ item: { index: item.index, error: error.message || '处理失败' } });
        }
      }
      self.postMessage({ result: true });
    } else if (data.action === 'zip') {
      const entries = Object.create(null);
      let size = 0;
      for (const file of data.files) {
        if (Object.hasOwn(entries, file.name)) throw Error('输出文件名重复。');
        size += file.bytes.length;
        if (size > MAX_FILE) throw Error('打包结果超过 32 MB。');
        entries[file.name] = file.bytes;
      }
      const bytes = zipSync(entries, { level: 0 });
      self.postMessage({ result: bytes }, [bytes.buffer]);
    } else throw Error('未知文件任务。');
  } catch (error) {
    self.postMessage({ error: error.message || '文件处理失败。' });
  }
};
