import {defineConfig} from 'sanity'
import {visionTool} from '@sanity/vision'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'
import {structure} from './structure'

export default defineConfig({
  name: 'danielnates-studio',
  title: 'Daniel Nates',

  projectId: '2c2yp0gm',
  dataset: 'production',

  plugins: [
    deskTool({structure}),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})