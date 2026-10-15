import {mountCapabilityBrowser} from './capabilities/browser.js';
import {matchesTool} from './tool-search.js';
import {Box,Card,ToolPanel,ToolHeader,ToolCard,Toolbar,Button,Input,Select,Option,Field,FormGrid,SearchField,Icon,EmptyState,Status,updateStatus,Link,Disclosure,Result} from './ui/index.js';
import {toolGroups,toolPages} from './navigation.js';
import {getPreferences,setPreferences,resetPreferences,favorites,setFavorites,getRecent,clearRecent,exportPreferences,importPreferences} from './preferences.js';

const byRoute=new Map(toolPages.map(p=>[p.route,p]));
// V0.8 is the current product version. Earlier numbers summarize development
// stages from Git and VERIFICATION.md; they are not historical release tags.
const releaseNotes=[
 {version:'V0.8',title:'工具联动与问题反馈',changes:[
  '新增“用其他工具处理”：把当前结果交给另一个工具，按结果类型推荐下一步，并按大分类、工具组和处理方向选择目标。',
  '接收结果后直接展示上一步的文本、图片或十六进制预览，保留完整原始数据；有旧输入时先确认替换，不会自动执行。单项工具中的“送到处理链”按钮已移除，处理链保留独立入口。',
  '新增网页内“报告问题”：填写问题、复现步骤及选填附件，预览后发送到维护者邮箱。不会自动附上解谜输入、文件或结果；邮件服务不可用时仍可复制或下载报告。'
 ]},
 {version:'V0.7',title:'统一任务页面与稳定性修复',changes:[
  '侧栏具体功能直接进入对应任务；首页和大分类保留总览。移除工具内重复的聚合页面、分类菜单和操作列表，避免同一功能出现两套界面。',
  '修复读取末尾附带 ZIP 数据的 PNG 图片时可能无响应、报越界错误的问题，保留图片原始字节供隐写和文件检查使用。',
  '完善切换任务、修改输入、停止运算后的结果失效处理，避免旧结果或迟到的响应覆盖当前内容。'
 ]},
 {version:'V0.6',title:'五类导航与逐功能科普',changes:[
  '工具统一整理为编解码与加解密、资料查询、图片音视频与文件处理、其他工具、科普五大类；侧栏、目录和搜索使用同一份功能登记。',
  '将支持的编码／解码、加密／解密合为同一功能入口，在工具内明确切换方向；补充基础转换、交互符号、十六进制编辑器和 IT 固定资料。',
  '科普按具体功能分别介绍规则、步骤、可核对例子、参数和边界，并在正文旁列出参考资料，可同页打开对应工具。'
 ]},
 {version:'V0.5',title:'紧凑工作台与使用偏好',changes:[
  '重新整理工作台布局，采用常驻侧栏和居中搜索；手机使用导航抽屉，精简顶栏与常驻说明，保留深色配色和 CRT 扫描线。',
  '统一输入、结果、帮助和交互反馈，调整中文及代码字体，关闭会影响密文和符号辨读的字体连字。',
  '加入首页、关于与设置，提供收藏、最近使用，以及字号、密度、动效、扫描线和启动页偏好；支持设置与收藏的导入导出。'
 ]},
 {version:'V0.4',title:'科学资料与图形浏览',changes:[
  '加入天文、化学、生物序列和传统历法工具，以及国家、机场、港口、Unicode、塔罗、颜色、地质、数列和晶体等固定资料查询。',
  '为资料查询补充地图、字符表、塔罗牌面、连续色盘等图形浏览方式，点选后查看对应记录。',
  '完善地区、货币、交通和天体之间的资料关联，支持将真实 CIF 晶体数据带入三维模型观察。'
 ]},
 {version:'V0.3',title:'媒体处理与交互工具扩充',changes:[
  '扩充音频、音乐、视频、压缩文件、坐标与时间处理功能，并把相关操作整合到原有素材工作区。',
  '加入原生纸笔解题，支持标准数独、数回、数墙和照明；提供题面编辑、撤销、求解及结果导出。',
  '加入十种语言的代码运行工具，以及图片碎片拼接、三维模型观察、棋谱复盘和生命游戏等交互工具。'
 ]},
 {version:'V0.2',title:'图片隐写与常用解谜工具',changes:[
  '整合 AperiSolve 的图像分析算法与 StegOnline 的位平面、数据提取能力，扩充通道、元数据、PNG 数据块和 LSB 检查。',
  '补充汉字属性与反查、单表替换求解、密文统计分析、交互符号输入、合成乐器、三阶魔方和二维码修复。',
  '为工具补充中文使用说明，并逐步完善原图、当前视图与处理结果的区分，以及各开源项目的来源和许可说明。'
 ]},
 {version:'V0.1',title:'基础工具箱',changes:[
  '建立中文 ARG 解谜工作台，提供文字、编码与密码、图片、音频和文件的基础处理入口。',
  '接入本地 CyberChef 引擎，在站内完成常用编码、解码与加解密；常规工具的数据处理在浏览器内进行。',
  '确立海军蓝、琥珀、青色及 CRT 扫描线的视觉风格，开始集中整理常用开源工具与项目来源。'
 ]}
];
function versionHistory(){
 const [current,...history]=releaseNotes;
 const changes=release=>Box({tag:'ul',children:release.changes.map(text=>Box({tag:'li',children:[Box({tag:'p',text})]}))});
 return Disclosure({id:'about-versions',className:'surface ui-flow-branch',children:[
  Box({tag:'summary',text:`版本更新 · ${current.version}`}),
  Box({tag:'h3',text:`${current.version} · ${current.title}`,attrs:{'data-current-version':current.version}}),changes(current),
  Result({layout:'collection',children:history.map(release=>Disclosure({className:'surface ui-flow-branch',attrs:{'data-release-version':release.version},children:[Box({tag:'summary',text:`${release.version} · ${release.title}`}),changes(release)]}))})
 ]});
}
function heading(title,code){return ToolHeader({className:'page-heading chronicle-heading',title,eyebrow:'// '+code});}
function link(text,route,navigate){return Link({text,attrs:{href:'#'+route},on:{click:event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate(route);}}});}
function downloadSettings(){const url=URL.createObjectURL(new Blob([exportPreferences()],{type:'application/json'}));const a=Link({attrs:{href:url,download:'迷雾工具箱-设置.json'}});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}

export function mountSitePages(main,{navigate}){
 const home=ToolPanel({id:'panel-home',className:'panel site-page',hidden:true,attrs:{'aria-label':'首页'}});
 const collections=Box({className:'home-collections'}),starred=Card({title:'已收藏',className:'surface home-collection'}),latest=Card({title:'最近使用',className:'surface home-collection'});
 const starList=Box({className:'home-quick-links'}),recentList=Box({className:'home-quick-links'});starred.append(starList);latest.append(recentList);collections.append(starred,latest);
 const browse=Card({title:'工具导航',className:'surface home-browser'});
 home.append(collections,browse);
 mountCapabilityBrowser(browse,{searchId:'home-search'});
 function syncFavoriteButtons(){const ids=favorites();for(const b of home.querySelectorAll('[data-favorite]')){const active=ids.has(b.dataset.favorite);b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',(active?'取消收藏':'收藏')+' · '+byRoute.get(b.dataset.favorite).title);}}
 function refreshCollections(){const p=getPreferences();for(const [section,list,ids,enabled,empty]of [[starred,starList,[...favorites()],p.showFavorites,'尚未收藏工具'],[latest,recentList,getRecent(),p.showRecent,'暂无使用记录']]){section.hidden=!enabled;list.replaceChildren();for(const id of ids){const entry=byRoute.get(id);if(entry)list.append(link(entry.title,id,navigate));}if(!ids.length)list.append(EmptyState({text:empty,size:'compact'}));}collections.hidden=starred.hidden&&latest.hidden;syncFavoriteButtons();}
 document.addEventListener('arg:collectionschange',refreshCollections);document.addEventListener('arg:preferenceschange',refreshCollections);refreshCollections();

 const about=ToolPanel({id:'panel-about',className:'panel site-page',hidden:true,header:heading('关于工具箱','ABOUT / 关于')});
 const intro=Card({title:'迷雾工具箱',className:'surface',children:[Box({tag:'p',text:`当前版本：${releaseNotes[0].version}`}),Box({tag:'p',className:'site-lead',text:'为 ARG 与 Puzzlehunt 准备的中文解谜工作台。'}),Box({tag:'p',text:'从密码、编码与符号，到图片隐写、音视频、科学资料和交互模拟，将常用工具放在同一个网页中。'}),Toolbar({children:[link('浏览全部工具','home',navigate),link('调整使用偏好','settings',navigate)]})]});
 const sourceInfo=Card({id:'about-source',title:'开源与本地部署',children:[
  Box({tag:'p',text:'这是可自行部署的 ARG 工具箱源码版，基于 musicraft 的迷雾工具箱整理。原创程序代码采用 GPL-3.0-or-later；第三方引擎、数据和字体保留各自许可。'}),
  Box({tag:'p',text:'依赖由部署者提前安装，常规处理在本地浏览器中进行。问题报告默认只支持复制和下载；没有预设收件人或站点反馈服务。'})
 ]});
 const privacy=Card({title:'数据与隐私',className:'surface',children:[Box({tag:'p',text:'常规工具在浏览器内计算；本站不会接收或保存你的工具输入、文件和结果。'}),Box({tag:'p',text:'设置和主动收藏的工具 ID 保存在当前浏览器。最近使用只记录在当前会话；仅选择“上次使用的工具”作为启动页时，额外保存一个工具 ID。'}),Box({tag:'p',text:'HTTP、DNS 等主动联网操作会向指定服务发送请求；外部服务遵循对方政策。网页及本地引擎需要从服务器加载，托管服务可能记录访问日志。'})]});
 const limitations=Card({title:'使用范围',className:'surface',children:[Box({tag:'p',text:'查询资料以随站点提供的数据集为准。密文识别与自动求解提供候选，不保证每道题都有答案。'}),Box({tag:'p',text:'大型引擎按需加载。建议使用较新的浏览器，并通过 HTTPS 访问；各工具的输入格式和限额见标题旁的使用说明。'})]});
 const credits=Disclosure({className:'surface about-credits',children:[Box({tag:'summary',text:'开源项目与许可证'}),Box({className:'resource-grid'})]});
 about.append(intro,sourceInfo,versionHistory(),Box({className:'site-info-grid',children:[privacy,limitations]}),credits);

 const settings=ToolPanel({id:'panel-settings',className:'panel site-page',hidden:true,header:heading('设置','SETTINGS / 设置')});
 let revision=0;
 const controls=new Map(),settingsStatus=Status({id:'settings-status',className:'status',text:'设置即时生效'});
 function preferenceField(key,label,options){const control=Select({id:'setting-'+key});for(const [value,text]of options)control.append(Option(text,value));controls.set(key,control);control.addEventListener('change',()=>{revision++;importFile.value='';const value=typeof getPreferences()[key]==='boolean'?control.value==='true':control.value;const saved=setPreferences({[key]:value});updateStatus(settingsStatus,saved?'设置已保存':'设置已应用；浏览器储存不可用，仅本次有效',saved?'success':'info');});return Field({label,control,className:'r1-field'});}
 const appearance=Card({title:'外观与动效',className:'surface',children:[FormGrid({children:[preferenceField('motion','界面动画',[['system','跟随系统'],['reduce','减少动态效果']]),preferenceField('scanlines','扫描线纹理',[['true','开启'],['false','关闭']]),preferenceField('textSize','文字大小',[['standard','标准'],['large','较大']]),preferenceField('density','界面密度',[['compact','紧凑'],['comfortable','舒适']])]})]});
 const navigation=Card({title:'导航与首页',className:'surface',children:[FormGrid({children:[preferenceField('startPage','启动页面',[['home','首页'],['last','上次使用的工具'],...toolPages.map(p=>[p.route,p.title])]),preferenceField('sidebarCollapsed','桌面侧栏',[['false','默认展开'],['true','默认收起']]),preferenceField('showFavorites','收藏快捷入口',[['true','显示'],['false','隐藏']]),preferenceField('showRecent','最近使用入口',[['true','显示'],['false','隐藏']])]})]});
 const importFile=Input({id:'settings-import',type:'file',attrs:{accept:'.json,application/json'}}),importLabel=Field({className:'r1-field',label:'导入设置文件（最多 64 KB）',control:importFile});
 importFile.addEventListener('change',async()=>{const file=importFile.files?.[0],gen=++revision;if(!file)return;try{if(file.size>65536)throw Error('设置文件超过 64 KB。');const text=await file.text();if(gen!==revision)return;const saved=importPreferences(text);updateStatus(settingsStatus,saved?'设置与收藏已导入':'导入已应用；浏览器储存不可用，仅本次有效',saved?'success':'info');}catch(error){if(gen===revision)updateStatus(settingsStatus,error.message,'error');}finally{if(gen===revision)importFile.value='';}});
 const data=Card({title:'本机数据',className:'surface',children:[Toolbar({children:[Button({text:'导出设置与收藏',variant:'secondary',on:{click:downloadSettings}}),Button({text:'恢复默认设置',variant:'secondary',on:{click:()=>{revision++;importFile.value='';const saved=resetPreferences();updateStatus(settingsStatus,saved?'已恢复默认设置':'已恢复默认设置；浏览器储存不可用',saved?'success':'info');}}}),Button({text:'清空最近使用',variant:'secondary',on:{click:()=>{clearRecent();updateStatus(settingsStatus,'最近使用已清空','success');}}}),Button({text:'清空收藏',variant:'secondary',on:{click:()=>{const saved=setFavorites([]);updateStatus(settingsStatus,saved?'收藏已清空':'收藏已清空；浏览器储存不可用',saved?'success':'info');}}})]}),importLabel]});
 function syncSettings(){const p=getPreferences();for(const [key,control]of controls)control.value=String(p[key]);}
 document.addEventListener('arg:preferenceschange',syncSettings);syncSettings();settings.append(Box({className:'site-settings-grid',children:[appearance,navigation]}),data,settingsStatus);
 main.prepend(home);main.append(about,settings);
}
