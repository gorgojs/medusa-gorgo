import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import jwt from "jsonwebtoken"
import { FEED_MODULE } from "../../src/providers/system"
import FeedModuleService from "../../src/modules/feed/service"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Feeds API Routes", () => {
      const headers: Record<string, string> = {}
      let container: ReturnType<typeof getContainer>

      beforeEach(async () => {
        container = getContainer()

        const auth = container.resolve("auth")
        const userService = container.resolve("user")

        const user = await userService.createUsers({
          email: "admin@test.com",
        })

        const authIdentity = await auth.createAuthIdentities({
          provider_identities: [
            {
              provider: "emailpass",
              entity_id: "admin@test.com",
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
      })

      describe("GET /admin/feeds", () => {
        it("get feeds", async () => {
          const res = await api.get("/admin/feeds", { headers })

          expect(res.status).toBe(200)
          expect(Array.isArray(res.data.feeds)).toBe(true)
        })
      })

      describe("POST /admin/feeds", () => {
        it("create feed", async () => {
          const payload = {
            feeds: [
              {
                title: "Feed POST API",
                file_name: "feed-post-api.xml",
                is_active: true,
                schedule: 30,
              },
            ],
          }

          const res = await api.post("/admin/feeds", payload, { headers })

          expect(res.status).toBe(200)

          const feed = res.data.feed

          expect(feed).toEqual({
            id: expect.any(String),
            title: "Feed POST API",
            file_name: "feed-post-api.xml",
            file_path: null,
            is_active: true,
            schedule: 30,
            last_export_at: null,
            settings: null,
            deleted_at: null,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })

          const service = container.resolve<FeedModuleService>(FEED_MODULE)
          const found = await service.listFeeds({ id: [feed.id] })
          expect(found).toHaveLength(1)
        })
      })
    })
  },
})

jest.setTimeout(60 * 1000)