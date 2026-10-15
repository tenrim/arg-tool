import {element as uiElement, Table, setState, updateStatus, animatePresence} from '../ui/index.js';
import {$,field,button,status,mount,download,copy,esc} from '../round1/common.js';
import {LANGUAGES,MAX_SOURCE,MAX_OUTPUT,ookToBrainfuck,visibleWhitespace,errorText} from './model.js';
const sources=[
 ['Esolang Park','https://github.com/nilaymaj/esolang-park','Brainfuck、Befunge-93、Deadfish 的解释与单步核心；Ook! 使用本站语法转换层复用 Brainfuck'],
 ['Whitespace-JS','https://github.com/susisu/Whitespace-JS','Whitespace 解析、32 位虚拟机与指令执行（含 loquat、co 依赖）'],
 ['malbolge-vm','https://github.com/zb3/malbolge-vm','Malbolge 校验、逐步执行、寄存器与内存'],
 ['Pyodide','https://github.com/pyodide/pyodide','CPython 3.13 的浏览器运行环境与标准库'],
 ['quickjs-emscripten','https://github.com/justjake/quickjs-emscripten','QuickJS JavaScript 独立运行环境'],
 ['Wasmoon','https://github.com/ceifa/wasmoon','Lua 5.4 的本地 WebAssembly 引擎'],
 ['sql.js','https://github.com/sql-js/sql.js','SQLite 查询与数据库导入导出']
];
export function initCodeRunner(){
 const options=['偏门语言','常用语言'].map(group=>`<optgroup label="${group}">${Object.entries(LANGUAGES).filter(([,l])=>l.group===group).map(([id,l])=>`<option value="${id}">${l.name}</option>`).join('')}</optgroup>`).join('');
 const panel=mount('code','代码运行',`<div class="surface code-settings"><div class="code-top-row">${field('运行语言',`<select id="code-language">${options}</select>`)}</div><p data-tool-help class="help" id="code-language-note"></p></div>
 <div class="code-layout"><div class="surface code-editor-side"><div class="code-section-heading"><h2>代码</h2><div class="code-file-actions"><label class="secondary-button code-file-label">打开代码<input id="code-file" type="file" accept="text/*,.bf,.ook,.b93,.df,.ws,.mb,.py,.js,.lua,.sql"></label>${button('code-save-source','保存代码')}</div></div>
 <label class="sr-only" for="code-source">待运行的代码</label><textarea id="code-source" class="code-source" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-describedby="code-language-note"></textarea>
 <div class="code-keypad" id="code-keypad" aria-label="代码符号快捷键"></div><div class="code-editor-meta"><span id="code-position">第 1 行，第 1 列</span><span>Ctrl / ⌘ + Enter 运行</span></div>
 <details id="code-whitespace"><summary>空白显形</summary><pre id="code-visible" class="code-pre"></pre></details>
 <div id="code-stdin-wrap">${field('程序输入（标准输入）','<textarea id="code-input" rows="4" spellcheck="false" placeholder="程序需要读取的内容，每行一项；不需要输入时留空。"></textarea>')}</div>
 <div id="code-db-wrap" hidden><label class="code-file-label secondary-button">打开 SQLite 数据库<input type="file" id="code-db-file" accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3"></label>${button('code-db-clear','使用空数据库')}<p class="help" id="code-db-info">空数据库</p></div>
 <div class="code-actions">${button('code-run','运行',true)}${button('code-step','单步')}${button('code-pause','暂停')}${button('code-stop','停止')}</div>${status('code-status')}</div>
 <div class="code-result-side"><div class="surface"><div class="code-section-heading"><h2>运行结果</h2><span id="code-result-meta" class="help">等待运行</span></div><label class="field-label" for="code-output">标准输出</label><textarea id="code-output" class="code-output" rows="10" readonly placeholder="运行后在这里查看输出。"></textarea><div class="code-result-actions">${button('code-copy','复制输出')}${button('code-save-output','下载输出')}</div><div id="code-error-wrap" hidden><h3>错误与诊断</h3><pre id="code-error" class="code-pre code-error"></pre></div><div id="code-sql-results" hidden></div><button id="code-db-save" class="secondary-button" hidden disabled>下载运行后的数据库</button></div>
 <div class="surface code-inspector" id="code-inspector"><h2>执行状态</h2><p class="help" id="code-next">等待单步执行</p><div id="code-state"></div></div></div></div>`,sources);
 panel.classList.add('code-panel');
 let lang='brainfuck',worker=null,timer=null,revision=0,fileRevision=0,dbRevision=0,busy=false,paused=false,finished=false,db=null,dbResult=null,ookMap=[],drafts=new Map(),selection=[0,0],lastOutput='';
 $('code-source').before(panel.querySelector('.code-actions'));
 const source=$('code-source'),input=$('code-input');
 function message(text,error=false){updateStatus($('code-status'),text,error?'error':'info');}
 function terminate(){clearTimeout(timer);timer=null;worker?.terminate();worker=null;busy=false;paused=false;}
 function controls(){setState($('code-run'),{busy:busy&&!paused});const hasOutput=!!lastOutput;for(const id of ['code-copy','code-save-output'])$(id).disabled=!hasOutput;$('code-run').disabled=busy&&!paused;$('code-run').textContent=paused?'继续运行':'运行';$('code-step').hidden=!LANGUAGES[lang].step;$('code-step').disabled=busy&&!paused;$('code-pause').hidden=!LANGUAGES[lang].step;$('code-pause').disabled=!busy||paused;$('code-stop').disabled=!worker;$('code-db-save').disabled=!dbResult;}
 function invalidate(text='代码或输入已变化，请重新运行。'){revision++;terminate();finished=false;lastOutput='';dbResult=null;$('code-output').value='';$('code-error-wrap').hidden=true;$('code-error').textContent='';$('code-sql-results').replaceChildren();$('code-sql-results').hidden=true;$('code-db-save').hidden=true;$('code-result-meta').textContent='等待运行';$('code-state').replaceChildren();$('code-next').textContent='等待单步执行';message(text);controls();}
 function position(){const end=source.selectionStart,prefix=source.value.slice(0,end);$('code-position').textContent=`第 ${prefix.split('\n').length} 行，第 ${end-prefix.lastIndexOf('\n')} 列`;selection=[source.selectionStart,source.selectionEnd];}
 function refreshVisible(){if($('code-whitespace').open)$('code-visible').textContent=visibleWhitespace(source.value);}
 function symbols(){const list=[...LANGUAGES[lang].keys];if(!list.includes('\t'))list.push('\t');if(!list.includes('\n'))list.push('\n');$('code-keypad').replaceChildren();for(const text of list){const b=uiElement('button');b.type='button';b.className='quiet-button';b.textContent=text===' '?'空格':text==='\t'?'Tab':text==='\n'?'换行':text;b.setAttribute('aria-label','插入 '+b.textContent);b.onpointerdown=e=>e.preventDefault();b.onclick=()=>insert(text);$('code-keypad').append(b);}}
 function insert(text){const [start,end]=selection;source.focus();source.setRangeText(text,start,end,'end');source.dispatchEvent(new Event('input'));position();}
 function choose(){drafts.set(lang,{code:source.value,input:input.value});lang=$('code-language').value;const saved=drafts.get(lang)||{code:'',input:''};source.value=saved.code;input.value=saved.input;source.placeholder=LANGUAGES[lang].hint;$('code-language-note').textContent=LANGUAGES[lang].note;$('code-stdin-wrap').hidden=lang==='sql';$('code-db-wrap').hidden=lang!=='sql';$('code-inspector').hidden=!LANGUAGES[lang].step;invalidate('已选择 '+LANGUAGES[lang].name+'，填写代码后运行。');selection=[0,0];symbols();position();refreshVisible();}
 function clock(milliseconds,text){clearTimeout(timer);timer=setTimeout(()=>{terminate();finished=true;message(text,true);$('code-result-meta').textContent='已停止 · 输出可能不完整';controls();},milliseconds);}
 function renderState(s={},range){const root=$('code-state');root.replaceChildren();const pre=(label,value)=>{const p=uiElement('p');p.className='help';p.textContent=label;const content=uiElement('pre');content.className='code-pre';content.textContent=typeof value==='string'?value:JSON.stringify(value,null,2);root.append(p,content);};
 if(range){let line=range.startLine+1,col=(range.startCol||0)+1;if(lang==='ook'){const pos=ookMap[range.startCol]??0,head=source.value.slice(0,pos);line=head.split('\n').length;col=pos-head.lastIndexOf('\n');}$('code-next').textContent=`下一条指令：第 ${line} 行，第 ${col} 列`;}else $('code-next').textContent='执行结束。';
 if(s.cells){const tape=uiElement('div');tape.className='code-tape';for(const [index,value]of s.cells){const cell=uiElement('div');cell.className='code-cell'+(index===s.pointer?' is-current':'');const a=uiElement('small'),b=uiElement('strong');a.textContent=index;b.textContent=value;cell.append(a,b);tape.append(cell);}root.append(tape);pre('当前内存指针',s.pointer);}
 if(s.stack){pre('栈（末尾为栈顶，最多显示 40 项）',s.stack);}
 if(s.direction){const dirs={up:'上',down:'下',left:'左',right:'右'};pre('二维指针方向 / 字符串模式',`${dirs[s.direction]||s.direction} / ${s.strMode?'开启':'关闭'}`);pre('当前程序网格（包括运行时修改）',s.grid||'');}
 if(s.value!==undefined)pre('累加器',s.value);
 if(s.heap)pre('堆（最多显示 40 项）',s.heap);
 if(s.a!==undefined){pre('寄存器 A / C / D',`${s.a} / ${s.c} / ${s.d}`);pre('数据指针附近的内存',s.memory);}
 }
 function sqlResults(tables){
  const root=$('code-sql-results');root.replaceChildren();root.hidden=!tables.length;
  for(const t of tables.slice(0,100)){
   const wrap=uiElement('div',{className:'code-table-scroll'});
   wrap.append(Table({caption:`查询结果 · ${t.rows.length} 行${t.rows.length>100?'（表格预览前 100 行，完整结果见标准输出）':''}`,columns:t.columns,rows:t.rows.slice(0,100)}));root.append(wrap);
  }
 }
 async function launch(mode){
 if(worker&&paused){paused=false;busy=true;clock(10000,'执行超过 10 秒，已停止。');worker.postMessage({kind:mode});controls();return;}
 const code=source.value,stdin=input.value;if(!code.length){message('请先输入代码。',true);return;}if(new TextEncoder().encode(code).length>MAX_SOURCE||new TextEncoder().encode(stdin).length>MAX_SOURCE){message('代码和程序输入分别最多 256 KB。',true);return;}
 let actual=code;try{if(lang==='ook'){const r=ookToBrainfuck(code);actual=r.code;ookMap=r.positions;}}catch(e){message(errorText(e),true);return;}
 invalidate('正在加载 '+LANGUAGES[lang].name+' 运行环境…');const version=revision;busy=true;finished=false;
 try{worker=new Worker(new URL('./worker.js',import.meta.url));clock(60000,'运行环境加载超时，请检查连接后重试。');
 worker.onmessage=({data:m})=>{if(version!==revision||!worker)return;
  if(m.kind==='running'){paused=false;message('正在运行…');clock(10000,'执行超过 10 秒，已停止。');controls();return;}
  if(m.kind==='loading')return;
  if(m.kind==='database'){if(m.bytes instanceof ArrayBuffer&&m.bytes.byteLength<=16*1024*1024){dbResult=new Uint8Array(m.bytes);$('code-db-save').hidden=false;}if(Array.isArray(m.tables))sqlResults(m.tables);return;}
  if(typeof m.output==='string'){lastOutput=m.output.slice(0,MAX_OUTPUT);$('code-output').value=lastOutput;}
  if(m.stderr||m.error){$('code-error-wrap').hidden=false;$('code-error').textContent=errorText(m.error||m.stderr);if(m.error&&m.stderr)$('code-error').textContent+='\n'+m.stderr.slice(0,8000);}
  if(m.state)renderState(m.state,m.range);
  $('code-result-meta').textContent=`${LANGUAGES[lang].step?`${m.steps||0} 步 · `:''}${m.elapsed??0} 毫秒`;
  if(m.kind==='done'){terminate();finished=true;updateStatus($('code-status'),lastOutput?'运行完成。':'运行完成，程序没有标准输出。','success');animatePresence($('code-output'),{kind:'feedback'});}
  else if(m.kind==='error'){terminate();finished=true;message('执行失败，请查看错误与诊断。',true);$('code-result-meta').textContent='执行失败 · 已保留此前输出';if(m.range)$('code-next').textContent=`错误位置：第 ${m.range.startLine+1} 行，第 ${(m.range.startCol||0)+1} 列`;}
  else if(m.kind==='paused'){paused=true;clearTimeout(timer);message('已暂停，可查看状态、单步或继续运行。');clock(300000,'暂停超过 5 分钟，已释放运行环境。');}
  controls();
 };
 worker.onerror=e=>{if(version!==revision)return;e.preventDefault();terminate();finished=true;message('运行环境加载或执行失败，请重新运行。',true);$('code-error-wrap').hidden=false;$('code-error').textContent=errorText(e.message);controls();};
 worker.postMessage({kind:'init',language:lang,code:actual,input:stdin,mode,database:lang==='sql'&&db?db.slice().buffer:null});controls();
 }catch(e){terminate();message(errorText(e),true);controls();}
 }
 $('code-run').onclick=()=>launch('run');$('code-step').onclick=()=>launch('step');$('code-pause').onclick=()=>{worker?.postMessage({kind:'pause'});message('正在暂停…');};$('code-stop').onclick=()=>{terminate();finished=true;message('已停止，当前输出可能不完整。');$('code-result-meta').textContent='已停止';controls();};
 $('code-language').onchange=choose;
 source.addEventListener('input',()=>{invalidate();position();refreshVisible();});input.oninput=()=>invalidate();for(const event of ['click','keyup','select'])source.addEventListener(event,position);
 source.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();selection=[source.selectionStart,source.selectionEnd];insert('\t');}if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();launch('run');}};
 $('code-whitespace').ontoggle=refreshVisible;
 $('code-file').onchange=async()=>{const ticket=++fileRevision,v=revision,f=$('code-file').files[0];try{if(!f)return;if(f.size>MAX_SOURCE)throw Error('代码文件最多 256 KB。');const text=new TextDecoder('utf-8',{fatal:true}).decode(await f.arrayBuffer());if(ticket!==fileRevision||v!==revision)return;source.value=text;invalidate('代码已打开；请确认语言后运行。');selection=[0,0];refreshVisible();position();}catch(e){if(ticket===fileRevision&&v===revision)message('无法打开代码：'+errorText(e),true);}finally{$('code-file').value='';}};
 $('code-db-file').onchange=async()=>{const ticket=++dbRevision,v=revision,f=$('code-db-file').files[0];try{if(!f)return;if(f.size>16*1024*1024)throw Error('数据库最多 16 MB。');const bytes=new Uint8Array(await f.arrayBuffer());if(ticket!==dbRevision||v!==revision)return;if(new TextDecoder().decode(bytes.slice(0,16))!=='SQLite format 3\0')throw Error('不是普通 SQLite 3 数据库，或文件已加密。');db=bytes;invalidate('数据库已载入，填写 SQL 后运行。');$('code-db-info').textContent=`${f.name} · ${f.size.toLocaleString()} 字节；原文件不会被修改。`;}catch(e){if(ticket===dbRevision&&v===revision)message(errorText(e),true);}finally{$('code-db-file').value='';}};
 $('code-db-clear').onclick=()=>{dbRevision++;db=null;invalidate('已切换到空数据库。');$('code-db-info').textContent='空数据库';};
 $('code-save-source').onclick=()=>download(source.value,'代码.'+LANGUAGES[lang].ext);
 $('code-save-output').onclick=()=>download(lastOutput,'代码运行结果.txt');$('code-db-save').onclick=()=>{if(dbResult)download(dbResult,'运行结果.sqlite','application/vnd.sqlite3');};
 $('code-copy').onclick=async()=>{try{await copy(lastOutput);message('输出已复制。');}catch(e){message(errorText(e),true);}};
 document.addEventListener('arg:panelchange',e=>{if(e.detail.name!=='code'&&worker){terminate();message('切换工具后已停止执行，输入保留。');controls();}});
 window.addEventListener('pagehide',terminate);
 choose();return{stop:terminate};
}
