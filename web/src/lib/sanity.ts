import {createClient} from '@sanity/client'

export const sanity = createClient({
  projectId: '2c2yp0gm',
  dataset: 'production',
  apiVersion: '2025-12-29',
  useCdn: false,
})