import { test, type TestContext } from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import RazorpayProvider, { toPaise, validSignature } from "../src/modules/razorpay/service"
import { assertCheckoutEnabled, assertQuantity } from "../src/lib/store-policy"

const options = { key_id: "rzp_test_fixture", key_secret: "test-only-secret", webhook_secret: "test-only-webhook-secret" }
const unusedRefunds = { refund: async () => { throw new Error('This test must not attempt a refund') } }
const session = { order_id: "order_fixture", session_id: "payses_fixture", amount: 399900, currency: "INR", key_id: options.key_id }
const order = { id: session.order_id, amount: session.amount, currency: "INR", notes: { medusa_session_id: session.session_id } }
const payment = { id: "pay_fixture", order_id: order.id, amount: order.amount, currency: "INR", status: "captured", amount_refunded: 0 }

function mock(t: TestContext, handler: (path: string, init?: RequestInit) => unknown) {
  const original = globalThis.fetch
  globalThis.fetch = (async (url, init) => new Response(JSON.stringify(handler(new URL(String(url)).pathname, init)), { status: 200 })) as typeof fetch
  t.after(() => { globalThis.fetch = original })
}

test("INR amounts convert to paise without silently rounding fractions", () => {
  assert.equal(toPaise(3999), 399900)
  assert.equal(toPaise("12.34"), 1234)
  for (const amount of [0, -1, 1.001, Number.NaN, Number.MAX_SAFE_INTEGER]) assert.throws(() => toPaise(amount))
})

test("raw webhook signature rejects tampered bodies and malformed signatures", () => {
  const raw = '{ "event": "payment.captured" }'
  const signature = createHmac("sha256", options.webhook_secret).update(raw).digest("hex")
  assert.equal(validSignature(raw, signature, options.webhook_secret), true)
  assert.equal(validSignature(raw.replace("captured", "failed"), signature, options.webhook_secret), false)
  assert.equal(validSignature(raw, "bad", options.webhook_secret), false)
})

test("initiation stores only server-created amounts and public checkout data", async t => {
  mock(t, (path, init) => {
    assert.equal(path, "/v1/orders")
    const payload = JSON.parse(String(init?.body))
    assert.equal(payload.amount, 399900)
    assert.equal(payload.notes.medusa_session_id, session.session_id)
    return order
  })
  const result = await new RazorpayProvider({}, options, unusedRefunds).initiatePayment({ amount: 3999, currency_code: "inr", data: { session_id: session.session_id, amount: 1, key_secret: "forged" } })
  assert.equal(result.data?.amount, 399900)
  assert.equal(result.data?.key_secret, undefined)
  assert.equal(result.status, "pending")
})

test("authorization requires captured payment and checks amount, currency and session ownership", async t => {
  let apiOrder = { ...order }
  let apiPayment = { ...payment, status: "authorized" }
  mock(t, path => path.endsWith("/payments") ? { items: [apiPayment] } : apiOrder)
  const provider = new RazorpayProvider({}, options, unusedRefunds)
  assert.equal((await provider.authorizePayment({ data: session })).status, "requires_more")
  apiPayment = { ...payment }
  assert.equal((await provider.authorizePayment({ data: session })).status, "captured")
  await assert.rejects(provider.authorizePayment({ data: session, context: { idempotency_key: "payses_foreign" } }))
  apiOrder = { ...order, amount: 1 }
  await assert.rejects(provider.authorizePayment({ data: session }))
})

test("partial and full refund retries use Medusa refund IDs as gateway idempotency keys", async t => {
  const calls: string[] = []
  mock(t, (path, init) => {
    if (path.endsWith("/refund")) {
      const payload = JSON.parse(String(init?.body))
      assert.equal(payload.amount, 123400)
      const headers = init?.headers as Record<string, string>
      calls.push(headers["X-Refund-Idempotency"])
      return { id: "rfnd_fixture", payment_id: payment.id, amount: payload.amount, status: "processed" }
    }
    return path.endsWith("/payments") ? { items: [payment] } : order
  })
  const provider = new RazorpayProvider({}, options, { refund: async (_paymentId: string, amount: number, key: string, _committed: number, _gateway: number, send: (key: string) => Promise<string>) => ({ refund_id: await send(key), refunded_total: amount }) })
  const input = { data: session, amount: 1234, context: { idempotency_key: "refnd_fixture01" } }
  await provider.refundPayment(input)
  await provider.refundPayment(input)
  assert.deepEqual(calls, ["refnd_fixture01", "refnd_fixture01"])
  await assert.rejects(provider.refundPayment({ data: session, amount: 1234 }))
})

test("duplicate captured webhooks map to the same session; failed events never downgrade it", async t => {
  mock(t, path => path.endsWith("/payments") ? { items: [payment] } : order)
  const provider = new RazorpayProvider({}, options, unusedRefunds)
  function webhook(event: string) {
    const rawData = JSON.stringify({ event, payload: { payment: { entity: payment } } })
    return { rawData, data: {}, headers: { "x-razorpay-signature": createHmac("sha256", options.webhook_secret).update(rawData).digest("hex") } }
  }
  const first = await provider.getWebhookActionAndData(webhook("payment.captured"))
  assert.equal(first.action, "captured")
  assert.equal(first.data?.session_id, session.session_id)
  assert.deepEqual(await provider.getWebhookActionAndData(webhook("payment.captured")), first)
  assert.equal((await provider.getWebhookActionAndData(webhook("payment.failed"))).action, "not_supported")
  const forged = webhook("payment.captured"); forged.headers["x-razorpay-signature"] = "0".repeat(64)
  await assert.rejects(provider.getWebhookActionAndData(forged))
})

test("paid payments cannot be silently canceled and pending order amounts cannot change", async t => {
  mock(t, path => path.endsWith("/payments") ? { items: [payment] } : order)
  const provider = new RazorpayProvider({}, options, unusedRefunds)
  await assert.rejects(provider.cancelPayment({ data: session }))
  await assert.rejects(provider.updatePayment({ data: session, amount: 1, currency_code: "inr" }))
})

test("checkout remains closed by default and quantity limits reject fractions and overflow", () => {
  const original = process.env.CHECKOUT_ENABLED
  process.env.CHECKOUT_ENABLED = "false"
  try { assert.throws(assertCheckoutEnabled) } finally {
    if (original === undefined) delete process.env.CHECKOUT_ENABLED; else process.env.CHECKOUT_ENABLED = original
  }
  assertQuantity(10)
  for (const quantity of [0, 11, 1.5, Number.NaN]) assert.throws(() => assertQuantity(quantity))
})
