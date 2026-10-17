'use client';
import {useEffect,useState} from 'react';
import {dedicationCopy} from '@/lib/dedication-copy';
let lastIndex=-1;
export default function BaeteeDedication({className='',refreshKey}){
 const [index,setIndex]=useState(0);
 useEffect(()=>{
  function refresh(){
   let previous=lastIndex;
   try{const saved=localStorage.getItem('baetee-dedication');if(saved!==null)previous=Number(saved)}catch{}
   const valid=Number.isInteger(previous)&&previous>=0&&previous<dedicationCopy.length;
   const next=valid?(previous+1)%dedicationCopy.length:Math.floor(Math.random()*dedicationCopy.length);
   lastIndex=next;setIndex(next);
   try{localStorage.setItem('baetee-dedication',String(next))}catch{}
  }
  refresh();
  const restored=event=>{if(event.persisted)refresh()};
  window.addEventListener('pageshow',restored);
  return()=>window.removeEventListener('pageshow',restored);
 },[refreshKey]);
 return <p className={className}>{dedicationCopy[index]}</p>;
}
