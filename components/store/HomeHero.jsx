 'use client';
import {tees,jackets,sneakers,tumblers,totes,paintings,collectibles} from '@/lib/catalog';
import {useCuration} from './CurationProvider';
export default function HomeHero(){
 const {rank}=useCuration(),tee=rank(tees)[0];
 const matching=items=>items.find(p=>(p.designId||p.id)===tee.id)||items[0];
 const categories=[['Tees','/#shop',tee],['Tumblers','/collections/tumblers',matching(tumblers)],['Denim jackets','/collections/denim',matching(jackets)],['Sneakers','/collections/sneakers',matching(sneakers)],['Collectibles','/collections/dolls',matching(collectibles)],['Paintings','/commissions',matching(paintings)],['Tote bags','/collections/accessories',matching(totes)]];
 return <section className="home-feature-hero" aria-labelledby="home-hero-title"><div className="home-feature-copy"><p className="store-kicker">A tribute to the daughters of India</p><h1 id="home-hero-title">Art for the way you live.</h1><p className="home-feature-description">Stories inspired by the daughters of India. Discover art to wear, carry, display and treasure.</p><a href="#shop" className="store-button">Shop Tees</a></div><nav className="home-feature-products" aria-label="Shop all seven collections">{categories.map(([label,url,p],index)=><a key={label} className={index===0?'hero-feature-tee':undefined} href={url}><img src={p.image} alt={p.title||p.name} fetchPriority={index===0?'high':undefined}/><span>{label}</span></a>)}</nav></section>
}
