import {defineField, defineType} from 'sanity'
import {pageBuilder} from '../objects/blocks'

export default defineType({
  name: 'article',
  title: 'Diario',
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
      name: 'date',
      title: 'Fecha',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumen (cards / SEO)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 3}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 3}),
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Imagen de portada',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'tags',
      title: 'Etiquetas',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'voice',
      title: 'Voz (narración)',
      type: 'voiceTrack',
    }),
    defineField(pageBuilder),
  ],
  orderings: [
    {
      title: 'Más reciente primero',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'date', media: 'cover'},
  },
})
