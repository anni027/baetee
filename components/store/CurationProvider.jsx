'use client';
import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {artworkPrice} from '@/lib/pricing';
import {shuffleProducts} from '@/lib/curation';
const CurationContext=createContext(null);
export function CurationProvider({children}){
 const [snapshot,setSnapshot]=useState(null),[seed,setSeed]=useState(0),[pricingReady,setPricingReady]=useState(true);
 useEffect(()=>{
  setSeed(Math.floor(Math.random()*2147483647));const controller=new AbortController();let settled=false;
  const finish=data=>{if(settled)return;settled=true;if(data)setSnapshot(data);setPricingReady(true)};
  const timeout=setTimeout(()=>{finish(null);controller.abort()},12000);
  fetch('/api/curation',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json()}).then(finish).catch(()=>finish(null));
  return()=>{settled=true;clearTimeout(timeout);controller.abort()};
 },[]);
 const priceFor=useCallback((kind,p)=>artworkPrice(kind,p),[]);
 const rank=useCallback(products=>shuffleProducts(products,snapshot?.scores,seed),[snapshot,seed]);
 return <CurationContext.Provider value={{snapshot,priceFor,rank,seed,pricingReady}}>{children}</CurationContext.Provider>;
}
export function useCuration(){return useContext(CurationContext)}
