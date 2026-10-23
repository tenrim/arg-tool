// Source controllers publish the same current-result lease as notebook/handoff.
let receiver;
export function connectGraphics(handler){receiver=handler;return()=>{if(receiver===handler)receiver=null;};}
export function sendToGraphics(request){return receiver?.(request);}
