'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {productFor} from '@/lib/catalog';
import {useCuration} from './CurationProvider';
import {cleanCart} from '@/lib/cart';
const CartContext=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState([]),[ready,setReady]=useState(false);const {priceFor,snapshot}=useCuration();
 useEffect(()=>{try{setItems(cleanCart(JSON.parse(localStorage.getItem('baetee-cart')||'[]')))}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('baetee-cart',JSON.stringify(items))}catch{}},[items,ready]);
 function add(id,size='Free size',kind='tee'){const product=productFor(kind,id);if(!product||!['tee','jacket','sneaker','object'].includes(kind))return;setItems(prev=>{const old=prev.find(p=>p.kind===kind&&p.id===id);return old?prev.map(p=>p===old?{...p,quantity:Math.min(10,p.quantity+1)}:p):[...prev,{kind,id,size:kind==='sneaker'?'Fit check':'Free size',quantity:1,unitPrice:priceFor(kind,product),priceVersion:'artwork-scope-2026-10-07'}]})}
 function update(id,size,quantity,kind='tee'){setItems(prev=>quantity<=0?prev.filter(p=>!(p.kind===kind&&p.id===id&&p.size===size)):prev.map(p=>p.kind===kind&&p.id===id&&p.size===size?{...p,quantity:Math.min(10,quantity)}:p))}
 const count=items.reduce((sum,p)=>sum+p.quantity,0);
 const total=items.reduce((sum,p)=>sum+p.unitPrice*p.quantity,0);
 return <CartContext.Provider value={{items,add,update,count,total,ready}}>{children}</CartContext.Provider>;
}
export function useCart(){return useContext(CartContext)}
