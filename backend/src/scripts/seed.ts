import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createApiKeysWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import catalog from "../data/catalog.json"

const updateCurrencies = createWorkflow("baetee-update-currencies", (input: { store_id: string }) => {
  const data = transform({ input }, ({ input }) => ({
    selector: { id: input.store_id },
    update: { supported_currencies: [{ currency_code: "inr", is_default: true }] },
  }))
  return new WorkflowResponse(updateStoresStep(data))
})

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const storeService = container.resolve(Modules.STORE)
  const salesService = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const productService = container.resolve(Modules.PRODUCT)
  const regionService = container.resolve(Modules.REGION)
  const stockService = container.resolve(Modules.STOCK_LOCATION)
  const assetBase = process.env.STORE_ASSET_BASE_URL?.replace(/\/$/, "")
  if (!assetBase || !/^https?:\/\//.test(assetBase)) throw new Error("Set STORE_ASSET_BASE_URL to the public storefront URL")

  const [store] = await storeService.listStores()
  if (!store) throw new Error("Medusa default store is missing; run migrations first")
  await updateCurrencies(container).run({ input: { store_id: store.id } })

  let [channel] = await salesService.listSalesChannels({ name: "BAETEE Online" })
  if (!channel) {
    const { result } = await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: "BAETEE Online" }] } })
    channel = result[0]
  }
  await updateStoresWorkflow(container).run({ input: { selector: { id: store.id }, update: { default_sales_channel_id: channel.id } } })

  let [region] = await regionService.listRegions({ name: "India" })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: { regions: [{ name: "India", currency_code: "inr", countries: ["in"], payment_providers: ["pp_system_default"] }] },
    })
    region = result[0]
  }
  const { data: taxRegions } = await query.graph({ entity: "tax_region", fields: ["id"], filters: { country_code: "in" } })
  if (!taxRegions.length) await createTaxRegionsWorkflow(container).run({ input: [{ country_code: "in", provider_id: "tp_system" }] })

  let [location] = await stockService.listStockLocations({ name: "BAETEE India" })
  if (!location) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: { locations: [{ name: "BAETEE India", address: { country_code: "IN", address_1: "", city: "India" } }] },
    })
    location = result[0]
    await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" } })
  }
  await updateStoresWorkflow(container).run({ input: { selector: { id: store.id }, update: { default_location_id: location.id } } })
  const { data: locationChannels } = await query.graph({ entity: "stock_location", fields: ["id", "sales_channels.id"], filters: { id: location.id } })
  if (!locationChannels[0]?.sales_channels?.some(item => item?.id === channel.id)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } })
  }

  let [profile] = await fulfillmentService.listShippingProfiles({ type: "default" })
  if (!profile) {
    const { result } = await createShippingProfilesWorkflow(container).run({ input: { data: [{ name: "BAETEE Garments", type: "default" }] } })
    profile = result[0]
  }
  const { data: fulfillmentSets } = await query.graph({ entity: "fulfillment_set", fields: ["id", "service_zones.id"], filters: { name: "BAETEE India Delivery" } })
  if (!fulfillmentSets.length) {
    const set = await fulfillmentService.createFulfillmentSets({
      name: "BAETEE India Delivery",
      type: "shipping",
      service_zones: [{ name: "India", geo_zones: [{ country_code: "in", type: "country" }] }],
    })
    await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_set_id: set.id } })
    // Zero is a setup placeholder. Review shipping and tax rules in Admin before enabling checkout.
    await createShippingOptionsWorkflow(container).run({ input: [{
      name: "India delivery", price_type: "flat", provider_id: "manual_manual",
      service_zone_id: set.service_zones[0].id, shipping_profile_id: profile.id,
      type: { label: "India delivery", description: "Delivery timing confirmed after order", code: "india-delivery" },
      prices: [{ currency_code: "inr", amount: 0 }],
      rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" }, { attribute: "is_return", value: "false", operator: "eq" }],
    }] })
  }

  const { data: keys } = await query.graph({ entity: "api_key", fields: ["id", "sales_channels.id"], filters: { type: "publishable", title: "BAETEE storefront" } })
  let key: { id: string } | undefined = keys.find(k => !k.sales_channels?.length || (k.sales_channels.length === 1 && k.sales_channels[0]?.id === channel.id))
  if (!key) {
    const { result } = await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: "BAETEE storefront", type: "publishable", created_by: "" }] } })
    key = result[0]
  }
  const { data: keyChannels } = await query.graph({ entity: "api_key", fields: ["id", "sales_channels.id"], filters: { id: key.id } })
  if (!keyChannels[0]?.sales_channels?.some(item => item?.id === channel.id)) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: key.id, add: [channel.id] } })
  }

  for (const tee of catalog.tees) {
    const handle = `baetee-tee-${String(tee.id).padStart(2, "0")}`
    if ((await productService.listProducts({ handle })).length) continue
    await createProductsWorkflow(container).run({ input: { products: [{
      title: tee.title, handle, status: ProductStatus.PUBLISHED,
      description: tee.story, subtitle: tee.manifestation,
      thumbnail: `${assetBase}${tee.image}`, images: [{ url: `${assetBase}${tee.image}` }],
      metadata: { legacy_id: tee.id, kind: "tee", painting: tee.painting, manifestation: tee.manifestation, story: tee.story },
      shipping_profile_id: profile.id,
      options: [{ title: "Size", values: catalog.sizes }],
      variants: catalog.sizes.map((size) => ({
        title: size, sku: `BAETEE-${String(tee.id).padStart(2, "0")}-${size}`,
        options: { Size: size }, manage_inventory: false,
        prices: [{ currency_code: "inr", amount: tee.price }],
      })),
      sales_channels: [{ id: channel.id }],
    }] } })
    logger.info(`Created ${handle}`)
  }

  for (const [kind, items] of [["painting", catalog.paintings], ["collectible", catalog.collectibles]] as const) {
    for (const item of items) {
      const handle = `baetee-${kind}-${String(item.id).padStart(2, "0")}`
      const defaults = {
        legacy_id: item.id, kind, commission_only: true, storefront_visible: true,
        story: item.story,
        ...("manifestation" in item ? { manifestation: item.manifestation, palette: item.palette } : { painting: item.painting, character: item.character }),
      }
      const [existing] = await productService.listProducts({ handle })
      if (existing) {
        // Upgrade the original seed without replacing Admin edits. Once opted in, never re-link a removed channel.
        const metadata = { ...defaults, ...existing.metadata }
        if (Object.keys(defaults).some(key => existing.metadata?.[key] === undefined)) {
          const firstOptIn = existing.metadata?.storefront_visible === undefined
          const { data: linked } = await query.graph({ entity: "product", fields: ["id", "sales_channels.id"], filters: { id: existing.id } })
          const channels = linked[0]?.sales_channels?.filter(Boolean).map(value => ({ id: value!.id })) || []
          if (firstOptIn && !channels.some(value => value.id === channel.id)) channels.push({ id: channel.id })
          await updateProductsWorkflow(container).run({ input: { products: [{ id: existing.id, metadata, ...(firstOptIn ? { sales_channels: channels } : {}) }] } })
        }
        continue
      }
      await createProductsWorkflow(container).run({ input: { products: [{
        title: "name" in item ? item.name : item.title, handle, status: ProductStatus.DRAFT,
        subtitle: "manifestation" in item ? item.manifestation : item.character,
        description: item.story, thumbnail: `${assetBase}${item.image}`,
        images: [{ url: `${assetBase}${item.image}` }],
        metadata: defaults,
        sales_channels: [{ id: channel.id }],
        shipping_profile_id: profile.id,
        options: [{ title: "Request", values: ["Commission"] }],
        variants: [],
      }] } })
      logger.info(`Created commission-only draft ${handle}`)
    }
  }
  logger.info(`BAETEE catalog ready. India region: ${region.id}. Publishable API key ID: ${key.id}`)
}
