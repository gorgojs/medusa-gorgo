import {
  ModuleProviderExports,
  ModuleServiceInitializeOptions,
} from "@medusajs/framework/types"

export const FeedProviderIdentifierRegistrationName =
  "feed_providers_identifier"

export const FeedProviderRegistrationPrefix = "fd_"

export type FeedModuleOptions = Partial<ModuleServiceInitializeOptions> & {
  /**
   * Providers to be registered
   */
  provider?: {
    /**
     * The module provider to be registered
     */
    resolve: string | ModuleProviderExports
    /**
     * The id of the provider
     */
    id: string
    /**
     * key value pair of the configuration to be passed to the provider constructor
     */
    options?: Record<string, unknown>
  }
}

export interface IFeedProvider {
    getFeedData(feed: Record<string, any>, container: any): Promise<string>;
}
