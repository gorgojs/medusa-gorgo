import { FeedModuleService } from "./services"
import loadProviders from "./loaders/providers"
import { Module, Modules } from "@medusajs/framework/utils"

console.log("=== Loading Feed Module")

export const FEED_MODULE = "feed"

export default Module(FEED_MODULE, {
  service: FeedModuleService,
  loaders: [loadProviders],
})
