import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publicCommissions } from '../src/lib/commission-catalog'

const piece = {
  id: 'prod_fixture', title: 'Admin title', status: 'draft', thumbnail: '/new-image.png', description: 'Admin story', subtitle: 'Admin subtitle',
  metadata: { kind: 'painting', legacy_id: 1, commission_only: true, storefront_visible: true, story: 'Old story', private_note: 'Never expose' },
  sales_channels: [{ id: 'sc_baetee' }], internal_note: 'Internal', variants: [{ price: 999 }],
}

test('commission projection exposes only display fields for explicitly visible, channel-linked pieces', () => {
  const result = publicCommissions([piece], ['sc_baetee'])
  assert.deepEqual(result.paintings, [{ id: 1, title: 'Admin title', image: '/new-image.png', story: 'Admin story', manifestation: 'Admin subtitle', painting: '', character: '', palette: '' }])
  assert.deepEqual(result.collectibles, [])
  for (const changed of [
    { ...piece, metadata: { ...piece.metadata, storefront_visible: false } },
    { ...piece, metadata: { ...piece.metadata, storefront_visible: undefined } },
    { ...piece, metadata: { ...piece.metadata, commission_only: false } },
    { ...piece, metadata: { ...piece.metadata, kind: 'tee' } },
    { ...piece, metadata: { ...piece.metadata, legacy_id: 0 } },
    { ...piece, status: 'rejected' }, { ...piece, sales_channels: [] },
  ]) assert.deepEqual(publicCommissions([changed], ['sc_baetee']).paintings, [])
  assert.deepEqual(publicCommissions([piece], ['another-channel']).paintings, [])
  assert.deepEqual(publicCommissions([piece], []).paintings, [])
})

test('commission IDs are unique within each kind and blank Admin content stays blank', () => {
  assert.throws(() => publicCommissions([piece, { ...piece, id: 'prod_duplicate' }], ['sc_baetee']))
  const result = publicCommissions([{ ...piece, description: '', subtitle: '' }, { ...piece, metadata: { ...piece.metadata, kind: 'collectible' } }], ['sc_baetee'])
  assert.equal(result.paintings[0].story, '')
  assert.equal(result.paintings[0].manifestation, '')
  assert.equal(result.collectibles.length, 1)
})
