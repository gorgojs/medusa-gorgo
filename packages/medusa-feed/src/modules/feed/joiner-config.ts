import { defineJoinerConfig } from "@medusajs/framework/utils"
import { default as schema } from "./schema"

export const joinerConfig = defineJoinerConfig("feed", {
  schema
})
