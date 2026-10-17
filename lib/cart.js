import {tees} from './catalog.js';
export function cleanCart(raw){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const item of raw){
  if(!item||typeof item!=='object')continue;
  const id=Number(item.id??String(item.key||'').split('-')[2]);
  const product=tees.find(p=>p.id===id);
  if(!product)continue;
  const candidate=item.size??String(item.key||'').split('-')[3];
  const size=['XS','S','M','L','XL','XXL'].includes(candidate)?candidate:'M';
  const quantity=Math.max(1,Math.min(10,Math.floor(Number(item.quantity)||1)));
  const existing=result.find(p=>p.id===id&&p.size===size);
  if(existing)existing.quantity=Math.min(10,existing.quantity+quantity);else result.push({id,size,quantity});
 }
 return result;
}
