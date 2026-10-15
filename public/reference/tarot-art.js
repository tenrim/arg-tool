export const TAROT_DECKS = Object.freeze({
 gearberry: Object.freeze({id:'gearberry',label:'蓝金幻想 · Gearberry',directory:'tarot-gearberry/',width:848,height:1264,numbering:'正义 VIII、力量 XI',credit:'Tarot Cards WebP Collection by Gearberry；牌面按上游 CC BY 4.0 声明使用。',url:'https://github.com/reginanka/tarot-cards',license:'CC BY 4.0',licenseURL:'https://creativecommons.org/licenses/by/4.0/'}),
 rws: Object.freeze({id:'rws',label:'经典 RWS · 1909',directory:'tarot-art/',width:720,height:1200,numbering:'力量 VIII、正义 XI',credit:'1909 年 Rider–Waite–Smith；Pamela Colman Smith 绘制，Steve P. 修复扫描，TarotCards 提供公版镜像。',url:'https://github.com/mixvlad/TarotCards',license:'公共领域',licenseURL:'https://github.com/mixvlad/TarotCards/blob/840b84d012c6b74dc1634fa2d00d1b21f5b28093/tarot/rider-waite/metadata.json'})
});
export function tarotDeck(id='gearberry'){
 if(!Object.hasOwn(TAROT_DECKS,id))throw Error('未收录的塔罗牌面版本。');return TAROT_DECKS[id];
}
export function tarotCardArt(card,id='gearberry'){
 const deck=tarotDeck(id),filename=id==='gearberry'?card.gearberryImage:card.image;
 if(!filename)throw Error('塔罗牌面资料不完整，请刷新页面后重试。');
 // Minor-arcana ranks are identical in both decks. The older identification
 // data stores their rank as a Chinese word, so use the validated numeric rank.
 return {file:deck.directory+filename,number:id==='rws'&&card.suit==='大阿尔卡那'?card.number:card.gearberryNumber,width:deck.width,height:deck.height,deck:deck.id};
}
