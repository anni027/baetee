import {artworkStories} from '@/lib/artwork-stories';
import BaeteeDedication from './BaeteeDedication';
export default function ProductBrandStory({id,compact=false}){
 return <section className={`product-brand-story ${compact?'product-brand-story-compact':''}`} aria-label="BAETEE artwork and dedication">
  <img className="product-brand-logo" src="/brand/baetee-clear-logo.png" alt="BAETEE — Born in India" width="1025" height="545"/>
  <h2>The art you wear</h2>
  <p>{artworkStories[id]}</p>
  <p className="product-brand-culture">At BAETEE, we see art as a way to carry what matters. Our culture celebrates individuality, thoughtful creation and the stories that connect generations.</p>
  <BaeteeDedication className="product-brand-dedication" refreshKey={id}/>
 </section>;
}
