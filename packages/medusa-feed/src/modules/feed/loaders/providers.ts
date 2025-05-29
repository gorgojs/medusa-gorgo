import { moduleProviderLoader } from "@medusajs/framework/modules-sdk"
import {
  LoaderOptions,
  ModuleProvider,
  ModulesSdkTypes,
} from "@medusajs/framework/types"
import { FeedProviderService } from "../services"
import {
  FeedProviderIdentifierRegistrationName,
  FeedProviderRegistrationPrefix,
} from "../types/provider"
import * as providers from "../providers"
import { asFunction, asValue, Lifetime } from "awilix"

const registrationFn = async (klass, container, pluginOptions) => {
  const key = FeedProviderService.getRegistrationIdentifier(
    klass,
    pluginOptions.id
  )

  container.register({
    [FeedProviderRegistrationPrefix + key]: asFunction(
      (cradle) => new klass(cradle, pluginOptions.options ?? {}),
      {
        lifetime: klass.LIFE_TIME || Lifetime.SINGLETON,
      }
    ),
  })

  container.registerAdd(FeedProviderIdentifierRegistrationName, asValue(key))
}

export default async ({
  container,
  options,
}: LoaderOptions<
  (
    | ModulesSdkTypes.ModuleServiceInitializeOptions
    | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
  ) & { providers: ModuleProvider[] }
>): Promise<void> => {
    // Local providers
  for (const provider of Object.values(providers)) {
    await registrationFn(provider, container, { id: "default" })
  }

  await moduleProviderLoader({
    container,
    providers: options?.providers || [],
    registerServiceFn: registrationFn,
  })
}
