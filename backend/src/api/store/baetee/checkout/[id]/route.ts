import type { MedusaStoreRequest as MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  updateCartWorkflow, listShippingOptionsForCartWithPricingWorkflow, addShippingMethodToCartWorkflow,
  createPaymentCollectionForCartWorkflow, createPaymentSessionsWorkflow, completeCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { assertCheckoutEnabled, RAZORPAY_PROVIDER } from "../../../../../lib/store-policy"
import { validSignature } from "../../../../../modules/razorpay/service"

async function cartFor(req: MedusaRequest) {
  if (!/^cart_[a-zA-Z0-9]+$/.test(req.params.id)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid cart")
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart", filters: { id: req.params.id },
    fields: ["id", "total", "subtotal", "tax_total", "shipping_total", "currency_code", "completed_at", "email", "sales_channel_id", "items.*", "shipping_address.*", "shipping_methods.*", "payment_collection.*", "payment_collection.payment_sessions.*"],
  })
  const cart = carts[0]
  if (!cart || !cart.sales_channel_id || !req.publishable_key_context?.sales_channel_ids.includes(cart.sales_channel_id)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found")
  }
  return cart
}

async function receipt(req: MedusaRequest) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: links } = await query.graph({ entity: "order_cart", fields: ["order_id"], filters: { cart_id: req.params.id } })
  if (!links[0]) return null
  const { data: orders } = await query.graph({ entity: "order", fields: ["id", "display_id", "total", "currency_code"], filters: { id: links[0].order_id } })
  const order = orders[0]
  return order ? { id: order.id, number: order.display_id, total: order.total, currency: order.currency_code } : null
}

function requiredText(body: Record<string, unknown>, field: string, max: number) {
  const text = body[field]
  if (typeof text !== "string" || !text.trim() || text.length > max) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Check ${field.replaceAll("_", " ")}`)
  return text.trim()
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cart = await cartFor(req)
  res.json({ order: cart.completed_at ? await receipt(req) : null, total: cart.total })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  assertCheckoutEnabled()
  const body = req.body as Record<string, unknown>
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid checkout request")
  const locking = req.scope.resolve(Modules.LOCKING)
  // The coordination lock prevents duplicate preparations. Core flows also take
  // their own cart lock for mutations and idempotent order completion.
  const result = await locking.execute(`baetee:checkout:${req.params.id}`, async () => {
    let cart = await cartFor(req)
    if (cart.completed_at) return { order: await receipt(req) }
    const session = cart.payment_collection?.payment_sessions?.find(s => s?.provider_id === RAZORPAY_PROVIDER && s.status !== "canceled")

    if (body.operation === "complete") {
      if (!session?.data || typeof session.data.order_id !== "string") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Payment has not started")
      const paymentId = requiredText(body, "payment_id", 80)
      if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId) || !validSignature(`${session.data.order_id}|${paymentId}`, body.signature, process.env.RAZORPAY_KEY_SECRET!)) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Payment signature is invalid")
      }
      await completeCartWorkflow(req.scope).run({ input: { id: cart.id } })
      return { order: await receipt(req) }
    }
    if (session) {
      if (body.operation !== "prepare") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Payment has started; your delivery details are locked")
      return { payment: session.data, total: cart.total }
    }

    if (body.operation === "address") {
      const email = requiredText(body, "email", 254)
      const postcode = requiredText(body, "postal_code", 6)
      const phone = requiredText(body, "phone", 16)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[1-9][0-9]{5}$/.test(postcode) || !/^\+?[0-9]{10,15}$/.test(phone)) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Check email, India PIN code and phone")
      }
      const address = {
        first_name: requiredText(body, "first_name", 80), last_name: requiredText(body, "last_name", 80),
        address_1: requiredText(body, "address_1", 200), city: requiredText(body, "city", 80),
        province: requiredText(body, "province", 80), postal_code: postcode, country_code: "in", phone,
      }
      await updateCartWorkflow(req.scope).run({ input: { id: cart.id, email, shipping_address: address, billing_address: address } })
      const { result: options } = await listShippingOptionsForCartWithPricingWorkflow(req.scope).run({ input: { cart_id: cart.id } })
      return { shipping_options: options.map(option => ({ id: option.id, name: option.name, amount: option.calculated_price?.calculated_amount })) }
    }
    if (body.operation === "prepare") {
      const shippingId = requiredText(body, "shipping_option_id", 80)
      const { result: options } = await listShippingOptionsForCartWithPricingWorkflow(req.scope).run({ input: { cart_id: cart.id } })
      if (!options.some(option => option.id === shippingId)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose an available delivery method")
      await addShippingMethodToCartWorkflow(req.scope).run({ input: { cart_id: cart.id, options: [{ id: shippingId }] } })
      cart = await cartFor(req)
      let collectionId = cart.payment_collection?.id
      if (!collectionId) {
        const { result: collection } = await createPaymentCollectionForCartWorkflow(req.scope).run({ input: { cart_id: cart.id } })
        collectionId = collection.id
      }
      await createPaymentSessionsWorkflow(req.scope).run({ input: { payment_collection_id: collectionId, provider_id: RAZORPAY_PROVIDER } })
      cart = await cartFor(req)
      const payment = cart.payment_collection?.payment_sessions?.find(s => s?.provider_id === RAZORPAY_PROVIDER)
      if (!payment) throw new Error("Payment session was not created")
      return { payment: payment.data, total: cart.total }
    }
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unknown checkout operation")
  }, { timeout: 5, expire: 120 })
  res.json(result)
}
