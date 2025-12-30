import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pressItem',
  title: 'Press',
  type: 'document',
  fields: [
    defineField({name: 'year', title: 'Año', type: 'number', validation: (r) => r.required().min(2000).max(2100)}),
    defineField({name: 'outlet', title: 'Medio', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'title', title: 'Título', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'url', title: 'Link', type: 'url', validation: (r) => r.required()}),
    defineField({
      name: 'excerpt',
      title: 'Extracto (opcional)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 3}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 3}),
      ],
    }),
  ],
})