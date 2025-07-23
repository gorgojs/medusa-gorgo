import { z } from "zod"

export const AdminGetFeedParams = z.object({
  fields: z.string().optional(),
})

export const AdminUpdateFeed = z.object({
  id: z.string(),
  title: z.string().optional(),
  file_name: z.string().optional(),
  file_path: z.string().optional(),
  last_export_at: z.coerce.date().optional(),
  schedule: z.number().optional(),
  is_active: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
})

export type AdminGetFeedParamsType = z.infer<typeof AdminGetFeedParams>
export type AdminUpdateFeedType = z.infer<typeof AdminUpdateFeed>