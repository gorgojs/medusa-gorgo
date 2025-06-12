import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Rss } from "@medusajs/icons"
import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  useToggleState,
  FocusModal,
  Button,
  Heading,
  Text,
  Input,
  Label,
  Select,
  Tooltip,
  Switch,
  Badge
} from "@medusajs/ui"
import { InformationCircleSolid, SquareGreenSolid, SquareRedSolid } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../../components/header"
import { scheduleData } from "../../../lib/constants"
import type { Feed, FeedsResponse, CreatedFeeds } from "../../../types"
import { useTranslation } from "react-i18next"
import { I18n } from "../../../components/i18n"

const PAGE_SIZE = 20

const FeedsPage = () => {
  const { t } = useTranslation()
  const columnHelper = createDataTableColumnHelper<Feed>()

  const columns = [
    columnHelper.accessor("title", { header: t("fields.title") }),
    columnHelper.accessor("file_name", { header: t("fields.fileName") }),
    columnHelper.accessor("file_path", {
      header: t("fields.filePath"),
      cell: ({ row }) => {
        const filePath = row.original.file_path
        const id = row.original.id
        const fileName = row.original.file_name

        if (!filePath || !id || !fileName) {
          return "-"
        }

        try {
          const url = new URL(filePath)
          const fullLink = `${url.origin}/feeds/${id}/${fileName}.xml`
          return (
            <a href={fullLink} target="_blank" rel="noopener noreferrer">
              <Badge size="xsmall">
                <Text size="small" className="text-ui-fg-interactive">
                  {fullLink}
                </Text>
              </Badge>
            </a>
          )
        } catch {
          return "-"
        }
      },
    }),
    columnHelper.accessor("last_export_at", {
      header: t("fields.lastExport"),
      cell: ({ getValue }) => {
        const raw = getValue()
        if (!raw) return "-"

        const date = new Date(raw)
        return date.toLocaleString()
      }
    }),
    columnHelper.accessor("is_active", {
      header: t("fields.status"),
      cell: ({ getValue }) => {
        const isActive = getValue()
        if (isActive) {
          return (
            <div className="flex items-center gap-1"><SquareGreenSolid />
              <Text size="small" leading="compact" className="whitespace-pre-line text-pretty">
                {t("general.active")}
              </Text>
            </div>
          )
        } else {
          return (
            <div className="flex items-center gap-1">
              <SquareRedSolid />
              <Text size="small" leading="compact" className="whitespace-pre-line text-pretty">
                {t("general.inactive")}
              </Text>
            </div>
          )
        }
      }
    }),
    columnHelper.accessor("schedule", {
      header: t("fields.schedule"),
      cell: ({ getValue }) => {
        const value = String(getValue())
        const option = scheduleData.find((item) => item.value === value)
        return (
          <Badge size="2xsmall">
            <Text size="xsmall" leading="compact">
              {option?.label}
            </Text>
          </Badge>)
      },
    }),
  ]
  const [createOpen, openCreate, closeCreate] = useToggleState()
  const [title, setTitle] = useState("")
  const [fileName, setFileName] = useState("")
  const [schedule, setSchedule] = useState<string>("30")
  const [isActive, setIsActive] = useState(false)

  const navigate = useNavigate()
  const limit = PAGE_SIZE
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })

  const offset = useMemo(() => pagination.pageIndex * limit, [pagination])

  const { data, isLoading } = useQuery<FeedsResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/feeds`, {
        query: { limit, offset },
      }),
    queryKey: [["feeds"]],
  })
  const table = useDataTable({
    columns,
    data: data?.feeds || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick(_, row) {
      navigate(`${row.id}`)
    },
  })

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (newFeed: { feeds: CreatedFeeds }) => {
      return sdk.client.fetch(`/admin/feeds`, {
        method: "POST",
        body: newFeed,
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["feeds"]],
      })
      setTitle("")
      setFileName("")
      setSchedule("30")
      setIsActive(false)
    },
    onError: (error) => {
      console.error("Error creating feed:", error)
    },
  })

  const saveFeed = () => {
    const createdFeed: CreatedFeeds = [{
      title: title,
      file_name: fileName,
      is_active: isActive,
      schedule: Number(schedule),
    }]
    mutate({ feeds: createdFeed })
    closeCreate()
  }

  return (
    <>
      <I18n />
      <Container className="divide-y p-0">
        <DataTable instance={table}>
          <Header
            key={createOpen ? "create-open" : "create-closed"}
            title={t("exports.header.title")}
            actions={[
              {
                type: "button",
                props: {
                  children: t("buttons.create"),
                  variant: "secondary",
                  onClick: () => openCreate(),
                },
              },
            ]}
          />
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>

        <FocusModal open={createOpen} onOpenChange={(open) => { if (!open) closeCreate() }}>

          <FocusModal.Content>

            <FocusModal.Header>

            </FocusModal.Header>
            <FocusModal.Body className="flex flex-col items-center py-16">


              <div className="flex w-full max-w-lg flex-col gap-y-8">
                <div className="flex flex-col gap-y-1">
                  <Heading>{t("exports.create.title")}</Heading>
                  <Text className="text-ui-fg-subtle">
                    {t("exports.create.description")}
                  </Text>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="title" size="small">{t("fields.title")}</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="file_name" size="small">{t("fields.fileName")}</Label>
                  <Input id="file_name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                </div>

                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="schedule_selector" size="small">{t("fields.schedule")}</Label>
                    <Tooltip content={t("tooltips.schedule")}>
                      <InformationCircleSolid className="text-ui-fg-subtle" />
                    </Tooltip>
                  </div>
                  <Select onValueChange={setSchedule} value={schedule}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content sideOffset={100}>
                      {scheduleData.map((item) => (
                        <Select.Item key={item.value} value={item.value}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="is-active-switch" size="small">{t("activityContainer.title")}</Label>
                  <Container>
                    <div className="flex gap-x-4">
                      <Switch id="is-active-switch" checked={isActive} onCheckedChange={() => setIsActive(prev => !prev)} />
                      <div className="flex flex-col gap-y-1">
                        <Label size="small" htmlFor="is-active-switch">{t("general.active")}</Label>
                        <Text size="small" className="text-ui-fg-muted">
                          {t("activityContainer.subtitle")}
                        </Text>
                      </div>
                    </div>
                  </Container>
                </div>
              </div>

            </FocusModal.Body>

            <FocusModal.Footer>
              <FocusModal.Close>
                <Button variant="secondary">{t("buttons.cancel")}</Button>
              </FocusModal.Close>
              <Button onClick={saveFeed}>{t("buttons.save")}</Button>
            </FocusModal.Footer>
          </FocusModal.Content>
        </FocusModal>
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Feeds",
  icon: Rss,
})

export const handle = {
  breadcrumb: () => "Feeds",
}

export default FeedsPage
