import { FeedModuleService } from "./services"
import loadProviders from "./loaders/providers"
import { Module } from "@medusajs/framework/utils"

export const FEED_MODULE = "feed"

export default Module(FEED_MODULE, {
  service: FeedModuleService,
  loaders: [loadProviders],
})
