
import {
  AbstractFeedProvider
} from "../utils/abstract-feed-provider"

export class SystemFeedService extends AbstractFeedProvider {
  static identifier = "system"

  async get(): Promise<string> {
    return "SystemFeedService"
  }

}

export default SystemFeedService
