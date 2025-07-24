import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import FeedModuleService from "../../../../../modules/feed/services/feed-module"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const service = req.scope.resolve<FeedModuleService>("feed")
  const provider = await service.retrieveProvider(id)

  res.status(200).json({
    provider
  })
}