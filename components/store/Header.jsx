'use client';
import Link from 'next/link';
import CollectionTools from './CollectionTools';
import {usePathname} from 'next/navigation';
import {ShoppingBag} from 'lucide-react';
import {useCart} from './CartProvider';
export default function Header(){
 const {count}=useCart();const path=usePathname();
 return <><CollectionTools/><a className="skip-link" href="#main">Skip to content</a><div className="store-announcement">Hand-painted in India. Made to order.</div><header className="store-header"><Link href="/" aria-label="BAETEE home" className="store-logo"><img src="/brand/baetee-ribbon-logo.svg" alt="BAETEE — Born in India" width="1025" height="545"/></Link><nav aria-label="Main navigation"><Link href="/#shop" aria-current={path==='/'?'page':undefined}>Tee's</Link><a href="/commissions" aria-current={path.startsWith('/commissions')?'page':undefined}>Collectibles</a></nav><Link href="/checkout" className="store-bag" aria-label={`Shopping bag, ${count} ${count===1?'item':'items'}`}><ShoppingBag size={21} strokeWidth={1.5}/><span>Bag</span><span className="bag-count">{count}</span></Link></header></>;
}
