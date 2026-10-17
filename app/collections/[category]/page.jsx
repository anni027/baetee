import DaughtersDates from '@/components/store/DaughtersDates';
import {notFound} from 'next/navigation';
import {collectionPages} from '@/lib/collections';
import {tees,collectibles,objects,jackets,sneakers} from '@/lib/catalog';
import CategoryNav from '@/components/store/CategoryNav';
import TeeCollectionGrid from '@/components/store/TeeCollectionGrid';
import CollectibleGrid from '@/components/store/CollectibleGrid';
export async function generateMetadata({params}){const {category}=await params;return {title:collectionPages[category]?.title||'Collection'}}
export default async function Page({params}){const {category}=await params;const config=collectionPages[category];if(!config)notFound();const source=config.kind==='tee'?tees:config.kind==='baetee'?collectibles:config.kind==='jacket'?jackets:config.kind==='sneaker'?sneakers:objects;const products=source.filter(p=>(!config.theme||p.theme===config.theme)&&(!config.category||p.category===config.category)).sort((a,b)=>Number(!!b.newRelease)-Number(!!a.newRelease));return <main id="main" className="collection-page"><CategoryNav/><div className="commission-intro"><p className="store-kicker">BAETEE collections</p><h1>{config.title}</h1><p>{config.intro}</p><p className="collection-count">{products.length} designs in this collection</p></div>{category==='tributes'&&<DaughtersDates/>}{config.kind!=='baetee'?<TeeCollectionGrid products={products} kind={config.kind}/>:<CollectibleGrid products={products}/> }</main>}
