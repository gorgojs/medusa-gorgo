import { IFeedProvider } from "../types/provider"

export class AbstractFeedProvider implements IFeedProvider {
  /**
   * Each file provider has a unique ID used to identify it. The provider's ID
   * will be stored as `fs_{identifier}_{id}`, where `{id}` is the provider's `id`
   * property in the `medusa-config.ts`.
   *
   * @example
   * class MyFileProviderService extends AbstractFileProviderService {
   *   static identifier = "my-file"
   *   // ...
   * }
   */
  public static identifier: string

  /**
   * Each file provider has a unique ID used to identify it. The provider's ID
   * will be stored as `fs_{identifier}_{id}`, where `{id}` is the provider's `id`
   * property in the `medusa-config.ts`.
   *
   * @example
   * class MyFileProviderService extends AbstractFileProviderService {
   *   static identifier = "my-file"
   *   // ...
   * }
   */
  public static title: string

  public static fileExtension: string


  /**
   * This method validates the options of the provider set in `medusa-config.ts`.
   * Implementing this method is optional. It's useful if your provider requires custom validation.
   *
   * If the options aren't valid, throw an error.
   *
   * @param options - The provider's options.
   *
   * @example
   * class MyFileProviderService extends AbstractFileProviderService {
   *   static validateOptions(options: Record<any, any>) {
   *     if (!options.apiKey) {
   *       throw new MedusaError(
   *         MedusaError.Types.INVALID_DATA,
   *         "API key is required in the provider's options."
   *       )
   *     }
   *   }
   * }
   */
  static validateOptions(options: Record<any, any>): void | never {}

  /**
   * @ignore
   */
  getIdentifier() {
    return (this.constructor as any).identifier
  }
  getTitle() {
    return (this.constructor as any).title
  }
  getFileExtension() {
    return (this.constructor as any).fileExtension
  }
  async get(): Promise<string> {
    throw Error("upload must be overridden by the child class")
  }

  async getFeedData(feed: Record<string, any>, container: any): Promise<string> {
    throw Error("upload must be overridden by the child class")
  }
}
