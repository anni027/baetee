import assert from 'node:assert/strict'

const base='http://localhost:3000'
async function api(path,method='GET',body,cookie,origin=base){
  const response=await fetch(base+path,{method,headers:{...(body===undefined?{}:{'content-type':'application/json',origin}),...(cookie?{cookie}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)})
  return {status:response.status,headers:response.headers,body:await response.json()}
}
for(const path of ['/','/product/tee/1','/product/painting/1','/commissions','/checkout'])assert.equal((await fetch(base+path)).status,200)
assert.equal((await api('/api/cart','POST',{id:1,size:'XS'},undefined,'https://foreign.example')).status,403)
assert.equal((await api('/api/cart','POST',null)).status,400)
const add=await api('/api/cart','POST',{id:1,size:'XS'})
assert.equal(add.status,200)
const setCookie=add.headers.get('set-cookie')
assert.ok(setCookie?.toLowerCase().includes('httponly'))
assert.ok(setCookie?.toLowerCase().includes('samesite=lax'))
const cookie=setCookie.split(';')[0]
assert.equal(add.body.total,3999)
const updated=await api('/api/cart','PATCH',{id:1,size:'XS',quantity:2},cookie)
assert.equal(updated.status,200)
assert.equal(updated.body.total,7998)
assert.equal((await api('/api/cart','GET',undefined,cookie)).body.items[0].quantity,2)
assert.equal((await api('/api/cart','PATCH',{id:1,size:'XS',quantity:0},cookie)).body.items.length,0)
assert.equal((await api('/api/checkout')).body.enabled,false)
assert.equal((await api('/api/requests','POST',{})).status,503)
console.log('Storefront pages, cookie cart add/update/remove, server totals, Origin/JSON guards and disabled service gates passed.')
