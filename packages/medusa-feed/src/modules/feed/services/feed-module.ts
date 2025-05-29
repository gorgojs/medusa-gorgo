import {
  ModuleJoinerConfig,
} from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils"

import { joinerConfig } from "../joiner-config"
import FeedProviderService from "./feed-provider"
import { IFeedModuleService } from "../types"

type InjectedDependencies = {
  feedProviderService: FeedProviderService
}

export default class FeedModuleService implements IFeedModuleService {
  protected readonly feedProviderService_: FeedProviderService

  constructor({ feedProviderService }: InjectedDependencies) {
    this.feedProviderService_ = feedProviderService
  }

  async getFeedData(key: string): Promise<any> {
    return await this.feedProviderService_.get(key)
  }

  __joinerConfig(): ModuleJoinerConfig {
    return joinerConfig
  }

}
