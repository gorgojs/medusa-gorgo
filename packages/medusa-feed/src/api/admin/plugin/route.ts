import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { FeedModuleService } from "../../../modules/feed/services"
import { runFeedsWorkflow } from "../../../workflows/run-feeds"
import { createFeedsWorkflow } from "../../../workflows/create-feeds"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const feedModuleService = req.scope.resolve("feed") as FeedModuleService
  const message = await feedModuleService.getFeedData("fd_system_default", {test: "value"})
  const providers = await feedModuleService.getProvidersList()
  console.log("Providers", providers)

  const { result } = await runFeedsWorkflow(req.scope)
    .run({
      input: {
        ids: []
      }
    })
  console.log("Launched feeds", result)
  res.json(message)
}

export const AUTHENTICATE = false