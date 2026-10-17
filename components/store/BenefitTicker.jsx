'use client';
import {useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
const benefits=['Hand-painted in India','Made to order','Choose XS–XXL'];
export default function BenefitTicker(){
 const [paused,setPaused]=useState(false);
 return <section className="shopping-benefits benefit-ticker" aria-label="BAETEE Tee details">
  <p className="sr-only">{benefits.join('. ')}.</p>
  <div className="ticker-window" aria-hidden="true"><div className={`ticker-track ${paused?'is-paused':''}`}>{[0,1].map(copy=><div className="ticker-group" key={copy}>{benefits.map(text=><span className="ticker-item" key={text}><span className="ticker-divider">{'\u2726'}</span>{text}</span>)}</div>)}</div></div>
  <Button className="ticker-toggle" variant="ghost" size="icon" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Resume scrolling benefits':'Pause scrolling benefits'} title={paused?'Resume ticker':'Pause ticker'}>{paused?<Play size={14}/>:<Pause size={14}/>}</Button>
 </section>;
}
