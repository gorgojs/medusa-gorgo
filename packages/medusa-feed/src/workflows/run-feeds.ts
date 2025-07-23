import { Modules } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
  transform,
  WorkflowData
} from '@medusajs/framework/workflows-sdk'
import { FEED_MODULE } from '../modules/feed'
import FeedModuleService from '../modules/feed/services/feed-module'
import { deleteFeedFilesWorkflow } from "./delete-feed-files"
import { updateFeedsWorkflow } from "./update-feeds"
import { gzip } from "zlib"
import { promisify } from "util"

export type GetFeedsStepInput = string[]

export const getFeedsStep = createStep(
  'get-feeds-step',
  async (ids: GetFeedsStepInput, { container }) => {
    const service = container.resolve<FeedModuleService>(FEED_MODULE)
    const providers = await service.getProvidersList()
    let feeds
    if (ids.length > 0) {
      feeds = await service.listFeeds({ id: ids })
    } else {
      const now = new Date();
      feeds = await service.listFeeds({ is_active: true })
      feeds = feeds.filter(feed => {
        if (!providers.includes(feed.provider_id)) return false
        if (!feed.last_export_at) return true
        const diffMs = now.getTime() - feed.last_export_at.getTime()
        return diffMs >= feed.schedule * 1000 * 60
      })
    }
    return new StepResponse(feeds)
  }
)

export type GenerateFeedFilesStepInput = {
  id: string
  provider_id: string
  title: string | null
  file_name: string | null
  file_path: string | null
  last_export_at: Date | null
  is_active: boolean
  schedule: number
  settings: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}[]

export const GenerateFeedFilesStep = createStep(
  'generate-feed-files-step',
  async (feeds: GenerateFeedFilesStepInput, { container }) => {
    const fileModuleService = container.resolve<any>(
      Modules.FILE
    )
    const feedModuleService = container.resolve<FeedModuleService>(FEED_MODULE)
    const providers = await feedModuleService.getProvidersList()


    const generatedFeeds = await Promise.all(feeds.map(async (feed) => {
      const feedData = await feedModuleService.getFeedData(feed.provider_id, { test: "value" })

      const ymlBuffer = Buffer.from(feedData, "utf-8")
      const gzipAsync = promisify(gzip)
      const gzipedBuffer = await gzipAsync(ymlBuffer)

      const fileDTO = await fileModuleService.createFiles({
        filename: `${feed.file_name}.gz`,
        mimeType: "application/gzip",
        content: gzipedBuffer.toString("binary"),
        access: "public",
      })

      return ({
        id: feed.id,
        file_id: fileDTO.id,
        file_url: fileDTO.url
      })
    }))

    return new StepResponse(generatedFeeds)
  }
)

export type RunFeedsWorkflowInput = {
  ids: string[]
}

export const runFeedsWorkflow = createWorkflow(
  'run-feeds-workflow',
  (input: WorkflowData<RunFeedsWorkflowInput>) => {
    const feed = getFeedsStep(input.ids)
    const generatedFeeds = GenerateFeedFilesStep(feed)
    const feedsToDelete = transform(
      generatedFeeds,
      (data) => data.map((item) => {
        return (item.id)
      })
    )
    deleteFeedFilesWorkflow.runAsStep({
      input: { ids: feedsToDelete },
    })
    const feedsToUpdate = transform(
      generatedFeeds,
      (data) => data.map((item) => {
        return ({
          id: item.id,
          file_path: item.file_url,
          last_export_at: new Date()
        })
      })
    )
    const updatedFeeds = updateFeedsWorkflow.runAsStep({
      input: feedsToUpdate,
    })

    return new WorkflowResponse(updatedFeeds)
  }
)