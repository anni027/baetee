import { Pool } from "pg"
import { databaseOptions } from "../../../scripts/database-options.cjs"

type Row = { operation_id: string; amount: string; status: "pending" | "succeeded"; refund_id: string | null }
type Result = { refund_id: string; refunded_total: number }

export class RefundLedger {
  private pool: Pool
  constructor(databaseUrl: string) {
    this.pool = new Pool({ ...databaseOptions(databaseUrl).connection, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 })
  }

  async close() { await this.pool.end() }

  async refund(paymentId: string, amount: number, operationId: string, committedTotal: number, gatewayTotal: number,
    send: (stableKey: string) => Promise<string>): Promise<Result> {
    const client = await this.pool.connect()
    let locked = false
    try {
      await client.query("set lock_timeout = '5s'")
      // A session lock stays held across the durable insert and the API call.
      // Process termination releases it; it cannot expire midway through a refund.
      await client.query("select pg_advisory_lock(hashtext($1))", [`baetee-refund:${paymentId}`])
      locked = true
      const { rows } = await client.query<Row>("select operation_id, amount, status, refund_id from baetee_gateway_refunds where payment_id=$1 order by created_at, operation_id", [paymentId])
      const succeeded = rows.filter(row => row.status === "succeeded")
      const total = succeeded.reduce((sum, row) => sum + Number(row.amount), 0)
      if (!Number.isSafeInteger(total) || !Number.isSafeInteger(committedTotal) || committedTotal < 0 || committedTotal > total) throw new Error("Refund ledger needs reconciliation")
      const exact = rows.find(row => row.operation_id === operationId)
      if (exact && Number(exact.amount) !== amount) throw new Error("The same refund operation cannot change amount")
      if (exact?.status === "succeeded" && exact.refund_id) return { refund_id: exact.refund_id, refunded_total: total }

      // Medusa may delete its refund record after a lost provider response. Reuse
      // the existing gateway refund when its result was not committed in Medusa.
      if (total > committedTotal) {
        const previous = succeeded[succeeded.length - 1]
        if (total - committedTotal !== amount || Number(previous.amount) !== amount || !previous.refund_id) throw new Error("An unrecorded refund needs reconciliation before a different refund")
        return { refund_id: previous.refund_id, refunded_total: total }
      }
      const pending = rows.find(row => row.status === "pending")
      if (pending && Number(pending.amount) !== amount) throw new Error("An unresolved refund exists; reconcile it before changing the amount")
      if (!pending && gatewayTotal !== total) throw new Error("Razorpay has external refunds; reconcile them with Medusa first")
      const stableKey = pending?.operation_id || operationId
      if (!pending) await client.query("insert into baetee_gateway_refunds (operation_id,payment_id,amount,status) values ($1,$2,$3,'pending')", [stableKey,paymentId,amount])
      // Any error leaves the pending row intact. A retry uses the SAME key and body.
      const refundId = await send(stableKey)
      await client.query("update baetee_gateway_refunds set status='succeeded', refund_id=$2, updated_at=now() where operation_id=$1", [stableKey,refundId])
      return { refund_id: refundId, refunded_total: total + amount }
    } finally {
      if (locked) await client.query("select pg_advisory_unlock(hashtext($1))", [`baetee-refund:${paymentId}`]).catch(() => {})
      client.release()
    }
  }
}
