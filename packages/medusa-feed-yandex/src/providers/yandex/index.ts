import { YandexFeedService } from "./yandex"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

const services = [
  YandexFeedService,
]

export default ModuleProvider("feed", {
  services,
})