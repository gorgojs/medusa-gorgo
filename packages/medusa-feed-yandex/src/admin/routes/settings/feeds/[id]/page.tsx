import {
  Container,
  Text,
  Drawer,
  Button,
  Heading,
  useToggleState,
  Input,
  Label,
  Switch,
  Select,
  Prompt,
  Badge,
  toast,
  Tooltip
} from "@medusajs/ui"
import { Pencil, Trash, Folder } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { SectionRow } from "../../../../components/section-row"
import { sdk } from "../../../../lib/sdk"
import { Header } from "../../../../components/header"
import { TwoColumnLayout } from "../../../../components/layouts/two-column"
import { scheduleData, fileExtension } from "../../../../lib/constants"
import type { Feed, FeedResponse } from "../../../../types"
import CategoryTable from "../../../../components/category-table"
import { I18n } from "../../../../components/utilities/i18n"
import { getScheduleLabel } from "../../../../lib/utils"
import { useDate } from "../../../../hooks/use-date"

let feedTitle: string | undefined

const FeedDetailsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [deleteFeedOpen, openDeleteFeed, closeDeleteFeed] = useToggleState()
  const [deleteFeedFileOpen, openDeleteFeedFile, closeDeleteFeedFile] = useToggleState()
  const [editOpen, openEdit, closeEdit] = useToggleState()
  const [editShopOpen, openEditShop, closeEditShop] = useToggleState()
  const [title, setTitle] = useState("")
  const [fileName, setFileName] = useState("")
  const [schedule, setSchedule] = useState<string>()
  const [isActive, setIsActive] = useState(true)

  const [shopName, setShopName] = useState("")
  const [shopCompany, setShopCompany] = useState("")
  const [shopUrl, setShopUrl] = useState("")
  const { getFullDate, getRelativeDate } = useDate()


  const { data, isError, error } = useQuery<FeedResponse>({
    queryFn: () => sdk.client.fetch(`/admin/feeds/${id}`),
    queryKey: ["feed", id],
  })

  useEffect(() => {
    if (data?.feed) {
      setTitle(data.feed.title!)
      setFileName(data.feed.file_name!)
      setIsActive(data.feed.is_active!)
      setSchedule(String(data.feed.schedule))
      setShopName(data.feed.settings?.name!)
      setShopCompany(data.feed.settings?.company!)
      setShopUrl(data.feed.settings?.url!)
    }
  }, [data])
  const feedData = data?.feed
  feedTitle = feedData?.title
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: async (updatedFeed: Feed) => {
      return sdk.client.fetch(`/admin/feeds/${updatedFeed.id}`, {
        method: "PATCH",
        body: updatedFeed,
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed", id],
      })
      queryClient.invalidateQueries({ queryKey: [["feeds"]] })
    },
    onError: (error) => {
      console.error("Error updating feed:", error)
    }
  })

  const { mutate: deleteMutate } = useMutation({
    mutationFn: async (feedId: { ids: string[] }) => {
      return sdk.client.fetch(`/admin/feeds/${feedId.ids[0]}`, {
        method: "DELETE",
        body: feedId,
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed", id],
      })
      queryClient.invalidateQueries({ queryKey: [["feeds"]] })
    },
    onError: (error) => {
      console.error("Error deleting feed:", error)
    }
  })

  const { mutate: deleteFeedFileMutate } = useMutation({
    mutationFn: async (feedId: string) => {
      return sdk.client.fetch(`/admin/feeds/${feedId}/delete-file`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed", id],
      })
      queryClient.invalidateQueries({ queryKey: [["feeds"]] })
    },
    onError: (error) => {
      console.error("Error deleting file:", error)
    }
  })

  const { mutate: launchMutate } = useMutation({
    mutationFn: async (feedId: string) => {
      return sdk.client.fetch(`/admin/feeds/${feedId}/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed", id],
      })
      queryClient.invalidateQueries({ queryKey: [["feeds"]] })
      toast.success(t("general.success"), {
        description: t("feeds.toasts.exportLaunched"),
      })
    },
    onError: (error) => {
      console.error("Error launching feed:", error)
    }
  })

  const saveFeedSettings = () => {
    const updatedFeed: Feed = {
      id: id!,
      title: title,
      file_name: fileName,
      is_active: isActive,
      schedule: Number(schedule)
    }
    mutate(updatedFeed)
    closeEdit()
  }

  const saveShopSettings = () => {
    const updatedFeed: Feed = {
      id: id!,
      settings: {
        name: shopName,
        company: shopCompany,
        url: shopUrl,
        platform: "Medusa"
      }
    }
    mutate(updatedFeed)
    closeEditShop()
  }

  const deleteFeed = () => {
    const deletedFeed = {
      ids: [id!]
    }
    deleteMutate(deletedFeed)
    navigate(`../`)
  }

  const deleteFeedFile = () => {
    deleteFeedFileMutate(id!)
    closeDeleteFeedFile()
  }

  if (isError) {
    throw error
  }

  const launchFeed = async () => {
    await launchMutate(data!.feed.id)
  }

  type CategorySetting = {
    id: string
    parentId?: string
    value: string
  }

  const saveFeedCategories = (
    selectedCategories: CategorySetting[]
  ) => {
    const updatedFeed = {
      id: id!,
      settings: { categories: selectedCategories },
    }
    mutate(updatedFeed)
  }

  const selectedIds: string[] =
    data?.feed?.settings?.categories?.map((c) => c.id) ?? []

  return (
    <>
      <I18n />
      <TwoColumnLayout
        firstCol={
          <>
            <Container className="divide-y p-0">
              <Header
                key={`${editOpen ? "edit-open" : "edit-closed"}-${deleteFeedOpen ? "delete-feed-open" : "delete-feed-closed"}-${deleteFeedFileOpen ? "delete-feed-file-open" : "delete-feed-file-closed"}`}

                title={feedData?.title!}
                status={{
                  color: feedData?.is_active ? "green" : "red",
                  text: feedData?.is_active ? t("general.active") : t("general.inactive")
                }}
                actions={[
                  {
                    type: "button",
                    props: {
                      children: t("actions.launchNow"),
                      variant: "secondary",
                      onClick: () => {
                        launchFeed()
                      },
                    },
                  },
                  {
                    type: "action-menu",
                    props: {
                      groups: [
                        {
                          actions: [
                            {
                              icon: <Pencil />,
                              label: t("actions.edit"),
                              onClick: () => openEdit(),
                            },
                            {
                              icon: <Folder />,
                              label: t("actions.deleteFile"),
                              onClick: () => openDeleteFeedFile(),
                            },
                            {
                              icon: <Trash />,
                              label: t("actions.delete"),
                              onClick: () => openDeleteFeed(),
                            },
                          ],
                        },
                      ],
                    },
                  },
                ]}
              />
              <SectionRow
                title={t("feeds.fields.id")}
                value={feedData?.id || "-"}
              />
              <SectionRow
                title={t("feeds.fields.fileName")}
                value={feedData?.file_name + fileExtension || "-"}
                className="break-all"
              />
              <SectionRow
                title={t("feeds.fields.feedUrl")}
                value={
                  feedData?.file_path && feedData?.id && feedData?.file_name ? (
                    (() => {
                      const url = new URL(feedData.file_path)
                      const feedViewUrl = `${url.origin}/feeds/${feedData.id}/${feedData.file_name}${fileExtension}`
                      return (
                        <a href={feedViewUrl} target="_blank" rel="noopener noreferrer">
                          <Badge size="base" className="h-full">
                            <Text size="xsmall" className="text-ui-fg-interactive break-all">{feedViewUrl}</Text>
                          </Badge>
                        </a>
                      )
                    })()
                  ) : (
                    "-"
                  )
                }
              />
              <SectionRow
                title={t("feeds.fields.filePath")}
                value={
                  feedData?.file_path
                    ? (
                      <a href={feedData?.file_path} target="_blank" rel="noopener noreferrer">
                        <Badge size="base" className="h-full">
                          <Text size="xsmall" className="text-ui-fg-interactive break-all">{feedData?.file_path}</Text>
                        </Badge>
                      </a>
                    )
                    : "-"
                }
              />
              <SectionRow
                title={t("feeds.fields.schedule")}
                value={
                  feedData?.schedule
                    ? (() => {
                      const option = scheduleData.find(
                        (opt) => opt.value === feedData.schedule
                      )
                      return (
                        <Badge size="2xsmall">
                          <Text size="small" leading="compact">
                            {getScheduleLabel(option?.value || feedData.schedule)}
                          </Text>
                        </Badge>
                      )
                    })()
                    : "-"
                }
              />
              <SectionRow
                title={t("feeds.fields.lastExport")}
                value={
                  feedData?.last_export_at
                    ? (
                      <Tooltip
                        className="z-10"
                        content={
                          <span className="text-pretty">{`${getFullDate({
                            date: feedData.last_export_at,
                            includeTime: true,
                          })}`}</span>
                        }
                      >
                        <Text
                          size="small"
                          leading="compact"
                          className="whitespace-pre-line text-pretty"
                        >
                          {getRelativeDate(feedData.last_export_at)}
                        </Text>
                      </Tooltip>
                    )
                    : ""
                }
              />
              <SectionRow
                title={t("feeds.fields.created")}
                value={
                  feedData?.created_at
                    ? getFullDate({
                      date: feedData.created_at,
                      includeTime: true,
                    })
                    : ""
                }
              />
              <SectionRow
                title={t("feeds.fields.updated")}
                value={
                  feedData?.updated_at
                    ? getFullDate({
                      date: feedData.updated_at,
                      includeTime: true,
                    })
                    : ""
                }
              />
              <Drawer open={editOpen} onOpenChange={(open) => {
                if (!open) closeEdit()
              }}>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title asChild><Heading>{t("feeds.edit.title")}</Heading></Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>
                    <div className="flex flex-col gap-y-4">
                      <Container>
                        <div className="flex gap-x-4">
                          <Switch id="is-active-switch" checked={isActive} onCheckedChange={() => setIsActive(prev => !prev)} />
                          <div className="flex flex-col gap-y-1">
                            <Label size="small" htmlFor="is-active-switch">{t("general.active")}</Label>
                            <Text size="small" className="text-ui-fg-muted">
                              {t("feeds.activityContainer.subtitle")}
                            </Text>
                          </div>
                        </div>
                      </Container>
                      <div className="flex flex-col gap-y-2">
                        <Label htmlFor="title" size="small">{t("feeds.fields.title")}</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <Label size="small" htmlFor="feed-file-name-input">{t("feeds.fields.fileName")}</Label>
                        <div className="relative">
                          <Input className="pr-14" id="feed-file-name-input" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                          <div className="absolute inset-y-0 right-0 z-10 flex w-12 items-center justify-center border-l">
                            <p className="font-medium font-sans txt-compact-small text-ui-fg-muted">
                              {fileExtension}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <Label size="small" htmlFor="schedule-selector">{t("feeds.fields.schedule")}</Label>
                        <Select value={schedule} onValueChange={setSchedule}>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content sideOffset={100}>
                            {scheduleData.map((item) => (
                              <Select.Item key={item.value} value={String(item.value)}>
                                {getScheduleLabel(item.value)}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>

                    </div>
                  </Drawer.Body>
                  <Drawer.Footer>
                    <div className="flex items-center justify-end gap-x-2">
                      <Drawer.Close asChild>
                        <Button size="small" variant="secondary">{t("actions.cancel")}</Button>
                      </Drawer.Close>
                      <Button size="small" type="submit" onClick={saveFeedSettings}>{t("actions.save")}</Button>
                    </div>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer>
              <Prompt open={deleteFeedOpen} onOpenChange={(open) => {
                if (!open) closeDeleteFeed()
              }}>
                <Prompt.Content>
                  <Prompt.Header>
                    <Prompt.Title>{t("feeds.prompts.deleteFeed.title")}</Prompt.Title>
                    <Prompt.Description>
                      {t("feeds.prompts.deleteFeed.description")}
                    </Prompt.Description>
                  </Prompt.Header>
                  <Prompt.Footer>
                    <Prompt.Cancel>{t("actions.cancel")}</Prompt.Cancel>
                    <Prompt.Action onClick={() => deleteFeed()}>{t("actions.delete")}</Prompt.Action>
                  </Prompt.Footer>
                </Prompt.Content>
              </Prompt>
              <Prompt open={deleteFeedFileOpen} onOpenChange={(open) => {
                if (!open) closeDeleteFeedFile()
              }}>
                <Prompt.Content>
                  <Prompt.Header>
                    <Prompt.Title>{t("feeds.prompts.deleteFeedFile.title")}</Prompt.Title>
                    <Prompt.Description>
                      {t("feeds.prompts.deleteFeedFile.description")}
                    </Prompt.Description>
                  </Prompt.Header>
                  <Prompt.Footer>
                    <Prompt.Cancel>{t("actions.cancel")}</Prompt.Cancel>
                    <Prompt.Action onClick={() => deleteFeedFile()}>{t("actions.delete")}</Prompt.Action>
                  </Prompt.Footer>
                </Prompt.Content>
              </Prompt>
            </Container>
            <CategoryTable
              defaultSelectedIds={selectedIds}
              onSave={async (selected) => {
                try {
                  await saveFeedCategories(selected)
                  toast.success(t("general.success"), {
                    description: t("feeds.toasts.categoriesSaved"),
                  })
                } catch (e) {
                  console.error(e)
                  toast.error(t("general.error"), {
                    description: t("feeds.toasts.categoriesSaveFailed"),
                  })
                }
              }}
            />
          </>
        }
        secondCol={
          <Container className="divide-y p-0">
            <Header
              key={`${editShopOpen ? "edit-shop-open" : "edit-shop-closed"}`}
              title={t("settings.shop.title")}
              subtitle={t("settings.shop.subtitle")}
              actions={[
                {
                  type: "action-menu",
                  props: {
                    groups: [
                      {
                        actions: [
                          {
                            icon: <Pencil />,
                            label: t("actions.edit"),
                            onClick: () => openEditShop(),
                          },
                        ],
                      },
                    ],
                  },
                },
              ]}
            />
            <SectionRow title={t("settings.shop.fields.name")} value={feedData?.settings?.name || "-"} />
            <SectionRow title={t("settings.shop.fields.company")} value={feedData?.settings?.company || "-"} />
            <SectionRow title={t("settings.shop.fields.url")} value={feedData?.settings?.url || "-"} />
            <SectionRow title={t("settings.shop.fields.platform")} value="Medusa" />
            <Drawer open={editShopOpen} onOpenChange={(open) => {
              if (!open) closeEditShop()
            }}>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title asChild><Heading>{t("feeds.edit.title")}</Heading></Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="shop-name" size="small">{t("settings.shop.fields.name")}</Label>
                      <Input id="shop-name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label size="small" htmlFor="shop-company">{t("settings.shop.fields.company")}</Label>
                      <Input id="shop-company" value={shopCompany} onChange={(e) => setShopCompany(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="shop-url" size="small">{t("settings.shop.fields.url")}</Label>
                      <Input id="shop-url" value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} />
                    </div>
                  </div>
                </Drawer.Body>
                <Drawer.Footer>
                  <div className="flex items-center justify-end gap-x-2">
                    <Drawer.Close asChild>
                      <Button size="small" variant="secondary">{t("actions.cancel")}</Button>
                    </Drawer.Close>
                    <Button size="small" type="submit" onClick={saveShopSettings}>{t("actions.save")}</Button>
                  </div>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          </Container>
        }
      />
    </>
  )
}

export const handle = {
  breadcrumb: () => feedTitle
}

export default FeedDetailsPage