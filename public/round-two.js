import {element as uiElement} from './ui/index.js';
import {$,button,field,setStatus} from './round1/common.js';
import {absorb,tabs,surface} from './round2/common.js';
import {initMusic,initMidi} from './round2/music.js';
import {initComparisons} from './round2/images.js';
import {initArchive} from './round2/archive.js';
import {initCoordinates} from './round2/coordinates.js';
export function initRoundTwo({getAudio,getImage,getFile}){
 const audio=$('panel-audio'),audioSurface=audio.querySelector('.surface'),signal=uiElement('div'),signalSurface=surface('');
 signalSurface.dataset.nativeSection='spectrum';
 // Keep the shared upload, player, waveform and status visible. Move existing nodes to preserve listeners.
 let moving=false;for(const child of [...audioSurface.children]){if(child.matches('.spectrogram-controls'))moving=true;if(moving&&child.id!=='audio-status')signalSurface.append(child);}signal.append(signalSurface);
 for(const child of [...audio.children])if(child!==audioSurface&&!child.matches('.page-heading,.tool-provenance')){if(child.querySelector('#sstv-run'))child.dataset.nativeSection='sstv';signal.append(child);}
 const play=absorb('instruments',audio);let selectAudio;const music=initMusic(audio,getAudio,id=>selectAudio(id));initMidi(audio,play);
 selectAudio=tabs(audio,'audio',[['signal','信号分析',signal],['music','音高与乐理',music],['play','弹奏与 MIDI',play]]);
 const image=$('panel-image'),base=image.querySelector('.surface'),analysis=uiElement('div'),analysisSurface=surface('');
 for(const child of [...base.children])if(!child.matches('.upload-zone,#image-info'))analysisSurface.append(child);analysis.append(analysisSurface);
 for(const child of [...image.children])if(child!==base&&!child.matches('.page-heading,.tool-provenance'))analysis.append(child);
 const repair=absorb('qrrepair',image),shared=surface(`<h2>二维码修复</h2><div class="r1-controls">${field('沿用图片来源',`<select id="qr-shared-source"><option value="original">原始图片</option><option value="view">当前处理视图</option></select>`)}${button('qr-use-image','使用上方图片',true)}</div>`);repair.prepend(shared);
 $('qr-use-image').onclick=()=>{try{const original=getImage();if(!original)throw Error('请先在上方选择图片。');let canvas=$('image-canvas');if($('qr-shared-source').value==='original'){canvas=uiElement('canvas');canvas.width=original.width;canvas.height=original.height;canvas.getContext('2d').putImageData(new ImageData(original.pixels,original.width,original.height),0,0);}document.dispatchEvent(new CustomEvent('arg:qr-source',{detail:{source:canvas}}));}catch(e){setStatus('qr-status',e.message,true);}};
 const comparison=initComparisons(image,getImage),selectImage=tabs(image,'image',[['analysis','图像与隐写',analysis],['compare','比较与取色',comparison],['repair','二维码修复',repair]]);
 comparison.children[0].dataset.nativeSection='compare';comparison.children[1].dataset.nativeSection='color';
 initArchive($('panel-file'),getFile);$('archive-list').closest('.surface').dataset.nativeSection='archive';initCoordinates();
 for(const id of ['compare-input','midi-input','archive-create-files','qr-image']){const input=$(id),wrapper=uiElement('span'),caption=uiElement('span');wrapper.className='r2-file';caption.textContent=input.multiple?'选择多个文件':'选择文件';input.before(wrapper);wrapper.append(input,caption);}
 return{selectAudio,selectImage};
}
