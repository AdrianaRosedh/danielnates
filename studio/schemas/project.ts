import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Proyectos',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string', validation: (r) => r.required()}),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'status',
      title: 'Jerarquía',
      type: 'string',
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
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 3, validation: (r) => r.required()}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 3}),
      ],
    }),

    defineField({
      name: 'body',
      title: 'Cuerpo (editorial)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}]}),
        defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
      ],
    }),

    defineField({
      name: 'heroMedia',
      title: 'Media principal',
      type: 'object',
      fields: [
        defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}}),
        defineField({name: 'videoUrl', title: 'Video URL (opcional)', type: 'url'}),
      ],
    }),

    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
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
  ],
})