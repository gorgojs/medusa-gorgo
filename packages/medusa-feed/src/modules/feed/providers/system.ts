
import {
  AbstractFeedProvider
} from "../utils/abstract-feed-provider"

export class SystemFeedService extends AbstractFeedProvider {
  static identifier = "system"

  async get(): Promise<string> {
    return "SystemFeedService's get()"
  }

  async getFeedData(input: Record<string, any>): Promise<string> {
    return `SystemFeedService's getFeedData() input: ${JSON.stringify(input)}`
  }

}

export default SystemFeedService
