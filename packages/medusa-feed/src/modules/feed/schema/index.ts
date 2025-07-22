export default `
type Feed {
  id: ID!
  provider_id: String!,
  title: String
  file_name: String
  file_path: String
  is_active: Boolean!
  schedule: Int!
  settings: JSON
  last_export_at: DateTime
  created_at: DateTime!
  updated_at: DateTime!
  deleted_at: DateTime
}
`
