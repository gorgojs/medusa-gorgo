import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import jwt from "jsonwebtoken"
import { FEED_MODULE } from "../../src/providers/system"
import FeedModuleService from "../../src/modules/feed/service"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Feed by ID API Routes", () => {
      const headers: Record<string, string> = {}
      let container: ReturnType<typeof getContainer>
      let createdFeedId: string

      beforeAll(async () => {
        container = getContainer()

        const auth = container.resolve("auth")
        const userService = container.resolve("user")

        const user = await userService.createUsers({
          email: "admin@medusa.test",
        })

        const authIdentity = await auth.createAuthIdentities({
          provider_identities: [
            {
              provider: "emailpass",
              entity_id: "admin@medusa.test",
              provider_metadata: {
                password: "supersecret",
              },
            },
          ],
          app_metadata: {
            user_id: user.id,
          },
        })

        const token = jwt.sign(
          {
            actor_id: user.id,
            actor_type: "user",
            auth_identity_id: authIdentity.id,
          },
          "supersecret",
          { expiresIn: "1d" }
        )

        headers["authorization"] = `Bearer ${token}`
        const service = container.resolve<FeedModuleService>(FEED_MODULE)
        const created = await service.createFeeds({
          title: "Original Feed",
          file_name: "original.xml",
          is_active: true,
          schedule: 10,
        })

        createdFeedId = created.id
      })

      it("GET /admin/feeds/:id — get feed", async () => {
        const res = await api.get(`/admin/feeds/${createdFeedId}`, { headers })

        expect(res.status).toBe(200)
        expect(res.data.feed).toMatchObject({
          id: createdFeedId,
          title: "Original Feed",
          file_name: "original.xml",
        })
      })

      it("PATCH /admin/feeds/:id — update feed", async () => {
        const service = container.resolve<FeedModuleService>(FEED_MODULE)
        const created = await service.createFeeds({
          title: "To Be Updated",
          file_name: "update-me.xml",
          is_active: false,
          schedule: 30,
        })

        const res = await api.patch(
          `/admin/feeds/${created.id}`,
          {
            id: created.id,
            title: "Updated Title",
            schedule: 60,
          },
          { headers }
        )

        expect(res.status).toBe(200)
        expect(res.data.feed).toMatchObject({
          id: created.id,
          title: "Updated Title",
          schedule: 60,
        })
      })


      it("DELETE /admin/feeds/:id — delete feed", async () => {
        const res = await api.delete(`/admin/feeds/${createdFeedId}`, {
          headers,
        })

        expect(res.status).toBe(200)
        expect(res.data).toEqual({
          id: createdFeedId,
          object: "feed",
          deleted: true,
        })

        const service = container.resolve<FeedModuleService>(FEED_MODULE)
        const found = await service.listFeeds({ id: [createdFeedId] })
        expect(found).toHaveLength(0)
      })
    })
  },
})

jest.setTimeout(60 * 1000)