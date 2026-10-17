import type {Metadata} from 'next';
import {CartProvider} from '@/components/store/CartProvider';
import {CurationProvider} from '@/components/store/CurationProvider';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import './globals.css';
export const metadata:Metadata={title:{default:'BAETEE — Art. Objects. Worn.',template:'%s · BAETEE'},description:'Discover BAETEE Tees, painted denim and white sneakers. Paintings and collectibles by commission. A tribute to the daughters of India.',icons:{icon:'/brand/baetee-ribbon-mark.svg',shortcut:'/brand/baetee-ribbon-mark.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><CurationProvider><CartProvider><Header/>{children}<Footer/></CartProvider></CurationProvider></body></html>}
