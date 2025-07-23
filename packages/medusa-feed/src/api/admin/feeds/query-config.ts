export const defaultAdminFeedFields = [
  "id",
  "provider_id",
  "title",
  "file_name",
  "file_path",
  "is_active",
  "schedule",
  "last_export_at",
  "settings",
  "created_at",
  "updated_at"
]

export const retrieveTransformQueryConfig = {
  defaults: defaultAdminFeedFields,
  isList: false,
}

export const listTransformQueryConfig = {
  defaults: defaultAdminFeedFields,
  defaultLimit: 20,
  isList: true,
}