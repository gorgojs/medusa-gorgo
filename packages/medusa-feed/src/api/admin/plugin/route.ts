import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { FeedModuleService } from "../../../modules/feed/services" // путь укажите свой

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  // const feedModuleService = req.scope.resolve("feed") as FeedModuleService
  // const message = await feedModuleService.getFeedData("system")
  // res.json(message)
  
  res.json({message: "Hello from Medusa Feed API!"})
}

export const AUTHENTICATE = false