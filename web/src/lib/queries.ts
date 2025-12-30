export const DANIEL_QUERY = `
*[_type == "person"] | order(_updatedAt desc)[0]{
  _id,
  name,
  tagline,
  subline,
  bioShort,
  bioLong,
  pillars,
  social
}
`;

export const PROJECTS_QUERY = `
*[_type == "project"] | order(
  select(
    status == "primary" => 0,
    status == "secondary" => 1,
    status == "past" => 2,
    3
  ) asc
){
  title,
  slug,
  status,
  summary,
  body,
  links,
  heroMedia
}
`;

export const PROJECT_BY_SLUG = `
*[_type == "project" && slug.current == $slug][0]{
  title,
  slug,
  status,
  summary,
  body,
  links,
  heroMedia
}
`;

export const FIELD_NOTES_QUERY = `
*[_type == "fieldNote"] | order(date desc){
  title,
  date,
  category,
  body,
  externalLink
}
`;