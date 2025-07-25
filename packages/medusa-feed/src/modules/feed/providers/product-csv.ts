
import {
  AbstractFeedProvider
} from "../utils/abstract-feed-provider"

export class ProductCsvFeedService extends AbstractFeedProvider {
  static identifier = "product_csv"
  static title = "Product CSV"
  static fileExtension = ".csv"

  async getFeedData(feed: Record<string, any>, container: any): Promise<string> {
    const productModuleService = container.resolve("product")
    return "id,title"
  }

}

export default ProductCsvFeedService
