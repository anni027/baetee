import { createHmac, timingSafeEqual } from "node:crypto"
import { RefundLedger } from "./refund-ledger"
import { AbstractPaymentProvider, BigNumber, MedusaError } from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CapturePaymentInput,
  DeletePaymentInput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput,
  InitiatePaymentOutput, RefundPaymentInput, RetrievePaymentInput, UpdatePaymentInput,
  ProviderWebhookPayload, WebhookActionResult, BigNumberInput,
} from "@medusajs/framework/types"

type Options = { key_id: string; key_secret: string; webhook_secret: string }
type Order = { id: string; amount: number; currency: string; notes: Record<string, string> }
type Payment = { id: string; order_id: string; amount: number; currency: string; status: string; amount_refunded: number }
type Session = { order_id: string; session_id: string; amount: number; currency: "INR"; key_id: string; canceled?: boolean; refunded_total?: number }

export function toPaise(value: BigNumberInput): number {
  const amount = Number(new BigNumber(value).numeric)
  const paise = Math.round(amount * 100)
  if (!Number.isFinite(amount) || !Number.isSafeInteger(paise) || paise < 100 || Math.abs(amount * 100 - paise) > 0.00001) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "INR amount must be positive with at most two decimals")
  }
  return paise
}

export function validSignature(raw: string | Buffer, signature: unknown, secret: string): boolean {
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false
  const expected = createHmac("sha256", secret).update(raw).digest()
  return timingSafeEqual(expected, Buffer.from(signature, "hex"))
}

export default class RazorpayProvider extends AbstractPaymentProvider<Options> {
  static identifier = "razorpay"
  private refunds: Pick<RefundLedger, "refund">

  static validateOptions(options: Options) {
    if (!/^rzp_(test|live)_[a-zA-Z0-9]+$/.test(options.key_id || "") || !options.key_secret || !options.webhook_secret) throw new Error("Razorpay credentials are incomplete")
  }

  constructor(container: Record<string, unknown>, options: Options, refunds?: Pick<RefundLedger, "refund">) {
    super(container, options)
    this.refunds = refunds || new RefundLedger(process.env.DATABASE_URL || "")
  }

  private async api<T>(path: string, method = "GET", body?: object, extraHeaders?: Record<string, string>): Promise<T> {
    // Do not retry money-changing requests implicitly. Refund retries use a stable provider key.
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: { Authorization: `Basic ${Buffer.from(`${this.config.key_id}:${this.config.key_secret}`).toString("base64")}`, "content-type": "application/json", ...extraHeaders },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`Razorpay request failed (${response.status}); reconcile before retrying`)
    return response.json() as Promise<T>
  }

  private session(data?: Record<string, unknown>): Session {
    if (!data || typeof data.order_id !== "string" || !/^order_[a-zA-Z0-9]+$/.test(data.order_id) ||
        typeof data.session_id !== "string" || !/^payses_[a-zA-Z0-9]+$/.test(data.session_id) ||
        !Number.isSafeInteger(data.amount) || Number(data.amount) < 100 || data.currency !== "INR") {
      throw new Error("Invalid Razorpay session")
    }
    return data as Session
  }

  private async state(data?: Record<string, unknown>) {
    const session = this.session(data)
    const order = await this.api<Order>(`/orders/${session.order_id}`)
    if (order.id !== session.order_id || order.amount !== session.amount || order.currency !== "INR" || order.notes?.medusa_session_id !== session.session_id) {
      throw new Error("Razorpay order does not match the Medusa session")
    }
    const result = await this.api<{ items: Payment[] }>(`/orders/${session.order_id}/payments`)
    const payment = result.items.find(p => p.status === "captured" || p.status === "refunded")
    if (payment && (payment.order_id !== order.id || payment.amount !== order.amount || payment.currency !== "INR")) throw new Error("Razorpay payment amount mismatch")
    return { session, order, payment }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    if (input.currency_code.toLowerCase() !== "inr") throw new Error("Razorpay is configured for INR only")
    const sessionId = input.data?.session_id
    if (typeof sessionId !== "string" || !/^payses_[a-zA-Z0-9]+$/.test(sessionId)) throw new Error("Missing Medusa payment session")
    const amount = toPaise(input.amount)
    const order = await this.api<Order>("/orders", "POST", { amount, currency: "INR", receipt: sessionId, notes: { medusa_session_id: sessionId } })
    if (!/^order_[a-zA-Z0-9]+$/.test(order.id) || order.amount !== amount || order.currency !== "INR") throw new Error("Invalid Razorpay order response")
    return { id: order.id, status: "pending", data: { order_id: order.id, session_id: sessionId, amount, currency: "INR", key_id: this.config.key_id, refunded_total: 0 } }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const { session, payment } = await this.state(input.data)
    if (session.canceled || (input.context?.idempotency_key && input.context.idempotency_key !== session.session_id)) throw new Error("Invalid payment session authorization")
    // Capture must be confirmed by Razorpay's authenticated API, never the browser callback.
    if (!payment || payment.status !== "captured" || payment.amount_refunded !== 0) return { status: "requires_more", data: session }
    return { status: "captured", data: { ...session, payment_id: payment.id } }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const { session, payment } = await this.state(input.data)
    return { status: session.canceled ? "canceled" : payment?.status === "captured" && payment.amount_refunded === 0 ? "captured" : "pending" }
  }

  async capturePayment(input: CapturePaymentInput) {
    const { session, payment } = await this.state(input.data)
    if (!payment || payment.status !== "captured") throw new Error("Enable automatic capture in Razorpay and confirm capture before completing orders")
    return { data: { ...session, payment_id: payment.id } }
  }

  async refundPayment(input: RefundPaymentInput) {
    const { session, payment } = await this.state(input.data)
    const key = input.context?.idempotency_key
    if (!payment || !key || !/^[a-zA-Z0-9_-]{10,100}$/.test(key)) throw new Error("Refund needs a captured payment and a stable Medusa refund ID")
    const amount = toPaise(input.amount)
    const recorded = await this.refunds.refund(payment.id, amount, key, session.refunded_total || 0, payment.amount_refunded, async stableKey => {
      const refund = await this.api<{ id: string; payment_id: string; amount: number; status: string }>(
        `/payments/${payment.id}/refund`, "POST", { amount, speed: "normal" }, { "X-Refund-Idempotency": stableKey },
      )
      if (refund.payment_id !== payment.id || refund.amount !== amount || refund.status === "failed" || !/^rfnd_[a-zA-Z0-9]+$/.test(refund.id)) throw new Error("Refund response needs reconciliation")
      return refund.id
    })
    return { data: { ...session, payment_id: payment.id, last_refund_id: recorded.refund_id, refunded_total: recorded.refunded_total } }
  }

  async retrievePayment(input: RetrievePaymentInput) {
    const { session, payment } = await this.state(input.data)
    return { data: { ...session, ...(payment ? { payment_id: payment.id } : {}) } }
  }

  async updatePayment(input: UpdatePaymentInput) {
    const session = this.session(input.data)
    if (input.currency_code.toLowerCase() !== "inr" || toPaise(input.amount) !== session.amount) throw new Error("Payment amount is locked; do not change a cart after starting payment")
    return { data: session }
  }

  async cancelPayment(input: CancelPaymentInput) {
    const { session, payment } = await this.state(input.data)
    if (payment) throw new Error("Paid Razorpay orders must be refunded explicitly in Medusa Admin")
    // Razorpay Orders cannot be voided. This only closes the Medusa session.
    return { data: { ...session, canceled: true } }
  }

  async deletePayment(_input: DeletePaymentInput): Promise<{ data: Record<string, unknown> }> {
    throw new Error("Razorpay orders cannot be voided; finish or reconcile the current payment before replacing its session")
  }

  async getWebhookActionAndData(input: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    if (!validSignature(input.rawData, input.headers["x-razorpay-signature"], this.config.webhook_secret)) throw new Error("Invalid Razorpay webhook signature")
    const event = JSON.parse(input.rawData.toString())
    if (event.event !== "payment.captured") return { action: "not_supported" }
    const payment = event.payload?.payment?.entity as Payment | undefined
    if (!payment || !/^pay_[a-zA-Z0-9]+$/.test(payment.id) || !/^order_[a-zA-Z0-9]+$/.test(payment.order_id)) throw new Error("Invalid Razorpay webhook payment")
    const order = await this.api<Order>(`/orders/${payment.order_id}`)
    const sessionId = order.notes?.medusa_session_id
    if (!sessionId || !/^payses_[a-zA-Z0-9]+$/.test(sessionId)) return { action: "not_supported" }
    const verified = await this.state({ order_id: order.id, session_id: sessionId, amount: order.amount, currency: "INR", key_id: this.config.key_id })
    if (verified.payment?.id !== payment.id || verified.payment.status !== "captured" || verified.payment.amount_refunded !== 0) return { action: "not_supported" }
    return { action: "captured", data: { session_id: sessionId, amount: new BigNumber(order.amount / 100) } }
  }
}
