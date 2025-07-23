import { Constructor, Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { FeedProviderRegistrationPrefix, IFeedProvider } from "../types/provider"
import { AbstractFeedProvider } from "../utils/abstract-feed-provider"

type InjectedDependencies = {
  [
  key: `${typeof FeedProviderRegistrationPrefix}${string}`
  ]: IFeedProvider
  logger?: Logger
}

export default class FeedProviderService {
  protected dependencies: InjectedDependencies
  #logger: Logger

  constructor(container: InjectedDependencies) {
    this.dependencies = container
    this.#logger = container["logger"]
      ? container.logger
      : (console as unknown as Logger)
  }

  retrieveProvider(providerId: string): IFeedProvider {
    try {
      return this.dependencies[providerId] as IFeedProvider
    } catch (err) {
      if (err.name === "AwilixResolutionError") {
        const errMessage = `Unable to retrieve the feed provider with id: ${providerId}. Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`
        throw new Error(errMessage)
      }

      const errMessage = `Unable to retrieve the feed provider with id: ${providerId}, the following error occurred: ${err.message}`
      this.#logger.error(errMessage)

      throw new Error(errMessage)
    }
  }

  static getRegistrationIdentifier(
    providerClass: Constructor<IFeedProvider>,
    optionName?: string
  ) {
    return `${(providerClass as any).identifier}_${optionName}`
  }

  getProvidersList(): Array<{ identifier: string; title: string }> {
    const prefix = FeedProviderRegistrationPrefix

    return Object.entries(this.dependencies)
      .filter(([key]) => key.startsWith(prefix))
      .map(([fullKey, instance]) => {
        const identifier = fullKey
        const ctor = (instance as any).constructor as typeof AbstractFeedProvider
        const title = ctor.title ?? identifier
        return { identifier, title }
      })
  }

  getFeedData(
    providerId: string,
    feed: Record<string, any>,
    container: any
  ): Promise<string> {
    const provider = this.retrieveProvider(providerId)
    return provider.getFeedData(feed, container)
  }
}
