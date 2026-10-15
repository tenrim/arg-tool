import {element as uiElement, Box} from '../ui/index.js';
import {$,mount} from '../round1/common.js';
import {taskView} from './task-view.js';
import {appendToolHelpContent} from '../tool-help.js';
const provenance=['CyberChef 11.5.0','https://github.com/gchq/CyberChef','官方本地运算引擎 · Apache-2.0；本站提供中文任务界面、参数表单和结果预览'];
const panels=[['crypto','加解密',['classical','machines','symmetric','publickey','signatures','credentials','derivation','certificates'],'ROT13'],['encoding','编码转换',['base','radix','charset','webencoding','symbolic','binaryencoding'],'From Base64'],['language','语言与文字变体',['language'],'Convert to NATO alphabet'],['textlab','文字整理与提取',['clean','extract','compare'],'Find / Replace'],['datalab','格式与数据',['format','code','charts'],'CSV to JSON'],['networklab','网络数据',['network'],'Parse URI'],['mathlab','数值与单位',['maths','units'],'Sum']];
function addSource(panel){const footer=panel.querySelector('.tool-provenance');if([...footer.querySelectorAll('a')].some(a=>a.href===provenance[1]))return;const p=uiElement('p'),a=uiElement('a');a.href=provenance[1];a.target='_blank';a.rel='noopener noreferrer';a.textContent=provenance[0];p.append(a,document.createTextNode(' · '+provenance[2]));footer.append(p);}
export function mountChefTools(){
 const tasks=new Map();let activeTask=null,activationRevision=0;
 for(const [id,title,groups,defaultOp]of panels){const panel=mount(id,title,'',[provenance]),task=taskView({id:'ct-'+id,groups,defaultOp});panel.querySelector('.tool-provenance').before(task.root);appendToolHelpContent(id,task.help);tasks.set(id,task);}
 let connected=null;
 async function selectCapability(detail){
  const revision=++activationRevision;
  const task=tasks.get(detail?.panel);if(!task)return false;
  if(activeTask&&activeTask!==task)activeTask.deactivate();activeTask=task;
  if(detail.panel==='image')connected?.roundTwo.selectImage('edit');
  if(detail.panel==='audio')connected?.roundTwo.selectAudio('metadata');
  const selected=await task.selectCapability(detail);
  return revision===activationRevision&&selected;
 }
 function deactivate(){activationRevision++;activeTask?.deactivate();activeTask=null;}
 function connect({imageTools,roundTwo,getFile,getAudioFile,material}){connected={imageTools,roundTwo};$('panel-image').querySelector('h1').textContent='图片处理与隐写';
  const imageShared={label:()=>{const input=material?.getMaterial('image');return input?'原始图片 · '+input.name:'沿用原始图片';},info:source=>{const input=material?.getMaterial('image',source==='view'?'view':'original');return input?input.name+' · '+input.width+' × '+input.height:'';},dimensions(source){const image=imageTools.getImage();return image?(source==='view'?[$('image-canvas').width,$('image-canvas').height]:[image.width,image.height]):null;},events:['arg:imagechange','arg:imageready','arg:imageviewchange'],async read(source){if(material)return material.getMaterial('image',source==='view'?'view':'original')?.read()??null;const image=imageTools.getImage();if(!image)return null;if(source==='shared')return image.file;return new Promise((resolve,reject)=>$('image-canvas').toBlob(blob=>blob?resolve(blob):reject(Error('无法读取当前图片视图。')),'image/png'));},preview(source){const image=imageTools.getImage();if(!image)return null;const canvas=uiElement('canvas');if(source==='view'){canvas.width=$('image-canvas').width;canvas.height=$('image-canvas').height;canvas.getContext('2d').drawImage($('image-canvas'),0,0);}else{canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.pixels),image.width,image.height),0,0);}canvas.setAttribute('aria-label','输入图片预览');return canvas;}};
  const image=taskView({id:'ct-image',groups:['imageEdit','imageColour','imageInspect','imageMake'],defaultOp:'Resize Image',shared:imageShared,applyImage:async file=>{await imageTools.load(file);document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:'native:image'}}));}});tasks.set('image',image);(()=>{const wrap=uiElement('div');wrap.append(image.root);roundTwo.selectImage.add('edit','编辑与生成',wrap);})();addSource($('panel-image'));
  const audio=taskView({id:'ct-audio',groups:['audio'],shared:{events:['arg:audiochange','arg:audioready'],label:()=>{const file=getAudioFile();return file?'原始音频 · '+file.name:'沿用原始音频';},info:()=>getAudioFile()?.name||'',read:()=>material?material.getMaterial('audio')?.read()??null:getAudioFile()},defaultOp:'Extract Audio Metadata'});tasks.set('audio',audio);(()=>{const wrap=uiElement('div');wrap.append(audio.root);roundTwo.selectAudio.add('metadata','文件标签',wrap);})();addSource($('panel-audio'));
  for(const [panel,id,groups,defaultOp,shared]of [
   ['file','ct-file',['hashes','compression','inspect'],'SHA2',{events:material?['arg:materialchange']:['arg:filechange','arg:fileready'],label:()=>{const source=material?.getMaterial('current');return source?'当前素材 · '+source.name:'沿用当前素材';},info:()=>material?.getMaterial('current')?.name||'',read:()=>material?material.getMaterial('current')?.read()??null:getFile()?.slice().buffer}],
   ['analysis','ct-statistics',['statistics'],'Entropy',{events:['arg:cipherchange'],label:'沿用上方密文',description:'使用本页“待分析文本”的当前内容。',read:()=>$('analysis-input').value}],
   ['coordinates','ct-time',['time'],'Parse DateTime',null],
   ['video','ct-media',['media'],'Play Media',{events:['arg:videochange'],label:()=>{const file=$('video-file').files[0];return file?'所选媒体 · '+file.name:'沿用所选媒体';},info:()=>$('video-file').files[0]?.name||'',read:()=>material?material.getMaterial('video')?.read()??null:$('video-file').files[0]}]
  ]){const task=taskView({id,groups,shared,defaultOp}),section=Box({className:'ct-extension'});section.append(task.root);$(('panel-'+panel)).querySelector('.tool-provenance').before(section);tasks.set(panel,task);addSource($('panel-'+panel));
  }
  $('analysis-input').addEventListener('input',()=>document.dispatchEvent(new Event('arg:cipherchange')));
  $('video-file').addEventListener('change',()=>document.dispatchEvent(new Event('arg:videochange')));
  document.addEventListener('arg:subpanelchange',e=>{if(e.detail.panel==='image'&&e.detail.id==='edit')image.ready();if(e.detail.panel==='audio'&&e.detail.id==='metadata')audio.ready();});
  for(const [panel,task] of tasks)if(!panels.some(([id])=>id===panel))appendToolHelpContent(panel,task.help);
 }
 return{connect,tasks,selectCapability,activate:selectCapability,deactivate,getTask:panel=>tasks.get(panel),getInput:panel=>tasks.get(panel)?.getInput()||null,adopt:(panel,input)=>tasks.get(panel)?.adopt(input)||false};
}
