import {readFileSync} from 'node:fs'
import {parseEnv} from 'node:util'
import assert from 'node:assert/strict'

const env = parseEnv(readFileSync(new URL('../.env.local', import.meta.url), 'utf8'))
const base = new URL(env.MEDUSA_BACKEND_URL)
assert.ok(['localhost','127.0.0.1'].includes(base.hostname), 'This check only creates carts in a local development backend')
const headers = {'x-publishable-api-key':env.MEDUSA_PUBLISHABLE_KEY,'content-type':'application/json'}
async function api(path,method='GET',body) {
  const response=await fetch(new URL(path,base),{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)})
  return {status:response.status,body:await response.json()}
}
const approved=JSON.parse(readFileSync(new URL('../backend/src/data/catalog.json',import.meta.url),'utf8'))
const catalog=await api(`/store/products?limit=100&region_id=${env.MEDUSA_REGION_ID}&fields=*variants.calculated_price,+metadata`)
assert.equal(catalog.status,200)
assert.equal(catalog.body.products.length,15)
for(const tee of approved.tees){
  const product=catalog.body.products.find(p=>Number(p.metadata?.legacy_id)===tee.id)
  assert.ok(product,`Missing tee ${tee.id}`)
  assert.equal(product.variants.length,6)
  assert.deepEqual(product.variants.map(v=>v.options[0].value).sort(),[...approved.sizes].sort())
  for(const variant of product.variants)assert.equal(variant.calculated_price.calculated_amount,tee.price)
}
console.log('Verified 15 tees, six sizes each, and all approved INR prices through the Store API.')

const created=await api('/store/carts','POST',{region_id:env.MEDUSA_REGION_ID})
assert.equal(created.status,200)
const cartId=created.body.cart.id,variantId=catalog.body.products[0].variants[0].id
const path=`/store/carts/${cartId}/line-items`
assert.equal((await api(path,'POST',{variant_id:variantId,quantity:9})).status,200)
const raced=await Promise.all([api(path,'POST',{variant_id:variantId,quantity:1}),api(path,'POST',{variant_id:variantId,quantity:1})])
assert.equal(raced.filter(r=>r.status===200).length,1,'Exactly one concurrent addition must succeed at quantity 9')
const cart=(await api(`/store/carts/${cartId}`)).body.cart
assert.equal(cart.items[0].quantity,10)
assert.equal((await api(`${path}/${cart.items[0].id}`,'POST',{quantity:11})).status,400)
console.log('Concurrent adds stop at 10; direct Store API quantity overflow is rejected.')

const gate=await api('/store/baetee/checkout')
assert.deepEqual(gate.body,{enabled:false},'Keep checkout closed while credentials and store rules are incomplete')
const collection=await api('/store/payment-collections','POST',{cart_id:cartId})
assert.equal(collection.status,200)
const manual=await api(`/store/payment-collections/${collection.body.payment_collection.id}/payment-sessions`,'POST',{provider_id:'pp_system_default'})
assert.equal(manual.status,403)
const completion=await api(`/store/carts/${cartId}/complete`,'POST',{})
assert.notEqual(completion.body.type,'order','Manual payment must never bypass the checkout gate')
console.log('Checkout gate is closed; a manual payment session cannot produce an unpaid order.')
