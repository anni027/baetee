import type {Metadata} from 'next';
import {CartProvider} from '@/components/store/CartProvider';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import './globals.css';
export const metadata:Metadata={title:{default:"BAETEE — Hand-painted Tee's",template:'%s · BAETEE'},description:'Shop hand-painted BAETEE Tee\'s from ₹3,499 to ₹5,499. Explore paintings and collectibles by commission. Born in India.',icons:{icon:'/brand/baetee-ribbon-mark.svg',shortcut:'/brand/baetee-ribbon-mark.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><CartProvider><Header/>{children}<Footer/></CartProvider></body></html>}
