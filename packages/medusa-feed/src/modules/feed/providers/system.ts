
import {
  AbstractFeedProvider
} from "../utils/abstract-feed-provider"
import { Category } from "../../../types/settings"
import yml from "yandex-market-language"

export class SystemFeedService extends AbstractFeedProvider {
  static identifier = "system"
  static title = "Yandex"
  static fileExtension = ".xml"

  async getFeedData(feed: Record<string, any>, container: any): Promise<string> {
    const productModuleService = container.resolve("product")

    const categoryIds = (feed.settings?.categories as Category[] ?? []).map(c => c.id)
    const categoryProductsMap = new Map()
    for (const categoryId of categoryIds) {
      const products = await productModuleService.listProducts({
        status: "published",
        categories: {
          id: { $in: [categoryId] }
        },
      })
      categoryProductsMap.set(categoryId, products)
    }

    const offers: any[] = []

    for (const [categoryId, products] of categoryProductsMap.entries()) {
      for (const product of products) {
        const offer: Record<string, any> = {
          id: product.id,
          name: product.title,
          categoryId: categoryId,
        }
        if (product.thumbnail) {
          offer.picture = [product.thumbnail]
        }
        if (product.description) {
          offer.description = product.description
        }
        const weight = parseFloat(product.weight)
        if (!isNaN(weight)) {
          offer.weight = weight
        }
        if (product.length && product.width && product.height) {
          offer.dimensions = [product.length, product.width, product.height]
        }
        if (product.metadata?.barcode && Array.isArray(product.metadata.barcode)) {
          offer.barcode = product.metadata.barcode
        }
        if (product.metadata?.param && Array.isArray(product.metadata.param)) {
          offer.param = product.metadata.param
        }
        if (product.origin_country) {
          offer.country_of_origin = product.origin_country
        }
        if (product.metadata?.manufacturer_warranty === true) {
          offer.manufacturer_warranty = true
        }
        offers.push(offer)
      }
    }

    const YmlObject = {
      name: feed.settings?.name || "-",
      company: feed.settings?.company || "-",
      url: feed.settings?.url || "-",
      platform: feed.settings?.platform || "-",
      categories: feed.settings?.categories || [],
      offers,
    }
    const ymlString = yml(YmlObject, { validate: false }).end({ pretty: true })

    return ymlString
  }

}

export default SystemFeedService
