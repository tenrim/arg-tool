import {element as uiElement, Option as uiOption, animateCollection} from '../ui/index.js';
import {TAROT_DECKS,tarotCardArt,tarotDeck} from './tarot-art.js';
const el=uiElement;
const button=(text,fn)=>{const b=el('button',text,'secondary-button');b.type='button';b.onclick=fn;return b;};
export function mountTarotDeck(host,cards,api){
 host.append(el('h3','塔罗牌组'));
 const selectors=el('div',undefined,'ref-tarot-selectors'),deck=el('select'),suit=el('select'),card=el('select');deck.id='tarot-deck';suit.id='tarot-suit';card.id='tarot-card';
 for(const [labelText,input] of [['牌面版本',deck],['牌组／花色',suit],['选择牌卡',card]]){const label=el('label',labelText);label.htmlFor=input.id;if(input===deck)label.className='ref-tarot-version';label.append(input);selectors.append(label);}
 for(const d of Object.values(TAROT_DECKS))deck.append(uiOption(d.label, d.id));deck.value=api.getDeck();
 for(const name of ['大阿尔卡那','权杖','圣杯','宝剑','星币'])suit.append(uiOption(name, name));host.append(selectors);
 const fan=el('div',undefined,'ref-tarot-fan'),caption=el('div',undefined,'ref-tarot-caption'),title=el('strong'),subtitle=el('span'),counter=el('span'),toolbar=el('div',undefined,'ref-tarot-navigation');
 fan.id='tarot-fan';fan.tabIndex=0;fan.setAttribute('role','group');fan.setAttribute('aria-label','横向叠放的塔罗牌，左右方向键切换');caption.setAttribute('aria-live','polite');caption.append(title,subtitle);
 const prev=button('上一张',()=>step(-1)),next=button('下一张',()=>step(1));toolbar.append(prev,counter,next);host.append(fan,caption,toolbar);
 let group=[],current=null,gesture=null,ignoreClickUntil=0;
 function setGroup(name){suit.value=name;group=cards.filter(r=>r.suit===name);if(name==='大阿尔卡那')group.sort((a,b)=>tarotCardArt(a,deck.value).number-tarotCardArt(b,deck.value).number);card.replaceChildren();for(const r of group)card.append(uiOption((r.suit==='大阿尔卡那'?tarotCardArt(r,deck.value).number+' · ':'')+r.name, r.id));}
 function layout(){const d=tarotDeck(deck.value);fan.dataset.deck=d.id;fan.style.setProperty('--tarot-ratio',`${d.width}/${d.height}`);}
 function show(r,query=true){if(!r)return;if(suit.value!==r.suit||!group.length)setGroup(r.suit);current=r;card.value=r.id;const index=group.indexOf(r),art=tarotCardArt(r,deck.value);title.textContent=r.name;subtitle.textContent=r.english+' · '+r.suit+' · '+art.number;counter.textContent=`${index+1} / ${group.length}`;prev.disabled=index===0;next.disabled=index===group.length-1;
  animateCollection(fan,()=>{fan.replaceChildren();for(let offset=-2;offset<=2;offset++){const item=group[index+offset];if(!item)continue;const b=button('',()=>{if(performance.now()<ignoreClickUntil)return;show(item);});b.className='ref-tarot-card'+(offset===0?' is-selected':'');b.dataset.choice=item.id;b.setAttribute('aria-pressed',String(offset===0));b.setAttribute('aria-label',item.name+'，'+item.english);b.style.setProperty('--offset',offset);b.style.setProperty('--distance',Math.abs(offset));b.style.zIndex=String(5-Math.abs(offset));
   const image=tarotCardArt(item,deck.value),img=el('img');img.src=new URL('../vendor/reference/'+image.file,import.meta.url).href;img.alt=item.name+'牌面 · '+tarotDeck(deck.value).label;img.width=image.width;img.height=image.height;img.draggable=false;img.decoding='async';b.append(img);img.onerror=()=>{img.hidden=true;b.append(el('span',item.name+'：牌面载入失败，点击重试','ref-tarot-image-error'));b.onclick=()=>show(item);};fan.append(b);
  }});if(query)api.select({query:r.name,filter:r.suit,recordId:r.id});
 }
 function step(delta){const index=group.indexOf(current);if(group[index+delta])show(group[index+delta]);}
 deck.onchange=()=>{setGroup(current.suit);layout();show(current,false);api.changeDeck(deck.value);};
 suit.onchange=()=>{setGroup(suit.value);show(group[0]);};card.onchange=()=>show(group.find(r=>r.id===card.value));
 fan.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);fan.focus({preventScroll:true});}};
 fan.onpointerdown=e=>{if(e.pointerType!=='touch'||!e.isPrimary)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY};};
 fan.onpointerup=e=>{if(gesture?.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(dy)*1.2){ignoreClickUntil=performance.now()+450;step(dx<0?1:-1);}};
 fan.onpointercancel=()=>{gesture=null;};layout();setGroup('大阿尔卡那');show(group[0],false);
 return {syncResult(result){if(result.total!==1)return;const r=cards.find(r=>r.id===result.items[0]?.id);if(r&&r!==current)show(r,false);}};
}
