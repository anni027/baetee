import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

export default async function connect({ container }: ExecArgs) {
  if (process.env.NODE_ENV === "production") throw new Error("This helper only connects the local storefront")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: keys } = await query.graph({ entity: "api_key", fields: ["token", "sales_channels.id"], filters: { type: "publishable", title: "BAETEE storefront" } })
  const channels = await container.resolve(Modules.SALES_CHANNEL).listSalesChannels({ name: "BAETEE Online" })
  const regions = await container.resolve(Modules.REGION).listRegions({ name: "India" })
  const key = keys.find(k => k.sales_channels?.length === 1 && k.sales_channels[0]?.id === channels[0]?.id)
  if (!key?.token || !regions[0]) throw new Error("Run the BAETEE seed first")
  const target = resolve(process.cwd(), "../.env.local")
  let content = existsSync(target) ? readFileSync(target, "utf8") : ""
  const values = { MEDUSA_BACKEND_URL: "http://localhost:9000", MEDUSA_PUBLISHABLE_KEY: key.token, MEDUSA_REGION_ID: regions[0].id, PUBLIC_STORE_URL: "http://localhost:3000" }
  for (const [name, value] of Object.entries(values)) {
    const line = `${name}=${value}`
    const pattern = new RegExp(`^${name}=.*$`, "m")
    content = pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`
  }
  writeFileSync(target, content)
  container.resolve(ContainerRegistrationKeys.LOGGER).info("Connected local storefront in ignored .env.local; no secret values printed")
}
