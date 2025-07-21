import { Constructor, Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { FeedProviderRegistrationPrefix, IFeedProvider } from "../types/provider"

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

  get(
    providerId: string,
  ): Promise<string> {
    const provider = this.retrieveProvider(providerId)
    return provider.get()
  }
}
