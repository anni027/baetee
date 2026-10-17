'use client';
import {useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {Check,ShoppingBag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {currency} from '@/lib/catalog';
import {useCart} from './CartProvider';
import {useCuration} from './CurationProvider';
import BrandMnemonic from './BrandMnemonic';
import ProductBrandStory from './ProductBrandStory';
import SizeGuide from './SizeGuide';
export default function TeeCollectionGrid({products,kind='tee',shuffle=true}){
 const reduced=useReducedMotion(),{add}=useCart(),{priceFor,rank,pricingReady}=useCuration();
 const [selected,setSelected]=useState(null),[added,setAdded]=useState(false);const list=shuffle?rank(products):products;
 const label=kind==='jacket'?'Denim jacket':kind==='sneaker'?'White sneakers':kind==='object'?'Art object':'Tee';
 return <><div className="tee-grid">{list.map((p,index)=><motion.article key={p.id} initial={false} whileHover={reduced?undefined:{y:-3}} transition={{duration:.2}} className="tee-card"><a href={`/product/${kind}/${p.id}`} className="tee-card-image"><img src={p.image} alt={p.title} loading={index<2?'eager':'lazy'} width="900" height="1125"/><BrandMnemonic/></a><div className="tee-card-copy"><div><a href={`/product/${kind}/${p.id}`}><h3>{p.painting||p.title}</h3></a><p>{p.category||label} · {kind==='sneaker'?'Fit checked':kind==='object'?'One size':'Free size'} · Unisex</p></div><strong>{currency.format(priceFor(kind,p))}</strong></div><Button className="card-quick-add" disabled={!pricingReady} onClick={()=>{setSelected(p);setAdded(false)}} aria-label={`Add ${p.painting} ${label} to bag`}><ShoppingBag size={15}/>Add to bag</Button></motion.article>)}</div><Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className="quick-add-dialog"><DialogTitle className="quick-add-title">{selected?.painting||selected?.title||'Your BAETEE piece'}</DialogTitle><DialogDescription>{label} · Unisex</DialogDescription>{selected&&<><div className="quick-add-product"><img src={selected.image} alt={selected.title}/><div className="quick-add-pricing"><strong>{currency.format(priceFor(kind,selected))}</strong><a href={`/product/${kind}/${selected.id}`}>View full details</a></div><ProductBrandStory id={selected.designId||selected.id} compact/></div>{kind==='sneaker'?<p className="quick-add-assurance">First, a plain pair for your fit check. Return it for painting using BAETEE-paid Blue Dart shipping. The painted pair then comes back to you.</p>:<div className="size-selector-heading"><p>{kind==='object'?'One size · Unisex':'One free size · Unisex'}</p>{kind!=='object'&&<SizeGuide/>}</div>}<Button className="store-button" disabled={!pricingReady} onClick={()=>{add(selected.id,kind==='sneaker'?'Fit check':'Free size',kind);setAdded(true)}}>{added?<><Check size={17}/>Add another</>:'Add to bag'}</Button>{added&&<p className="quick-add-feedback" role="status">Added to your bag. <a href="/checkout">View bag</a></p>}</>}</DialogContent></Dialog></>;
}
