import {onDisconnect} from '../ui/index.js';

// A capability selects existing controls. It never constructs a second tool,
// replaces a file input, or copies a simulator's rules into the navigation.
export function mountNativeWorkspaces({roundTwo,imageTools,hexEditor,itReference,getAudioFile,getFile,getFileFile,getVideoFile=()=>document.getElementById('video-file')?.files[0]}) {
  const main=document.getElementById('main'),hidden=new Map(),directionFields=new Map();
  let removeDirectionListeners=()=>{};
  let active=null,activePanel=null,destroyed=false,fileRevision=0,audioRevision=0,videoRevision=0,currentKind=null,currentReady=false,materialSelection=0;
  const hide=node=>{if(!node)return;if(!hidden.has(node))hidden.set(node,node.hidden);node.hidden=true;};
  function restore() {
    removeDirectionListeners();removeDirectionListeners=()=>{};
    for(const [control,{options,label,text}] of directionFields){
      const value=control.value;control.replaceChildren(...options);control.value=value;
      if(label)label.textContent=text;
    }
    directionFields.clear();
    if(activePanel&&main.isConnected) {
      document.dispatchEvent(new CustomEvent('arg:nativetaskchange',{detail:{panel:activePanel,id:null,reason:'leave'}}));
      if(activePanel==='image')imageTools.cancelTask();
    }
    for(const [node,value] of hidden)node.hidden=value;
    hidden.clear();active=null;activePanel=null;
  }
  function hideOtherSections(panel,selected,keep=[]) {
    for(const node of panel.querySelectorAll('[data-native-section]')) {
      if(node.dataset.nativeSection!==selected&&!keep.includes(node.dataset.nativeSection))hide(node);
    }
  }
  function selectDirectionFields(panel,entry,direction) {
    const choices=entry.open.nativeDirections||[],selectors=new Map();
    for(const choice of choices)for(const {selector,value,event} of choice.controls||[]){
      if(event==='click')continue;
      if(!selectors.has(selector))selectors.set(selector,new Set());
      selectors.get(selector).add(String(value));
    }
    const fields=new Set();
    for(const [selector,values] of selectors){
      if(values.size<2)continue;
      const control=panel.querySelector(selector);if(control?.tagName!=='SELECT')continue;
      fields.add(selector);
      const options=[...control.options],label=control.closest('label')?.querySelector(':scope>span'),value=control.value;
      directionFields.set(control,{options,label,text:label?.textContent});
      control.replaceChildren(...options.filter(option=>values.has(option.value)));
      control.value=value;if(label)label.textContent='方向';
    }
    let selected=direction||choices[0]?.id;
    const changed=()=>{
      if(destroyed||active!==entry.id)return;
      const choice=choices.find(item=>item.controls?.length&&item.controls.every(({selector,value,event})=>{
        const node=panel.querySelector(selector);return event==='click'||node&&(node.type==='checkbox'?node.checked===Boolean(value):node.value===String(value));
      }));
      if(!choice||choice.id===selected)return;
      selected=choice.id;
      document.dispatchEvent(new CustomEvent('arg:capability-native-direction',{detail:{id:entry.id,direction:choice.id}}));
    };
    const nodes=[...fields].map(selector=>panel.querySelector(selector));
    for(const node of nodes)node.addEventListener('change',changed);
    removeDirectionListeners=()=>{for(const node of nodes)node.removeEventListener('change',changed);};
    return fields;
  }
  function activateOperation(entry) {
    if(destroyed||entry?.open?.kind!=='operation')return false;
    const panel=document.getElementById('panel-'+entry.open.panel),task=panel?.querySelector('.ct-tool');
    if(!task)return false;
    restore();active=entry.id;activePanel=entry.open.panel;
    // Keep the original shared source nodes and selected form. Other native
    // tools on this controller's panel are separate registered tasks.
    const selectors={image:['#image-input','#image-info','#image-status'],audio:['#audio-input','#audio-info','#audio-status'],file:['[data-native-section="file-upload"]'],analysis:['#analysis-input'],video:['#video-file','#video-status']};
    const sources=(selectors[entry.open.panel]||[]).map(selector=>panel.querySelector(selector)).filter(Boolean).map(node=>node.closest('.upload-zone,label')||node);
    // Shared help can live inside its animation shell. Preserve the actual
    // help node and its ancestors, rather than assuming every shared surface
    // remains a direct child of the workspace.
    const keep=[task,...sources,...panel.querySelectorAll(':scope>.page-heading,:scope>.tool-provenance,:scope>.capability-workspace-context,:scope>.capability-topic-settings,:scope>[data-tool-help],.tool-help-panel')];
    function visit(parent){for(const child of parent.children){if(keep.includes(child))continue;if(keep.some(node=>child.contains(node)))visit(child);else hide(child);}}
    visit(panel);return true;
  }
  async function activateNative(entry,{op,direction}={}) {
    if(destroyed||entry?.open?.kind!=='native')return false;
    const target=entry.open,panel=document.getElementById('panel-'+target.panel);
    if(!panel)return false;
    restore();active=entry.id;activePanel=target.panel;
    for(const node of panel.querySelectorAll('.ct-tool'))hide(node.closest('.ct-extension')||node);
    document.dispatchEvent(new CustomEvent('arg:nativetaskchange',{detail:{panel:target.panel,id:entry.taskId||entry.id,capabilityId:entry.id}}));
    if(target.panel==='image')imageTools.cancelTask();
    const tab=target.tab;
    if(tab?.panel==='image'&&!roundTwo.selectImage(tab.id))return false;
    if(tab?.panel==='audio'&&!roundTwo.selectAudio(tab.id))return false;
    if(target.engine&&!imageTools.selectEngine(target.engine,{render:false}))return false;
    // Apply options in their registered order: dependent menus (e.g. UTF-8
    // format after conversion family) must be populated before the next one.
    const operations=target.operationControls?.find(mapping=>mapping.op===op)?.controls||[];
    const nativeDirection=target.nativeDirections?.find(item=>item.id===direction)||target.nativeDirections?.[0];
    for(const {selector,value,event='change'} of [...(nativeDirection?.controls||target.controls||[]),...operations]) {
      const control=panel.querySelector(selector);
      if(!control||control.type==='file')return false;
      if(event==='click'){control.click();continue;}
      if(control.tagName==='SELECT'&&![...control.options].some(option=>option.value===String(value)))return false;
      if(control.type==='checkbox')control.checked=Boolean(value);else control.value=String(value);
      control.dispatchEvent(new CustomEvent(event,{bubbles:true,detail:{uiSource:'navigation'}}));
      // Original tools sometimes invalidate on input and configure on change.
      // Both must reach the original owner. Navigation initialization is not
      // continuous typing, so motion can distinguish these synthetic events.
      if(event==='change')control.dispatchEvent(new CustomEvent('input',{bubbles:true,detail:{uiSource:'navigation'}}));
    }
    for(const selector of target.clicks||[]) {
      const control=panel.querySelector(selector);if(!control)return false;control.click();
    }
    // Mode discovery lives in the complete capability overview. Keep direction
    // and real algorithm parameters here, rather than another task dropdown.
    const modeSelectors=new Set(['#basics-family','#basics-format','#tapcode-mode','#invisible-action','#hanzi-mode','#word-mode','#word-grid-mode','#extract-mode','#video-mode','#code-language','#paper-type','#element-spelling-mode','#keyboard-mode']);
    const directionSelectors=selectDirectionFields(panel,entry,nativeDirection?.id);
    for(const option of nativeDirection?.controls||target.controls||[])if(modeSelectors.has(option.selector)&&!directionSelectors.has(option.selector))hide(panel.querySelector(option.selector)?.closest('label'));
    if(target.panel==='basics')hide(document.getElementById('basics-family')?.closest('label'));
    if(target.panel==='words')hide(panel.querySelector('.hunt-tabs'));
    if(target.panel==='hanzi') {
      if((entry.taskId||entry.id)!=='native:hanzi')hide(document.getElementById('hanzi-full'));
      const mode=document.getElementById('hanzi-mode').value;
      if(!mode.startsWith('tele-'))hide(document.getElementById('hanzi-table').closest('label'));
      if(mode!=='info'){hide(document.getElementById('hanzi-property').closest('label'));hide(document.getElementById('hanzi-project'));}
    }
    if(target.panel==='sequence'&&(entry.taskId||entry.id)!=='native:sequence-processing')hide(document.getElementById('sequence-native'));
    if(target.panel==='chemistry'){
      hide(document.getElementById('chem-mode')?.closest('label'));
      if((entry.taskId||entry.id)==='native:chemistry')hide(document.getElementById('chemistry-form'));
      else hide(document.getElementById('element-grid')?.closest('.science-card'));
    }
    if(target.panel==='extract'&&['first','last','transpose'].includes(document.getElementById('extract-mode').value))hide(document.getElementById('extract-indices').closest('label'));
    if(target.panel==='video') {
      const mode=document.getElementById('video-mode').value;
      if(!['native','capabilities'].includes(mode)){hide(document.getElementById('video-format-field'));hide(document.getElementById('video-advanced'));hide(document.getElementById('video-native-args')?.closest('label'));hide(document.getElementById('video-capabilities'));}
      if(mode==='animation'){
        for(const id of ['video-start','video-duration'])hide(document.getElementById(id).closest('label'));
        hide(document.getElementById('video-run').parentElement);
        hide(document.getElementById('video-status'));
        hide(document.getElementById('video-results').closest('.hunt-results'));
      }
      if(['native','capabilities'].includes(mode)){hide(document.getElementById('video-start').closest('label'));hide(document.getElementById('video-duration').closest('label'));}
      if(mode==='frame')hide(document.getElementById('video-duration').closest('label'));
      if(!['frames','gif'].includes(mode))hide(document.getElementById('video-fps').closest('label'));
    }
    for(const bar of panel.querySelectorAll('.r2-tabs,.image-engine-tabs'))hide(bar);
    const slice=target.slice;
    if(target.panel==='it-reference')return await itReference.activate(slice)!==false;
    if(target.panel==='symbols'&&slice)hideOtherSections(panel,slice,['symbols-result']);
    if(target.panel==='image') {
      if(slice==='compare'||slice==='color')hideOtherSections(panel,slice);
      if(slice==='preview')hide(document.getElementById('basic-controls'));
      if(slice==='stereo')hide(document.getElementById('image-view-controls'));
      if(['preview','planes','stereo'].includes(slice)) {
        hide(panel.querySelector('.image-result-heading'));
        hide(document.getElementById('image-output'));
        hide(document.getElementById('image-copy')?.closest('.button-row'));
      }
      if(target.imageAction) {
        for(const id of ['image-qr','image-exif','image-png','barcode-read'])if(id!==target.imageAction)hide(document.getElementById(id));
        if(['image-exif','image-png'].includes(target.imageAction))hide(document.getElementById('image-analysis-source')?.closest('label'));
      }
    }
    if(target.panel==='audio'&&(slice==='spectrum'||slice==='sstv'))hideOtherSections(panel,slice);
    if(target.panel==='file') {
      hideOtherSections(panel,slice==='archive'?'archive':slice==='hex'?'hex-editor':'file-analysis',['file-upload']);
      if(slice==='archive')hide(document.getElementById('file-modes'));
      if(slice==='hex')for(const footer of panel.querySelectorAll(':scope>.tool-provenance'))hide(footer);
      hexEditor?.setActive(slice==='hex');
      for(const node of panel.querySelectorAll('.ct-tool'))hide(node.closest('.ct-extension')||node);
    }
    if(target.anchor) {
      const anchor=panel.querySelector(target.anchor);
      if(anchor&&!anchor.closest('[hidden]')) {
        const focus=anchor.matches('button,input,select,textarea,[tabindex]')?anchor:anchor.querySelector('button,input,select,textarea,[tabindex]');
        focus?.focus({preventScroll:true});
      }
    }
    return true;
  }
  function getMaterial(kind,source='original') {
    if(destroyed)return null;
    if(kind==='current') {
      const input=currentReady&&currentKind?getMaterial(currentKind,'original'):null;
      if(!input)return null;
      const selection=materialSelection;
      return {...input,async read(){
        if(selection!==materialSelection)throw Error('当前素材已经变化，请重新执行。');
        const data=await input.read();
        if(selection!==materialSelection)throw Error('当前素材已经变化，请重新执行。');
        return data;
      }};
    }
    if(kind==='image') {
      const image=imageTools.getImage();if(!image)return null;
      const revision=imageTools.getRevision(),current=source==='view';
      const view=current?imageTools.getCurrentView():image;
      return {kind,source:current?'view':'original',file:current?null:image.file,name:current?'当前图片视图.png':image.file.name,width:view.width,height:view.height,
        revision:current?revision.viewRevision:revision.generation,
        async read() {
          if(imageTools.getImage()!==image)throw Error('图片已经变化，请重新选择素材。');
          if(!current)return image.file;
          if(imageTools.getRevision().viewRevision!==revision.viewRevision)throw Error('图片视图已经变化，请重新选择素材。');
          const canvas=document.getElementById('image-canvas');
          const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('无法读取图片视图。')),'image/png'));
          if(imageTools.getImage()!==image||imageTools.getRevision().viewRevision!==revision.viewRevision)throw Error('图片视图已经变化，请重新选择素材。');
          return blob;
        },getPixels:()=>({pixels:new Uint8ClampedArray(view.pixels),width:view.width,height:view.height})};
    }
    if(kind==='audio') {
      const file=getAudioFile?.();if(!file)return null;
      const revision=audioRevision;
      return {kind,source:'original',file,name:file.name,revision,async read(){if(audioRevision!==revision||getAudioFile()!==file)throw Error('音频已经变化，请重新选择素材。');return file;}};
    }
    if(kind==='file') {
      const selected=getFile?.(),bytes=selected?.bytes??selected;if(!bytes)return null;
      const revision=fileRevision,file=getFileFile?.();
      return {kind,source:'original',file,name:file?.name||'当前文件',revision,size:bytes.byteLength,async read(){if(fileRevision!==revision||getFile()!==selected)throw Error('文件已经变化，请重新选择素材。');return file||bytes.slice();}};
    }
    if(kind==='video') {
      const file=getVideoFile();if(!file)return null;
      const revision=videoRevision;
      return {kind,source:'original',file,name:file.name,revision,async read(){if(videoRevision!==revision||getVideoFile()!==file)throw Error('视频已经变化，请重新选择素材。');return file;}};
    }
    return null;
  }
  function materialChanged(kind,ready) {
    materialSelection++;
    currentKind=kind;currentReady=ready;
    document.dispatchEvent(new CustomEvent('arg:materialchange',{detail:{kind,ready}}));
  }
  function materialReady(kind) {
    // A slower decode of an earlier selection cannot take over a later file
    // selected in a different media tool.
    if(currentKind!==kind)return;
    currentReady=true;
    document.dispatchEvent(new CustomEvent('arg:materialchange',{detail:{kind,ready:true}}));
  }
  // Read only the controls named by the registered direction contract. Source
  // links follow an actual edited direction without probing a computation API.
  function getSelection(entry,fallback={}){
    if(active!==entry?.id)return fallback;
    const panel=document.getElementById('panel-'+entry.open.panel);
    const matches=item=>item.controls?.length&&item.controls.every(({selector,value})=>{const control=panel?.querySelector(selector);return control&&(control.type==='checkbox'?control.checked===Boolean(value):control.value===String(value));});
    const operation=entry.open.operationControls?.find(matches),direction=entry.open.nativeDirections?.find(matches);
    return{...fallback,...(entry.variantId?{variant:entry.variantId}:{}),...(operation?{op:operation.op}:{}),...(direction?{direction:direction.id}:{})};
  }
  const fileChanged=()=>{fileRevision++;materialChanged('file',false);},audioChanged=()=>{
    audioRevision++;materialChanged('audio',false);const selection=materialSelection;
    // audiochange also reports channel/direction edits. The original File is
    // still valid in that case; a new file selection clears it synchronously.
    queueMicrotask(()=>{if(!destroyed&&selection===materialSelection&&getAudioFile?.())materialReady('audio');});
  };
  const imageChanged=()=>materialChanged('image',false),imageReady=()=>materialReady('image'),audioReady=()=>materialReady('audio'),fileReady=()=>materialReady('file');
  const videoChanged=()=>{videoRevision++;materialChanged('video',Boolean(getVideoFile()));};
  const routeChanged=()=>restore();
  const listeners=[['arg:filechange',fileChanged],['arg:audiochange',audioChanged],['arg:imagechange',imageChanged],['arg:imageready',imageReady],['arg:audioready',audioReady],['arg:fileready',fileReady],['arg:videochange',videoChanged],['arg:panelchange',routeChanged]];
  for(const [event,listener] of listeners)document.addEventListener(event,listener);
  function destroy(){if(destroyed)return;restore();destroyed=true;for(const [event,listener] of listeners)document.removeEventListener(event,listener);release();}
  const release=onDisconnect(main,destroy);
  return {activateNative,activateOperation,restore,getMaterial,getSelection,destroy,get active(){return active;}};
}
