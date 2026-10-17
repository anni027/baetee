'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {tees} from '@/lib/catalog';
import {cleanCart} from '@/lib/cart';
const CartContext=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState([]),[ready,setReady]=useState(false);
 useEffect(()=>{try{setItems(cleanCart(JSON.parse(localStorage.getItem('baetee-cart')||'[]')))}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('baetee-cart',JSON.stringify(items))}catch{}},[items,ready]);
 function add(id,size){setItems(prev=>{const old=prev.find(p=>p.id===id&&p.size===size);return old?prev.map(p=>p===old?{...p,quantity:Math.min(10,p.quantity+1)}:p):[...prev,{id,size,quantity:1}]})}
 function update(id,size,quantity){setItems(prev=>quantity<=0?prev.filter(p=>!(p.id===id&&p.size===size)):prev.map(p=>p.id===id&&p.size===size?{...p,quantity:Math.min(10,quantity)}:p))}
 const count=items.reduce((sum,p)=>sum+p.quantity,0);
 const total=items.reduce((sum,p)=>sum+tees.find(t=>t.id===p.id).price*p.quantity,0);
 return <CartContext.Provider value={{items,add,update,count,total,ready}}>{children}</CartContext.Provider>;
}
export function useCart(){return useContext(CartContext)}
