// Algorithm suites select real registered tasks through the production route
// event; discovery suites additionally exercise the visible search/sidebar.
export async function chooseOperation(page,op){
 const entry=await page.evaluate(async op=>{
  const {loadRegistry,resolveCapability}=await import('./capabilities/registry.js');
  const registry=await loadRegistry(),owner=registry.byOperation.get(op);
  const {entry}=resolveCapability(registry,owner?.id,op);if(!entry)throw Error('Unregistered operation: '+op);
  document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id:entry.id,op}}));
  return {id:entry.id,panel:entry.open.panel,kind:entry.open.kind};
 },op);
 await page.waitForFunction(({entry,op})=>{
  const panel=document.getElementById('panel-'+entry.panel);
  return panel&&!panel.hidden&&panel.querySelector('.capability-workspace-context')?.dataset.currentCapability===entry.id
   &&(entry.kind!=='operation'||panel.querySelector('.ct-tool')?.dataset.operation===op&&panel.querySelector('.ct-tool')?.dataset.capabilityId===entry.id);
 },{entry,op});
 return entry;
}
export async function chooseNativeTask(page,id,direction){
 const selected=await page.evaluate(async({id,direction})=>{
  const {loadRegistry,resolveCapability}=await import('./capabilities/registry.js');
  const {entry,direction:resolvedDirection}=resolveCapability(await loadRegistry(),id,undefined,direction);
  if(entry?.open.kind!=='native')throw Error('Unregistered native task: '+id);
  document.dispatchEvent(new CustomEvent('arg:opencapability',{detail:{id,direction}}));
  return{id:entry.id,panel:entry.open.panel,variant:entry.variantId,direction:resolvedDirection};
 },{id,direction});
 await page.waitForFunction(selected=>{
  const panel=document.getElementById('panel-'+selected.panel),params=new URLSearchParams(location.hash.split('?')[1]);
  return panel&&!panel.hidden&&panel.querySelector('[data-current-capability]')?.dataset.currentCapability===selected.id
   &&(!selected.variant||params.get('view')===selected.variant)&&(!selected.direction||params.get('dir')===selected.direction);
 },selected);
 return selected;
}
export async function go(page,route){
 while(await page.locator('dialog[open]').count())await page.keyboard.press('Escape');
 const aliases={instruments:'audio',qrrepair:'image',resources:'about',text:'cyberchef',pipeline:'cyberchef'};
 const root=route.split('/')[0],panel=aliases[root]||root;
 await page.evaluate(value=>{location.hash=value;},route);
 await page.waitForFunction(id=>{
   const target=document.getElementById('panel-'+id);
   return Boolean(target&&!target.hidden);
 },panel);
 if(root==='instruments')await page.waitForSelector('#audio-play-pane:not([hidden])');
 if(root==='qrrepair')await page.waitForSelector('#image-repair-pane:not([hidden])');
}
