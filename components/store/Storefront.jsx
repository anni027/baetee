'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {Check,ShoppingBag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {tees,currency} from '@/lib/catalog';
import {homeCopy,nextCopyIndex} from '@/lib/home-copy';
import {heroImages} from '@/lib/hero-images';
import {useCart} from './CartProvider';
import BrandMnemonic from './BrandMnemonic';
import ProductBrandStory from './ProductBrandStory';
import ArtistSection from './ArtistSection';
import BenefitTicker from './BenefitTicker';
import SizeGuide from './SizeGuide';
export default function Storefront(){
 const reduced=useReducedMotion(),{add}=useCart();
 const [copyIndex,setCopyIndex]=useState(0),lastCopy=useRef(-1);
 const [heroIndex,setHeroIndex]=useState(0),lastHero=useRef(-1);
 const [sort,setSort]=useState('collection'),[selected,setSelected]=useState(null),[size,setSize]=useState(''),[added,setAdded]=useState(false);
 useEffect(()=>{
  function refreshCopy(){
   let previous=lastCopy.current;
   try{const stored=localStorage.getItem('baetee-home-copy');if(stored!==null)previous=Number(stored)}catch{}
   const index=nextCopyIndex(previous);lastCopy.current=index;setCopyIndex(index);
   try{localStorage.setItem('baetee-home-copy',String(index))}catch{}
   let previousHero=lastHero.current;
   try{const saved=localStorage.getItem('baetee-home-image');if(saved!==null)previousHero=Number(saved)}catch{}
   const nextHero=nextCopyIndex(previousHero,heroImages.length);lastHero.current=nextHero;setHeroIndex(nextHero);
   try{localStorage.setItem('baetee-home-image',String(nextHero))}catch{}
  }
  refreshCopy();
  const restored=e=>{if(e.persisted)refreshCopy()};window.addEventListener('pageshow',restored);
  return()=>window.removeEventListener('pageshow',restored);
 },[]);
 const copy=homeCopy[copyIndex],hero=heroImages[heroIndex],catalog=tees;
 const featured=catalog.find(p=>p.id===hero.id)||catalog[0];
 const products=useMemo(()=>{const list=[...catalog];if(sort==='low')list.sort((a,b)=>a.price-b.price);if(sort==='high')list.sort((a,b)=>b.price-a.price);if(sort==='name')list.sort((a,b)=>a.painting.localeCompare(b.painting));return list},[sort]);
 function choose(tee){setSelected(tee);setSize('');setAdded(false)}
 return <main id="main" className="shopping-home">
  <section className="store-hero shopping-hero"><div className="hero-copy"><p className="store-kicker">Hand-painted Tee's</p><h1>{copy.headline}</h1><p className="hero-description">{copy.description}</p><a className="store-button" href="#shop">Shop the collection</a></div><a className="hero-editorial" href={`/product/tee/${featured.id}`}><img src={hero.image} alt={`Model wearing the hand-painted ${featured.painting} Tee`} fetchPriority="high"/><div className="hero-product-label"><span>{featured.painting}</span><strong>{currency.format(featured.price)}</strong></div><BrandMnemonic className="hero-mnemonic"/></a></section>
  <BenefitTicker/>
  <section className="shop-section" id="shop" aria-labelledby="shop-title"><div className="section-heading shop-heading"><div><p className="store-kicker">Find your favourite</p><h2 id="shop-title">Shop Tee's</h2><p className="shop-count">15 designs · Hand-painted on ivory</p></div><div className="shop-sort"><label id="shop-sort-label">Sort by</label><Select value={sort} onValueChange={setSort}><SelectTrigger aria-labelledby="shop-sort-label" className="store-select"><SelectValue/></SelectTrigger><SelectContent className="store-select-options"><SelectItem value="collection">Collection order</SelectItem><SelectItem value="low">Price: low to high</SelectItem><SelectItem value="high">Price: high to low</SelectItem><SelectItem value="name">Name: A to Z</SelectItem></SelectContent></Select></div></div>
   <div className="tee-grid">{products.map((tee,index)=><motion.article key={tee.id} initial={false} whileHover={reduced?undefined:{y:-3}} transition={{duration:.2}} className="tee-card"><a href={`/product/tee/${tee.id}`} className="tee-card-image"><img src={tee.image} alt={tee.title} loading={index<2?'eager':'lazy'} width="900" height="1100"/><BrandMnemonic/></a><div className="tee-card-copy"><div><a href={`/product/tee/${tee.id}`}><h3>{tee.painting}</h3></a><p>Hand-painted · Ivory</p></div><strong>{currency.format(tee.price)}</strong></div><Button className="card-quick-add" onClick={()=>choose(tee)} aria-label={`Add ${tee.painting} to bag — choose your size`}><ShoppingBag size={15}/>Add to bag</Button></motion.article>)}</div>
  </section>
  <section className="commission-feature"><div className="commission-feature-image"><img src="/art/08-water-remembers-the-lotus.png" alt="Water Remembers the Lotus painting" loading="lazy"/><img src="/collectible/baegirl-08-water-remembers-lotus.png" alt="The Lotus Memory BAETEE collectible" loading="lazy"/></div><div className="commission-feature-copy"><p className="store-kicker">Beyond the wardrobe</p><h2>A piece of<br/>your own.</h2><p>Explore the paintings and BAETEE collectibles behind the tees. Tell us which piece speaks to you.</p><a href="/commissions" className="store-button store-button-light">Submit your commission</a><small>Paintings & collectibles · By commission</small></div></section><ArtistSection/>
  <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className="quick-add-dialog"><DialogTitle className="quick-add-title">{selected?.painting||'Choose your Tee'}</DialogTitle><DialogDescription>Loose fit. Hand-painted on ivory. Made to order.</DialogDescription>{selected&&<><div className="quick-add-product"><img src={selected.image} alt={selected.title}/><div className="quick-add-pricing"><strong>{currency.format(selected.price)}</strong><a href={`/product/tee/${selected.id}`}>View full details</a></div><ProductBrandStory id={selected.id} compact/></div><p className="quick-add-assurance">Hand-painted in India · Made to order · Each brushstroke is individual</p><div className="size-selector-heading"><label id="quick-size-label">Choose your size</label><SizeGuide/></div><p className="size-fit-note">Relaxed, loose fit</p><Select value={size} onValueChange={value=>{setSize(value);setAdded(false)}}><SelectTrigger aria-labelledby="quick-size-label" className="store-select"><SelectValue placeholder="Select size"/></SelectTrigger><SelectContent className="store-select-options">{['XS','S','M','L','XL','XXL'].map(value=><SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Button className="store-button" disabled={!size} onClick={()=>{add(selected.id,size);setAdded(true)}}>{added?<><Check size={17}/>Add another</>:'Add to bag'}</Button>{added&&<p className="quick-add-feedback" role="status">Added to your bag in size {size}. <a href="/checkout">View bag</a></p>}</>}</DialogContent></Dialog>
 </main>;
}
