import type { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { RAZORPAY_PROVIDER } from "../lib/store-policy"

export default async function configure({ container }: ExecArgs) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_WEBHOOK_SECRET) throw new Error("Add all three Razorpay settings first")
  const [region] = await container.resolve(Modules.REGION).listRegions({ name: "India" })
  if (!region) throw new Error("Run the catalog seed first")
  await updateRegionsWorkflow(container).run({ input: { selector: { id: region.id }, update: { payment_providers: [RAZORPAY_PROVIDER] } } })
}
