import {Dialog,dialogController,Button,Box,Toolbar,Result,Status,Select,Option,Input,SearchField,Disclosure,updateStatus,onDisconnect} from '../ui/index.js';
import {loadRegistry,searchEntries} from '../capabilities/registry.js';
import {getCatalogue,IMAGE_INPUT} from '../chef-tools/catalog.js';
import {connectHandoff} from './button.js';
import {snapshot,recommendations,compatibleTargets,groupTargets} from './model.js';

export function mountHandoff({receive,needsReplace}) {
  const title=Box({tag:'h2',id:'handoff-title',text:'选择下一步工具'}),close=Button({text:'关闭'});
  const summary=Box({tag:'p'}),status=Status({id:'handoff-status'}),list=Result({layout:'collection'}),files=Select({attrs:{'aria-label':'选择要交给其他工具的结果文件'},hidden:true});
  const dialog=Dialog({id:'handoff-dialog',className:'ui-flow-dialog',attrs:{'aria-labelledby':'handoff-title'},children:[Toolbar({children:[title,close]}),summary,files,list,status]});
  document.body.append(dialog);const modal=dialogController(dialog,{closeButton:close,initialFocus:close});
  let revision=0,request=null,data=null,registry=null,catalogue=null,items=[];
  function clear(){revision++;request=null;data=null;items=[];list.replaceChildren();files.replaceChildren();}
  dialog.addEventListener('close',clear);
  function fold(title,build,attrs={},expanded=false){
    const content=Box({className:'ui-flow-group'}),node=Disclosure({className:'ui-flow-branch',attrs,children:[Box({tag:'summary',text:title}),content]});let rendered=false;
    const populate=()=>{if(node.open&&!rendered){rendered=true;content.append(...build());}};
    node.addEventListener('toggle',populate);node.open=expanded;populate();return node;
  }
  function targetButton(target,rev,recommended=false){
    const direction=(target.entry.actions||target.entry.directions)?.find(d=>d.op===target.op)?.label;
    return Button({layout:'stacked',attrs:{'data-handoff-target':target.op||target.entry.id},children:[Box({tag:'strong',text:target.entry.title+(direction?' · '+direction:'')}),...(recommended?[Box({tag:'span',text:target.reason})]:[])],on:{click:()=>choose(target,rev)}});
  }
  function renderChoices(rev){
    const targets=recommendations(data,request.source,registry).slice(0,3),recommended=Box({attrs:{'data-handoff-section':'recommended'},children:[Box({tag:'h3',text:'优先推荐'})]});
    for(const category of groupTargets(targets,registry))recommended.append(Box({className:'ui-flow-category',attrs:{'data-handoff-category':category.id},children:[Box({tag:'h4',text:category.title}),...category.groups.map(group=>Box({className:'ui-flow-group',attrs:{'data-handoff-group':group.id},children:[Box({tag:'h5',text:group.title}),Result({layout:'collection',children:group.targets.map(target=>targetButton(target,rev,true))})]}))]}));
    const others=compatibleTargets(data,registry,catalogue,IMAGE_INPUT),all=Box({attrs:{'data-handoff-section':'all'}}),search=Input({id:'handoff-search',type:'search',placeholder:'搜索可接收结果的工具'});
    const draw=()=>{
      const query=search.value.trim(),matches=new Set(searchEntries({entries:others.map(target=>target.entry)},query).map(entry=>entry.id));
      const filtered=query?others.filter(target=>matches.has(target.entry.id)):others;recommended.hidden=!!query;
      const tree=groupTargets(filtered,registry);
      all.replaceChildren(...tree.map(category=>fold(`${category.title} · ${category.count} 项`,()=>category.groups.map(group=>fold(`${group.title} · ${group.targets.length} 项`,()=>group.targets.map(target=>{
        if(target.directions.length===1)return targetButton({...target,op:target.directions[0].op},rev);
        return Box({className:'ui-flow-family',children:[Box({tag:'strong',text:target.entry.title}),Toolbar({attrs:{'aria-label':target.entry.title+(target.entry.topic?'处理操作':'处理方向')},children:target.directions.map(direction=>Button({text:direction.label,attrs:{'data-handoff-target':direction.op,'aria-label':target.entry.title+' · '+direction.label},on:{click:()=>choose({entry:target.entry,op:direction.op},rev)}}))})]});
      }),{'data-handoff-group':group.id},!!query)),{'data-handoff-category':category.id},!!query)));
      if(!tree.length)all.append(Box({tag:'p',text:'没有找到可接收当前结果的工具。'}));
    };
    search.addEventListener('input',draw);draw();
    list.replaceChildren(recommended,Box({tag:'h3',text:'按分类选择'}),SearchField({label:'搜索可接收结果的工具',control:search}),all);
  }
  async function selectFile(index){
    const rev=++revision;list.replaceChildren();data=null;
    try {
      if(!request?.isCurrent())throw Error('来源结果已改变，请关闭后重新执行。');
      const value=items[index];const input=value instanceof Blob?{bytes:new Uint8Array(await value.arrayBuffer()),name:value.name}:value;
      if(rev!==revision)return;if(!request?.isCurrent())throw Error('来源结果已改变，请关闭后重新执行。');
      data=snapshot(input);summary.textContent=`${data.bytes.length.toLocaleString()} 字节 · ${data.mime.startsWith('image/')?'图片':data.mime.startsWith('text/')?'文字':'文件 / 字节'}`;
      renderChoices(rev);
      updateStatus(status,'');
    } catch(error){if(rev===revision)updateStatus(status,error.message,'error');}
  }
  async function choose(target,rev,confirmed=false){
    if(rev!==revision||!data||!request?.isCurrent()){updateStatus(status,'来源结果已失效，请重新执行后再选择。','error');return;}
    if(!confirmed&&needsReplace(target,data)){
      list.replaceChildren(Box({tag:'p',text:'目标工具已有输入。替换后不会自动执行。'}),Toolbar({children:[Button({text:'替换并继续',variant:'primary',on:{click:()=>choose(target,rev,true)}}),Button({text:'返回推荐',on:{click:()=>selectFile(Number(files.value)||0)}})]}));return;
    }
    const captured=data;list.replaceChildren();updateStatus(status,'正在载入目标工具…');
    try{if(await receive(target,captured,()=>rev===revision&&dialog.open)){modal.close();}else if(rev===revision)updateStatus(status,'目标未接收结果。可以关闭后重试。','error');}
    catch(error){if(rev===revision)updateStatus(status,error.message,'error');}
  }
  files.addEventListener('change',()=>selectFile(Number(files.value)));
  const disconnect=connectHandoff(async value=>{
    clear();request=value;const rev=revision;files.hidden=true;summary.textContent='正在准备推荐…';updateStatus(status,'');modal.open();
    try{const result=await value.read();[registry,catalogue]=await Promise.all([loadRegistry(),getCatalogue()]);if(rev!==revision)return;if(!value.isCurrent())throw Error('来源结果已改变，请关闭后重新执行。');
      items=result?.files?.length?[...result.files]:[result];files.hidden=items.length<2;
      files.replaceChildren(...items.map((item,i)=>Option(item.name||`结果 ${i+1}`,String(i))));await selectFile(0);
    }catch(error){if(rev===revision)updateStatus(status,error.message,'error');}
  });
  onDisconnect(dialog,()=>{clear();disconnect();modal.destroy();});return {dialog};
}
