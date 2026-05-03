import {defineField, defineType} from 'sanity'
import {pageBuilder} from './objects/blocks'

export default defineType({
  name: 'project',
  title: 'Proyectos',
  type: 'document',
  groups: [
    {name: 'core', title: 'Resumen', default: true},
    {name: 'content', title: 'Contenido'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string', group: 'core', validation: (r) => r.required()}),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'status',
      title: 'Jerarquía',
      type: 'string',
      group: 'core',
      options: {
        list: [
          {title: 'Primario (Olivea)', value: 'primary'},
          {title: 'Secundario (Fritanguita)', value: 'secondary'},
          {title: 'Pasado (Maizal)', value: 'past'},
        ],
        layout: 'radio',
      },
      initialValue: 'secondary',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'summary',
      title: 'Resumen (cards / SEO)',
      type: 'object',
      group: 'core',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 3, validation: (r) => r.required()}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 3}),
      ],
    }),

    defineField({
      name: 'voice',
      title: 'Voz (narración del proyecto)',
      type: 'voiceTrack',
      group: 'core',
    }),

    defineField({
      name: 'heroMedia',
      title: 'Media principal (hero)',
      type: 'object',
      group: 'core',
      fields: [
        defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}}),
        defineField({name: 'videoUrl', title: 'Video URL (opcional)', type: 'url'}),
      ],
    }),

    defineField({...pageBuilder, group: 'content'} as any),

    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      group: 'meta',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Etiqueta', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'href', title: 'URL', type: 'url', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        },
      ],
    }),

    defineField({
      name: 'body',
      title: 'Cuerpo (legado — usar Bloques)',
      type: 'object',
      group: 'meta',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}]}),
        defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'status', media: 'heroMedia.image'},
  },
})
