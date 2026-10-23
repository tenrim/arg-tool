import {parseCIF, expandCrystal} from './cif.js';
// Parse and expand user-selected CIF entirely in a terminable local worker.
self.onmessage = ({data}) => {
  try {
    const crystal = parseCIF(data.cif);
    self.postMessage({model:expandCrystal(crystal, data.repeat)});
  } catch (error) {
    self.postMessage({error:error.message || 'CIF 读取失败，请检查文件。'});
  }
};
