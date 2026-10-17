'use client';
import AutoTicker from './AutoTicker';
const categories=[['Tees','/#shop'],['Paintings','/commissions'],['Collectibles','/collections/dolls'],['Denim jackets','/collections/denim'],['White sneakers','/collections/sneakers'],['Tumblers','/collections/tumblers'],['Tote bags','/collections/accessories'],['Masters reimagined','/collections/masters']];
export default function CategoryNav(){return <AutoTicker as="nav" className="category-ticker" label="Shop by collection" reverse>{[0,1].map(copy=><div className="ticker-group category-group" key={copy} aria-hidden={copy===1?true:undefined}>{categories.map(([label,url])=><a key={url} href={url} tabIndex={copy===1?-1:undefined}>{label}</a>)}</div>)}</AutoTicker>}
