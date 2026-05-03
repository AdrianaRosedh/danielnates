import {defineField, defineType} from 'sanity'
import {pageBuilder} from '../objects/blocks'

export default defineType({
  name: 'artPiece',
  title: 'Arte',
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
      name: 'cover',
      title: 'Imagen principal',
      type: 'image',
      options: {hotspot: true},
      validation: (r) => r.required(),
    }),
    defineField({name: 'year', title: 'Año', type: 'number'}),
    defineField({name: 'medium', title: 'Medio (óleo, gouache, etc.)', type: 'string'}),
    defineField({name: 'dimensions', title: 'Dimensiones', type: 'string'}),
    defineField({
      name: 'statement',
      title: 'Statement',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 4}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 4}),
      ],
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
      title: 'Año (descendente)',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'year', media: 'cover'},
  },
})
