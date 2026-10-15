let pending=null;
export function openCrystal(model){pending=structuredClone(model);location.hash='model';document.dispatchEvent(new Event('arg:crystal-ready'));}
export function takeCrystal(){const value=pending;pending=null;return value;}
