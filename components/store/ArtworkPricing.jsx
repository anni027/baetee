import {artworkScope} from '@/lib/pricing';
export default function ArtworkPricing({product}){const scope=artworkScope(product);return <p className="artwork-pricing"><strong>{scope.label} · {scope.detailLabel}</strong><span>Price reflects the artwork’s coverage and detail.</span></p>}
