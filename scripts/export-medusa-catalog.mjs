import { writeFileSync } from 'node:fs'
import { paintings, collectibles, tees } from '../lib/catalog.js'
import { artworkStories } from '../lib/artwork-stories.js'

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
if (tees.length !== 15 || paintings.length !== 15 || collectibles.length !== 15) {
  throw new Error('Expected 15 items in each BAETEE collection')
}
const ids = (items) => items.map((item) => item.id).join(',')
if ([tees, paintings, collectibles].some((items) => ids(items) !== '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15')) {
  throw new Error('Catalog IDs must stay stable from 1 to 15')
}
const expectedPrices = [3999, 4499, 4499, 4999, 5499, 4999, 3499, 3499, 3999, 5499, 5499, 4499, 3499, 3999, 4999]
if (tees.some((item, index) => item.price !== expectedPrices[index])) {
  throw new Error('Tee price differs from the approved pricing table')
}
if ([...paintings, ...collectibles].some((item) => 'price' in item)) {
  throw new Error('Commission items must not have prices')
}
const catalog = {
  sizes,
  tees: tees.map(({ id, title, painting, image, manifestation, price }) => ({ id, title, painting, image, manifestation, story: artworkStories[id], price })),
  paintings: paintings.map(({ id, title, image, manifestation, palette }) => ({ id, title, image, manifestation, palette, story: artworkStories[id] })),
  collectibles: collectibles.map(({ id, name, painting, image, character }) => ({ id, name, painting, image, character, story: artworkStories[id] })),
}
writeFileSync(new URL('../backend/src/data/catalog.json', import.meta.url), `${JSON.stringify(catalog, null, 2)}\n`)
console.log('Exported 15 tees, 15 paintings and 15 collectibles with approved prices.')
