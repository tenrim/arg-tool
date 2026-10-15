import {toolPages} from './navigation.js';

export const PREFERENCES_KEY='arg.ui.preferences.v1';
export const FAVORITES_KEY='arg.ui.favorites.v1';
const LAST_KEY='arg.ui.last-tool.v1',validTools=new Set(toolPages.map(p=>p.route));
export const DEFAULT_PREFERENCES=Object.freeze({motion:'system',scanlines:true,textSize:'standard',density:'compact',startPage:'home',showRecent:true,showFavorites:true,sidebarCollapsed:false});
const choices={motion:['system','reduce'],textSize:['standard','large'],density:['compact','comfortable'],startPage:['home','last',...validTools]};
let preferences,installed=false,recent=[];
function read(key){try{return localStorage.getItem(key);}catch{return null;}}
function write(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
function emit(name){document.dispatchEvent(new Event(name));}
export function validatePreferences(value,{strict=false}={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('设置格式无效。');
 const result={...DEFAULT_PREFERENCES};
 if(strict&&Object.keys(value).some(key=>!Object.hasOwn(DEFAULT_PREFERENCES,key)))throw Error('设置包含无法识别的选项。');
 for(const key of Object.keys(DEFAULT_PREFERENCES)){
  if(!Object.hasOwn(value,key))continue;
  const valid=choices[key]?choices[key].includes(value[key]):typeof value[key]==='boolean';
  if(!valid){if(strict)throw Error('设置选项无效：'+key);continue;}result[key]=value[key];
 }
 return result;
}
export function getPreferences(){
 if(!preferences){try{preferences=validatePreferences(JSON.parse(read(PREFERENCES_KEY)||'{}'));}catch{preferences={...DEFAULT_PREFERENCES};}}
 return {...preferences};
}
function apply(){
 const p=getPreferences(),root=document.documentElement;
 root.dataset.uiMotion=p.motion;root.dataset.uiText=p.textSize;root.dataset.uiDensity=p.density;root.dataset.uiScanlines=String(p.scanlines);
 emit('arg:preferenceschange');
}
export function setPreferences(patch){preferences=validatePreferences({...getPreferences(),...patch},{strict:true});const saved=write(PREFERENCES_KEY,JSON.stringify(preferences));if(preferences.startPage==='last'&&recent[0])write(LAST_KEY,recent[0]);apply();return saved;}
export function resetPreferences(){return setPreferences({...DEFAULT_PREFERENCES});}
export function getFavorites(value){try{const raw=value??read(FAVORITES_KEY)??'[]';if(raw.length>65536)return new Set();const list=JSON.parse(raw);return new Set(Array.isArray(list)?list.filter(id=>typeof id==='string'&&validTools.has(id)):[]);}catch{return new Set();}}
let sessionFavorites;
export function favorites(){return new Set(sessionFavorites??=getFavorites());}
export function setFavorites(ids){sessionFavorites=new Set([...ids].filter(id=>validTools.has(id)));const saved=write(FAVORITES_KEY,JSON.stringify([...sessionFavorites]));emit('arg:collectionschange');return saved;}
export function getRecent(){return [...recent];}
export function clearRecent(){recent=[];try{localStorage.removeItem(LAST_KEY);}catch{/* Session history still clears. */}emit('arg:collectionschange');}
export function recordTool(route){if(!validTools.has(route))return;recent=[route,...recent.filter(id=>id!==route)].slice(0,6);if(getPreferences().startPage==='last')write(LAST_KEY,route);emit('arg:collectionschange');}
export function initialRoute(){const p=getPreferences();if(p.startPage==='last'){const id=read(LAST_KEY);return validTools.has(id)?id:'home';}return p.startPage;}
export function exportPreferences(){return JSON.stringify({format:'arg-tool-preferences',version:1,preferences:getPreferences(),favorites:[...favorites()]},null,2);}
export function parsePreferencesBackup(text){
 if(typeof text!=='string'||text.length>65536)throw Error('设置文件超过 64 KB。');
 let data;try{data=JSON.parse(text);}catch{throw Error('设置文件不是有效 JSON。');}
 if(data?.format!=='arg-tool-preferences'||data.version!==1)throw Error('不是支持的工具箱设置文件。');
 const next=validatePreferences(data.preferences,{strict:true});
 if(!Array.isArray(data.favorites)||data.favorites.length>validTools.size||data.favorites.some(id=>typeof id!=='string'||!validTools.has(id)))throw Error('收藏列表包含无效工具。');
 return {preferences:next,favorites:[...new Set(data.favorites)]};
}
export function importPreferences(text){const next=parsePreferencesBackup(text);const saved=setPreferences(next.preferences);return setFavorites(next.favorites)&&saved;}
export function initPreferences(){
 if(installed)return;installed=true;apply();
 window.addEventListener('storage',event=>{
  if(event.key===PREFERENCES_KEY||event.key===null){preferences=undefined;apply();}
  if(event.key===FAVORITES_KEY||event.key===null){sessionFavorites=getFavorites(event.newValue);emit('arg:collectionschange');}
 });
}
