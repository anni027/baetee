'use client'
import Link from 'next/link'
import BrandMnemonic from './BrandMnemonic'
import ArtistSection from './ArtistSection'
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs'

export default function CommissionCollection({paintings,collectibles}) {
  return <main id="main" className="commissions-page">
    <div className="commission-intro"><p className="store-kicker">Paintings & collectibles</p><h1>A piece of<br/>your own.</h1><p>Paintings and the characters they inspired. Choose a piece and tell us about the commission you have in mind.</p></div>
    <Tabs defaultValue="paintings" className="commission-tabs">
      <TabsList className="commission-tab-list" aria-label="Commission category"><TabsTrigger value="paintings">Paintings</TabsTrigger><TabsTrigger value="collectibles">BAETEE collectibles</TabsTrigger></TabsList>
      {[
        ['paintings',paintings,'painting'],
        ['collectibles',collectibles,'baetee'],
      ].map(([value,products,kind])=><TabsContent key={value} value={value}>
        {!products.length&&<p>No pieces are available in this collection yet.</p>}
        <div className="commission-grid">{products.map(p=><article className="commission-card" key={p.id}>
          <Link href={`/product/${kind}/${p.id}`} className={`commission-card-image ${kind==='baetee'?'collectible-image':''}`}><img src={p.image} alt={p.title} loading="lazy"/><BrandMnemonic/></Link>
          <p className="store-kicker">{kind==='painting'?'Painting':'BAETEE collectible'}</p>
          <h2><Link href={`/product/${kind}/${p.id}`}>{p.title}</Link></h2>
          {kind==='baetee'&&p.painting&&<p className="commission-art-source">Inspired by {p.painting}</p>}
          <p className="commission-art-note">{p.story||p.manifestation||p.character}</p>
          <Link href={`/product/${kind}/${p.id}`} className="product-link">Submit your commission</Link>
        </article>)}</div>
      </TabsContent>)}
    </Tabs><ArtistSection/>
  </main>
}
