import {productFor} from './catalog.js';
import {priceBands} from './curation.js';
export function cleanCart(raw){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const item of raw.slice(0,120)){
  if(!item||typeof item!=='object')continue;
  const id=Number(item.id??String(item.key||'').split('-')[2]);
  const kind=['tee','jacket','sneaker','object'].includes(item.kind)?item.kind:'tee';
  const product=productFor(kind,id);
  if(!product)continue;
  const size=kind==='sneaker'?'Fit check':'Free size';
  const [min,max]=priceBands[kind];
  const unitPrice=Number.isFinite(item.unitPrice)&&item.unitPrice>=min&&item.unitPrice<=max?item.unitPrice:product.price;
  const quantity=Math.max(1,Math.min(10,Math.floor(Number(item.quantity)||1)));
  const existing=result.find(p=>p.kind===kind&&p.id===id&&p.size===size);
  if(existing)existing.quantity=Math.min(10,existing.quantity+quantity);else result.push({kind,id,size,quantity,unitPrice,priceVersion:typeof item.priceVersion==='string'?item.priceVersion.slice(0,80):'catalogue'});
 }
 return result;
}
