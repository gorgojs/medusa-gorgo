import {
  ModuleJoinerConfig,
} from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils"

import { joinerConfig } from "../joiner-config"
import FeedProviderService from "./feed-provider"
import { IFeedModuleService } from "../types"
import { IFeedProvider } from "../types/provider" 

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

  async retrieveProvider(id: string): Promise<{
      provider: IFeedProvider
      identifier: string
      title?: string
      fileExtension?: string
    }> {
    return await this.feedProviderService_.retrieveProvider(id)
  }

  async getFeedData(key: string, feed: Record<string, any>, container: any): Promise<any> {
    return await this.feedProviderService_.getFeedData(key, feed, container)
  }

  async getProvidersList(): Promise<Array<{ identifier: string; title: string }>> {
    return this.feedProviderService_.getProvidersList()
  }

  __joinerConfig(): ModuleJoinerConfig {
    return joinerConfig
  }

}
