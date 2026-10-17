import { test } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { parseEnv } from "node:util"
import { Pool } from "pg"
import { RefundLedger } from "../src/modules/razorpay/refund-ledger"

const env = parseEnv(readFileSync(".env", "utf8"))
assert.ok(["localhost", "127.0.0.1"].includes(new URL(env.DATABASE_URL).hostname), "Ledger tests only write fixture records in a local database")

test("refund recovery survives lost gateway responses and lost Medusa writes", async t => {
  const paymentId = `pay_test_${randomUUID()}`
  const ledger = new RefundLedger(env.DATABASE_URL)
  const pool = new Pool({ connectionString: env.DATABASE_URL })
  t.after(async () => { await pool.query("delete from baetee_gateway_refunds where payment_id=$1", [paymentId]); await pool.end(); await ledger.close() })
  const gateway = new Map<string, string>()
  let lostResponse = true
  const send = async (key: string) => {
    if (!gateway.has(key)) gateway.set(key, `rfnd_test${gateway.size + 1}`)
    if (lostResponse) { lostResponse = false; throw new Error("Simulated connection loss after refund") }
    return gateway.get(key)!
  }
  await assert.rejects(ledger.refund(paymentId, 100, "refnd_original", 0, 0, send))
  await assert.rejects(ledger.refund(paymentId, 200, "refnd_changed", 0, 100, send))
  const recovered = await ledger.refund(paymentId, 100, "refnd_new_medusa_record", 0, 100, send)
  assert.equal(gateway.size, 1)
  assert.equal(recovered.refunded_total, 100)

  // The provider succeeded, but pretend Medusa lost the result before saving it.
  const again = await ledger.refund(paymentId, 100, "refnd_retry_again", 0, 100, send)
  assert.deepEqual(again, recovered)
  assert.equal(gateway.size, 1)
  assert.deepEqual(await ledger.refund(paymentId, 100, "refnd_original", 100, 100, send), recovered)
  assert.equal(gateway.size, 1)

  // Once Medusa has committed that total, a new refund is a distinct operation.
  const next = await ledger.refund(paymentId, 200, "refnd_legitimate_second", 100, 100, send)
  assert.equal(next.refunded_total, 300)
  assert.equal(gateway.size, 2)
})

test("concurrent retry requests share one durable gateway refund", async t => {
  const paymentId = `pay_test_${randomUUID()}`
  const ledger = new RefundLedger(env.DATABASE_URL)
  const pool = new Pool({ connectionString: env.DATABASE_URL })
  t.after(async () => { await pool.query("delete from baetee_gateway_refunds where payment_id=$1", [paymentId]); await pool.end(); await ledger.close() })
  let calls = 0
  const send = async () => { calls++; return "rfnd_test1" }
  const [first, second] = await Promise.all([
    ledger.refund(paymentId, 100, "refnd_concurrent_a", 0, 0, send),
    ledger.refund(paymentId, 100, "refnd_concurrent_b", 0, 0, send),
  ])
  assert.deepEqual(first, second)
  assert.equal(calls, 1)
  await assert.rejects(ledger.refund(paymentId, 100, "refnd_external", 100, 200, send))
})
