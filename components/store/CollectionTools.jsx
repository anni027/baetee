'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {paintings} from '@/lib/catalog';
export default function CollectionTools(){
 const router=useRouter();
 useEffect(()=>{
  const context=document.modelContext;if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  Promise.resolve().then(async()=>{
   await context.registerTool({name:'list_baetee_editions',title:'List BAETEE editions',description:'List the painting designs available by commission, without listed prices.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>paintings.map(p=>({id:p.id,title:p.title,manifestation:p.manifestation,commissionAvailable:true}))},{signal:lifecycle.signal});
   await context.registerTool({name:'start_baetee_commission',title:'Start BAETEE commission',description:'Navigate to the commission enquiry form for a painting. Does not submit or send an enquiry.',inputSchema:{type:'object',properties:{editionId:{type:'integer',minimum:1,maximum:Math.max(...paintings.map(p=>p.id))}},required:['editionId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const id=input?.editionId;if(!Number.isInteger(id)||!paintings.some(p=>p.id===id))throw new Error('Choose a design from the current catalogue.');router.push(`/product/painting/${id}`);return {status:'commission_navigation_started',editionId:id};}},{signal:lifecycle.signal});
  }).catch(()=>{});
  return()=>lifecycle.abort();
 },[router]);
 return null;
}
