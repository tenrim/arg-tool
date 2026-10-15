import {capabilityRoute} from '../capabilities/routes.js';
// Injected controller contracts keep cross-tool data out of navigation and DOM.
export function createHandoffTargets({navigate,current,controller,material,loadImage,loadFile}) {
  return {
    needsReplace(target,data){
      const c=controller(target.entry),input=c?.getInputModel?.()||c?.getInput?.();
      if(input?.kind==='text')return !!input.text&&input.text!==data.text;
      return !!input||!!material(target.entry.open.panel);
    },
    async receive(target,data,valid){
      const revision=current().revision+1;
      await navigate(capabilityRoute(target.entry,target.op));
      const active=()=>valid()&&current().revision===revision&&current().entry?.id===target.entry.id;
      if(!active())return false;
      if(target.entry.open.kind==='operation')return controller(target.entry)?.adopt({kind:'bytes',source:'result',bytes:data.bytes})===true;
      const file=new File([data.bytes],data.name,{type:data.mime});
      if(target.entry.open.panel==='file')return loadFile(file,{bytes:data.bytes,isCurrent:active});
      if(target.entry.id==='native:image')return loadImage(file,{isCurrent:active});
      throw Error('目标工具不支持这种结果。');
    }
  };
}
