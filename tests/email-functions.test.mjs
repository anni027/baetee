import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const token='fixture-email-token'
function harness(name) {
  let handler
  const calls=[]
  let failed=false
  const source=readFileSync(new URL(`../supabase/functions/${name}/index.ts`,import.meta.url),'utf8')
  const env={EMAIL_FUNCTION_TOKEN:token,RESEND_API_KEY:'fixture-resend-key',EMAIL_FROM:'store@example.com',COMMISSION_RECIPIENT:'owner@example.com',ORDER_RECIPIENT:'owner@example.com'}
  const context=vm.createContext({
    Deno:{serve:fn=>{handler=fn},env:{get:name=>env[name]}},Response,TextDecoder,AbortSignal,
    fetch:async (_url,init)=>{
      calls.push({headers:init.headers,body:JSON.parse(init.body)})
      return new Response('{}',{status:failed?500:200})
    },
  })
  vm.runInContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,context)
  return {calls,env,fail:()=>{failed=true},request:(body,secret=token)=>handler(new Request('http://localhost/function',{method:'POST',headers:{'x-baetee-token':secret,'content-type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)}))}
}

test('commission function rejects unauthorized, oversized and malformed requests',async()=>{
  const h=harness('send-commission')
  assert.equal((await h.request({},'invalid')).status,403)
  assert.equal((await h.request('x'.repeat(8193))).status,413)
  assert.equal((await h.request('null')).status,400)
  assert.equal(h.calls.length,0)
})

test('commission sends owner and customer plain text with stable retry keys',async()=>{
  const h=harness('send-commission')
  const body={requestId:'a'.repeat(64),name:'Customer',email:'customer@example.com',piece:'Test artwork',kind:'painting',details:'<script>alert(1)</script>',budget:5000}
  assert.equal((await h.request(body)).status,200)
  assert.equal(h.calls.length,2)
  assert.equal(h.calls[0].body.html,undefined)
  assert.equal(h.calls[0].body.text.includes(body.details),true)
  const keys=h.calls.map(call=>call.headers['Idempotency-Key'])
  assert.equal((await h.request(body)).status,200)
  assert.deepEqual(h.calls.slice(2).map(call=>call.headers['Idempotency-Key']),keys)
})

test('order mail accepts INR totals with paise, rejects invalid currency, and surfaces provider failure',async()=>{
  const h=harness('send-order')
  const body={orderId:'order_fixture',displayId:1,email:'customer@example.com',currency:'inr',total:4198.95}
  assert.equal((await h.request(body)).status,200)
  assert.equal(h.calls.length,2)
  assert.equal((await h.request({...body,currency:'usd'})).status,400)
  assert.equal((await h.request({...body,total:1.001})).status,400)
  assert.equal((await h.request('x'.repeat(2049))).status,413)
  h.fail()
  assert.equal((await h.request(body)).status,502)
  assert.equal(h.calls[2].headers['Idempotency-Key'],h.calls[0].headers['Idempotency-Key'])
})
