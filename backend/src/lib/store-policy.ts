import { MedusaError } from "@medusajs/framework/utils"

export const RAZORPAY_PROVIDER = "pp_razorpay_razorpay"

export function assertCheckoutEnabled() {
  const enabled = process.env.CHECKOUT_ENABLED === "true" && process.env.STORE_RULES_VERIFIED === "true" &&
    process.env.ORDER_DELIVERY_VERIFIED === "true" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET &&
    process.env.SUPABASE_URL && process.env.EMAIL_FUNCTION_TOKEN && process.env.PRIVACY_CONTACT_EMAIL
  if (!enabled) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Checkout is not connected yet")
  if (!process.env.RAZORPAY_KEY_ID!.startsWith("rzp_test_") && process.env.RAZORPAY_LIVE_VERIFIED !== "true") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Live payments have not been verified")
  }
}

export function assertQuantity(quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose between 1 and 10 per Tee and size")
  }
}
