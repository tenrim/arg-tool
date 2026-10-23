import {musicClue} from './tonal-model.js';
import {Button,Card,Field,FormGrid,Input,Option,Select,Status,Textarea,Toolbar,onDisconnect,setTextareaValue,updateStatus} from '../ui/index.js';
import {resultRecording} from '../result-recording.js';
export function mountTonal(panel){
 const operation=Select({id:'tonal-operation',children:[Option('两个音符之间的音程','distance'),Option('按半音数移调','transpose')]}),first=Input({id:'tonal-first',value:'C4'}),second=Input({id:'tonal-second',value:'G4'}),output=Textarea({id:'tonal-output',autoSize:true,maxRows:12,attrs:{readonly:true,'aria-label':'音程与移调结果'}}),run=Button({text:'计算音程／移调'}),status=Status({});
 const secondField=Field({label:'第二个音符',control:second}),root=Card({id:'tonal-native',title:'音程与移调',children:[FormGrid({children:[Field({label:'计算内容',control:operation}),Field({label:'起始音符（如 C4、F#3、Bb4）',control:first}),secondField]}),Toolbar({children:[run]}),status,output]});panel.querySelector('.tool-provenance').before(root);
 const recording=resultRecording({id:'tonal-native-result',anchor:output,panel}),label=secondField.querySelector('.ui-field-label');
 const clear=()=>{recording.clear();setTextareaValue(output,'');updateStatus(status,'');};
 operation.onchange=()=>{clear();(label||secondField.firstElementChild).textContent=operation.value==='distance'?'第二个音符':'移调半音数（负数向下）';second.value=operation.value==='distance'?'G4':'7';};
 first.oninput=second.oninput=clear;
 run.onclick=()=>{clear();try{const text=musicClue(operation.value,first.value,second.value).map(row=>row.join('：')).join('\n');setTextareaValue(output,text);recording.publish({text,name:'音程与移调.txt'});updateStatus(status,'计算完成','success');}catch(e){updateStatus(status,e.message,'error');}};
 const leave=({detail})=>{if(detail?.name!=='audio')clear();},task=({detail})=>{if(detail?.panel==='audio')clear();};document.addEventListener('arg:panelchange',leave);document.addEventListener('arg:nativetaskchange',task);onDisconnect(root,()=>{clear();document.removeEventListener('arg:panelchange',leave);document.removeEventListener('arg:nativetaskchange',task);});return root;
}
