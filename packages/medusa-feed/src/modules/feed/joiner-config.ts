import { defineJoinerConfig, Modules } from "@medusajs/framework/utils"

export const joinerConfig = defineJoinerConfig("feed", {
  models: [{ name: "Feed" }],
})
