import { addToCartWorkflow, updateLineItemInCartWorkflow, completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { BigNumber, ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { assertCheckoutEnabled, assertQuantity, RAZORPAY_PROVIDER } from "../../lib/store-policy"

type Line = { variant_id?: string | null }

async function approvedVariants(container: MedusaContainer, items: Line[]) {
  const ids = [...new Set(items.map(item => item.variant_id).filter((id): id is string => !!id))]
  if (!ids.length || items.some(item => !item.variant_id)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only Tee variants can be purchased")
  const products = container.resolve(Modules.PRODUCT)
  const variants = await products.listProductVariants({ id: ids }, { relations: ["product"] })
  if (variants.length !== ids.length || variants.some(variant => variant.product?.status !== "published" || variant.product?.metadata?.kind !== "tee")) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Paintings and collectibles are available by commission only")
  }
}

async function currentLines(container: MedusaContainer, id: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({ entity: "cart", fields: ["id", "items.*", "payment_collection.payment_sessions.*"], filters: { id } })
  const cart = carts[0]
  if (!cart) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found")
  if (cart.payment_collection?.payment_sessions?.some(session => session?.provider_id === RAZORPAY_PROVIDER && session?.status !== "canceled")) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Your payment has started; finish payment before changing the bag")
  }
  return (cart.items || []).filter((item): item is NonNullable<typeof item> => !!item)
}

// These hooks run after Medusa takes the shared cart lock, so concurrent adds
// check the fresh quantity inside the same lock as the eventual mutation.
addToCartWorkflow.hooks.validate(async ({ input, cart }, { container }) => {
  const lines = await currentLines(container, cart.id)
  const quantities = new Map<string, number>(lines.filter(line => !!line.variant_id).map(line => [line.variant_id!, line.quantity]))
  const items = input.items || []
  for (const item of items) {
    if (!item.variant_id) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose a Tee variant")
    const added = Number(new BigNumber(item.quantity).numeric)
    assertQuantity(added)
    const quantity = (quantities.get(item.variant_id) || 0) + added
    assertQuantity(quantity)
    quantities.set(item.variant_id, quantity)
  }
  await approvedVariants(container, items)
})

updateLineItemInCartWorkflow.hooks.validate(async ({ input, cart }, { container }) => {
  await currentLines(container, cart.id)
  if (input.update.quantity !== undefined) assertQuantity(Number(new BigNumber(input.update.quantity).numeric))
})

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  assertCheckoutEnabled()
  if (cart.currency_code !== "inr" || cart.shipping_address?.country_code !== "in" || !cart.email || !cart.shipping_methods?.length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "An India delivery address, email and delivery method are required")
  }
  for (const item of cart.items || []) assertQuantity(item.quantity)
  await approvedVariants(container, cart.items || [])
  const sessions = cart.payment_collection?.payment_sessions || []
  if (sessions.length !== 1 || sessions[0].provider_id !== RAZORPAY_PROVIDER) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Use Razorpay to complete this order")
  }
  if (Math.round(Number(cart.total) * 100) !== sessions[0].data?.amount) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The cart changed after payment started; payment requires reconciliation")
  }
})
