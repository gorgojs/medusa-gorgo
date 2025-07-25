import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createFeedsWorkflow } from "../../src/workflows/create-feeds"
import { deleteFeedsWorkflow } from "../../src/workflows/delete-feeds"
import { updateFeedsWorkflow } from "../../src/workflows/update-feeds"
import { FEED_MODULE } from "../../src/providers/system"
import FeedModuleService from "../../src/modules/feed/service"


medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("createFeedsWorkflow", () => {
      it("create feeds", async () => {
        const container = getContainer()

        const input = [
          {
            file_name: "feed1.xml",
            is_active: true,
            schedule: 60,
          },
          {
            file_name: "feed2.xml",
            is_active: false,
            schedule: 120,
          },
        ]

        const { result } = await createFeedsWorkflow(container).run({ input })

        expect(result).toHaveLength(2)
        expect(result[0]).toHaveProperty("file_name", "feed1.xml")
        expect(result[1]).toHaveProperty("file_name", "feed2.xml")

        const service = container.resolve<FeedModuleService>(FEED_MODULE)
        const feeds = await service.listFeeds({
          file_name: ["feed1.xml", "feed2.xml"],
        })

        expect(feeds).toHaveLength(2);
      })
    })

    describe("deleteFeedsWorkflow", () => {
      it("delete feeds", async () => {
        const container = getContainer()
        const service = container.resolve<FeedModuleService>(FEED_MODULE)

        const created = await service.createFeeds({
          file_name: "todelete.xml",
          is_active: true,
          schedule: 30,
        })

        await deleteFeedsWorkflow(container).run({
          input: {ids: [created.id]},
        })

        const found = await service.listFeeds({ id: [created.id] })
        expect(found).toHaveLength(0)
      })
    })

    describe("updateFeedsWorkflow", () => {
      it("update feeds", async () => {
        const container = getContainer()
        const service = container.resolve<FeedModuleService>(FEED_MODULE)

        const created = await service.createFeeds({
          file_name: "original.xml",
          is_active: true,
          schedule: 30,
        })

        await updateFeedsWorkflow(container).run({
          input: [{
            id: created.id,
            title: "updated feed name",
            schedule: 60
          }],
        })

        const updated = await service.retrieveFeed(created.id);
        expect(updated.title).toBe("updated feed name")
        expect(updated.schedule).toBe(60)
      })
    })
  },
})

jest.setTimeout(60 * 1000);
