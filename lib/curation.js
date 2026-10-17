export const trendSource='https://trends.google.com/trending/rss?geo=IN';
import {priceBands,artworkPrice} from './pricing.js';
export {priceBands} from './pricing.js';
const designTags={
 1:['flowers','gardening'],2:['gardening','roots'],3:['garden','nature'],4:['sunflower','van gogh'],5:['flowers','spring'],6:['spring','flowers'],7:['garden','gardening'],8:['lotus','monet'],9:['gardening','garden'],10:['home','family'],11:['rose','flowers'],12:['gardening','plants'],13:['orchard','garden'],14:['jasmine','flowers'],15:['sunflower','flowers'],
 16:['van gogh','sunflower'],17:['monet','lotus','water lilies'],18:['raja ravi varma','ravi varma','indian art'],19:['kalpana chawla','space','astronaut','nasa','isro','chandrayaan'],20:['jasmine','flowers'],21:['botany','gardening','plants'],22:['monsoon','rain','cycling'],23:['solar','renewable energy'],24:['space','astronomy','telescope','isro','nasa'],25:['marigold','self expression'],26:['ocean','sea','surfing'],27:['coding','technology','space','artificial intelligence'],28:['renoir','friendship'],29:['desert','cactus'],30:['degas','ballet','dance'],31:['riya ahir','bus painting','street art'],32:['rooftop garden','gardening'],33:['weaving','handloom'],34:['marine research','ocean conservation'],35:['education','literacy'],36:['kite making','kite festival']
};
function textValue(value){return value.replace(/^<!\[CDATA\[|\]\]>$/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').slice(0,180)}
export function parseTrends(xml){
 if(typeof xml!=='string'||xml.length>500000)throw new Error('Invalid trend feed');
 return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,100).flatMap(([,item])=>{
  const title=textValue(item.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'').trim();
  const traffic=item.match(/<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/)?.[1]||'';
  const date=Date.parse(item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]||'');
  let volume=Number(traffic.replace(/[^\d.]/g,''));if(/K/i.test(traffic))volume*=1000;if(/M/i.test(traffic))volume*=1000000;
  return title&&Number.isFinite(volume)?[{title,volume,date:Number.isFinite(date)?date:0}]:[];
 });
}
export function buildCuration(trends,now=Date.now()){
 const scores={};const matches={};const recent=trends.filter(t=>t.date>now-72*3600000&&t.date<=now+3600000);const maximum=Math.max(1,...recent.map(t=>t.volume));
 for(const [id,tags] of Object.entries(designTags)){
  const related=recent.filter(t=>tags.some(tag=>new RegExp('(?:^|\\W)'+tag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|\\W)','i').test(t.title)));
  scores[id]=related.length?Math.min(1,Math.max(...related.map(t=>Math.log1p(t.volume)/Math.log1p(maximum)))):0;matches[id]=related.map(t=>t.title).slice(0,3);
 }
 const prices={};for(const kind of Object.keys(priceBands)){prices[kind]={};for(let id=1;id<=31;id++)prices[kind][id]=artworkPrice(kind,{id});}
 return {version:new Date(now).toISOString(),source:trendSource,fetchedAt:new Date(now).toISOString(),scores,matches,prices,hasFeed:trends.length>0};
}
export function shuffleProducts(products,scores={},seed=0){
 const random=id=>{let x=(id*2654435761+seed)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};
 return [...products].sort((a,b)=>(scores[b.designId||b.id]||0)-(scores[a.designId||a.id]||0)||random(a.id)-random(b.id));
}
