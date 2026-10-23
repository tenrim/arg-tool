import {Box,DataList} from './layout.js';
import {Disclosure} from './overlays.js';

// Dataset owners provide a display projection; exports never read this DOM.
export function RecordDetails({items=[],supplementary=[],original=[],raw,links}={}){
 const root=Box({});root.append(DataList({items,attrs:{'data-record-section':'primary'}}));
 if(supplementary.length)root.append(Disclosure({children:[Box({tag:'summary',text:'更多资料'}),DataList({items:supplementary})]}));
 root.append(Disclosure({attrs:{'data-record-section':'original'},children:[Box({tag:'summary',text:'完整原始字段与资料说明'}),DataList({items:original}),links,Box({tag:'pre',text:JSON.stringify(raw,null,2),attrs:{'data-record-raw':''}})]}));
 return root;
}
