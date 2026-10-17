'use client';
import {useCuration} from './CurationProvider';
import BrandMnemonic from './BrandMnemonic';
import {artworkStories} from '@/lib/artwork-stories';
export default function CollectibleGrid({products}){const {rank}=useCuration();return <div className="commission-grid">{rank(products).map(p=><article key={p.id} className="commission-card"><a href={`/product/baetee/${p.id}`} className="commission-card-image"><img src={p.image} alt={p.name} loading="lazy"/><BrandMnemonic/></a><p className="store-kicker">BAETEE collectible</p><h2><a href={`/product/baetee/${p.id}`}>{p.name}</a></h2><p className="commission-art-source">Inspired by {p.painting}</p><p className="commission-art-note">{artworkStories[p.id]||p.character}</p><a className="product-link" href={`/product/baetee/${p.id}`}>Submit your commission</a></article>)}</div>}
