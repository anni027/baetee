import type { MedusaStoreRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import { publicCommissions } from '../../../../lib/commission-catalog'

export async function GET(req: MedusaStoreRequest, res: MedusaResponse) {
  const channels = req.publishable_key_context?.sales_channel_ids || []
  if (!channels.length) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, 'A storefront sales channel is required')
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const products: Parameters<typeof publicCommissions>[0] = []
  let skip = 0
  while (true) {
    const { data, metadata } = await query.graph({
      entity: 'product',
      fields: ['id', 'title', 'status', 'thumbnail', 'description', 'subtitle', 'metadata', 'images.url', 'sales_channels.id'],
      filters: { status: ['draft', 'published'] },
      pagination: { skip, take: 100, order: { id: 'ASC' } },
    })
    products.push(...data)
    skip += data.length
    if (!data.length || skip >= (metadata?.count || 0)) break
  }
  res.setHeader('Cache-Control', 'no-store')
  res.json(publicCommissions(products, channels))
}
