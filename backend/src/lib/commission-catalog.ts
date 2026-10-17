type CommissionProduct = {
  id: string; title: string; status: string; thumbnail?: string | null
  description?: string | null; subtitle?: string | null
  images?: Array<{ url: string } | null> | null
  metadata?: Record<string, unknown> | null
  sales_channels?: Array<{ id: string } | null> | null
}

type PublicPiece = { id: number; title: string; image: string; story: string; manifestation: string; painting: string; character: string; palette: string }
const text = (value: unknown) => typeof value === 'string' ? value : ''

// Deliberate public projection: never return the original metadata, variants or internal fields.
export function publicCommissions(products: CommissionProduct[], channelIds: string[]) {
  const paintings: PublicPiece[] = [], collectibles: PublicPiece[] = []
  const ids = new Set<string>()
  for (const product of products) {
    const meta = product.metadata
    if (!meta || meta.commission_only !== true || meta.storefront_visible !== true ||
        !['draft', 'published'].includes(product.status) || !['painting', 'collectible'].includes(text(meta.kind)) ||
        !product.sales_channels?.some(channel => channel && channelIds.includes(channel.id))) continue
    const id = Number(meta.legacy_id)
    if (!Number.isSafeInteger(id) || id < 1) continue
    const identity = `${meta.kind}:${id}`
    if (ids.has(identity)) throw new Error('Commission IDs must be unique within a collection')
    ids.add(identity)
    const piece = {
      id, title: product.title, image: product.thumbnail || product.images?.find(image => image?.url)?.url || '/brand/baetee-ribbon-mark.svg',
      story: product.description ?? text(meta.story), manifestation: product.subtitle ?? text(meta.manifestation),
      painting: text(meta.painting), character: text(meta.character), palette: text(meta.palette),
    }
    if (meta.kind === 'painting') paintings.push(piece)
    else collectibles.push(piece)
  }
  const byId = (a: { id: number }, b: { id: number }) => a.id - b.id
  return { paintings: paintings.sort(byId), collectibles: collectibles.sort(byId) }
}
