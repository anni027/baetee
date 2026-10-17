import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function orderPlaced({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "currency_code", "total"],
    filters: { id: data.id },
  })
  const order = orders[0]
  if (!order?.email) throw new Error(`Order ${data.id} has no email for confirmation`)

  const url = process.env.SUPABASE_URL
  const token = process.env.EMAIL_FUNCTION_TOKEN
  if (process.env.ORDER_DELIVERY_VERIFIED !== "true" || !url || !token) {
    throw new Error("Order email delivery is not verified")
  }
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/send-order`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-baetee-token": token },
    body: JSON.stringify({
      orderId: order.id,
      displayId: order.display_id,
      email: order.email,
      currency: order.currency_code,
      total: order.total,
    }),
    signal: AbortSignal.timeout(25000),
  })
  if (!response.ok) throw new Error(`Order email delivery failed (${response.status})`)
}

export const config: SubscriberConfig = { event: "order.placed", context: { subscriberId: "baetee-order-email" } }
