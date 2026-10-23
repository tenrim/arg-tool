import {Box, Card, Toolbar, FormGrid, SplitView, Field, Input, Select, Option, Button, Status, Badge, DataList, Link, ByteGrid, byteGridController, onDisconnect, setState, updateStatus} from '../ui/index.js';
import {HexDocument, parseHex, parseOffset, inspectBytes, MAX_HEX_BYTES} from './model.js';
import {resultRecording} from '../result-recording.js';

const address = value => `0x${value.toString(16).toUpperCase().padStart(8, '0')}`;
const asHex = bytes => Array.from(bytes, byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
const editedName = name => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? `${name.slice(0, dot)}.edited${name.slice(dot)}` : `${name || '文件'}.edited.bin`;
};

/** Owns one in-memory working document; never replaces the source File. */
export function mountHexEditor(parent, {onUseBytes} = {}) {
  const documentModel = new HexDocument();
  const root = Card({id: 'hex-editor', className: 'surface hex-workbench', hidden: true, attrs: {'data-native-section': 'hex-editor', 'aria-label': '十六进制编辑器'}});
  const status = Status({id: 'hex-status'}), searchStatus = Status({id: 'hex-search-status'});
  const fileState = Badge({id: 'hex-file-state', text: '尚未载入文件'});
  const undo = Button({id: 'hex-undo', text: '撤销', variant: 'secondary'}), redo = Button({id: 'hex-redo', text: '重做', variant: 'secondary'});
  const selected = Badge({id: 'hex-selection-state'});
  const jumpValue = Input({id: 'hex-jump-value', type: 'text', value: '0', placeholder: '0 或 0x10', attrs: {inputmode: 'text', spellcheck: 'false'}});
  const jump = Button({id: 'hex-jump', text: '跳转', variant: 'secondary'});
  const selectionLength = Input({id: 'hex-selection-length', type: 'number', value: '1', attrs: {min: '0', max: MAX_HEX_BYTES, inputmode: 'numeric'}});
  const editValue = Input({id: 'hex-edit-value', type: 'text', placeholder: '41 42 00', attrs: {spellcheck: 'false', autocomplete: 'off', maxlength: 2 * 1024 * 1024}});
  const write = Button({id: 'hex-write', text: '覆盖字节', variant: 'primary'});
  const insert = Button({id: 'hex-insert', text: '插入字节', variant: 'secondary'});
  const remove = Button({id: 'hex-delete', text: '删除选区', variant: 'secondary'});
  const copy = Button({id: 'hex-copy', text: '复制十六进制', variant: 'secondary'});
  const endian = Select({id: 'hex-endian', children: [Option('小端 · Little endian', 'little'), Option('大端 · Big endian', 'big')]});
  const inspector = Box({id: 'hex-inspector'});
  const inspection = Card({className: 'surface hex-inspection', title: '字节解释', children: [Field({label: '字节顺序', control: endian}), inspector]});
  const grid = ByteGrid({id: 'hex-grid', label: '十六进制和 ASCII 字节', onSelectionChange: selection => selectChanged(selection)});
  const gridController = byteGridController(grid);
  const searchMode = Select({id: 'hex-search-mode', children: [Option('十六进制字节', 'hex'), Option('文字 / UTF-8', 'text')]});
  const searchValue = Input({id: 'hex-search-value', type: 'text', placeholder: '搜索字节或文字', attrs: {spellcheck: 'false', autocomplete: 'off', maxlength: 2 * 1024 * 1024}});
  const searchNext = Button({id: 'hex-search-next', text: '下一处', variant: 'secondary'});
  const searchPrevious = Button({id: 'hex-search-prev', text: '上一处', variant: 'secondary'});
  const searchStop = Button({id: 'hex-search-stop', text: '停止搜索', variant: 'secondary', disabled: true});
  const filename = Input({id: 'hex-filename', type: 'text', value: '文件.edited.bin', attrs: {maxlength: 255}});
  const download = Button({id: 'hex-download', text: '下载编辑文件', variant: 'primary'});
  const use = Button({id: 'hex-use', text: '用于文件分析', variant: 'secondary', hidden: !onUseBytes});
  const primary = Box({className: 'hex-editor-primary', children: [grid,
    FormGrid({className: 'hex-edit-controls', density: 'normal', children: [Field({label: '编辑值 / 十六进制', span: 'full', control: editValue}), Toolbar({children: [write, insert, remove, copy]})]}),
    FormGrid({className: 'hex-search-controls', density: 'normal', minColumnWidth: '140px', children: [Field({label: '搜索方式', control: searchMode}), Field({label: '搜索内容', control: searchValue}), Toolbar({children: [searchPrevious, searchNext, searchStop]})]}),
    searchStatus,
    FormGrid({className: 'hex-export-controls', density: 'normal', children: [Field({label: '导出文件名', control: filename}), Toolbar({children: [download, use]})]}),
    status
  ]});
  const layout = SplitView({className: 'hex-editor-layout', children: [primary, inspection]});
  root.append(
    Toolbar({className: 'hex-editor-heading', children: [Box({tag: 'h2', text: '十六进制编辑器'}), fileState, undo, redo]}),
    FormGrid({className: 'hex-position-controls', density: 'normal', minColumnWidth: '150px', children: [Field({label: '字节偏移', control: jumpValue}), jump, Field({label: '选区字节数', control: selectionLength}), selected]}),
    layout
  );
  parent.append(root);
  let recordedDocument = null;
  const recording = resultRecording({id: 'hex-result', anchor: primary.querySelector('.hex-export-controls'), source: 'file', onLeave: () => {recordedDocument = null;}});
  let loaded = false, active = false, disposed = false, fileName = '文件.bin', fileGeneration = 0, uiRevision = 0, rangeValid = true;
  let selection = {offset: 0, start: 0, end: 0, length: 0}, worker = null, searchTimer, searchRequest = 0, lastMatch = null;
  const objectURLs = new Set();

  function recordDocument() {
    if (!loaded || !active || disposed) {recordedDocument = null;recording.clear();return;}
    const revision = documentModel.revision, generation = fileGeneration, name = filename.value.trim() || editedName(fileName);
    if (recordedDocument?.revision === revision && recordedDocument.generation === generation && recordedDocument.name === name) return;
    recordedDocument = {revision, generation, name};
    // Export the complete working document on explicit capture. The bounded
    // byte grid and selected range never become the saved byte source.
    recording.publish(() => ({bytes: documentModel.exportBytes(), name}));
  }

  function updateControls() {
    recordDocument();
    for (const control of [jumpValue, jump, selectionLength, editValue, insert, searchMode, searchValue, searchNext, searchPrevious, endian, filename, download, use]) control.disabled = !loaded;
    undo.disabled = !loaded || !documentModel.canUndo; redo.disabled = !loaded || !documentModel.canRedo;
    write.disabled = !loaded || !rangeValid || selection.offset >= documentModel.length;
    insert.disabled = !loaded || !rangeValid;
    remove.disabled = copy.disabled = !loaded || !rangeValid || selection.end <= selection.start;
    if (worker) searchNext.disabled = searchPrevious.disabled = true;
    searchStop.disabled = !worker;
    fileState.textContent = loaded ? `${documentModel.length.toLocaleString('zh-CN')} 字节 · ${documentModel.modified ? '已修改' : '原始内容'}` : '尚未载入文件';
    fileState.dataset.state = documentModel.modified ? 'modified' : 'original';
  }

  function showInspection() {
    if (disposed) return;
    if (!loaded) {inspector.replaceChildren(); selected.textContent = ''; return;}
    const offset = selection.offset, remaining = documentModel.length - offset;
    const sample = documentModel.read(offset, Math.min(256, Math.max(8, selection.length), remaining));
    const data = inspectBytes(sample, 0, {littleEndian: endian.value === 'little', length: Math.min(32, selection.length)});
    const numeric = value => value === null ? '字节不足' : String(value);
    const preview = selection.length > 32 ? ' / 前 32 字节' : '';
    const items = [['偏移', address(offset)], ['选区', `${selection.length.toLocaleString('zh-CN')} 字节`], ['十六进制' + preview, data.hex || '—'], ['二进制' + preview, data.binary || '—'], ['ASCII' + preview, data.ascii || '—'], ['UTF-8' + preview, data.validUtf8 ? JSON.stringify(data.utf8) : (preview ? '预览字节不是完整有效的 UTF-8' : '不是完整有效的 UTF-8')], ...[['Uint8','uint8'],['Int8','int8'],['Uint16','uint16'],['Int16','int16'],['Uint32','uint32'],['Int32','int32'],['Uint64','uint64'],['Int64','int64'],['Float32','float32'],['Float64','float64']].map(([label, key]) => [label, numeric(data[key])])];
    inspector.replaceChildren(DataList({items}));
    selected.textContent = `${address(offset)} · ${selection.length.toLocaleString('zh-CN')} 字节`;
  }

  function cancelSearch(message = '') {
    if (disposed) return;
    searchRequest++; worker?.terminate(); worker = null; clearTimeout(searchTimer);
    setState(searchNext, {busy: false}); setState(searchPrevious, {busy: false});
    updateStatus(searchStatus, message); updateControls();
  }

  function selectChanged(next) {
    if (disposed) return;
    uiRevision++;
    selection = next;
    rangeValid = true;
    if (!loaded) return;
    cancelSearch(); lastMatch = null;
    jumpValue.value = address(next.offset); selectionLength.value = String(next.length);
    selectionLength.removeAttribute('aria-invalid');
    jumpValue.removeAttribute('aria-invalid');
    editValue.value = asHex(documentModel.read(next.start, Math.min(16, next.length)));
    showInspection(); updateControls();
  }

  function refresh(offset = selection.offset) {
    if (disposed) return;
    gridController.setData(loaded ? {length: documentModel.length, read: (start, count) => documentModel.read(start, count)} : null, {offset});
    showInspection(); updateControls();
  }

  function action(callback, message, {needsRange = true} = {}) {
    if (!loaded || disposed) return;
    if (needsRange && !rangeValid) {updateStatus(status, '请先修正字节偏移或选区范围。', 'error');return;}
    uiRevision++;
    cancelSearch(); lastMatch = null;
    try {
      const changed = callback();
      refresh(); updateStatus(status, changed === false ? '内容未变化。' : message, changed === false ? 'info' : 'success');
    } catch (error) {updateStatus(status, error.message || '编辑失败，请检查字节和范围。', 'error'); updateControls();}
  }
  write.onclick = () => action(() => documentModel.overwrite(selection.offset, parseHex(editValue.value)), '字节已覆盖。');
  insert.onclick = () => action(() => documentModel.insert(selection.offset, parseHex(editValue.value)), '字节已插入。');
  remove.onclick = () => action(() => documentModel.delete(selection.start, selection.end - selection.start), '选区已删除。');
  undo.onclick = () => action(() => documentModel.undo(), '已撤销。', {needsRange: false});
  redo.onclick = () => action(() => documentModel.redo(), '已重做。', {needsRange: false});
  jump.onclick = () => {
    if (!loaded) return;
    try {gridController.select(parseOffset(jumpValue.value, {max: documentModel.length}), {focus: true}); updateStatus(status, ''); jumpValue.removeAttribute('aria-invalid');}
    catch (error) {rangeValid = false;jumpValue.setAttribute('aria-invalid', 'true'); updateStatus(status, error.message, 'error');updateControls();}
  };
  jumpValue.addEventListener('keydown', event => {if (event.key === 'Enter') {event.preventDefault(); jump.click();}});
  selectionLength.addEventListener('input', () => {
    if (!loaded) return;
    try {
      const count = parseOffset(selectionLength.value, {max: documentModel.length - selection.offset});
      gridController.select(selection.offset, {end: selection.offset + count}); updateStatus(status, '');
    } catch (error) {rangeValid = false;cancelSearch(); selectionLength.setAttribute('aria-invalid', 'true'); updateStatus(status, error.message, 'error');}
  });
  endian.addEventListener('change', showInspection);
  editValue.addEventListener('input', () => {if (disposed) return;cancelSearch(); lastMatch = null; updateStatus(status, '');});
  editValue.addEventListener('keydown', event => {if (event.key === 'Enter') {event.preventDefault(); write.click();}});
  gridController.viewport.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') {event.preventDefault(); (event.shiftKey ? redo : undo).click();}
      if (event.key.toLowerCase() === 'y') {event.preventDefault(); redo.click();}
    } else if (event.key === 'Delete') {event.preventDefault(); remove.click();}
  });
  copy.onclick = async () => {
    if (!loaded || !selection.length || !rangeValid) return;
    const revision = documentModel.revision, operationRevision = uiRevision;
    try {
      if (selection.length > 1024 * 1024) throw Error('复制选区最多 1 MB；完整字节请下载文件。');
      await navigator.clipboard.writeText(asHex(documentModel.read(selection.start, selection.length)));
      if (revision === documentModel.revision && operationRevision === uiRevision && loaded && active && !disposed) updateStatus(status, '已复制选区十六进制。', 'success');
    } catch (error) {if (revision === documentModel.revision && operationRevision === uiRevision && active && !disposed) updateStatus(status, error.message || '无法使用剪贴板，请下载文件。', 'error');}
  };

  function search(direction) {
    if (!loaded || !active) return;
    cancelSearch();
    try {
      const pattern = searchMode.value === 'text' ? new TextEncoder().encode(searchValue.value) : parseHex(searchValue.value, {maxBytes: 1024 * 1024});
      if (!pattern.length) throw Error('搜索内容不能为空。');
      if (pattern.length > 1024 * 1024) throw Error('搜索内容最多 1 MB。');
      const patternLength = pattern.length;
      const bytes = documentModel.exportBytes(), revision = documentModel.revision, id = ++searchRequest, generation = fileGeneration;
      const start = lastMatch === selection.offset ? (direction === 'next' ? selection.offset + 1 : selection.offset - 1) : selection.offset;
      const currentWorker = new Worker(new URL('./search-worker.js', import.meta.url), {type: 'module'});
      worker = currentWorker; setState(direction === 'next' ? searchNext : searchPrevious, {busy: true}); updateControls();
      updateStatus(searchStatus, '正在搜索…');
      const belongs = () => !disposed && active && loaded && worker === currentWorker && searchRequest === id && documentModel.revision === revision && fileGeneration === generation;
      currentWorker.onmessage = ({data}) => {
        if (!belongs() || data.id !== id || data.revision !== revision) return;
        currentWorker.terminate(); worker = null; clearTimeout(searchTimer);
        setState(searchNext, {busy: false}); setState(searchPrevious, {busy: false});
        if (data.error) {updateStatus(searchStatus, data.error, 'error'); updateControls(); return;}
        if (data.offset === null) {lastMatch = null; updateStatus(searchStatus, '未找到匹配字节。'); updateControls(); return;}
        gridController.select(data.offset, {end: data.offset + patternLength}); lastMatch = data.offset;
        updateStatus(searchStatus, `${address(data.offset)} · ${patternLength} 字节${data.wrapped ? ' · 已绕回' : ''}`, 'success'); updateControls();
      };
      currentWorker.onerror = event => {if (!belongs()) return; event.preventDefault(); cancelSearch(); updateStatus(searchStatus, '字节搜索线程加载失败，请重试。', 'error');};
      searchTimer = setTimeout(() => {if (!belongs()) return; cancelSearch(); updateStatus(searchStatus, '搜索超时，已停止。', 'error');}, 30000);
      currentWorker.postMessage({id, revision, bytes, pattern, start, direction, wrap: true}, [bytes.buffer, pattern.buffer]);
    } catch (error) {cancelSearch(); updateStatus(searchStatus, error.message || '搜索失败，请重试。', 'error');}
  }
  searchNext.onclick = () => search('next'); searchPrevious.onclick = () => search('previous');
  searchStop.onclick = () => cancelSearch('搜索已停止。');
  for (const control of [searchValue, searchMode]) for (const event of ['input', 'change']) control.addEventListener(event, () => {if (disposed) return;cancelSearch(); lastMatch = null;});
  searchValue.addEventListener('keydown', event => {if (event.key === 'Enter') {event.preventDefault(); search(event.shiftKey ? 'previous' : 'next');}});
  download.onclick = () => {
    if (!loaded) return;
    const url = URL.createObjectURL(new Blob([documentModel.exportBytes()], {type: 'application/octet-stream'})); objectURLs.add(url);
    const link = Link({attrs: {href: url, download: filename.value.trim() || editedName(fileName)}}); link.click();
    setTimeout(() => {URL.revokeObjectURL(url);objectURLs.delete(url);}, 1000);
    updateStatus(status, '已导出当前完整字节。', 'success');
  };
  use.onclick = () => {
    if (!loaded || !onUseBytes) return;
    const revision = documentModel.revision, operationRevision = uiRevision, generation = fileGeneration;
    const bytes = documentModel.exportBytes(), name = filename.value.trim() || editedName(fileName);
    const belongs = () => loaded && active && !disposed && generation === fileGeneration && revision === documentModel.revision && operationRevision === uiRevision;
    Promise.resolve().then(() => {
      if (!belongs()) return false;
      return Promise.resolve(onUseBytes(bytes, {name, isCurrent: belongs})).then(applied => applied !== false);
    }).then(applied => {if (applied && belongs()) updateStatus(status, '编辑内容已用于文件分析。', 'success');}).catch(error => {if (belongs()) updateStatus(status, error.message || '文件分析载入失败。', 'error');});
  };
  const invalidateUI = () => {uiRevision++;};
  filename.addEventListener('input', recordDocument);
  const onTask = ({detail}) => {if (detail?.panel === 'file' && detail.id === 'native:hex-editor' && active) recordDocument();};
  document.addEventListener('arg:nativetaskchange', onTask);
  for (const event of ['input', 'change', 'click']) root.addEventListener(event, invalidateUI, {capture: true});
  const api = {
    root,
    load(bytes, {name = '文件.bin', generation = fileGeneration + 1} = {}) {
      if (disposed) return;
      uiRevision++;
      cancelSearch(); lastMatch = null; fileGeneration = generation; fileName = name;
      documentModel.load(bytes ?? new Uint8Array()); loaded = bytes != null;
      filename.value = editedName(name); editValue.value = ''; jumpValue.value = '0';
      searchValue.value = ''; updateStatus(status, ''); updateStatus(searchStatus, '');
      refresh(0);
    },
    setActive(value) {if (disposed) return;uiRevision++;active = !!value; root.hidden = !active; if (!active) {cancelSearch();lastMatch = null;} else {gridController.refresh();recordDocument();}},
    cancel() {if (disposed) return;uiRevision++;active = false;cancelSearch();lastMatch = null;},
    getEditedBytes() {return loaded ? documentModel.exportBytes() : null;},
    destroy() {
      if (disposed) return;
      uiRevision++;active = false;loaded = false;cancelSearch();disposed = true;
      documentModel.load(new Uint8Array());gridController.destroy();
      editValue.value = searchValue.value = filename.value = '';
      inspector.replaceChildren();
      for (const event of ['input', 'change', 'click']) root.removeEventListener(event, invalidateUI, {capture: true});
      document.removeEventListener('arg:nativetaskchange', onTask);recording.clear();recordedDocument = null;
      for (const url of objectURLs) URL.revokeObjectURL(url);objectURLs.clear();
    }
  };
  onDisconnect(root, api.destroy); refresh(0);
  return api;
}
