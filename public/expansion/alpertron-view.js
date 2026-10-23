import {Box, Button, CheckGroup, ConversionWorkbench, DataList, Disclosure, Field, FilePicker, Input, Notice, Option, Select, ToolHeader, ToolPanel, Toolbar, Link, onDisconnect, updateStatus} from '../ui/index.js';
import {ALPERTRON_CALCULATORS, ALPERTRON_LIMITS} from './alpertron-catalog.js';
import {AlpertronClient} from './alpertron-client.js';
import {taskSession} from './session.js';

let functionReference;
const loadFunctions = () => functionReference ||= fetch(new URL('../vendor/expansion/alpertron/functions.json', import.meta.url), {credentials: 'same-origin', mode: 'same-origin', redirect: 'error'})
  .then(response => {if (!response.ok) throw Error('函数说明载入失败，请重试。'); return response.json();})
  .catch(error => {functionReference = null; throw error;});
const optionSelect = (id, options, value) => {
  const control = Select({id, children: options.map(([key, text]) => Option(text, key))}); control.value = String(value); return control;
};
export function mountAlpertron(host) {
  const panels = [], sessions = new Map();
  for (const calculator of ALPERTRON_CALCULATORS) {
    const id = 'number-' + calculator.id, controls = new Map(), settings = [];
    const action = optionSelect(id+'-action', calculator.actions.map(item => [item.id, item.label]), calculator.actions[0].id);
    settings.push(Field({label: '操作', control: action}));
    for (const definition of calculator.fields) {
      if (definition.name === 'expression') continue;
      let control;
      if (definition.type === 'select') control = optionSelect(id+'-'+(definition.name === 'output' ? 'output-format' : definition.name), definition.options, definition.value);
      else {
        control = Input({id: id+'-'+definition.name, type: definition.type === 'checkbox' ? 'checkbox' : definition.type || 'text', value: definition.type === 'checkbox' ? undefined : definition.value,
          attrs: {spellcheck:'false', ...(definition.min !== undefined ? {min:definition.min} : {}), ...(definition.step !== undefined ? {step:definition.step} : {})}});
        if (definition.type === 'checkbox') control.checked = !!definition.value;
      }
      controls.set(definition.name, control);
      const field = Field({label: definition.label, control});
      settings.push(definition.type === 'checkbox' ? CheckGroup({label: definition.label, children:[field]}) : field);
    }
    const digits = Input({id:id+'-digits',type:'number',value:'0',attrs:{min:0,max:20,step:1}});
    const timeout = optionSelect(id+'-timeout', [['30000','30 秒'],['60000','1 分钟'],['120000','2 分钟'],['300000','5 分钟']], '30000');
    settings.push(Field({label:'每次计算时限',control:timeout}), Field({label:'数字分组长度（0 为不分组）',control:digits}));
    let hexadecimal, verbose;const reportOptions=[];
    {
      hexadecimal = Input({id:id+'-hexadecimal',type:'checkbox'});
      reportOptions.push(Field({label:'十六进制输出',control:hexadecimal}));
    }
    {
      verbose = Input({id:id+'-verbose',type:'checkbox'});
      reportOptions.push(Field({label:'保留完整详细报告',control:verbose}));
    }
    settings.push(CheckGroup({label:'报告选项',children:reportOptions}));
    const view = ConversionWorkbench({id,settings,inputLabel:'数值表达式／批处理',resultLabel:'完整计算报告'});
    view.run.textContent = '计算'; view.input.maxLength = ALPERTRON_LIMITS.inputBytes;
    const readOptions = () => {
      const values = {calculator:calculator.id,action:action.value,digits:Number(digits.value),timeoutMs:Number(timeout.value)};
      for (const [key,control] of controls) values[key] = control.type === 'checkbox' ? control.checked : control.value;
      if (hexadecimal) values.hexadecimal = hexadecimal.checked;
      if (verbose) values.verbose = verbose.checked;
      return values;
    };
    const client = new AlpertronClient();
    const continueButton = Button({id:id+'-continue',text:calculator.supportsBatch ? '继续批处理' : '继续展开',disabled:true});
    const divisors = Button({id:id+'-divisors',text:'列出全部除数',disabled:true});
    const advanced = Toolbar({children:[continueButton,divisors]});
    view.stop.after(advanced); continueButton.hidden = true;
    let command = null, session, fileRevision = 0;
    const invalidate = () => {
      fileRevision++;
      if (client.pending) client.cancel();
      continueButton.disabled = divisors.disabled = true;
      continueButton.hidden = true;
    };
    session = taskSession(view, {id,options:readOptions,
      onInvalidate:invalidate,
      execute: async (input,options,{signal,onProgress}) => {
        const selectedCommand = command; command = null;
        const abort = () => client.cancel();
        if (signal.aborted) {abort(); throw Object.assign(Error('已停止'),{name:'AbortError'});}
        signal.addEventListener('abort',abort,{once:true});
        try {
          const observe = {onProgress:progress => {if (progress.text) onProgress(progress);}, timeoutMs:options.timeoutMs};
          const result = selectedCommand === 'C' ? await client.continue(observe)
            : selectedCommand === 'D' ? await client.divisors(observe)
            : await client.run({...options,expression:input},observe);
          return {...result,output:result.text,value:{text:result.text},status:result.paused ? `本批已完成，点击“${continueButton.textContent}”处理后续内容。` : '本地计算完成'};
        } finally {signal.removeEventListener('abort',abort);}
      },
      render:result => {
        continueButton.hidden = !result.paused; continueButton.disabled = !result.paused;
        divisors.disabled = !client.canInspectFactorization;
        if (result.action === 'D') divisors.textContent = result.more ? '展开更多除数' : '重新列出全部除数';
      },
    });
    const follow = code => {command = code; void session.run();};
    continueButton.onclick = () => follow('C'); divisors.onclick = () => follow('D');
    const file = Input({id:id+'-batch-file',type:'file',attrs:{accept:'.txt,.csv,text/plain,text/csv'}});
    if (calculator.supportsBatch) {
      view.parameters.append(FilePicker({input:file,triggerLabel:calculator.supportsBatch ? '载入文本／批处理文件' : '载入表达式文件'}));
      file.addEventListener('change',async () => {
        const selected = file.files?.[0], revision = ++fileRevision;
        file.value = '';
        if (!selected) return;
        try {
          if (selected.size > ALPERTRON_LIMITS.inputBytes) throw Error('批处理文件超过 900,000 字节限制。');
          const text = new TextDecoder('utf-8',{fatal:true}).decode(await selected.arrayBuffer());
          if (revision !== fileRevision) return;
          session.adopt(text); updateStatus(view.status,'已载入本地文本文件，尚未执行。');
        } catch (error) {if (revision === fileRevision) updateStatus(view.status,error.message,'error');}
      });
    }
    let focusedInput = view.input;
    for (const control of [view.input,...controls.values()]) control.addEventListener('focus',() => {if (!control.readOnly && !['number','checkbox'].includes(control.type) && control.tagName !== 'SELECT') focusedInput = control;});
    const functions = Disclosure({attrs:{'data-tool-help':''},children:[Box({tag:'summary',text:calculator.supportsBatch ? '完整表达式函数与批处理语法' : '完整表达式函数与语法'}),Notice({text:'保留固定上游的表达式函数。点击函数可插入相应输入字段；表达式按上游运算规则计算。'})]});
    const functionStatus = Notice({text:''}); functions.append(functionStatus);
    functions.append(Link({text:'下载固定完整上游源码（GPL）',attrs:{href:new URL('../vendor/expansion/alpertron/source.tar.gz',import.meta.url).href,download:'alpertron-source.tar.gz'}}));
    if(calculator.id==='integer')functions.append(Disclosure({children:[Box({tag:'summary',text:'查询外部已知分解记录（FactorDB）'}),Box({tag:'p',text:'FactorDB 是第三方分解记录库，可能包含现成因数或部分分解，与本页本地算法计算不同。打开后由你手动输入整数；本站不代理查询，也不会自动发送当前数值。请核对对方记录状态，查不到结果不代表素数。'}),Link({text:'打开 FactorDB',attrs:{href:'https://factordb.com/',target:'_blank',rel:'noopener noreferrer'}})]}));
    let functionsLoaded = false, disconnected = false;
    functions.addEventListener('toggle',async () => {
      if (!functions.open || functionsLoaded) return;
      functionsLoaded = true;
      try {
        const reference = (await loadFunctions())[calculator.id];
        if (disconnected) return;
        for (const group of reference?.groups || []) {
          const tools = Toolbar({className:'expansion-function-keys'});
          for (const entry of group.functions) {
            const button = Button({text:entry.label,attrs:{title:entry.description}});
            button.onclick = () => {
              const target = group.target === 'expression' ? view.input : group.target ? controls.get(group.target) : focusedInput; if (!target || target.readOnly || target.disabled) return;
              target.focus(); const start = target.selectionStart ?? target.value.length;
              target.setRangeText(entry.insert,target.selectionStart ?? target.value.length,target.selectionEnd ?? target.value.length,'end');
              const offset = entry.insert.includes('(') ? entry.insert.indexOf('(')+1 : entry.insert.length;
              target.setSelectionRange(start+offset,start+offset); target.dispatchEvent(new Event('input',{bubbles:true}));
            };
            tools.append(button);
          }
          functions.append(Disclosure({children:[Box({tag:'summary',text:group.name}),tools]}));
        }
        const notes = [['限制','表达式仅接受 ASCII 语法；不是 JavaScript，不执行页面脚本。最多 900,000 字节输入、累计 32 MB 报告。']];
        if (calculator.supportsBatch) notes.unshift(['多行','每行一条表达式，保持上游原始执行顺序。'],['循环','x=初值;x=更新式;循环条件;输出表达式;可选筛选条件'],['循环实例','x=1;x=x+1;x<=5;x^2 → 1、4、9、16、25'],['继续','每批最多 1000 项；继续会保留并累计之前各批结果。']);
        notes.push(['Ans','上次答案仅在当前本地引擎会话有效；停止或离开页面会释放会话。']);
        functions.append(DataList({items:notes}));
        functionStatus.remove();
      } catch (error) {functionsLoaded = false; functionStatus.textContent = error.message;}
    });
    const panel = ToolPanel({id:'panel-'+id,className:'panel expansion-panel',hidden:true,header:ToolHeader({className:'page-heading',title:calculator.title}),body:[view.root,functions]});
    const leave = ({detail}) => {if (detail?.name !== id) client.cancel('已离开数论工作区');};
    document.addEventListener('arg:panelchange',leave);
    onDisconnect(panel,() => {disconnected = true; fileRevision++; client.destroy(); document.removeEventListener('arg:panelchange',leave);});
    host.append(panel); panels.push(panel); sessions.set(id,session);
  }
  return {panels,sessions};
}
