import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { assertCheckoutEnabled } from "../../../../lib/store-policy"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  try { assertCheckoutEnabled(); res.json({ enabled: true }) }
  catch { res.json({ enabled: false }) }
}
