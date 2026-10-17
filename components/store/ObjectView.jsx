'use client';
import {useState} from 'react';
import {objects,currency} from '@/lib/catalog';
import {Button} from '@/components/ui/button';
import {useCart} from './CartProvider';
import {useCuration} from './CurationProvider';
import BrandMnemonic from './BrandMnemonic';
import BaeteeDedication from './BaeteeDedication';
import ArtworkPricing from './ArtworkPricing';
import EditionNote from './EditionNote';
export default function ObjectView({id}){const p=objects.find(p=>p.id===id),{priceFor,pricingReady}=useCuration(),{add}=useCart(),[added,setAdded]=useState(false);return <main id="main" className="product-page"><nav className="product-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/collections/objects">Objects & accessories</a></nav><div className="product-layout"><div className="product-visual product-visual-object"><img src={p.image} alt={p.title}/><BrandMnemonic/></div><section className="product-details"><p className="store-kicker">{p.category} · Unisex</p><h1>{p.title}</h1><section className="product-brand-story"><img className="product-brand-logo" src="/brand/baetee-clear-logo.png" alt="BAETEE — Born in India"/><p>{p.description}</p><BaeteeDedication refreshKey={`object-${id}`} className="product-brand-dedication"/></section><p className="product-price">{currency.format(priceFor('object',p))}<small>Prices in INR · Price saved when added to bag</small></p><ArtworkPricing product={p}/><p className="size-fit-note">One size · Unisex</p><Button className="store-button product-add" disabled={!pricingReady} onClick={()=>{add(id,'Free size','object');setAdded(true)}}>{added?'Added to your bag':'Add to bag'}</Button>{added&&<p className="cart-feedback" role="status">Your selection is saved. <a href="/checkout">View bag</a></p>}<EditionNote/></section></div></main>}
