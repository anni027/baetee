import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules, ProductStatus } from '@medusajs/framework/utils'
import { createProductsWorkflow, updateProductsWorkflow, deleteProductsWorkflow } from '@medusajs/medusa/core-flows'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

// Run against the local apps only. Own fixtures are removed in finally; no real products are edited.
export default async function verifyCatalog({ container }: ExecArgs) {
  const local = (value: string) => ['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname)
  assert.notEqual(process.env.NODE_ENV, 'production')
  assert.ok(process.env.DATABASE_URL && local(process.env.DATABASE_URL), 'Only a local database may be tested')
  assert.equal(process.env.STORE_ASSET_BASE_URL?.replace(/\/$/, ''), 'http://localhost:3000')
  const base = 'http://localhost:3000', backend = 'http://localhost:9000'
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [channel] = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: 'BAETEE Online' })
  assert.ok(channel)
  const { data: keys } = await query.graph({ entity: 'api_key', fields: ['token', 'sales_channels.id'], filters: { type: 'publishable', title: 'BAETEE storefront' } })
  const key = keys.find(item => item.sales_channels?.length === 1 && item.sales_channels[0]?.id === channel.id)?.token
  assert.ok(key)
  const headers = { 'x-publishable-api-key': key }
  const gate = await fetch(`${backend}/store/baetee/checkout`, { headers }).then(response => response.json())
  assert.equal(gate.enabled, false, 'Run only while checkout is disabled')
  const tag = randomUUID(), legacyId = 900000000 + Math.floor(Math.random() * 100000000)
  const fixtureIds: string[] = []
  let cookie = ''
  async function html(path: string, expectedStatus = 200) {
    const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) })
    assert.equal(response.status, expectedStatus, path)
    return response.text()
  }
  async function api(method: string, body?: object) {
    const response = await fetch(`${base}/api/cart`, {
      method, headers: { origin: base, 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
    })
    assert.equal(response.status, 200)
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) cookie = setCookie.split(';')[0]
    return response.json()
  }
  try {
    // Create separately so the first fixture is tracked even if creating the second fails.
    const { result: tees } = await createProductsWorkflow(container).run({ input: { products: [{
      title: `Fixture tee ${tag}`, handle: `verify-tee-${tag}`, status: ProductStatus.PUBLISHED,
      description: `Original story ${tag}`, subtitle: `Original subtitle ${tag}`, thumbnail: `${base}/brand/baetee-ribbon-mark.svg`,
      metadata: { kind: 'tee', legacy_id: legacyId, painting: 'Fixture artwork' },
      sales_channels: [{ id: channel.id }], options: [{ title: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
      variants: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => ({ title: size, options: { Size: size }, manage_inventory: false, prices: [{ currency_code: 'inr', amount: 3999 }] })),
    }] } })
    fixtureIds.push(tees[0].id)
    const metadata = { kind: 'painting', legacy_id: legacyId, commission_only: true, storefront_visible: true, private_note: `private-${tag}` }
    const { result: paintings } = await createProductsWorkflow(container).run({ input: { products: [{
      title: `Fixture painting ${tag}`, handle: `verify-painting-${tag}`, status: ProductStatus.DRAFT,
      description: `Painting story ${tag}`, thumbnail: `${base}/brand/baetee-ribbon-mark.svg`, metadata,
      sales_channels: [{ id: channel.id }], options: [{ title: 'Request', values: ['Commission'] }], variants: [],
    }] } })
    fixtureIds.push(paintings[0].id)
    assert.ok((await html('/')).includes(`Fixture tee ${tag}`))
    assert.ok((await html('/commissions')).includes(`Fixture painting ${tag}`))
    const added = await api('POST', { id: legacyId, size: 'XS' })
    assert.equal(added.items[0].unitPrice, 3999)
    assert.equal(added.items[0].lineTotal, 3999)
    const lineId = added.items[0].lineId

    // The same workflow is used by Medusa Admin's product update route.
    await updateProductsWorkflow(container).run({ input: { products: [
      { id: tees[0].id, title: `Updated tee ${tag}`, description: `Updated story ${tag}`, subtitle: `Updated subtitle ${tag}`, thumbnail: `${base}/brand/baetee-ribbon-logo.svg` },
      { id: paintings[0].id, title: `Updated painting ${tag}`, description: `Updated painting story ${tag}`, thumbnail: `${base}/brand/baetee-ribbon-logo.svg` },
    ] } })
    const page = await html(`/product/tee/${legacyId}`)
    for (const value of [`Updated tee ${tag}`, `Updated story ${tag}`, `Updated subtitle ${tag}`, '/brand/baetee-ribbon-logo.svg']) assert.ok(page.includes(value), value)
    assert.ok((await html('/')).includes(`Updated tee ${tag}`))
    assert.ok((await html('/commissions')).includes(`Updated painting ${tag}`))
    assert.ok((await html(`/product/painting/${legacyId}`)).includes(`Updated painting story ${tag}`))
    const projection = await fetch(`${backend}/store/baetee/commissions`, { headers }).then(response => response.text())
    assert.ok(!projection.includes(`private-${tag}`))
    assert.equal((await fetch(`${backend}/store/baetee/commissions`)).status, 400)

    await updateProductsWorkflow(container).run({ input: { products: [
      { id: tees[0].id, status: ProductStatus.DRAFT },
      { id: paintings[0].id, metadata: { ...metadata, storefront_visible: false } },
    ] } })
    assert.ok(!(await html('/')).includes(`Updated tee ${tag}`))
    assert.ok(!(await html('/commissions')).includes(`Updated painting ${tag}`))
    await html(`/product/tee/${legacyId}`, 404)
    await html(`/product/painting/${legacyId}`, 404)
    const unavailable = await api('GET')
    assert.equal(unavailable.items[0].available, false)
    const removed = await api('PATCH', { id: legacyId, size: 'XS', lineId, quantity: 0 })
    assert.equal(removed.items.length, 0)
    console.log('Database product edits, images, descriptions, dynamic IDs, visibility, safe commission projection and unavailable cart removal passed.')
  } finally {
    if (fixtureIds.length) await deleteProductsWorkflow(container).run({ input: { ids: fixtureIds } })
  }
}
