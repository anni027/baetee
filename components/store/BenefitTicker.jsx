'use client';
import AutoTicker from './AutoTicker';
const benefits=['Hand-painted in India','Made to order','Free size · Unisex'];
export default function BenefitTicker(){return <AutoTicker className="benefit-ticker" label="BAETEE collection details">{[0,1].map(copy=><div className="ticker-group" key={copy} aria-hidden={copy===1?true:undefined}>{benefits.map(text=><span className="ticker-item" key={text}><span className="ticker-divider" aria-hidden="true">✦</span>{text}</span>)}</div>)}</AutoTicker>}
