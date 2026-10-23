import {captureFailure} from '../feedback/model.js';
import {render as uiRender, Box, Select, Option, Field, FormGrid, ConversionLayout, setState, setTextareaValue, updateStatus, confirmAction, animatePresence, onDisconnect} from '../ui/index.js';
import {INVERSES,inverseArgs} from './inverse.js';
import {CyberChefClient} from '../cyberchef-client.js';
import {operationName,operationDescription,parameterName,localizedError} from '../cyberchef-i18n.js';
import {GROUPS,getCatalogue,classifyCatalogue,IMAGE_INPUT,NETWORK_OPS} from './catalog.js';
import {defaults,schemas,renderParameters} from './schema.js';
import {resultView} from './result-view.js';
import {guidance} from './guidance.js';
import {checkImageSize} from './limits.js';
import {download} from '../round1/common.js';
import {normalizeInputSource} from '../capabilities/input-session.js';
import {loadRegistry} from '../capabilities/registry.js';
import {operationFamilies} from './families.js';
import {resultRecording} from '../result-recording.js';
import {sourcePreview} from './source-preview.js';
const MAX=32*1024*1024;
export function taskView({id,groups,shared,applyImage,defaultOp}){
 const root=Box({id,className:'ct-tool'});
 uiRender(root, '<div class="ct-input-area"><h3>输入</h3><label>输入来源<select class="ct-source"><option value="text">文字 / UTF-8</option><option value="hex">十六进制输入</option><option value="base64">Base64 输入</option><option value="file">选择本机文件</option>'+(shared?'<option value="shared">沿用本页文件</option>':'')+(id==='ct-image'?'<option value="view">当前处理视图 / PNG</option>':'')+'<option value="result" hidden>上一步结果</option></select></label><label class="ct-file secondary-button">选择文件<input type="file" class="ct-file-input"></label><textarea class="ct-input" rows="4" data-fit="content" data-min-rows="4" aria-label="输入内容" placeholder="输入待处理的内容"></textarea><p class="ct-input-info help" hidden></p><div class="ct-source-preview"></div></div><div class="ct-result-area"><h3>结果</h3><div class="ct-result"></div><div class="ct-actions"><button class="ct-use" disabled>作为输入</button><button class="ct-copy" disabled>复制</button><button class="ct-download" disabled>下载</button>'+(applyImage?'<button class="ct-apply" disabled>用于图片分析</button>':'')+'</div></div><button class="ct-run primary-button">转换</button><button class="ct-stop" disabled>停止</button><p class="ct-summary" hidden></p><p class="ct-status status" role="status" aria-live="polite"></p>');
 const q=s=>root.querySelector(s);
 const inputPreview=sourcePreview(q('.ct-source-preview'));
 const directionSelect=Select({className:'ct-direction',attrs:{'aria-label':'方向'}});
 const directionBar=Field({className:'ct-directions',label:'方向',control:directionSelect,hidden:true});
 directionSelect.addEventListener('change',()=>selectDirection(directionSelect.value));
 const parameters=FormGrid({className:'ct-parameters chef-args'});
 const helpTitle=Box({tag:'h3'}),instructions=Box({tag:'p',className:'ct-instructions'});
 const help=Box({hidden:true,children:[helpTitle,instructions]});
 const inputNodes=[...q('.ct-input-area').children],resultNodes=[...q('.ct-result-area').children];
 const workspace=ConversionLayout({parameters:Box({className:'ct-settings',children:[directionBar,parameters,q('.ct-summary')]}),actions:[q('.ct-run'),q('.ct-stop')],status:q('.ct-status'),input:inputNodes,result:resultNodes});
 workspace.inputCard.classList.add('ct-input-area');workspace.resultCard.classList.add('ct-result-area');root.replaceChildren(workspace.root);
 const noInputOps=new Set(['Generate PGP Key Pair','Generate RSA Key Pair']);let noInput=false;
 if(typeof shared?.label==='string')q('.ct-source option[value=shared]').textContent=shared.label;const view=resultView(q('.ct-result')),drafts=new Map(),sourceDrafts=new Map();let catalogue,entries=[],families=[],familyByOp=new Map(),currentFamily=null,group=groups[0],step=null,selected='',client=null,busy=false,revision=0,selectionRevision=0,localFile=null,previous=null,previousOrigin=null,readyPromise,capability=null,inputSnapshot=null,adopting=false;
 const inputText=()=>inputSnapshot?.display===q('.ct-input').value?inputSnapshot.text:q('.ct-input').value;
 let recorded=null;const recording=resultRecording({id:id+'-result',anchor:q('.ct-actions'),source:id.includes('image')?'image':'chef'});
 const message=(text,error=false,tone='info')=>updateStatus(q('.ct-status'),text,error?'error':tone);
 function controls(){setState(q('.ct-run'),{busy});q('.ct-run').disabled=!step||busy;q('.ct-stop').disabled=!busy;const r=view.get();if(busy||!r){recorded=null;recording.clear();}else if(recorded!==r){recorded=r;recording.publish({bytes:r.export?.bytes||r.response.bytes,files:r.response.files});}directionSelect.value=selected;q('.ct-use').disabled=!r||!!r.response.files;q('.ct-download').disabled=!r||!!r.response.files;q('.ct-copy').disabled=!r?.text;if(applyImage)q('.ct-apply').disabled=!r?.image;}
 function renderDirections(){const directions=currentFamily?.directions||[],label=currentFamily?.owner.topic?'操作':'方向';directionBar.querySelector(':scope>span').textContent=label;directionSelect.setAttribute('aria-label',label);if(directionBar.dataset.familyId!==currentFamily?.id||[...directionSelect.options].map(option=>option.value).join('\n')!==directions.map(direction=>direction.op).join('\n')){directionBar.dataset.familyId=currentFamily?.id||'';directionSelect.replaceChildren(...directions.map(direction=>Option(direction.label,direction.op)));}directionSelect.value=selected;directionBar.hidden=capability?.mixed||directions.length<2;}
 function rememberSource(){if(capability?.mixed&&selected)sourceDrafts.set(selected,q('.ct-source').value);}
 function invalidate(text=''){revision++;client?.close();client=null;busy=false;view.clear();controls();message(text);}
 function mode(){const source=q('.ct-source').value;if(shared?.label)q('.ct-source option[value=shared]').textContent=typeof shared.label==='function'?shared.label():shared.label;q('.ct-input-area>label:has(.ct-source)').hidden=noInput;q('.ct-input').hidden=noInput||!['text','hex','base64'].includes(source);q('.ct-file').hidden=noInput||source!=='file';const info=q('.ct-input-info');info.textContent=source==='file'?(localFile?.name||''):['shared','view'].includes(source)?shared?.info?.(source)||'':'';info.hidden=!info.textContent;
  if(source==='result'&&!noInput)inputPreview.show(previous);else{inputPreview.clear();if((source==='shared'||source==='view')&&shared?.preview){const canvas=shared.preview(source);if(canvas)q('.ct-source-preview').append(canvas);}}
 }
 async function payload(){if(noInput)return '';const source=q('.ct-source').value;if(['text','hex','base64'].includes(source)){const text=inputText();if(new TextEncoder().encode(text).length>MAX)throw Error('输入超过 32 MB。');return text;}if(source==='result'){if(!previous)throw Error('没有可继续处理的结果。');return previous.slice().buffer;}if(source==='file'){if(!localFile)throw Error('请先选择本机文件。');if(localFile.size>MAX)throw Error('文件超过 32 MB。');return localFile.arrayBuffer();}const data=await shared?.read(source);if(data===null||data===undefined)throw Error('请先在本页上方选择文件。');const bytes=data instanceof Blob?await data.arrayBuffer():data;if((typeof bytes==='string'?new TextEncoder().encode(bytes).length:bytes.byteLength||0)>MAX)throw Error('文件超过 32 MB。');return bytes;}
 function recipe(){const steps=[];const format=noInput?'text':q('.ct-source').value;if(format==='hex'||format==='base64'){const op=format==='hex'?'From Hex':'From Base64';steps.push({op,args:defaults(catalogue.operations[op])});}const operation=structuredClone(step),args=schemas(catalogue.operations[selected]);
  // Cipher operations with a Raw string input treat code units as bytes. Feed
  // an explicit hex representation so UTF-8 text is not truncated to 8 bits.
  const rawInput=args.findIndex(a=>a.name==='Input'&&a.type==='option'&&a.value.includes('Hex')&&a.value.includes('Raw'));
  if(rawInput>=0&&operation.args[rawInput]==='Raw'){steps.push({op:'To Hex',args:defaults(catalogue.operations['To Hex'])});operation.args[rawInput]='Hex';}
  steps.push(operation);return steps;}
 function validate(){const definition=catalogue.operations[selected];schemas(definition).forEach((arg,i)=>{if(q(`.ct-parameters [data-arg="${i}"]`)?.hidden)return;const v=step.args[i];if(arg.type==='number'&&(!Number.isFinite(v)||(arg.min!==undefined&&v<arg.min)||(arg.max!==undefined&&v>arg.max)||(arg.integer&&!Number.isInteger(v))))throw Error(`请检查“${parameterName(arg.name)}”的数值范围。`);});
  if(IMAGE_INPUT.has(selected)||selected==='Generate Image'||selected==='Generate QR Code'){for(const [i,arg]of schemas(definition).entries()){if(/Width|Height/.test(arg.name)&&(+step.args[i]>8192||+step.args[i]<=0))throw Error('图片宽高需为 1–8192，结果最多 8 百万像素。');if(arg.name==='Bit'&&(!Number.isInteger(step.args[i])||step.args[i]<0||step.args[i]>7))throw Error('位编号需为 0–7 的整数。');}const args=schemas(definition),width=args.findIndex(a=>a.name==='Width'),height=args.findIndex(a=>a.name==='Height');if(width>=0&&height>=0&&step.args[width]*step.args[height]>8_000_000)throw Error('目标图片超过 8 百万像素。');if(selected==='Generate QR Code'&&(step.args[1]>32||step.args[2]>64))throw Error('二维码像素尺寸最多 32，留白最多 64 个模块。');}
 }
 function adoptResult(result){
  if(!result||result.response.files)return false;
  previous=(result.export?.bytes||result.response.bytes).slice();
  previousOrigin={op:result.op,args:structuredClone(result.args),formatsApplied:false};
  q('.ct-source option[value=result]').hidden=false;q('.ct-source').value='result';
  return true;
 }
 function resultDirectionArgs(op,args){
  const origin=previousOrigin;
  if(q('.ct-source').value!=='result'||!origin||origin.formatsApplied||INVERSES[origin.op]!==op)return args;
  const sourceSchema=schemas(catalogue.operations[origin.op]),targetSchema=schemas(catalogue.operations[op]);
  // Continued bytes belong to the executed result, not to the current form.
  // Transpose only declared, compatible formats at the explicit handoff. Once
  // initialized, this direction's user-edited settings remain its own draft.
  for(const [from,to]of [['Output','Input'],['Input','Output']]){
   const sourceIndex=sourceSchema.findIndex(arg=>arg.name===from),targetIndex=targetSchema.findIndex(arg=>arg.name===to);
   if(sourceIndex<0||targetIndex<0)continue;
   const value=origin.args[sourceIndex],definition=targetSchema[targetIndex];
   if(sourceSchema[sourceIndex].type==='option'&&definition.type==='option'&&definition.value.includes(value))args[targetIndex]=structuredClone(value);
  }
  origin.formatsApplied=true;return args;
 }
 function choose(op,{preserveSource=false,sourceMode}={}){const entry=entries.find(e=>e.op===op);if(!catalogue.operations[op]||!entry)return false;selected=op;currentFamily=familyByOp.get(op)||null;renderDirections();noInput=noInputOps.has(op);root.classList.toggle('ct-generator',noInput);workspace.inputCard.hidden=noInput;step=drafts.get(op)||{op,args:defaults(catalogue.operations[op])};step.args=resultDirectionArgs(op,step.args);drafts.set(op,step);invalidate('');group=entry.group;const g=GROUPS[group];root.dataset.operation=op;help.hidden=false;helpTitle.textContent=operationName(op)+' · 操作说明';instructions.textContent=guidance(op,g,operationDescription(op,catalogue.operations[op]));q('.ct-summary').textContent=NETWORK_OPS.has(op)?'此操作会按你填写的参数联网，点击执行才发送请求。':op==='Unzip'?'ZIP 使用目录与逐条解压。':'';q('.ct-summary').hidden=!q('.ct-summary').textContent;q('.ct-run').textContent=op==='Unzip'?'查看 ZIP 目录':'转换';q('.ct-source').disabled=op==='Unzip';q('.ct-parameters').hidden=op==='Unzip';if(op==='Unzip')q('.ct-source').value='shared';renderParameters(q('.ct-parameters'),catalogue.operations[op],step,()=>{invalidate();drafts.set(op,step);});
  if(!preserveSource){if(id==='ct-image'&&q('.ct-source').value!=='result'){q('.ct-source').value=IMAGE_INPUT.has(op)?'shared':'text';}else if(shared&&!selected.startsWith('Generate')&&q('.ct-source').value==='text'&&!q('.ct-input').value)q('.ct-source').value='shared';}
  if(sourceMode&&[...q('.ct-source').options].some(option=>option.value===sourceMode))q('.ct-source').value=sourceMode;
  mode();controls();animatePresence(workspace.root);return true;}
 root.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!q('.ct-run').disabled){e.preventDefault();q('.ct-run').click();}});
q('.ct-source').onchange=()=>{rememberSource();invalidate();mode();};q('.ct-input').oninput=()=>{if(!adopting)inputSnapshot=null;invalidate();};q('.ct-file-input').onchange=e=>{localFile=e.target.files[0]||null;invalidate();mode();};q('.ct-stop').onclick=()=>invalidate('已停止处理。');
 q('.ct-run').onclick=async()=>{if(busy||!step)return;if(selected==='Unzip'){const target=document.getElementById('archive-list');target?.scrollIntoView({block:'center'});target?.click();return;}invalidate('正在准备输入…');busy=true;controls();const gen=revision;let timer;try{validate();const data=await payload();if(gen!==revision)return;const mode=q('.ct-source').value;let size=typeof data==='string'?new TextEncoder().encode(data).length:data.byteLength;if(mode==='hex')size=Math.ceil(size/2);if(mode==='base64')size=Math.ceil(size*3/4);checkImageSize(selected,step.args,size,['shared','view'].includes(mode)?shared?.dimensions?.(mode):null);timer=setTimeout(()=>{if(gen===revision)invalidate('处理超过 30 秒，已停止。请缩小输入后重试。');},30000);client=new CyberChefClient(()=>{if(gen===revision)message('正在处理，请稍候…');});const response=await client.bake(data,recipe(),{structured:true});if(gen!==revision)return;await view.show(response,selected,step.args);if(gen!==revision)return;message(`处理完成 · ${Math.round(response.duration)} ms${response.files?'':` · ${response.bytes.length.toLocaleString()} 字节`}`,false,'success');}catch(e){captureFailure(e);if(gen===revision){view.clear();message(localizedError(e.message),true);}}finally{clearTimeout(timer);if(gen===revision){client?.close();client=null;busy=false;controls();}}};
 q('.ct-use').onclick=()=>{if(!adoptResult(view.get()))return;invalidate('已将结果作为输入，可调整方向或参数后再次转换。');mode();};
 q('.ct-download').onclick=()=>{const r=view.get();if(r){const data=r.export||{bytes:r.response.bytes,kind:r.kind};download(data.bytes,operationName(selected)+'.'+(data.kind?.ext||'txt'),data.kind?.mime||'text/plain');}};q('.ct-copy').onclick=async()=>{const current=view.get();if(!current)return;try{await navigator.clipboard.writeText(current.previewText||current.text||'');if(current!==view.get())return;confirmAction(q('.ct-copy'));message('文本已复制。');}catch{if(current===view.get())message('请在结果文本框中选中并手动复制。');}};
 if(applyImage)q('.ct-apply').onclick=async()=>{const r=view.get();if(!r?.image)return;const {bytes}=r.response;await applyImage(new File([bytes],'处理结果.'+r.kind.ext,{type:r.kind.mime}));};
 let sharedFrame;const sharedListeners=[];
 for(const event of shared?.events||[]){const listener=()=>{if(['shared','view'].includes(q('.ct-source').value)){invalidate();cancelAnimationFrame(sharedFrame);sharedFrame=requestAnimationFrame(()=>{if(root.isConnected)mode();});}};document.addEventListener(event,listener);sharedListeners.push([event,listener]);}
 async function ready(){return readyPromise??=Promise.all([getCatalogue(),loadRegistry()]).then(([c,registry])=>{catalogue=c;entries=classifyCatalogue(c).filter(e=>groups.includes(e.group)&&!e.reason);families=operationFamilies(entries,registry);familyByOp=new Map(families.flatMap(family=>family.directions.map(direction=>[direction.op,family])));const start=defaultOp||entries[0]?.op;if(start)choose(start);if(shared&&id!=='ct-image'){q('.ct-source').value='shared';mode();}return true;}).catch(e=>{message(e.message,true);readyPromise=null;return false;});}
 function compatibleDirectionArgs(targetOp){
  // A topic contains related actions, not a promise that each is an inverse.
  // Only the canonical explicit inverse may transfer compatible parameters.
  // Other actions retain their own draft/defaults, including signing keys.
  if(!step||INVERSES[selected]!==targetOp)return structuredClone(drafts.get(targetOp)?.args||defaults(catalogue.operations[targetOp]));
  const source=catalogue.operations[selected],target=catalogue.operations[targetOp],sourceSchema=schemas(source),targetSchema=schemas(target);
  const compatible=inverseArgs(source,target,step.args,schemas,defaults),args=structuredClone(drafts.get(targetOp)?.args||defaults(target));
  targetSchema.forEach((arg,i)=>{
   // These format controls describe different sides of a directed operation.
   // A plaintext input format cannot replace a ciphertext input format merely
   // because the schema names match. Keep this direction's own draft/default;
   // only an explicitly adopted result may initialize them from its origin.
   if(arg.name==='Input'||arg.name==='Output')return;
   const from=sourceSchema.findIndex(candidate=>candidate.name===arg.name&&candidate.type===arg.type);if(from<0)return;
   const value=step.args[from];
   if(['option','argSelector','populateOption','populateMultiOption'].includes(arg.type)&&Array.isArray(arg.value)&&!arg.value.some(option=>(typeof option==='object'?option.name:option)===value))return;
   if(arg.type==='number'&&(!Number.isFinite(value)||arg.min!==undefined&&value<arg.min||arg.max!==undefined&&value>arg.max||arg.integer&&!Number.isInteger(value)))return;
   if(arg.type==='toggleString'&&(!value||!arg.toggleValues.includes(value.option)))return;
   args[i]=structuredClone(compatible[i]);
  });
  return args;
 }
 function selectDirection(op){
  if(capability?.mixed)return;
  if(!currentFamily?.directions.some(direction=>direction.op===op)||op===selected)return;
  drafts.set(op,{op,args:compatibleDirectionArgs(op)});
  choose(op,{preserveSource:true});
  if(capability)document.dispatchEvent(new CustomEvent('arg:capability-direction',{detail:{panel:GROUPS[group].panel,capabilityId:capability.id,op}}));
 }
 async function selectCapability(detail){
  rememberSource();
  const request=++selectionRevision;
  const sameFamily=familyByOp.get(detail?.op||detail?.operationId)?.id===currentFamily?.id;
  const nextOp=detail?.op||detail?.operationId;
  if(step&&sameFamily&&nextOp!==selected)drafts.set(nextOp,{op:nextOp,args:compatibleDirectionArgs(nextOp)});
  capability={id:String(detail?.capabilityId||''),directions:[],mixed:detail?.topicKind==='mixed'};root.dataset.capabilityId=capability.id;root.dataset.display='capability';if(!sameFamily){directionBar.hidden=true;directionSelect.replaceChildren();}step=null;invalidate('');
  if(!await ready()||request!==selectionRevision)return false;
  const op=detail?.op||detail?.operationId;
  if(!entries.some(entry=>entry.op===op)){selected='';step=null;delete root.dataset.operation;helpTitle.textContent='无法打开操作';instructions.textContent='';q('.ct-parameters').replaceChildren();message('当前任务不支持此操作。',true);workspace.root.hidden=false;controls();return false;}
  // Directions come from the same registry projection as discovery. Request
  // metadata cannot fabricate a reverse or cross an engine boundary.
  capability.directions=familyByOp.get(op)?.directions||[{op,label:operationName(op)}];
  workspace.root.hidden=false;
  const source=q('.ct-source').value;
  // Keep the original input object. Switching direction invalidates the output,
  // while explicit result-continuation actions adopt output bytes as input.
  const preserveSource=source==='result'||source==='file'||['text','hex','base64'].includes(source)&&!!q('.ct-input').value||['shared','view'].includes(source);
  // Related actions can require wholly different source kinds. Generation
  // starts with text, recognition with the unchanged original image; each
  // action then remembers the player's explicit file/view/result choice.
  const sourceMode=capability.mixed?(source==='result'?'result':sourceDrafts.get(op)||(id==='ct-image'&&IMAGE_INPUT.has(op)?'shared':'text')):undefined;
  choose(op,{preserveSource,sourceMode});
  return true;
 }
 function deactivate(){rememberSource();selectionRevision++;help.hidden=true;invalidate('');}
 function getInput(){
  const source=q('.ct-source').value;
  if(['text','hex','base64'].includes(source))return {kind:'text',source,text:inputText()};
  if(source==='file'&&localFile)return {kind:'file',source,file:localFile};
  if(source==='result'&&previous)return {kind:'bytes',source,bytes:previous.slice()};
  return null;
 }
 function adopt(value){
  const input=normalizeInputSource(value);if(!input)return false;
  previousOrigin=null;invalidate('');
  if(input.kind==='text'){
   q('.ct-source').value=input.source;setTextareaValue(q('.ct-input'),input.text,{feedback:false});inputSnapshot={text:input.text,display:q('.ct-input').value};
   adopting=true;try{q('.ct-input').dispatchEvent(new Event('input',{bubbles:true}));}finally{adopting=false;}
  }else if(input.kind==='bytes'){
   previous=input.bytes;q('.ct-source option[value=result]').hidden=false;q('.ct-source').value='result';
  }else if(input.kind==='file'){
   localFile=input.file;q('.ct-file-input').value='';q('.ct-source').value='file';
  }
  mode();controls();return true;
 }
 onDisconnect(root,()=>{selectionRevision++;revision++;client?.close();client=null;busy=false;cancelAnimationFrame(sharedFrame);for(const [event,listener]of sharedListeners)document.removeEventListener(event,listener);view.clear();});
 controls();return{root,help,ready,selectCapability,deactivate,getInput,adopt,getOperation:()=>selected||defaultOp,refresh:mode};
}
