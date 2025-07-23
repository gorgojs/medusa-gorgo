import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Rss } from "@medusajs/icons"
import {
  Container,
  useToggleState,
} from "@medusajs/ui"
import { t } from "i18next"
import { SingleColumnLayout } from "../../../components/layout"
import { FeedListTable, FeedCreateModal } from "../../../components/routes/feeds/feed-list"
import { I18n } from "../../../components/utilities/i18n"

const FeedsPage = () => {
  const [stateModal, openModal, closeModal] = useToggleState()
  return (
    <>
      <I18n />
      <SingleColumnLayout>
        <Container className="p-0">
          <FeedListTable stateModal={stateModal} openModal={openModal} />
          <FeedCreateModal stateModal={stateModal} closeModal={closeModal} />
        </Container>
      </SingleColumnLayout>
    </>
  )
}

export const config = defineRouteConfig({
  label: t("feeds.domain"),
  icon: Rss,
})

export const handle = {
  breadcrumb: () => t("feeds.domain"),
}

export default FeedsPage
