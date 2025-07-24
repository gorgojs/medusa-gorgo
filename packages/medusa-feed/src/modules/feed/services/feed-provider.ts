import { Constructor, Logger } from "@medusajs/framework/types"
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

  retrieveProvider(providerId: string): {
    provider: IFeedProvider
    identifier: string
    title?: string
    fileExtension?: string
  } {
    let instance: IFeedProvider
    try {
      instance = this.dependencies[providerId] as IFeedProvider
    } catch (err: any) {
      if (err.name === "AwilixResolutionError") {
        throw new Error(
          `Unable to retrieve the feed provider with id: ${providerId}. Please make sure it is registered in the container and it is configured correctly.`
        )
      }
      this.#logger.error(`Error retrieving provider ${providerId}: ${err.message}`)
      throw new Error(`Unable to retrieve the feed provider with id: ${providerId}.`)
    }
    const ctor = (instance as any).constructor as {
      identifier: string
      title?: string
      fileExtension?: string
    }

    return {
      provider: instance,
      identifier: ctor.identifier,
      title: ctor.title,
      fileExtension: ctor.fileExtension,
    }
  }

  static getRegistrationIdentifier(
    providerClass: Constructor<IFeedProvider>,
    optionName?: string
  ) {
    return `${(providerClass as any).identifier}_${optionName}`
  }

  getProvidersList(): Array<{ identifier: string; title: string, fileExtension: string }> {
    const prefix = FeedProviderRegistrationPrefix

    return Object.entries(this.dependencies)
      .filter(([key]) => key.startsWith(prefix))
      .map(([fullKey, instance]) => {
        const identifier = fullKey
        const ctor = (instance as any).constructor as typeof AbstractFeedProvider
        const title = ctor.title ?? identifier
        const fileExtension = ctor.fileExtension
        return { identifier, title, fileExtension }
      })
  }

  getFeedData(
    providerId: string,
    feed: Record<string, any>,
    container: any
  ): Promise<string> {
    const provider = this.retrieveProvider(providerId).provider
    return provider.getFeedData(feed, container)
  }
}
