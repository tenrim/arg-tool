import {render as uiRender, element as uiElement, ToolHeader, Toolbar, IconButton} from './ui/index.js';
import {addToolHelp} from './tool-help.js';
import {toolGroups} from './navigation.js';
import {mountToolSearch} from './workspace.js';
import {mountWorkbenchShell,uiIcon} from './workbench-shell.js';
const home=new URL('./index.html',import.meta.url).href;
export function mountShell(header,nav,{navigate}={}){
 document.body.classList.add('site-ui','scanlines');
 header.className='site-header chronicle-header';
 uiRender(header, `<div class="header-inner"><a class="brand" href="${home}" aria-label="迷雾工具箱首页"><strong>迷雾工具箱</strong></a></div>`);
 const brand=header.querySelector('.brand');brand.href='#home';brand.onclick=event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate('home');};
 nav.remove();
 const inner=header.querySelector('.header-inner'),search=mountToolSearch(inner,navigate);
 const workbench=mountWorkbenchShell(inner,{navigate,search});
 return workbench;
}
export function decorateHeading(heading,id){
 const group=toolGroups.find(g=>g.items.some(i=>i[0]===id));if(!group)return;
 const item=group.items.find(i=>i[0]===id);
 const title=({'crypto':'加解密','encoding':'编码转换'}[id]||item[1]);
 const actions=Toolbar({className:'heading-actions'});
 const favorite=IconButton({className:'tool-favorite app-icon-button',label:'收藏工具',attrs:{'aria-pressed':'false','data-favorite':id},children:uiIcon('star')});actions.append(favorite);
 const replacement=ToolHeader({className:'page-heading chronicle-heading',title,children:[]});
 replacement.append(actions);heading.replaceWith(replacement);addToolHelp(replacement,actions,id,item[1]);
}
export function mountFooter(main,{navigate}={}){
 const footer=main.querySelector('.main-footer')||uiElement('footer');
 footer.className='main-footer';uiRender(footer, '<span>迷雾工具箱 <span class="footer-divider">/</span> 解谜工具集</span><div class="footer-privacy"><span>本网页的常规工具在本地浏览器运行，不会将你的输入、文件或结果上传或保存在本站服务器。在线查询与问题反馈会发送你主动提交的信息。</span><details><summary>本地与联网说明</summary><p>网页和工具组件需要从服务器加载；本地工具计算在你的浏览器内完成。标注“在线查询”的功能只有在你点击查询后，才将本次查询经本站服务器发给页面注明的外站；本站不持久保存查询和返回结果。报告问题会发送你确认的报告与自选附件。主动执行 HTTP、DNS 等联网操作时，也会向指定服务发送请求。外部服务遵循对方政策，托管平台可能记录访问日志。你保存的配方、笔记和图稿仅存于本机浏览器。</p></details></div>');
 main.append(footer);
 const links=uiElement('nav',undefined,'footer-links');links.setAttribute('aria-label','网站导航');
 for(const [id,title]of [['home','首页'],['about','关于'],['settings','设置']]){const a=uiElement('a',title);a.href='#'+id;a.onclick=event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate(id);};links.append(a);}footer.prepend(links);
}
