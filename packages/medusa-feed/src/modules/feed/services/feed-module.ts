import {
  ModuleJoinerConfig,
} from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils"

import { joinerConfig } from "../joiner-config"
import FeedProviderService from "./feed-provider"
import { IFeedModuleService } from "../types"

import Feed from "../models/feed"

type InjectedDependencies = {
  feedProviderService: FeedProviderService
}

export default class FeedModuleService extends MedusaService({
  Feed
}) implements IFeedModuleService {
  protected readonly feedProviderService_: FeedProviderService

  constructor({ 
    feedProviderService
  }: InjectedDependencies) {
    super(...arguments)
    this.feedProviderService_ = feedProviderService
  }

  async getFeedData(key: string, input: Record<string, any>): Promise<any> {
    return await this.feedProviderService_.getFeedData(key, input)
  }

  __joinerConfig(): ModuleJoinerConfig {
    return joinerConfig
  }

}
