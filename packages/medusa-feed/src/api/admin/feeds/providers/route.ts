import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import FeedModuleService from "../../../../modules/feed/services/feed-module"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<FeedModuleService>("feed")
  const providers = await service.getProvidersList()

  res.status(200).json({
    providers
  })
}