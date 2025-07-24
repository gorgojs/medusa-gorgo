import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { gunzip } from "zlib"
import { promisify } from "util"
import { FeedModuleService } from "../../../../modules/feed/services"
import mime from "mime-types"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id, fileName } = req.params
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const fileModuleService = req.scope.resolve(Modules.FILE)

    const { data } = await query.graph({
      entity: "feed",
      filters: { id },
      fields: ["provider_id", "file_path", "file_name"],
    })

    const feed = data?.[0]

    if (!feed) {
      return res.status(404).json({ message: "Feed not found" })
    }

    const { provider_id: provider_id, file_path: filePath, file_name: expectedFileName } = feed

    const service = req.scope.resolve<FeedModuleService>("feed")
    const provider = await service.retrieveProvider(provider_id)

    if (!filePath || !expectedFileName || !provider_id) {
      return res.status(404).json({ message: "Feed file info missing" })
    }

    const expectedFileNameWithExt = expectedFileName + provider.fileExtension
    if (expectedFileNameWithExt !== fileName) {
      return res.status(404).json({ message: "File name does not match" })
    }

    let fileId: string
    try {
      const url = new URL(filePath)
      fileId = url.pathname.split("/").pop()!
    } catch {
      return res.status(400).json({ message: "Invalid file path format" })
    }
    const encoded = decodeURIComponent(fileId)
    const base64Buffer = await fileModuleService.getAsBuffer(encoded)
    const gunzipAsync = promisify(gunzip)
    const xmlBuffer = await gunzipAsync(base64Buffer)
  
    res.setHeader("Content-Type", mime.lookup(fileName))
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`)
    res.send(xmlBuffer)

  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
